/**
 * LLM Response Formatter Service
 * Processes raw API data through LLM to generate natural language responses
 */

export class LLMResponseFormatter {
  private static SYSTEM_PROMPT = `You are an autonomous agent that manages rental business. Review the API response and create a helpful, professional response that can be sent via email or text message to team members.

IMPORTANT:
- Write a professional but friendly message
- Extract key insights and actionable information
- For performance data: highlight best/worst performers and suggest actions
- For tenant data: mention names, payment status, and any issues
- For room data: specify availability, prices, and locations
- Include specific numbers and percentages
- Suggest next steps when appropriate
- Keep it concise but informative
- Sign off as "Your Autonomous Rental Manager" or similar`;

  /**
   * Process API response through LLM (using Gemini or OpenAI)
   */
  static async formatWithLLM(
    apiResponse: any,
    userQuery: string,
    apiKey?: string
  ): Promise<string> {
    try {
      // Use Gemini API if available
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY || apiKey) {
        return await this.formatWithGemini(apiResponse, userQuery, apiKey);
      }
      
      // Fallback to rule-based formatting
      return this.formatWithRules(apiResponse, userQuery);
    } catch (error) {
      console.error('LLM formatting failed:', error);
      return this.formatWithRules(apiResponse, userQuery);
    }
  }

  /**
   * Format using Google Gemini API
   */
  private static async formatWithGemini(
    apiResponse: any,
    userQuery: string,
    apiKey?: string
  ): Promise<string> {
    const geminiApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `
${this.SYSTEM_PROMPT}

User Query: "${userQuery}"

API Response Data:
${JSON.stringify(apiResponse, null, 2)}

Based on this data, write a professional message that team members can understand and act upon:`;

    console.log('🔑 Using Gemini API Key:', geminiApiKey ? `${geminiApiKey.substring(0, 10)}...` : 'NOT SET');
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || this.formatWithRules(apiResponse, userQuery);
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  /**
   * Rule-based formatting as fallback
   */
  private static formatWithRules(apiResponse: any, userQuery: string): string {
    // Always try to provide meaningful output even without LLM
    if (Array.isArray(apiResponse) && apiResponse.length > 0) {
      // Check if it's building performance data
      const firstItem = apiResponse[0];
      if (firstItem.data && firstItem.data.occupancy_rate !== undefined) {
        let message = `Based on your request about ${userQuery}, here's what I found:\n\n`;
        apiResponse.forEach(item => {
          const d = item.data || item;
          if (d.category === 'Best Performing') {
            message += `Best Performing Building: ${d.building_name} is doing excellent with ${d.occupancy_rate}% occupancy. They have ${d.occupied_rooms} out of ${d.total_rooms} rooms filled.\n\n`;
          } else if (d.category === 'Worst Performing') {
            message += `Worst Performing Building: ${d.building_name} needs immediate attention with only ${d.occupancy_rate}% occupancy. Only ${d.occupied_rooms} out of ${d.total_rooms} rooms are occupied.\n\n`;
          }
        });
        message += "Recommendation: Focus your marketing and leasing efforts on the underperforming property to improve occupancy rates.";
        return message;
      }
      
      // For other data types
      const itemType = this.detectItemType(firstItem);
      if (itemType === 'tenant') {
        return this.formatTenantsConversational(apiResponse);
      } else if (itemType === 'room') {
        return this.formatRoomsConversational(apiResponse);
      } else if (itemType === 'building') {
        return this.formatBuildingsConversational(apiResponse);
      } else {
        // Generic format with more details
        return `Found ${apiResponse.length} results. Configure Gemini API for professional formatting.`;
      }
    }
    
    // Handle single object responses
    if (typeof apiResponse === 'object' && apiResponse !== null) {
      return this.formatReportConversational(apiResponse, userQuery);
    }
    
    return `Data retrieved: ${JSON.stringify(apiResponse)}`;
  }

  private static detectItemType(item: any): string {
    if (!item) return 'item';
    
    if (item.tenant_name || item.tenant_id || item.lease) return 'tenant';
    if (item.room_number || item.room_id || item.private_room_rent) return 'room';
    if (item.building_name || item.building_id || item.total_rooms) return 'building';
    if (item.lead_name || item.lead_id) return 'lead';
    
    return 'item';
  }

  private static formatTenantsConversational(tenants: any[]): string {
    const results = tenants.map(t => {
      const name = t.tenant_name || t.name || 'Unknown tenant';
      const room = t.room?.number || t.room_number || 'unspecified';
      const building = t.room?.building_name || t.building_name || '';
      const email = t.email || t.tenant_email || '';
      const payment = t.payment?.status || '';
      
      let info = `${name} is in room ${room}`;
      if (building) info += ` at ${building}`;
      if (email) info += `. Contact: ${email}`;
      if (payment) info += `. Payment status: ${payment}`;
      
      return info + '.';
    });
    
    return `Found ${tenants.length} tenants. ${results.join(' ')}`;
  }

  private static formatRoomsConversational(rooms: any[]): string {
    const results = rooms.map(r => {
      const title = r.title || `Room ${r.room_number}` || 'Room';
      const building = r.building_name || r.building?.name || '';
      const rent = r.rent || r.private_room_rent || 0;
      const status = r.status || 'available';
      
      let info = `${title}`;
      if (building) info += ` at ${building}`;
      info += ` is ${status}. Rent: $${rent}/month`;
      
      return info + '.';
    });
    
    return `Found ${rooms.length} rooms. ${results.join(' ')}`;
  }

  private static formatBuildingsConversational(buildings: any[]): string {
    const results = buildings.map(b => {
      const name = b.building_name || b.name || 'Building';
      const available = b.available_rooms || 0;
      const total = b.total_rooms || 0;
      
      let info = `${name}`;
      if (total > 0) info += ` has ${available} of ${total} rooms available`;
      else if (available > 0) info += ` has ${available} rooms available`;
      
      return info + '.';
    });
    
    return `Found ${buildings.length} buildings. ${results.join(' ')}`;
  }

  private static formatReportConversational(data: any, userQuery: string): string {
    let response = `Here's what I found for your ${userQuery.toLowerCase()}. `;
    
    if (data.total_revenue !== undefined) {
      response += `The total revenue is $${data.total_revenue.toLocaleString()}. `;
    }
    
    if (data.occupancy_rate !== undefined) {
      response += `Occupancy is at ${data.occupancy_rate}%. `;
    }
    
    if (data.occupied_rooms !== undefined && data.total_rooms !== undefined) {
      response += `We have ${data.occupied_rooms} out of ${data.total_rooms} rooms occupied. `;
    }
    
    if (data.by_building && typeof data.by_building === 'object') {
      const buildingCount = Object.keys(data.by_building).length;
      response += `This covers ${buildingCount} building${buildingCount !== 1 ? 's' : ''}. `;
    }
    
    return response || `I've processed your request for ${userQuery}.`;
  }

  private static formatTenants(tenants: any[]): string {
    let result = '**Tenant Details:**\n\n';
    
    tenants.forEach((tenant, index) => {
      result += `${index + 1}. **${tenant.tenant_name || tenant.name || 'Unknown Tenant'}**\n`;
      result += `   • Email: ${tenant.email || tenant.tenant_email || 'N/A'}\n`;
      result += `   • Phone: ${tenant.phone || 'N/A'}\n`;
      
      if (tenant.room) {
        result += `   • Room: ${tenant.room.number || tenant.room.room_number || 'N/A'} at ${tenant.room.building_name || 'N/A'}\n`;
      }
      
      result += `   • Status: ${tenant.status || 'Active'}\n`;
      
      if (tenant.payment?.status) {
        result += `   • Payment Status: ${tenant.payment.status}\n`;
      }
      
      if (tenant.lease?.end_date) {
        result += `   • Lease Ends: ${new Date(tenant.lease.end_date).toLocaleDateString()}\n`;
      }
      
      result += '\n';
    });
    
    return result;
  }

  private static formatRooms(rooms: any[]): string {
    let result = '**Available Rooms:**\n\n';
    
    // Group by building if possible
    const buildingGroups: { [key: string]: any[] } = {};
    
    rooms.forEach(room => {
      const building = room.building?.name || room.building || room.building_name || 'Unknown Building';
      if (!buildingGroups[building]) {
        buildingGroups[building] = [];
      }
      buildingGroups[building].push(room);
    });
    
    Object.entries(buildingGroups).forEach(([building, buildingRooms]) => {
      result += `📍 **${building}**\n`;
      
      buildingRooms.forEach(room => {
        result += `   • Room ${room.room_number || room.title || 'N/A'}`;
        result += ` - $${room.rent || room.private_room_rent || 0}/month`;
        result += ` (${room.status || 'Available'})\n`;
        
        if (room.floor_number) {
          result += `     Floor ${room.floor_number}`;
        }
        if (room.furnished) {
          result += ' • Furnished';
        }
        if (room.bathroom_included) {
          result += ' • Private Bath';
        }
        if (room.floor_number || room.furnished || room.bathroom_included) {
          result += '\n';
        }
      });
      
      result += '\n';
    });
    
    // Add summary
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(r => 
      r.status === 'Available' || r.status === 'available' || !r.status
    ).length;
    const priceRange = rooms.reduce((acc, room) => {
      const price = room.rent || room.private_room_rent || 0;
      return {
        min: Math.min(acc.min, price),
        max: Math.max(acc.max, price)
      };
    }, { min: Infinity, max: 0 });
    
    result += '**Summary:**\n';
    result += `• Total Rooms: ${totalRooms}\n`;
    result += `• Available: ${availableRooms}\n`;
    if (priceRange.min !== Infinity) {
      result += `• Price Range: $${priceRange.min} - $${priceRange.max}/month\n`;
    }
    
    return result;
  }

  private static formatBuildings(buildings: any[]): string {
    let result = '**Building Information:**\n\n';
    
    buildings.forEach((building, index) => {
      result += `${index + 1}. **${building.building_name || building.name || 'Unknown Building'}**\n`;
      
      if (building.address || building.city || building.state) {
        result += `   • Location: ${[building.address, building.city, building.state].filter(Boolean).join(', ')}\n`;
      }
      
      if (building.total_rooms !== undefined) {
        result += `   • Total Rooms: ${building.total_rooms}\n`;
      }
      
      if (building.available_rooms !== undefined) {
        result += `   • Available: ${building.available_rooms}\n`;
      }
      
      if (building.occupancy_rate !== undefined) {
        result += `   • Occupancy: ${building.occupancy_rate}%\n`;
      }
      
      result += '\n';
    });
    
    return result;
  }

  private static formatGenericList(items: any[]): string {
    let result = '';
    
    items.forEach((item, index) => {
      result += `**Item ${index + 1}:**\n`;
      
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'id' && !key.endsWith('_id')) {
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          let formattedValue = value;
          
          if (typeof value === 'object') {
            formattedValue = JSON.stringify(value, null, 2);
          } else if (typeof value === 'number' && (key.includes('price') || key.includes('rent'))) {
            formattedValue = `$${value.toLocaleString()}`;
          }
          
          result += `   • ${formattedKey}: ${formattedValue}\n`;
        }
      });
      
      result += '\n';
    });
    
    return result;
  }

  private static formatReport(data: any, userQuery: string): string {
    let result = `**Report: ${userQuery}**\n\n`;
    
    // Handle financial reports
    if (data.total_revenue !== undefined || data.revenue !== undefined) {
      result += '**Financial Summary:**\n';
      
      if (data.total_revenue !== undefined) {
        result += `• Total Revenue: $${data.total_revenue.toLocaleString()}\n`;
      }
      if (data.occupied_rooms !== undefined) {
        result += `• Occupied Rooms: ${data.occupied_rooms}\n`;
      }
      if (data.occupancy_rate !== undefined) {
        result += `• Occupancy Rate: ${data.occupancy_rate}%\n`;
      }
      
      result += '\n';
    }
    
    // Handle any other data fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && !key.startsWith('_')) {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          result += `\n**${formattedKey}:**\n`;
          Object.entries(value).forEach(([subKey, subValue]) => {
            const formattedSubKey = subKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            result += `   • ${formattedSubKey}: ${subValue}\n`;
          });
        }
      }
    });
    
    return result;
  }

  private static generateRecommendations(data: any[], itemType: string): string {
    let recommendations = '';
    
    if (itemType === 'tenant') {
      const latePayments = data.filter(t => t.payment?.status === 'Late').length;
      if (latePayments > 0) {
        recommendations += `• Follow up with ${latePayments} tenant${latePayments > 1 ? 's' : ''} with late payments\n`;
      }
      
      const expiringLeases = data.filter(t => {
        if (!t.lease?.end_date) return false;
        const endDate = new Date(t.lease.end_date);
        const monthFromNow = new Date();
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        return endDate <= monthFromNow;
      }).length;
      
      if (expiringLeases > 0) {
        recommendations += `• ${expiringLeases} lease${expiringLeases > 1 ? 's' : ''} expiring soon - initiate renewal discussions\n`;
      }
    } else if (itemType === 'room') {
      const available = data.filter(r => r.status === 'Available' || r.status === 'available').length;
      if (available > 0) {
        recommendations += `• ${available} rooms available for immediate occupancy\n`;
        recommendations += `• Update marketing listings to promote available units\n`;
      }
      
      const maintenance = data.filter(r => r.status === 'Maintenance').length;
      if (maintenance > 0) {
        recommendations += `• ${maintenance} rooms under maintenance - check completion timeline\n`;
      }
    }
    
    if (!recommendations) {
      recommendations = '• Continue monitoring and maintain regular communication with team\n';
    }
    
    return recommendations;
  }
}