'use client'

import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InlineOccupancyChart } from './analytics/InlineOccupancyChart';
import { InlineRevenueChart } from './analytics/InlineRevenueChart';
import { InlineAnalyticsGrid } from './analytics/InlineAnalyticsGrid';
import { InlinePropertyComparison } from './analytics/InlinePropertyComparison';
import SmartDataVisualizer from './SmartDataVisualizer';

interface MessageRendererProps {
  content: string;
  metadata?: any;
  role: 'user' | 'assistant' | 'system';
}

const markdownComponents: Partial<Components> = {
  p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
  h1: ({children}) => <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>,
  h2: ({children}) => <h2 className="text-xl font-semibold mb-2 mt-3">{children}</h2>,
  h3: ({children}) => <h3 className="text-lg font-semibold mb-2 mt-2">{children}</h3>,
  ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
  ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
  li: ({children}) => <li className="ml-2">{children}</li>,
  strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({children}) => <em className="italic">{children}</em>,
  code: ({children, ...props}) => {
    const inline = !('data-language' in props);
    const className = (props as any).className || '';
    const language = className?.replace('language-', '') || '';

    return inline ? (
      <code className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    ) : (
      <div className="relative">
        {language && (
          <div className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-tr-lg">
            {language}
          </div>
        )}
        <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm">
          {children}
        </code>
      </div>
    );
  },
  pre: ({children}) => <pre className="mb-3">{children}</pre>,
  blockquote: ({children}) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic my-3 text-gray-700">
      {children}
    </blockquote>
  ),
  a: ({href, children}) => (
    <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({children}) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border-collapse border border-gray-300">
        {children}
      </table>
    </div>
  ),
  thead: ({children}) => <thead className="bg-gray-100">{children}</thead>,
  tbody: ({children}) => <tbody>{children}</tbody>,
  tr: ({children}) => <tr className="border-b border-gray-300">{children}</tr>,
  th: ({children}) => <th className="px-4 py-2 text-left font-semibold">{children}</th>,
  td: ({children}) => <td className="px-4 py-2">{children}</td>,
  hr: () => <hr className="my-4 border-gray-300" />,
};

const userMarkdownComponents: Partial<Components> = {
  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({children}) => <ul className="list-disc list-inside mb-2">{children}</ul>,
  ol: ({children}) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
  li: ({children}) => <li className="mb-1">{children}</li>,
  code: ({children, ...props}) => {
    const inline = !('data-language' in props);
    return inline ? (
      <code className="bg-gray-700 text-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>
    ) : (
      <code className="block bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto">{children}</code>
    );
  },
  pre: ({children}) => <pre className="mb-2">{children}</pre>,
  blockquote: ({children}) => (
    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-2">{children}</blockquote>
  ),
};

const simpleMarkdownComponents: Partial<Components> = {
  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({children}) => <ul className="list-disc list-inside mb-2">{children}</ul>,
  ol: ({children}) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
  code: ({children, ...props}) => {
    const inline = !('data-language' in props);
    return inline ? (
      <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm">{children}</code>
    ) : (
      <code className="block bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">{children}</code>
    );
  },
};

export function MessageRenderer({ content, metadata, role }: MessageRendererProps) {
  // Clean up content if it's wrapped in markdown code blocks
  let cleanContent = content;
  if (cleanContent.startsWith('```markdown\n') && cleanContent.endsWith('\n```')) {
    cleanContent = cleanContent.slice(12, -4);
  } else if (cleanContent.startsWith('```markdown\n') && cleanContent.endsWith('```')) {
    cleanContent = cleanContent.slice(12, -3);
  } else if (cleanContent.startsWith('markdown\n')) {
    // Remove standalone "markdown" prefix
    cleanContent = cleanContent.slice(9);
  } else if (cleanContent.startsWith('```') && cleanContent.endsWith('```')) {
    // Check if it's a code block with language specifier
    const firstNewline = cleanContent.indexOf('\n');
    if (firstNewline > 3 && firstNewline < 20) {
      cleanContent = cleanContent.slice(firstNewline + 1, -3);
    }
  }

  // Remove any remaining "markdown" prefix at the start
  cleanContent = cleanContent.replace(/^markdown\s*\n/, '');

  // Check if the message contains analytics data
  const hasAnalyticsData = metadata?.analytics_data || metadata?.has_analytics;
  const analyticsType = metadata?.analytics_type;
  const analyticsData = metadata?.analytics_data;

  // Check if content contains raw JSON data
  const containsRawData = React.useMemo(() => {
    // Check if content looks like JSON
    const trimmedContent = cleanContent.trim();
    return (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
           (trimmedContent.startsWith('[') && trimmedContent.endsWith(']')) ||
           cleanContent.includes('"Analytics Data"') ||
           cleanContent.includes('"total_leads"') ||
           cleanContent.includes('"conversion_rate"') ||
           cleanContent.includes('"revenue"') ||
           cleanContent.includes('"occupancy"');
  }, [content]);

  // Try to parse JSON from content
  const parsedContentData = React.useMemo(() => {
    if (!containsRawData) return null;

    try {
      // Try to extract JSON from the content
      const jsonMatch = cleanContent.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If parsing fails, return null
    }
    return null;
  }, [cleanContent, containsRawData]);

  // For user messages, render with markdown support
  if (role === 'user') {
    return (
      <div className="prose prose-sm prose-invert max-w-none text-white">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={userMarkdownComponents}
        >
          {cleanContent}
        </ReactMarkdown>
      </div>
    );
  }

  // For assistant messages with analytics
  if (hasAnalyticsData && analyticsData) {
    return (
      <div className="space-y-4">
        {/* Text content with markdown */}
        <div className="prose prose-sm prose-gray max-w-none text-gray-800">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {cleanContent}
          </ReactMarkdown>
        </div>

        {/* Analytics visualizations */}
        <div className="mt-4">
          {analyticsType === 'occupancy' && (
            <InlineOccupancyChart data={analyticsData} />
          )}

          {analyticsType === 'financial' && (
            <InlineRevenueChart data={analyticsData} />
          )}

          {analyticsType === 'metrics' && (
            <InlineAnalyticsGrid
              data={analyticsData}
              type={analyticsData.type || 'all'}
            />
          )}

          {analyticsType === 'dashboard' && (
            <div className="space-y-3">
              {analyticsData.occupancy && (
                <InlineOccupancyChart data={analyticsData.occupancy} />
              )}
              {analyticsData.financial && (
                <InlineRevenueChart data={analyticsData.financial} />
              )}
              {analyticsData.buildings && (
                <InlinePropertyComparison buildings={analyticsData.buildings} />
              )}
              {analyticsData.metrics && (
                <InlineAnalyticsGrid data={analyticsData.metrics} type="all" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if we have raw data to display
  if (parsedContentData) {
    const textBeforeJson = cleanContent.substring(0, cleanContent.indexOf(JSON.stringify(parsedContentData).charAt(0)));
    const textAfterJson = cleanContent.substring(cleanContent.lastIndexOf(JSON.stringify(parsedContentData).slice(-1)) + 1);

    return (
      <div className="space-y-4">
        {/* Text before JSON with markdown */}
        {textBeforeJson.trim() && (
          <div className="prose prose-sm prose-gray max-w-none text-gray-800">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={simpleMarkdownComponents}
            >
              {textBeforeJson.trim()}
            </ReactMarkdown>
          </div>
        )}

        {/* Smart Data Visualization */}
        <SmartDataVisualizer
          data={parsedContentData}
          title="Analytics Data"
          className="my-4"
        />

        {/* Text after JSON with markdown */}
        {textAfterJson.trim() && (
          <div className="prose prose-sm prose-gray max-w-none text-gray-800">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={simpleMarkdownComponents}
            >
              {textAfterJson.trim()}
            </ReactMarkdown>
          </div>
        )}
      </div>
    );
  }

  // Default rendering for regular messages with full markdown support
  return (
    <div className="prose prose-sm prose-gray max-w-none text-gray-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}