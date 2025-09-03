'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Home, DollarSign, MapPin, Filter, AlertCircle,
  ArrowRight, Building, Sparkles, TrendingUp, RefreshCw,
  Info, Lightbulb, Target, ChevronRight
} from 'lucide-react';

interface NoResultsDisplayProps {
  searchCriteria?: {
    priceMin?: number;
    priceMax?: number;
    location?: string;
    features?: string[];
  };
  totalAvailable?: number;
  onAction?: (action: string, data?: any) => void;
  suggestions?: string[];
}

export default function NoResultsDisplay({ 
  searchCriteria, 
  totalAvailable = 0, 
  onAction,
  suggestions = []
}: NoResultsDisplayProps) {
  // Generate smart suggestions based on criteria
  const generateSuggestions = () => {
    const defaultSuggestions = [];
    
    if (searchCriteria?.priceMax) {
      defaultSuggestions.push(`Show me all rooms under $${searchCriteria.priceMax + 500}`);
    }
    
    if (searchCriteria?.location) {
      defaultSuggestions.push('Show me rooms in nearby areas');
    }
    
    if (searchCriteria?.features && searchCriteria.features.length > 0) {
      defaultSuggestions.push(`Show me rooms with ${searchCriteria.features[0]} only`);
    }
    
    defaultSuggestions.push('Show me all available rooms');
    defaultSuggestions.push('What are the most popular rooms?');
    
    return suggestions.length > 0 ? suggestions : defaultSuggestions;
  };

  const smartSuggestions = generateSuggestions();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Main Card */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        
        {/* Icon and Title */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
            >
              <AlertCircle className="w-4 h-4 text-yellow-900" />
            </motion.div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No Rooms Match Your Search
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We couldn't find any rooms that match all your criteria. Don't worry though - we have {totalAvailable} total rooms available!
          </p>
        </motion.div>

        {/* Search Criteria Summary */}
        {searchCriteria && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center mb-4">
              <Filter className="w-5 h-5 text-gray-500 mr-2" />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Your Search Criteria</h4>
            </div>
            
            {/* If we have specific criteria, show them */}
            {(searchCriteria.priceMin !== undefined || searchCriteria.location || searchCriteria.features) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchCriteria.priceMin !== undefined && searchCriteria.priceMax !== undefined && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      ${searchCriteria.priceMin} - ${searchCriteria.priceMax}
                    </span>
                  </div>
                )}
                
                {searchCriteria.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {searchCriteria.location}
                    </span>
                  </div>
                )}
                
                {searchCriteria.features && searchCriteria.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            ) : searchCriteria.originalQuery ? (
              /* If we only have the original query, show it */
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  "{searchCriteria.originalQuery}"
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  We couldn't identify specific criteria from your search. Try being more specific about price, location, or amenities.
                </p>
              </div>
            ) : (
              /* Fallback if nothing is detected */
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No specific criteria detected
              </div>
            )}
          </motion.div>
        )}

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Try These Searches Instead</h4>
          </div>
          
          <div className="space-y-2">
            {smartSuggestions.slice(0, 3).map((suggestion, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                onClick={() => onAction?.('search', suggestion)}
                className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {suggestion}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={() => onAction?.('view_all')}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center group"
          >
            <Home className="w-5 h-5 mr-2" />
            View All {totalAvailable} Available Rooms
            <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => onAction?.('adjust_criteria')}
            className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all border border-gray-300 dark:border-gray-600 flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Adjust Search Criteria
          </button>
        </motion.div>

        {/* Additional Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                Pro Tip: Flexibility Gets Results
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Try adjusting your price range by $100-200 or considering different amenities. 
                Many great rooms might be just outside your initial criteria!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        {totalAvailable > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 flex items-center justify-center space-x-6 text-sm"
          >
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {totalAvailable} rooms available citywide
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                High demand area
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}