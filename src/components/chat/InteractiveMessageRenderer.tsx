'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseBuildingImages } from '@/lib/backend-sync';
import RoomCards from './RoomCards';
import { RoomDetailsModal } from './RoomDetailsModal';
import { 
  Building, MapPin, DollarSign, Bed, Bath, Eye, Wifi, 
  Dumbbell, WashingMachine, Shield, PawPrint, Calendar,
  ChevronRight, Star, Users, TrendingUp, Home, 
  Phone, Mail, ExternalLink, Clock, CheckCircle, X,
  Sparkles, Heart, Zap, Award, ArrowUp, ArrowDown,
  BarChart3, PieChart, Activity, Maximize2, Play,
  Camera, Video, Map, Navigation, Gift, Crown
} from 'lucide-react';

interface BuildingData {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  amenities?: string[];
  image?: string;
  building_images?: any; // Can be string, array, or null
  roomCount?: number;
  priceRange?: { min: number; max: number };
}

interface RoomData {
  room_id: string;
  room_number: string;
  room_type?: string;
  private_room_rent: number;
  status: string;
  floor_number?: number;
  furnished?: boolean;
  bathroom_included?: boolean;
  room_images?: any;
  buildings?: {
    building_name: string;
    city: string;
    state: string;
    building_images?: any;
  };
  // Legacy fields for backward compatibility
  id?: number;
  building?: string;
  price?: number;
  type?: string;
  bathrooms?: number;
  view?: string;
  furnishing?: string;
  available?: boolean;
}

interface InteractiveMessageProps {
  content: string;
  data?: any;
  metadata?: any;
  onAction?: (action: string, data: any) => void;
}

// Amenity icons mapping
const amenityIcons: { [key: string]: any } = {
  'wifi': Wifi,
  'gym': Dumbbell,
  'laundry': WashingMachine,
  'security': Shield,
  'pet-friendly': PawPrint,
  'pets': PawPrint,
};

export default function InteractiveMessageRenderer({ content, data, metadata, onAction }: InteractiveMessageProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

  // Component state and data extraction

  // Extract rooms data - check multiple possible locations
  let rooms: any[] = [];
  
  // Check if this is a room query based on various indicators
  const isRoomQuery = (item: any) => {
    return item && (
      item.room_id !== undefined || 
      item.room_number !== undefined || 
      item.private_room_rent !== undefined ||
      item.room_type !== undefined
    );
  };
  
  if (data?.rooms && Array.isArray(data.rooms)) {
    rooms = data.rooms;
  } else if (metadata?.result?.rooms && Array.isArray(metadata.result.rooms)) {
    rooms = metadata.result.rooms;
  } else if (metadata?.rooms && Array.isArray(metadata.rooms)) {
    rooms = metadata.rooms;
  } else if (Array.isArray(data) && data.length > 0 && isRoomQuery(data[0])) {
    // Direct array of rooms
    rooms = data;
  } else if (data?.data && Array.isArray(data.data) && data.data.length > 0 && isRoomQuery(data.data[0])) {
    // Backend response format with data field
    rooms = data.data;
  } else if (metadata?.result?.data && Array.isArray(metadata.result.data) && metadata.result.data.length > 0 && isRoomQuery(metadata.result.data[0])) {
    // Backend style response in metadata
    rooms = metadata.result.data;
  } else if (metadata?.data && Array.isArray(metadata.data) && metadata.data.length > 0 && isRoomQuery(metadata.data[0])) {
    // Alternative backend style
    rooms = metadata.data;
  }

  // Extract buildings data
  const buildingsData = data?.buildings || metadata?.result?.buildings || metadata?.buildings || [];
  const buildings = Array.isArray(buildingsData) ? buildingsData : [];
  const stats = data?.stats || metadata?.result?.stats || metadata?.stats || null;

  // Additional debug logging for rooms
  if (Array.isArray(rooms) && rooms.length > 0) {
    console.log('🔍 InteractiveMessageRenderer - Extracted rooms data:', {
      roomsFound: rooms.length,
      roomsData: rooms.slice(0, 2), // Show first 2 rooms for debugging
      extractedFrom: 'Found rooms',
      // Additional debug info
      hasDataField: !!data?.data,
      dataFieldIsArray: Array.isArray(data?.data),
      dataFieldLength: data?.data?.length || 0,
      firstDataItem: data?.data?.[0],
      metadataKeys: metadata ? Object.keys(metadata) : [],
      // Check if building data exists
      firstRoomHasBuildings: rooms[0]?.buildings !== undefined,
      firstRoomBuildingName: rooms[0]?.buildings?.building_name,
      // Raw data check
      rawData: data,
      rawMetadata: metadata,
      // Check for separate buildings data
      hasBuildingsArray: !!data?.buildings || !!metadata?.buildings || !!metadata?.result?.buildings,
      buildingsData: data?.buildings || metadata?.buildings || metadata?.result?.buildings
    });
  }
  
  // Detect analytics/insights data
  const isFinancialReport = data?.insight_type === 'FINANCIAL' || 
                           metadata?.result?.insight_type === 'FINANCIAL' ||
                           metadata?.result?.result?.insight_type === 'FINANCIAL' ||
                           data?.success && data?.data?.by_building;
  const isAnalyticsReport = data?.insight_type || metadata?.result?.insight_type || metadata?.result?.result?.insight_type;
  const analyticsData = metadata?.result?.result?.data || data?.data || metadata?.result?.data || null;
  
  // Debug logging
  console.log('🔍 Analytics Detection:', {
    isAnalyticsReport,
    analyticsData,
    metadataStructure: metadata,
    hasResultResult: !!metadata?.result?.result,
    insightType: metadata?.result?.result?.insight_type
  });

  // Handle building click - show details first
  const handleBuildingClick = (building: BuildingData) => {
    setSelectedBuilding(building);
  };

  // Handle schedule tour action
  const handleScheduleTour = (building: BuildingData) => {
    setShowTourModal(true);
    if (onAction) {
      onAction('schedule_tour', { buildingId: building.id, buildingName: building.name });
    }
  };

  // Render building cards
  const renderBuildingCards = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mt-8 space-y-6"
      >
        {/* Enhanced Header with Animation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
        <div className="flex items-center space-x-3">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
          >
            <Building className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              ✨ Found {buildings.length} Amazing {buildings.length === 1 ? 'Building' : 'Buildings'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Handpicked properties just for you</p>
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200"
        >
          <span className="text-sm font-medium text-blue-700 flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            Click for details
          </span>
        </motion.div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buildings.slice(0, showAllRooms ? buildings.length : 4).map((building: BuildingData, idx: number) => (
          <motion.div
            key={building.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: idx * 0.15,
              duration: 0.5,
              ease: "easeOut"
            }}
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBuildingClick(building)}
            className="group cursor-pointer"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 relative group-hover:border-blue-300">
              {/* Floating Award Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.15 + 0.3 }}
                className="absolute top-4 right-4 z-10"
              >
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-full shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </motion.div>
              {/* Enhanced Building Header with Gradient and Animation */}
              <div className="relative h-40 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
                
                <div className="relative p-5 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
                      >
                        <Building className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h4 className="text-lg font-bold text-white drop-shadow-sm">{building.name}</h4>
                        <div className="flex items-center text-white/90 text-sm">
                          <Navigation className="w-4 h-4 mr-1" />
                          {building.city}, {building.state}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {building.roomCount && (
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/30">
                        <span className="text-white text-sm font-semibold flex items-center">
                          <Home className="w-4 h-4 mr-1" />
                          {building.roomCount} rooms
                        </span>
                      </div>
                    )}
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/30"
                    >
                      <span className="text-white text-xs font-medium flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Building Details */}
              <div className="p-6">
                <div className="space-y-4 mb-5">
                  <div className="flex items-center text-gray-700 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{building.address}</span>
                  </div>
                  
                  {building.priceRange && (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <DollarSign className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-green-800 text-sm font-semibold">Price Range</span>
                        </div>
                        <motion.span 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-green-700 font-bold text-lg"
                        >
                          ${building.priceRange.min.toLocaleString()} - ${building.priceRange.max.toLocaleString()}
                        </motion.span>
                      </div>
                      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-green-100 to-transparent opacity-50"></div>
                    </motion.div>
                  )}
                </div>
                
                {/* Enhanced Amenities */}
                {building.amenities && building.amenities.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center mb-3">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                      <h5 className="text-sm font-bold text-gray-900">Premium Amenities</h5>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {building.amenities.slice(0, 3).map((amenity, i) => {
                        const Icon = amenityIcons[amenity.toLowerCase()] || CheckCircle;
                        return (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 px-3 py-2 rounded-xl text-xs border border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <Icon className="w-4 h-4 mr-2 text-gray-600 group-hover:text-blue-600 transition-colors" />
                            <span className="text-gray-700 font-medium">{amenity}</span>
                          </motion.div>
                        );
                      })}
                      {building.amenities.length > 3 && (
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-xl border border-purple-200 font-medium"
                        >
                          <Gift className="w-3 h-3 mr-1" />
                          +{building.amenities.length - 3} more perks
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Enhanced Actions */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div 
                      whileHover={{ x: 5 }}
                      className="text-blue-600 text-sm font-semibold group-hover:text-blue-700 transition-colors flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Click for Full Tour
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" />
                    </motion.div>
                    <div className="flex items-center space-x-2">
                      <motion.div 
                        animate={{ 
                          boxShadow: ['0 0 0 0 rgba(251, 191, 36, 0)', '0 0 0 4px rgba(251, 191, 36, 0.3)', '0 0 0 0 rgba(251, 191, 36, 0)'] 
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex items-center text-amber-600 text-sm bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 rounded-lg border border-amber-200"
                      >
                        <Star className="w-3 h-3 fill-current mr-1" />
                        <span className="font-bold">4.8</span>
                      </motion.div>
                      <div className="flex items-center text-green-600 text-xs bg-green-50 px-2 py-1 rounded-lg">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Hot
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScheduleTour(building);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Tour
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors group"
                    >
                      <Heart className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {buildings.length > 4 && !showAllRooms && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAllRooms(true)}
            className="relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Discover All {buildings.length} Amazing Properties</span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              >
                <Zap className="w-4 h-4" />
              </motion.div>
            </div>
          </motion.button>
          <p className="text-sm text-gray-500 mt-3">✨ Each one handpicked just for you</p>
        </motion.div>
      )}
    </motion.div>
    );
  };

  // Render room cards using the dedicated RoomCards component
  const renderRoomCards = () => {
    // Ensure rooms is an array
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return null;
    }

    // Transform rooms data to match RoomCards interface while preserving all properties
    const transformedRooms = rooms.map((room: any) => {
      // Debug log each room's building data
      console.log('🏢 Transforming room:', {
        roomNumber: room.room_number,
        hasBuildings: !!room.buildings,
        buildingsData: room.buildings,
        buildingName: room.buildings?.building_name,
        // Check for building info in other fields
        building_id: room.building_id,
        building_name_direct: room.building_name,
        building_singular: room.building,
        building_data: room.building?.building_name,
        allKeys: Object.keys(room).filter(key => key.includes('building')),
        // Show ALL keys to see full structure
        allRoomKeys: Object.keys(room)
      });
      
      // Preserve all original room properties
      const transformed = {
        ...room,
        // Ensure required fields exist
        room_id: room.room_id || `room-${room.id}`,
        room_number: room.room_number || room.room_id || 'Unknown',
        room_type: room.room_type || room.type || 'Standard',
        private_room_rent: room.private_room_rent || room.price || 0,
        status: room.status || (room.available !== false ? 'Available' : 'Occupied'),
        floor_number: room.floor_number || 1,
        furnished: room.furnished !== undefined ? room.furnished : (room.furnishing === 'Furnished'),
        bathroom_included: room.bathroom_included !== undefined ? room.bathroom_included : (room.bathrooms && room.bathrooms > 0),
        room_images: room.room_images || room.images || [],
        // Preserve the buildings object which comes from the join - this is key!
        // Check for both 'buildings' (plural) and 'building' (singular)
        buildings: room.buildings || room.building || null
      };
      
      return transformed;
    })

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mt-8"
      >
        {/* Enhanced Room Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center space-x-3">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Home className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                🏠 Found {rooms.length} Perfect {rooms.length === 1 ? 'Room' : 'Rooms'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {rooms.filter(r => r.status === 'Available').length} available • 
                Price range: ${Math.min(...rooms.map(r => r.private_room_rent || r.price || 0))} - ${Math.max(...rooms.map(r => r.private_room_rent || r.price || 0))}
              </p>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-full border border-emerald-200"
          >
            <span className="text-sm font-semibold text-emerald-700 flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              View details
            </span>
          </motion.div>
        </motion.div>
        
        {/* Use the dedicated RoomCards component */}
        <RoomCards 
          rooms={transformedRooms} 
          showExploreLink={true} 
          onRoomClick={(room) => setSelectedRoom(room)}
        />
      </motion.div>
    );
  };

  // Enhanced statistics with animations and better visuals
  const renderStats = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mt-8"
      >
      {/* Stats Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center space-x-3 mb-6"
      >
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
        >
          <BarChart3 className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            📈 Live Analytics Dashboard
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Real-time property insights</p>
        </div>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.totalRooms && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <Home className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-3 h-3 bg-white rounded-full opacity-75"
                ></motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-bold text-white mb-1"
              >
                {stats.totalRooms.toLocaleString()}
              </motion.div>
              <div className="text-blue-100 text-sm font-semibold">Total Rooms</div>
            </div>
          </motion.div>
        )}
        
        {stats.availableRooms && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                    scale: { repeat: Infinity, duration: 2 }
                  }}
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1, 
                        delay: i * 0.2 
                      }}
                      className="w-2 h-2 bg-white rounded-full opacity-75"
                    ></motion.div>
                  ))}
                </div>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-3xl font-bold text-white mb-1"
              >
                {stats.availableRooms.toLocaleString()}
              </motion.div>
              <div className="text-green-100 text-sm font-semibold">Available Now</div>
            </div>
          </motion.div>
        )}
        
        {stats.averagePrice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <DollarSign className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div 
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-3 h-3 bg-white rounded-full"
                ></motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-3xl font-bold text-white mb-1"
              >
                ${stats.averagePrice.toLocaleString()}
              </motion.div>
              <div className="text-purple-100 text-sm font-semibold">Average Price</div>
            </div>
          </motion.div>
        )}
        
        {stats.occupancyRate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 3.5 }}
                >
                  <TrendingUp className="w-8 h-8 text-white" />
                </motion.div>
                {/* Occupancy Progress Ring */}
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="3"
                    />
                    <motion.path
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeDasharray={`${stats.occupancyRate}, 100`}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.8 }}
                    />
                  </svg>
                </div>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-3xl font-bold text-white mb-1"
              >
                {stats.occupancyRate}%
              </motion.div>
              <div className="text-orange-100 text-sm font-semibold">Occupancy Rate</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Additional Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Live market insights</span>
          </div>
          <motion.div 
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-blue-600"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
    );
  };

  // Render Analytics/Insights Report
  const renderAnalyticsReport = () => {
    if (!analyticsData || !isAnalyticsReport) return null;

    const insightType = metadata?.result?.result?.insight_type || data?.insight_type || metadata?.result?.insight_type || '';
    
    // Handle different insight types
    switch(insightType.toUpperCase()) {
      case 'FINANCIAL':
        return renderFinancialReport();
      case 'OCCUPANCY':
        return renderOccupancyReport();
      case 'TENANT':
        return renderTenantReport();
      case 'ROOM_PERFORMANCE':
        return renderRoomPerformanceReport();
      default:
        // If unknown type but has data, show generic analytics
        if (analyticsData) {
          return renderGenericAnalytics();
        }
        return null;
    }
  };

  // Render Financial Report
  const renderFinancialReport = () => {
    if (!analyticsData) return null;

    const byBuilding = analyticsData.by_building || [];
    const totalPotentialRevenue = analyticsData.total_potential_revenue || 0;
    const actualRevenue = analyticsData.actual_revenue || 0;
    const realizationRate = analyticsData.revenue_realization_rate || 0;
    const avgRent = analyticsData.avg_private_rent || 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-6 space-y-6"
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Potential Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${totalPotentialRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actual Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${actualRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl border ${
              realizationRate >= 70 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                : realizationRate >= 50
                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Realization Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {realizationRate.toFixed(1)}%
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                realizationRate >= 70 
                  ? 'bg-green-500' 
                  : realizationRate >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Building-wise Revenue Breakdown */}
        {byBuilding && byBuilding.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-gray-600" />
              Revenue by Building
            </h3>
            <div className="space-y-3">
              {byBuilding.map((building: any, idx: number) => {
                const buildingRealizationRate = building.revenue_realization_rate || 0;
                return (
                  <motion.div
                    key={building.building_id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{building.building_name}</h4>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        buildingRealizationRate >= 70 
                          ? 'bg-green-100 text-green-700' 
                          : buildingRealizationRate >= 50
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {buildingRealizationRate.toFixed(1)}% realized
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Potential</p>
                        <p className="font-semibold text-gray-900">
                          ${(building.total_potential_revenue || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Actual</p>
                        <p className="font-semibold text-gray-900">
                          ${(building.actual_revenue || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Rent</p>
                        <p className="font-semibold text-gray-900">
                          ${Math.round(building.avg_private_rent || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Render Occupancy Report
  const renderOccupancyReport = () => {
    if (!analyticsData) return null;
    
    const totalRooms = analyticsData.total_rooms || 0;
    const occupiedRooms = analyticsData.occupied_rooms || 0;
    const availableRooms = analyticsData.available_rooms || 0;
    const occupancyRate = analyticsData.occupancy_rate || 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Occupancy Report</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{totalRooms}</p>
            <p className="text-sm text-gray-600">Total Rooms</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{occupiedRooms}</p>
            <p className="text-sm text-gray-600">Occupied</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{availableRooms}</p>
            <p className="text-sm text-gray-600">Available</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{occupancyRate}%</p>
            <p className="text-sm text-gray-600">Occupancy Rate</p>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render Tenant Report
  const renderTenantReport = () => {
    if (!analyticsData) return null;
    
    // Import TenantMetricsRenderer dynamically
    const TenantMetricsRenderer = React.lazy(() => import('./TenantMetricsRenderer'));
    
    return (
      <React.Suspense fallback={<div className="mt-6 p-4 bg-blue-50 rounded-lg">Loading tenant metrics...</div>}>
        <TenantMetricsRenderer data={analyticsData} rawData={analyticsData} />
      </React.Suspense>
    );
  };

  // Render Room Performance Report
  const renderRoomPerformanceReport = () => {
    if (!analyticsData) return null;
    
    const priceComparison = analyticsData.price_comparison_by_building || [];
    
    if (priceComparison.length > 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-6"
        >
          <h3 className="text-lg font-bold text-gray-900">Room Price Comparison by Building</h3>
          <div className="space-y-4">
            {priceComparison.map((building: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">{building.building_name}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Least Expensive</p>
                    <p className="font-bold text-green-600">
                      Room {building.least_expensive.room_number}: ${building.least_expensive.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Most Expensive</p>
                    <p className="font-bold text-red-600">
                      Room {building.most_expensive.room_number}: ${building.most_expensive.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price Range</p>
                    <p className="font-bold text-gray-900">${building.price_range}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }
    
    return <div className="mt-6 p-4 bg-purple-50 rounded-lg">Room performance report coming soon...</div>;
  };

  // Render Generic Analytics
  const renderGenericAnalytics = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-gray-50 p-6 rounded-2xl"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Analytics Data</h3>
        <pre className="text-xs text-gray-600 overflow-auto">
          {JSON.stringify(analyticsData, null, 2)}
        </pre>
      </motion.div>
    );
  };

  // Enhanced content parsing with animations
  const renderFormattedContent = () => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Enhanced Headers with icons
      if (line.startsWith('## ')) {
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3 mt-6 mb-4"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {line.substring(3)}
            </h3>
          </motion.div>
        );
      }
      
      // Enhanced Bold text with gradients
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <motion.p 
            key={index} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed"
          >
            {parts.map((part, i) => 
              i % 2 === 1 ? (
                <span key={i} className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {part}
                </span>
              ) : part
            )}
          </motion.p>
        );
      }
      
      // Enhanced Bullet points with icons
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <motion.li 
            key={index} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start space-x-3 mb-2 text-gray-700 dark:text-gray-300"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
              className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2.5 flex-shrink-0"
            ></motion.div>
            <span>{line.substring(2)}</span>
          </motion.li>
        );
      }
      
      // Enhanced Regular lines
      return line.trim() ? (
        <motion.p 
          key={index} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.03 }}
          className="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed"
        >
          {line}
        </motion.p>
      ) : (
        <br key={index} />
      );
    });
  };

  return (
    <div className="w-full">
      {/* Render formatted text content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {renderFormattedContent()}
      </div>
      
      {/* Render interactive components based on data */}
      {Array.isArray(buildings) && buildings.length > 0 && renderBuildingCards()}
      {Array.isArray(rooms) && rooms.length > 0 && renderRoomCards()}
      {stats && renderStats()}
      {isAnalyticsReport && analyticsData && renderAnalyticsReport()}
      
      {/* Building Details Modal */}
      <AnimatePresence>
        {selectedBuilding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBuilding(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedBuilding.name}</h2>
                      <div className="flex items-center mt-1 text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {selectedBuilding.address}, {selectedBuilding.city}, {selectedBuilding.state}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBuilding(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Building Images */}
              {(() => {
                const images = parseBuildingImages(selectedBuilding.building_images || selectedBuilding.image);
                if (images.length === 0) return null;
                
                return (
                  <div className="relative">
                    {/* Main Image */}
                    <div className="relative h-64 bg-gray-100">
                      <img
                        src={images[0]}
                        alt={selectedBuilding.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    {images.length > 1 && (
                      <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                        {images.slice(1, 5).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${selectedBuilding.name} - ${index + 2}`}
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              // Could implement image gallery viewer here
                              window.open(image, '_blank');
                            }}
                          />
                        ))}
                        {images.length > 5 && (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                            +{images.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Building Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedBuilding.roomCount && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Home className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{selectedBuilding.roomCount}</div>
                          <div className="text-sm text-gray-600">Total Rooms</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedBuilding.priceRange && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            ${selectedBuilding.priceRange.min} - ${selectedBuilding.priceRange.max}
                          </div>
                          <div className="text-sm text-gray-600">Price Range</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {selectedBuilding.amenities && selectedBuilding.amenities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Building Amenities</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedBuilding.amenities.map((amenity, i) => {
                        const Icon = amenityIcons[amenity.toLowerCase()] || CheckCircle;
                        return (
                          <div key={i} className="flex items-center bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                            <Icon className="w-4 h-4 mr-3 text-gray-600" />
                            <span className="text-sm text-gray-800 font-medium">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Rooms */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Rooms</h3>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                      Ask me about specific rooms in this building to see detailed information and availability.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onAction && onAction('view_building_rooms', { buildingName: selectedBuilding.name });
                      setSelectedBuilding(null);
                    }}
                    className="w-full py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium border border-slate-200"
                  >
                    View All Rooms in This Building
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleScheduleTour(selectedBuilding);
                      setSelectedBuilding(null);
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center shadow-sm"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Tour
                  </button>
                  <button
                    onClick={() => {
                      onAction && onAction('get_building_info', { buildingName: selectedBuilding.name });
                      setSelectedBuilding(null);
                    }}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                  >
                    More Info
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Scheduling Modal */}
      <AnimatePresence>
        {showTourModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTourModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Schedule a Tour</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Great choice! I can help you schedule a tour for this building. 
                Would you like to:
              </p>
              <div className="space-y-3">
                <button className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Schedule for Today
                </button>
                <button className="w-full p-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  Choose Another Date
                </button>
                <button 
                  onClick={() => setShowTourModal(false)}
                  className="w-full p-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Room Details Modal */}
      {selectedRoom && (
        <RoomDetailsModal
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          room={selectedRoom}
          onAction={onAction}
        />
      )}
    </div>
  );
}