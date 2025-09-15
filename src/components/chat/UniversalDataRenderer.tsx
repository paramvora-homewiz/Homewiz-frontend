'use client';

import React from 'react';

interface UniversalDataRendererProps {
  data: any;
  content?: string;
  metadata?: any;
  userQuery?: string;
}

export default function UniversalDataRenderer({ data, content, metadata, userQuery }: UniversalDataRendererProps) {
  // Helper function to check if a value is empty/null
  const isEmpty = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return true;
    if (typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value).length === 0 || Object.values(value).every(v => isEmpty(v));
    }
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

  // Helper function to format field names
  const formatFieldName = (key: string): string => {
    // Skip internal fields
    if (key.startsWith('_') || key === 'id' || key.endsWith('_id')) return '';
    
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .replace(/\b(Id|Url|Api)\b/g, match => match.toUpperCase());
  };

  // Helper function to format value based on type and field name
  const formatValue = (value: any, key: string = ''): string => {
    if (isEmpty(value)) return '';
    
    // Handle dates
    if (key.includes('date') || key.includes('created') || key.includes('updated')) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      } catch {}
    }
    
    // Handle money/price fields
    if (key.includes('price') || key.includes('rent') || key.includes('revenue') || 
        key.includes('amount') || key.includes('deposit') || key.includes('payment')) {
      if (typeof value === 'number') {
        return `$${value.toLocaleString()}`;
      }
    }
    
    // Handle percentages
    if (key.includes('rate') || key.includes('percent')) {
      if (typeof value === 'number') {
        return `${value}%`;
      }
    }
    
    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  };

  // Render nested object (like room, lease, payment info)
  const renderNestedObject = (obj: any, indent: number = 0): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      if (isEmpty(value) || !formatFieldName(key)) return;
      
      const formattedKey = formatFieldName(key);
      const indentClass = indent > 0 ? `ml-${indent * 4}` : '';
      
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // Nested object
        elements.push(
          <div key={key} className={indentClass}>
            <div className="font-medium text-sm mt-2">{formattedKey}:</div>
            {renderNestedObject(value, indent + 1)}
          </div>
        );
      } else {
        // Simple value
        const formattedValue = formatValue(value, key);
        if (formattedValue) {
          elements.push(
            <div key={key} className={`text-sm ${indentClass}`}>
              • {formattedKey}: {formattedValue}
            </div>
          );
        }
      }
    });
    
    return elements;
  };

  // Detect data type and render appropriately
  const renderData = () => {
    if (!data) return null;

    // If data is an array (multiple items like tenants, rooms, etc.)
    if (Array.isArray(data)) {
      // Detect the type of items
      const firstItem = data[0];
      if (!firstItem) return null;
      
      // Determine item type based on fields
      let itemType = 'Items';
      if (firstItem.tenant_name || firstItem.name) itemType = 'Tenants';
      else if (firstItem.room_number || firstItem.room_id) itemType = 'Rooms';
      else if (firstItem.building_name || firstItem.building_id) itemType = 'Buildings';
      else if (firstItem.lead_name) itemType = 'Leads';
      
      return (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-bold text-lg mb-3">
            {content || `Found ${data.length} ${itemType}:`}
          </h3>
          <div className="space-y-4">
            {data.map((item: any, index: number) => {
              // Extract main identifier (name, title, etc.)
              const mainName = item.tenant_name || item.name || item.title || 
                             item.building_name || item.lead_name ||
                             `${itemType.slice(0, -1)} ${index + 1}`;
              
              return (
                <div key={index} className="border-l-4 border-blue-500 pl-3">
                  <div className="font-semibold">{mainName}</div>
                  <div className="space-y-1 mt-1">
                    {/* Handle room info specially if it exists */}
                    {item.room && typeof item.room === 'object' && (
                      <div className="text-sm">
                        • Room: {item.room.number || item.room.room_number} at {item.room.building_name || 'Unknown Building'}
                      </div>
                    )}
                    
                    {/* Handle other fields */}
                    {Object.entries(item).map(([key, value]) => {
                      // Skip certain fields
                      if (key === 'id' || key.endsWith('_id') || key === 'name' || 
                          key === 'tenant_name' || key === 'title' || key === 'room' ||
                          isEmpty(value)) {
                        return null;
                      }
                      
                      const formattedKey = formatFieldName(key);
                      if (!formattedKey) return null;
                      
                      // Handle nested objects
                      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                        const hasNonEmptyValues = Object.values(value).some(v => !isEmpty(v));
                        if (!hasNonEmptyValues) return null;
                        
                        return (
                          <div key={key}>
                            <div className="font-medium text-sm mt-1">{formattedKey}:</div>
                            {renderNestedObject(value, 1)}
                          </div>
                        );
                      }
                      
                      // Handle simple values
                      const formattedValue = formatValue(value, key);
                      if (formattedValue) {
                        return (
                          <div key={key} className="text-sm">
                            • {formattedKey}: {formattedValue}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    // If data is a single object (report, summary, etc.)
    if (typeof data === 'object') {
      return (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-bold text-lg mb-3">{content || 'Data:'}</h3>
          <div className="space-y-2">
            {renderNestedObject(data)}
          </div>
        </div>
      );
    }
    
    // Fallback for simple values
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {content && <h3 className="font-bold text-lg mb-3">{content}</h3>}
        <div>{String(data)}</div>
      </div>
    );
  };

  return (
    <>
      {renderData()}
    </>
  );
}