'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface QueryResponseMismatchDetectorProps {
  query: string;
  responseData: any;
  children: React.ReactNode;
}

export default function QueryResponseMismatchDetector({ 
  query, 
  responseData, 
  children 
}: QueryResponseMismatchDetectorProps) {
  
  // Detect if query is about tenant payments but response is financial data
  const detectMismatch = () => {
    const queryLower = query.toLowerCase();
    
    // Check if query is about tenant payments
    const isTenantPaymentQuery = 
      (queryLower.includes('tenant') && (queryLower.includes('paid') || queryLower.includes('overdue'))) ||
      queryLower.includes('payment status') ||
      queryLower.includes('who paid') ||
      queryLower.includes('outstanding payment') ||
      queryLower.includes('late payment');
    
    // Check if query is about occupancy rate
    const isOccupancyQuery = 
      queryLower.includes('occupancy') ||
      queryLower.includes('occupied') ||
      queryLower.includes('vacancy') ||
      queryLower.includes('vacant') ||
      (queryLower.includes('how many') && queryLower.includes('filled'));
    
    // Check if response is financial/revenue data instead of tenant data
    const isFinancialResponse = 
      responseData?.by_building || 
      responseData?.total_potential_revenue !== undefined ||
      responseData?.revenue_realization_rate !== undefined ||
      responseData?.actual_revenue !== undefined;
    
    const isTenantResponse = 
      responseData?.tenants || 
      responseData?.payments ||
      (Array.isArray(responseData) && responseData[0]?.tenant_name);
    
    const isOccupancyResponse = 
      responseData?.occupancy_rate !== undefined ||
      responseData?.occupied_units !== undefined ||
      responseData?.total_units !== undefined ||
      responseData?.vacancy_rate !== undefined;
    
    // Return object with mismatch type
    if (isTenantPaymentQuery && isFinancialResponse && !isTenantResponse) {
      return { type: 'tenant_payment_mismatch' };
    }
    
    if (isOccupancyQuery && isFinancialResponse && !isOccupancyResponse) {
      return { type: 'occupancy_mismatch' };
    }
    
    return null;
  };
  
  const mismatch = detectMismatch();
  
  if (mismatch) {
    const mismatchMessages = {
      tenant_payment_mismatch: {
        title: "Unexpected Response",
        description: "I received financial revenue data instead of tenant payment information. This might be due to how the query was interpreted.",
        suggestions: [
          "Show me list of tenants with payment status",
          "Which tenants have outstanding rent payments?",
          "List all overdue tenant payments",
          "Show tenant payment history"
        ],
        understood: "Financial report showing building revenues"
      },
      occupancy_mismatch: {
        title: "Occupancy Data Not Available",
        description: "I received financial revenue data instead of occupancy rate information. The system may have misunderstood your query about occupancy rates.",
        suggestions: [
          "What is the current occupancy rate?",
          "Show me occupancy statistics by building",
          "Which buildings have the highest vacancy?",
          "Display monthly occupancy trends"
        ],
        understood: "Financial report showing building revenues instead of occupancy data"
      }
    };
    
    const message = mismatchMessages[mismatch.type];
    
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">{message.title}</h4>
              <p className="text-sm text-amber-800 mb-3">
                {message.description}
              </p>
              <div className="bg-amber-100 rounded-md p-3">
                <p className="text-sm font-medium text-amber-900 mb-2">Try asking more specifically:</p>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  {message.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-3">
          <p className="text-sm text-gray-600 mb-2">
            <strong>What I understood:</strong> {message.understood}
          </p>
          {children}
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}