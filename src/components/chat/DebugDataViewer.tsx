import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DebugDataViewerProps {
  data: any;
  metadata: any;
}

export function DebugDataViewer({ data, metadata }: DebugDataViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs font-mono">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
      >
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        Debug Data View
      </button>
      
      {isExpanded && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Data Structure:</h4>
            <pre className="bg-white dark:bg-gray-900 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Metadata Structure:</h4>
            <pre className="bg-white dark:bg-gray-900 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Room Detection:</h4>
            <div className="bg-white dark:bg-gray-900 p-2 rounded">
              <p>data?.rooms: {data?.rooms ? `${data.rooms.length} rooms` : 'undefined'}</p>
              <p>metadata?.result?.rooms: {metadata?.result?.rooms ? `${metadata.result.rooms.length} rooms` : 'undefined'}</p>
              <p>metadata?.rooms: {metadata?.rooms ? `${metadata.rooms.length} rooms` : 'undefined'}</p>
              <p>Array.isArray(data): {Array.isArray(data) ? 'true' : 'false'}</p>
              <p>metadata?.result?.data: {metadata?.result?.data ? `Array: ${Array.isArray(metadata.result.data)}` : 'undefined'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}