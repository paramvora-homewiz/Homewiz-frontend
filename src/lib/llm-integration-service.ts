// LLM Integration Service for intelligent data parsing

interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'backend';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

interface LLMResponse {
  success: boolean;
  data?: any;
  formattedData?: any;
  insights?: string[];
  visualization?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMIntegrationService {
  private config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = config;
  }
  
  // Parse complex data using LLM
  async parseComplexData(data: any, context?: string): Promise<LLMResponse> {
    try {
      const prompt = this.generateParsingPrompt(data, context);
      
      switch (this.config.provider) {
        case 'openai':
          return await this.parseWithOpenAI(prompt, data);
        case 'anthropic':
          return await this.parseWithAnthropic(prompt, data);
        case 'backend':
          return await this.parseWithBackend(data, context);
        default:
          throw new Error('Invalid LLM provider');
      }
    } catch (error) {
      console.error('LLM parsing error:', error);
      return {
        success: false,
        error: error.message,
        data: data // Return original data as fallback
      };
    }
  }
  
  // Generate intelligent parsing prompt
  private generateParsingPrompt(data: any, context?: string): string {
    return `
You are a data formatting assistant for a real estate management system. 
${context ? `Context: ${context}` : ''}

Analyze this data and provide:
1. A user-friendly summary of what this data represents
2. Key insights and metrics
3. The best way to visualize this data (table, cards, chart, etc.)
4. Any anomalies or important patterns

Data to analyze:
${JSON.stringify(data, null, 2)}

Respond with a JSON object containing:
{
  "summary": "Brief description of the data",
  "dataType": "financial|occupancy|tenant|analytics|other",
  "insights": ["insight1", "insight2", ...],
  "keyMetrics": [
    {"label": "Metric Name", "value": "value", "unit": "$|%|units", "trend": "up|down|stable"}
  ],
  "visualization": "cards|table|chart|mixed",
  "formattedData": { ... cleaned and structured data ... },
  "alerts": ["any warnings or important notes"]
}
`;
  }
  
  // OpenAI implementation
  private async parseWithOpenAI(prompt: string, originalData: any): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that formats and analyzes real estate data. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })
    });
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    const parsedContent = JSON.parse(result.choices[0].message.content);
    
    return {
      success: true,
      data: originalData,
      formattedData: parsedContent.formattedData || originalData,
      insights: parsedContent.insights,
      visualization: parsedContent.visualization,
      usage: {
        promptTokens: result.usage.prompt_tokens,
        completionTokens: result.usage.completion_tokens,
        totalTokens: result.usage.total_tokens
      }
    };
  }
  
  // Anthropic implementation
  private async parseWithAnthropic(prompt: string, originalData: any): Promise<LLMResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-opus-20240229',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000
      })
    });
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    // Extract JSON from Claude's response
    const content = result.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsedContent = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    
    return {
      success: true,
      data: originalData,
      formattedData: parsedContent.formattedData || originalData,
      insights: parsedContent.insights,
      visualization: parsedContent.visualization,
      usage: {
        promptTokens: result.usage.input_tokens,
        completionTokens: result.usage.output_tokens,
        totalTokens: result.usage.input_tokens + result.usage.output_tokens
      }
    };
  }
  
  // Backend implementation (your existing backend)
  private async parseWithBackend(data: any, context?: string): Promise<LLMResponse> {
    // This would integrate with your existing backend
    // For now, return a simulated response
    return {
      success: true,
      data: data,
      formattedData: data,
      insights: ['Data processed by backend AI'],
      visualization: 'auto'
    };
  }
  
  // Check if data needs LLM parsing
  static shouldUseLLM(data: any): boolean {
    // Skip LLM for simple data structures
    if (typeof data !== 'object' || data === null) return false;
    
    // Use LLM for complex nested structures
    const complexity = this.calculateComplexity(data);
    if (complexity > 10) return true;
    
    // Use LLM for unstructured text data
    if (this.containsUnstructuredText(data)) return true;
    
    // Use LLM for data with many different types
    if (this.hasMixedDataTypes(data)) return true;
    
    return false;
  }
  
  private static calculateComplexity(obj: any, depth = 0): number {
    if (depth > 5) return depth;
    
    let complexity = depth;
    
    if (Array.isArray(obj)) {
      complexity += obj.length * 0.5;
      obj.forEach(item => {
        complexity += this.calculateComplexity(item, depth + 1);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj);
      complexity += keys.length;
      keys.forEach(key => {
        complexity += this.calculateComplexity(obj[key], depth + 1);
      });
    }
    
    return complexity;
  }
  
  private static containsUnstructuredText(data: any): boolean {
    const str = JSON.stringify(data);
    // Check for long text strings that might benefit from summarization
    const longTextPattern = /"[^"]{200,}"/;
    return longTextPattern.test(str);
  }
  
  private static hasMixedDataTypes(data: any): boolean {
    if (typeof data !== 'object' || data === null) return false;
    
    const types = new Set();
    const checkTypes = (obj: any) => {
      for (const value of Object.values(obj)) {
        types.add(typeof value);
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          checkTypes(value);
        }
      }
    };
    
    checkTypes(data);
    return types.size > 4; // Has many different data types
  }
}

// Export singleton instance with default config
export const llmService = new LLMIntegrationService({
  provider: 'backend',
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL
});

// Export function for easy use
export async function enhanceDataWithLLM(data: any, context?: string): Promise<any> {
  if (!LLMIntegrationService.shouldUseLLM(data)) {
    return data; // Return original data if LLM not needed
  }
  
  const result = await llmService.parseComplexData(data, context);
  return result.success ? result.formattedData : data;
}