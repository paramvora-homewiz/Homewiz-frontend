'use client';

import React from 'react';
import { Mail, MessageSquare, Copy } from 'lucide-react';

interface TeamMessageFormatterProps {
  data: any;
  userQuery: string;
  content?: string;
}

export default function TeamMessageFormatter({ data, userQuery, content }: TeamMessageFormatterProps) {
  // Format the data based on type
  const formatDataForTeam = () => {
    if (!data) return '';
    
    // Handle tenant data
    if (Array.isArray(data) && data[0] && (data[0].tenant_name || data[0].name)) {
      const tenants = data;
      return `
Team Update: Tenant Report

Query: ${userQuery}

We have ${tenants.length} tenant(s) matching your criteria:

${tenants.map((t, i) => `
${i + 1}. ${t.tenant_name || t.name}
   • Contact: ${t.email || t.tenant_email || 'N/A'} | ${t.phone || 'N/A'}
   • Room: ${t.room?.number || t.room_number || 'N/A'} at ${t.room?.building_name || t.building_name || 'N/A'}
   • Status: ${t.status || 'Unknown'}
   ${t.payment?.status ? `• Payment Status: ${t.payment.status}` : ''}
   ${t.lease?.end_date ? `• Lease Ends: ${new Date(t.lease.end_date).toLocaleDateString()}` : ''}
`).join('\n')}

Action Items:
• Follow up with any tenants showing late payment status
• Review lease expiration dates for renewals
• Contact tenants with unknown status for verification

Please let me know if you need additional details or want me to schedule follow-ups.

Best regards,
HomeWiz Management System
      `.trim();
    }
    
    // Handle room data
    if (Array.isArray(data) && data[0] && (data[0].room_number || data[0].room_id)) {
      const rooms = data;
      return `
Team Update: Room Availability Report

Query: ${userQuery}

We have ${rooms.length} room(s) matching your criteria:

${rooms.map((r, i) => `
${i + 1}. ${r.title || `Room ${r.room_number}`}
   • Building: ${r.building?.name || r.building || r.building_name || 'N/A'}
   • Rent: $${r.rent || r.private_room_rent || 0}/month
   • Status: ${r.status || 'Available'}
   • Floor: ${r.floor_number || 'N/A'}
   ${r.furnished ? '• Furnished: Yes' : ''}
`).join('\n')}

Summary:
• Total rooms: ${rooms.length}
• Available: ${rooms.filter(r => r.status === 'Available' || r.status === 'available').length}
• Price range: $${Math.min(...rooms.map(r => r.rent || r.private_room_rent || 0))} - $${Math.max(...rooms.map(r => r.rent || r.private_room_rent || 0))}

Next Steps:
• Schedule viewings for interested prospects
• Update listings on marketing platforms
• Prepare rooms marked as "Maintenance" for availability

Best regards,
HomeWiz Management System
      `.trim();
    }
    
    // Handle building data
    if (Array.isArray(data) && data[0] && (data[0].building || data[0].building_name || data[0].name)) {
      const buildings = data;
      
      return buildings.map((b, i) => {
        const name = b.title || b.name || b.building_name || `Building ${i + 1}`;
        const rent = b.rent || b.private_room_rent || 0;
        const status = b.status || 'Unknown';
        const address = b.address || 'not specified';
        
        return `${name} is ${status === 'Unknown' ? 'available' : status}. The rent is $${rent} per month and it's located at ${address}.`;
      }).join(' ').trim();
    }
    
    // Handle financial/report data
    if (typeof data === 'object' && !Array.isArray(data)) {
      const entries = Object.entries(data).filter(([key, value]) => 
        value !== null && value !== undefined && !key.startsWith('_') && key !== 'id'
      );
      
      if (entries.length === 0) {
        return `No data found for this query.`;
      }
      
      const descriptions = entries.map(([key, value]) => {
        const field = key.replace(/_/g, ' ');
        if (typeof value === 'number') {
          if (key.includes('revenue') || key.includes('rent') || key.includes('amount')) {
            return `The ${field} is $${value.toLocaleString()}`;
          } else if (key.includes('rate') || key.includes('percent')) {
            return `The ${field} is ${value}%`;
          }
          return `The ${field} is ${value}`;
        }
        if (typeof value === 'boolean') {
          return `The ${field} is ${value ? 'yes' : 'no'}`;
        }
        if (typeof value === 'object') {
          return null;
        }
        return `The ${field} is ${value}`;
      }).filter(Boolean);
      
      return descriptions.join('. ') + '.';
    }
    
    // Default format - extract all meaningful information
    if (Array.isArray(data)) {
      const items = data.map((item, i) => {
        if (typeof item === 'object' && item !== null) {
          // Extract all non-null, non-id values
          const values = [];
          
          // Check for common fields first
          if (item.title || item.name) values.push(item.title || item.name);
          if (item.building_name) values.push(`at ${item.building_name}`);
          if (item.rent || item.private_room_rent) values.push(`$${item.rent || item.private_room_rent}/month`);
          if (item.status && item.status !== 'Unknown') values.push(item.status);
          
          // If no common fields found, extract other meaningful values
          if (values.length === 0) {
            Object.entries(item).forEach(([key, value]) => {
              if (value && key !== 'id' && !key.endsWith('_id') && key !== '_id') {
                if (typeof value === 'string' || typeof value === 'number') {
                  values.push(value);
                }
              }
            });
          }
          
          return values.length > 0 ? values.join(' ') : `Item ${i + 1}`;
        }
        return String(item);
      });
      
      return `Found ${data.length} items. ${items.join('. ')}.`;
    }
    
    return `Data received but format not recognized for proper display.`;
  };

  const formattedMessage = formatDataForTeam();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedMessage);
    alert('Message copied to clipboard!');
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Team Communication Format
          </h3>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <Copy className="w-4 h-4" />
          Copy Message
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-md p-4 font-mono text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
        {formattedMessage}
      </div>
      
      <div className="mt-3 flex gap-2">
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
          <MessageSquare className="w-3 h-3" />
          Ready to send via email or text
        </div>
      </div>
    </div>
  );
}