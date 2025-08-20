# LLM-Based Data Parsing Guide

## Overview

This guide explains how to use LLMs (Large Language Models) to intelligently parse and format complex data structures in your HomeWiz frontend application.

## Why Use LLM for Data Parsing?

1. **Complex Data Structures**: When API responses have deeply nested or irregular structures
2. **Natural Language Insights**: Extract meaningful insights from raw data
3. **Dynamic Formatting**: Automatically choose the best visualization format
4. **Error Resilience**: Handle unexpected data formats gracefully

## Implementation

### 1. Basic LLM Integration

```typescript
// Example: Using OpenAI API for data parsing
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseDataWithLLM(data: any): Promise<ParsedResult> {
  const prompt = `
    Analyze this data and provide:
    1. Data type (financial, occupancy, etc.)
    2. Key metrics and insights
    3. Best visualization format
    
    Data: ${JSON.stringify(data)}
    
    Return as JSON with structure:
    {
      "type": "data type",
      "insights": ["insight1", "insight2"],
      "metrics": [{"label": "name", "value": "value"}],
      "visualization": "cards|table|chart"
    }
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

### 2. Using Claude API

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function parseWithClaude(data: any): Promise<ParsedResult> {
  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Parse and format this data for display:
        ${JSON.stringify(data, null, 2)}
        
        Provide a structured response with:
        - Data classification
        - Key metrics
        - Recommended visualization
        - Human-readable insights`
    }]
  });
  
  return parseClaudeResponse(message.content);
}
```

### 3. Integration with SmartDataVisualizer

```typescript
// In your component
const [parsedData, setParsedData] = useState(null);
const [isLoading, setIsLoading] = useState(false);

const handleComplexData = async (rawData: any) => {
  setIsLoading(true);
  try {
    // First try local parsing
    const localParsed = parseComplexData(rawData);
    
    // If local parsing isn't sufficient, use LLM
    if (needsLLMParsing(localParsed)) {
      const llmResult = await parseDataWithLLM(rawData);
      setParsedData(llmResult);
    } else {
      setParsedData(localParsed);
    }
  } catch (error) {
    console.error('Parsing failed:', error);
    // Fallback to raw display
  } finally {
    setIsLoading(false);
  }
};
```

## When to Use LLM Parsing

### Good Use Cases:
- Unstructured text data that needs categorization
- Complex nested JSON with unclear hierarchy
- Data requiring natural language summaries
- Multi-format data needing intelligent routing

### When NOT to Use:
- Simple, well-structured data
- High-frequency real-time data (performance concern)
- Sensitive data that shouldn't leave your servers
- When deterministic parsing is required

## Best Practices

### 1. Caching LLM Results

```typescript
const llmCache = new Map();

export async function getCachedOrParse(data: any) {
  const cacheKey = generateCacheKey(data);
  
  if (llmCache.has(cacheKey)) {
    return llmCache.get(cacheKey);
  }
  
  const result = await parseDataWithLLM(data);
  llmCache.set(cacheKey, result);
  
  return result;
}
```

### 2. Error Handling

```typescript
export async function safeLLMParse(data: any) {
  try {
    // Try LLM parsing with timeout
    const result = await Promise.race([
      parseDataWithLLM(data),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ]);
    return result;
  } catch (error) {
    // Fallback to local parsing
    return parseComplexData(data);
  }
}
```

### 3. Cost Optimization

- Use smaller models for simple parsing tasks
- Batch multiple parsing requests when possible
- Implement request throttling
- Cache results aggressively

## Example Prompts

### Financial Data Parsing
```
Analyze this financial data and extract:
1. Total revenue across all properties
2. Realization rate (actual vs potential)
3. Top performing buildings
4. Areas needing attention

Format the response for dashboard display.
```

### Occupancy Analysis
```
Review this occupancy data and provide:
1. Overall occupancy percentage
2. Trends over time
3. Buildings with low occupancy
4. Recommendations for improvement

Present in a user-friendly format.
```

## Security Considerations

1. **Data Sanitization**: Always sanitize data before sending to LLM
2. **PII Removal**: Remove personal information before external API calls
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Audit Logging**: Log all LLM requests for compliance

## Future Enhancements

1. **Fine-tuned Models**: Train custom models on your specific data formats
2. **Edge Processing**: Use smaller models for client-side parsing
3. **Streaming Responses**: Implement streaming for large data sets
4. **Multi-modal Analysis**: Combine data with charts/images for richer insights

## Conclusion

LLM-based data parsing can significantly improve the user experience by:
- Automatically formatting complex data
- Providing intelligent insights
- Choosing optimal visualizations
- Handling edge cases gracefully

Use it judiciously based on your specific needs and constraints.