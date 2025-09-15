'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { 
  MapPin, DollarSign, Bed, Bath, Home, Users, 
  CheckCircle, Clock, Sun, Cloud, Star, Eye,
  Calendar, Activity, Building, Wifi, Car,
  Dumbbell, WashingMachine, Thermometer, Shield,
  Coffee, Tv, Wind, Lock, Phone, Mail,
  Square, Maximize2, Layers, Camera, PlayCircle, X
} from 'lucide-react';
import { parseBuildingImages } from '@/lib/backend-sync';

interface RoomData {
  id?: number;
  room_id?: string;
  building?: string | {
    id?: string | number;
    name?: string;
    building_name?: string;
    address?: string;
    city?: string;
    state?: string;
  };
  building_id?: string;
  building_name?: string;
  buildings?: any;
  room_number: string;
  room_type?: string;
  price?: number;
  private_room_rent?: number;
  rent?: number;
  title?: string;
  type?: string;
  bathrooms?: number;
  bathroom_type?: string;
  view?: string;
  floor_number?: number;
  furnishing?: string;
  available?: boolean;
  status?: string;
  amenities?: any;
  bed_size?: string;
  bed_type?: string;
  sq_footage?: number;
  maximum_people_in_room?: number;
  active_tenants?: number;
  ready_to_rent?: boolean;
  booked_till?: string;
  full_address?: string;
  match_score?: number;
  match_reasons?: string[];
  // Individual amenity fields
  wifi?: boolean;
  mini_fridge?: boolean;
  work_desk?: boolean;
  work_chair?: boolean;
  air_conditioning?: boolean;
  heating?: boolean;
  cable_tv?: boolean;
  furnished?: boolean;
  sink?: boolean;
  bedding_provided?: boolean;
  // Media fields
  room_images?: any;
  building_images?: any;
  building_videos?: any;
}

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onAction?: (action: string, data: any) => void;
}

// Helper function to extract price from room data
const getRoomPrice = (room: any): number | null => {
  const possiblePriceFields = [
    'private_room_rent',
    'price',
    'rent',
    'monthly_rent',
    'rate',
    'room_rent'
  ];
  
  for (const field of possiblePriceFields) {
    if (room[field] && typeof room[field] === 'number') {
      return room[field];
    }
  }
  
  if (room.pricing?.private_room_rent) return room.pricing.private_room_rent;
  if (room.pricing?.price) return room.pricing.price;
  
  return null;
};

// Helper function to estimate sunlight exposure
const estimateSunlightExposure = (room: RoomData) => {
  const view = room.view?.toLowerCase() || '';
  const floor = room.floor_number || 1;
  
  if (view.includes('north') || floor < 2) {
    return { level: 'low', label: 'Limited', icon: Cloud, color: 'text-gray-500' };
  }
  if (view.includes('south') || view.includes('city') || floor > 3) {
    return { level: 'high', label: 'Excellent', icon: Sun, color: 'text-yellow-500' };
  }
  return { level: 'medium', label: 'Good', icon: Sun, color: 'text-orange-400' };
};

// Map amenity keys to icons
const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  gym: Dumbbell,
  laundry: WashingMachine,
  ac: Thermometer,
  air_conditioning: Thermometer,
  heating: Thermometer,
  security: Shield,
  kitchen: Coffee,
  tv: Tv,
  cable_tv: Tv,
  ventilation: Wind,
  secure_entry: Lock,
  furnished: Home,
  mini_fridge: Coffee,
  work_desk: Square,
  work_chair: Square,
  sink: Bath,
  bedding_provided: Bed,
};

export function RoomDetailsModal({ isOpen, onClose, room, onAction }: RoomDetailsModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  
  const price = getRoomPrice(room);
  const sunlight = estimateSunlightExposure(room);
  const SunlightIcon = sunlight.icon;

  // Extract building name from various possible fields
  // Extract building name from various sources
  let buildingName = room.building_name;
  if (!buildingName && room.building) {
    if (typeof room.building === 'string') {
      buildingName = room.building;
    } else if (typeof room.building === 'object' && room.building !== null) {
      buildingName = room.building.name || room.building.building_name;
    }
  }
  if (!buildingName && room.buildings) {
    buildingName = room.buildings.name || room.buildings.building_name;
  }
  buildingName = buildingName || 'Building';
  
  // Extract address
  const address = room.full_address || room.buildings?.address || '';
  
  // Parse images - only use room images
  const roomImages = parseBuildingImages(room.room_images);
  const allImages = roomImages;
  
  // Parse videos
  const buildingVideos = parseBuildingImages(room.buildings?.building_videos || room.building_videos);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-6xl"
    >
      <div>
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Room {room.room_number}
              </h1>
              <div className="flex items-center mb-1 opacity-90">
                <Building className="w-5 h-5 mr-2" />
                <span className="text-lg">{buildingName}</span>
              </div>
              {address && (
                <div className="flex items-center text-sm opacity-80">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{address}</span>
                </div>
              )}
            </div>
            
            {price && (
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">
                  ${price.toLocaleString()}
                </div>
                <div className="text-sm opacity-90">per month</div>
              </div>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-3 mt-4">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
              room.status === 'Available' || room.available ? 'bg-green-500 text-white' :
              room.status === 'Occupied' ? 'bg-red-500 text-white' :
              'bg-yellow-500 text-white'
            }`}>
              {room.status || (room.available ? 'Available' : 'Occupied')}
            </span>
            
            {room.ready_to_rent && (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white">
                <CheckCircle className="w-4 h-4 mr-1" />
                Ready to Rent
              </span>
            )}
            
            {room.match_score && (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white">
                <Star className="w-4 h-4 mr-1" />
                {room.match_score}% Match
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Media Gallery Section - Always show section, even if no images */}
          <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-gray-600" />
                Photos & Videos
              </h3>
              
              {/* Main Image/Video Display */}
              <div className="relative mb-4">
                {showVideo && buildingVideos.length > 0 ? (
                  <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <video
                      controls
                      autoPlay
                      className="w-full h-full"
                      src={buildingVideos[0]}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <button
                      onClick={() => setShowVideo(false)}
                      className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : allImages.length > 0 ? (
                  <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={allImages[selectedImageIndex]}
                      alt={`${buildingName} - Room ${room.room_number}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Show placeholder when image fails to load
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="h-full flex items-center justify-center bg-gray-100">
                              <div class="text-gray-400 text-center">
                                <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p>Image could not be loaded</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <Camera className="w-16 h-16 mx-auto mb-2" />
                      <p>No photos available</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setShowVideo(false);
                    }}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index && !showVideo
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide broken thumbnail
                        const button = e.currentTarget.parentElement;
                        if (button) {
                          button.style.display = 'none';
                        }
                      }}
                    />
                  </button>
                ))}
                
                {/* Video Thumbnail */}
                {buildingVideos.length > 0 && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all relative ${
                      showVideo
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute bottom-1 left-1 right-1 text-xs text-white bg-black/60 rounded px-1 py-0.5 text-center">
                      Video Tour
                    </div>
                  </button>
                )}
              </div>
            </div>
          
          {/* Key Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Room Type Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Home className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Room Type</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{room.room_type || 'Standard Room'}</p>
              {room.furnishing && (
                <p className="text-sm text-gray-600 mt-1">{room.furnishing}</p>
              )}
            </div>

            {/* Space Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Square className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Space</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {room.sq_footage ? `${room.sq_footage} sq ft` : 'Standard Size'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Floor {room.floor_number || 1}</p>
            </div>

            {/* Occupancy Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Occupancy</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {room.maximum_people_in_room || 1} {room.maximum_people_in_room === 1 ? 'Person' : 'People'}
              </p>
              {room.active_tenants !== undefined && (
                <p className="text-sm text-gray-600 mt-1">
                  Current: {room.active_tenants} tenant{room.active_tenants !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Room Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-gray-600" />
                    Room Details
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Bathroom</p>
                      <p className="font-medium text-gray-900 flex items-center">
                        <Bath className="w-4 h-4 mr-2 text-gray-400" />
                        {room.bathroom_type || 'Private'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Bed Type</p>
                      <p className="font-medium text-gray-900 flex items-center">
                        <Bed className="w-4 h-4 mr-2 text-gray-400" />
                        {room.bed_size || 'Full'} {room.bed_type || 'Bed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">View</p>
                      <p className="font-medium text-gray-900 flex items-center">
                        <Eye className="w-4 h-4 mr-2 text-gray-400" />
                        {room.view || 'Standard View'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Natural Light</p>
                      <p className={`font-medium flex items-center ${sunlight.color}`}>
                        <SunlightIcon className="w-4 h-4 mr-2" />
                        {sunlight.label}
                      </p>
                    </div>
                    {room.bathrooms !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Number of Bathrooms</p>
                        <p className="font-medium text-gray-900">{room.bathrooms}</p>
                      </div>
                    )}
                    {room.booked_till && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Available From</p>
                        <p className="font-medium text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(room.booked_till).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Information */}
              {room.match_score && room.match_reasons && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-blue-600" />
                      Why This Room Matches You
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {room.match_reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 mr-3 text-blue-500 mt-0.5" />
                          <span className="text-gray-700">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Amenities Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-gray-600" />
                    Amenities & Features
                  </h3>
                </div>
                <div className="p-6">
                  {(() => {
                    // Map of amenity fields in the room object
                    const amenityFields = {
                      wifi: room.wifi,
                      'mini_fridge': room.mini_fridge,
                      'work_desk': room.work_desk,
                      'work_chair': room.work_chair,
                      'air_conditioning': room.air_conditioning,
                      heating: room.heating,
                      'cable_tv': room.cable_tv,
                      furnished: room.furnished,
                      sink: room.sink,
                      'bedding_provided': room.bedding_provided,
                    };
                    
                    // Filter out undefined values and check if we have any amenities
                    const availableAmenities = Object.entries(amenityFields).filter(([_, value]) => value !== undefined);
                    
                    if (availableAmenities.length > 0) {
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          {availableAmenities.map(([key, value]) => {
                            const IconComponent = amenityIcons[key] || CheckCircle;
                            return (
                              <div key={key} className="flex items-center">
                                <IconComponent className={`w-5 h-5 mr-3 ${value ? 'text-green-500' : 'text-gray-300'}`} />
                                <span className={`${value ? 'text-gray-700 font-medium' : 'text-gray-400 line-through'}`}>
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-gray-500 text-center py-4">
                          No amenity information available
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-gray-600" />
                    Get In Touch
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Interested in this room? Contact us to schedule a viewing or get more information.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        onAction?.('schedule_tour', { 
                          room: room.room_number, 
                          building: buildingName,
                          room_id: room.id || room.room_id 
                        });
                        onClose();
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Schedule Tour
                    </button>
                    
                    <button
                      onClick={() => {
                        onAction?.('contact_about_room', { 
                          room: room.room_number, 
                          building: buildingName,
                          room_id: room.id || room.room_id 
                        });
                        onClose();
                      }}
                      className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Contact About Room
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Building Information Link */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <button
              onClick={() => {
                onAction?.('get_building_info', { 
                  buildingName: buildingName,
                  building_id: room.building_id 
                });
                onClose();
              }}
              className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
            >
              <Building className="w-5 h-5 mr-2" />
              View Full Building Information for {buildingName}
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}