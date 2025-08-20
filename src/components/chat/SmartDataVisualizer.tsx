'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Code, Eye, EyeOff, Copy, Check, Download,
  BarChart3, Table, Grid3x3, List, FileJson,
  TrendingUp, DollarSign, Home, Users, AlertCircle,
  Target, Activity
} from 'lucide-react';
import { parseComplexData } from '@/lib/intelligent-data-parser';
import { formatCurrency, formatPercentage } from '@/lib/analytics-formatter';
import TenantPaymentStatusDisplay from './TenantPaymentStatusDisplay';
import { TemplateSelector } from '@/lib/template-selector-llm';

interface SmartDataVisualizerProps {
  data: any;
  title?: string;
  className?: string;
  userQuery?: string;
}

export default function SmartDataVisualizer({ data, title, className = '', userQuery }: SmartDataVisualizerProps) {
  const [viewMode, setViewMode] = useState<'smart' | 'raw'>('smart');
  const [copied, setCopied] = useState(false);

  // Parse the data intelligently
  const parsedData = useMemo(() => {
    return parseComplexData(data);
  }, [data]);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle download as JSON
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {title || 'Data Visualization'}
            </h3>
            {parsedData.success && parsedData.summary && (
              <span className="text-sm text-gray-500">• {parsedData.summary}</span>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('smart')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'smart'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              Smart View
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'raw'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Code className="w-4 h-4 inline mr-1" />
              Raw Data
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'smart' && parsedData.success ? (
          <SmartView
            data={parsedData.formattedData}
            originalData={data}
            type={parsedData.visualizationType || 'cards'}
            userQuery={userQuery}
          />
        ) : (
          <RawView data={data} />
        )}
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-3 border-t flex items-center justify-end space-x-2">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
        >
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={handleDownload}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
        >
          <Download className="w-4 h-4 mr-1" />
          Download
        </button>
      </div>
    </motion.div>
  );
}

// Smart View Component
const SmartView: React.FC<{ data: any; originalData?: any; type: string; userQuery?: string }> = ({ data, originalData, type, userQuery }) => {
  console.log('🎯 SmartView data:', {
    data,
    originalData,
    type,
    userQuery,
    keys: Object.keys(data),
    originalKeys: originalData ? Object.keys(originalData) : [],
    hasByBuilding: !!data.by_building,
    hasTotalPotential: !!data.total_potential_revenue,
    hasActualRevenue: !!data.actual_revenue,
    hasRealizationRate: !!data.revenue_realization_rate || !!data.realization_rate,
    hasPayments: !!(data.tenants || data.payments || data.payment_status),
    hasTenantData: Array.isArray(data.tenants) || Array.isArray(data.payments),
    hasLeadData: !!(data.total_leads || data.conversion_rate)
  });

  // Use LLM-based template selection when query is available
  // Use original data for template selection if available
  const dataForSelection = originalData || data;
  let selectedTemplate = null;
  if (userQuery) {
    selectedTemplate = TemplateSelector.selectTemplate(userQuery, dataForSelection);
    console.log('🤖 Template Selection Result:', selectedTemplate);
  }

  // For tenant payment data
  const isPaymentData = () => {
    // Check for payment-specific fields
    if (data.tenants || data.payments || data.payment_status) return true;

    // Check if it's an array of payment records
    if (Array.isArray(data)) {
      const firstItem = data[0];
      if (firstItem && (
        firstItem.tenant_name && firstItem.payment_status ||
        firstItem.amount_due !== undefined ||
        firstItem.days_overdue !== undefined
      )) return true;
    }

    // Check for payment summary data
    if (data.paid_count !== undefined || data.overdue_count !== undefined) return true;

    return false;
  };

  // If we have a template selection result, use it
  if (selectedTemplate) {
    console.log('📊 Using template:', selectedTemplate.template, 'with confidence:', selectedTemplate.confidence);

    switch (selectedTemplate.template) {
      case 'payment':
        // Check if this is a mismatch situation (payment query but financial data)
        console.log('🔍 Payment template check:', {
          reason: selectedTemplate.reason,
          includesMismatch: selectedTemplate.reason.includes('mismatch'),
          hasByBuilding: !!data.by_building,
          hasTenants: !!data.tenants,
          hasPayments: !!data.payments,
          shouldShowMismatch: selectedTemplate.reason.includes('mismatch') || (data.by_building && !data.tenants && !data.payments)
        });

        if (selectedTemplate.reason.includes('mismatch') ||
            (dataForSelection.by_building && !dataForSelection.tenants && !dataForSelection.payments)) {
          return (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-2">Query-Data Mismatch Detected</h4>
                    <p className="text-sm text-amber-800 mb-3">
                      You asked for tenant payment information, but the system returned financial revenue data instead.
                      This appears to be a backend issue where payment queries are being interpreted as financial reports.
                    </p>
                    <div className="bg-amber-100 rounded-md p-3">
                      <p className="text-sm font-medium text-amber-900 mb-2">To get payment data, try these queries:</p>
                      <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                        <li>"Show me tenant payment status"</li>
                        <li>"List all overdue tenant payments"</li>
                        <li>"Which tenants have outstanding balances"</li>
                        <li>"Payment collection summary"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Showing the financial data we received instead:</p>
                <BuildingRevenueView data={dataForSelection} />
              </div>
            </div>
          );
        }
        // Show payment display even with empty data to demonstrate the UI
        return <TenantPaymentStatusDisplay data={data} title={selectedTemplate.suggestedTitle || "Tenant Payment Status"} />;

      case 'financial':
        // Always show this if confidence is reasonable
        if (selectedTemplate.confidence >= 0.3) {
          return <BuildingRevenueView data={data} />;
        }
        break;

      case 'leads':
        // Pass original data when available so we keep raw fields like total_leads, converted, by_source
        return <LeadConversionView data={dataForSelection} />;

      default:
        // Fall through to existing logic
        break;
    }
  }

  // Existing logic as fallback
  if (isPaymentData()) {
    return <TenantPaymentStatusDisplay data={data} />;
  }

  // For financial/revenue data
  if (data.total_potential_revenue !== undefined ||
      data.actual_revenue !== undefined ||
      data.revenue_realization_rate !== undefined ||
      data.realization_rate !== undefined ||
      (data.by_building && Array.isArray(data.by_building))) {
    return <BuildingRevenueView data={data} />;
  }

  // For lead conversion data (relaxed detection)
  const hasLeadSignals =
    data.total_leads !== undefined ||
    data.approved_leads !== undefined ||
    data.converted !== undefined ||
    data.new_leads !== undefined ||
    data.interested !== undefined ||
    data.application_submitted !== undefined;
  if (hasLeadSignals) {
    return <LeadConversionView data={data} />;
  }

  // For general analytics data
  if (data.insight_type) {
    return <AnalyticsView data={data} />;
  }

  switch (type) {
    case 'cards':
      return <CardsView data={data} />;
    case 'table':
      return <TableView data={data} />;
    case 'list':
      return <ListView data={data} />;
    case 'chart':
      return <ChartView data={data} />;
    default:
      return <CardsView data={data} />;
  }
};

// Cards View
const CardsView: React.FC<{ data: any }> = ({ data }) => {
  const metrics = data.metrics || data.properties || [];
  const details = data.details || data.nestedData || {};

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
              <p className="text-xl font-bold text-gray-900">
                {metric.type === 'currency'
                  ? formatCurrency(safeNumber(metric.value))
                  : metric.type === 'percentage'
                  ? formatPercentage(metric.value)
                  : (typeof metric.value === 'number' ? metric.value.toLocaleString() : String(metric.value))}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Nested Data - Only show if not already displayed in a specialized view */}
      {Object.keys(details).length > 0 && !data.by_building && !data.by_source && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">Additional Details</h4>
          {Object.entries(details).map(([key, value]) => {
            // Skip showing raw data that's already visualized
            if (key === 'by_building' || key === 'by_source' || key === 'funnel') {
              return null;
            }
            return (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">{formatLabel(key)}</h5>
                <ObjectExplorer data={value} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Table View
const TableView: React.FC<{ data: any }> = ({ data }) => {
  const { columns = [], rows = [] } = data;

  if (columns.length === 0 || rows.length === 0) {
    return <div className="text-gray-500">No table data available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col: any) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row: any, rowIndex: number) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rowIndex * 0.02 }}
              className="hover:bg-gray-50"
            >
              {columns.map((col: any) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCellValue(row[col.key], col.type)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// List View
const ListView: React.FC<{ data: any }> = ({ data }) => {
  const items = data.items || [];

  return (
    <div className="space-y-2">
      {items.map((item: any, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">{item.display || item.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Chart View (placeholder)
const ChartView: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-600">Chart visualization coming soon</p>
      <p className="text-sm text-gray-500 mt-2">Data is ready for charting</p>
    </div>
  );
};

// Raw View
const RawView: React.FC<{ data: any }> = ({ data }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);
  const lines = jsonString.split('\n');
  const shouldCollapse = lines.length > 50;

  return (
    <div className="relative">
      <pre className={`bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm ${
        isCollapsed ? 'max-h-96' : ''
      }`}>
        <code>{shouldCollapse && isCollapsed ? lines.slice(0, 20).join('\n') + '\n...' : jsonString}</code>
      </pre>
      {shouldCollapse && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute bottom-4 right-4 px-3 py-1 bg-gray-800 text-gray-200 rounded text-sm hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? 'Show all' : 'Collapse'}
        </button>
      )}
    </div>
  );
};

// Building Revenue View
const BuildingRevenueView: React.FC<{ data: any }> = ({ data }) => {
  const buildings = Array.isArray(data.by_building) ? data.by_building : [];

  console.log('🏢 BuildingRevenueView data:', {
    data,
    buildingsCount: buildings.length,
    buildings: buildings,
    hasOverallTotals: !!(data.total_potential_revenue || data.actual_revenue),
    rawTotalPotential: data.total_potential_revenue,
    rawActualRevenue: data.actual_revenue
  });

  const totalPotentialRaw =
    data.total_potential_revenue ??
    (buildings.length
      ? buildings.reduce(
          (sum: number, b: any) => sum + safeNumber(b.total_potential_revenue ?? b.potential),
          0
        )
      : 0);
  const actualRevenueRaw =
    data.actual_revenue ??
    (buildings.length
      ? buildings.reduce((sum: number, b: any) => sum + safeNumber(b.actual_revenue ?? b.actual), 0)
      : 0);
  const realizationRateRaw =
    data.revenue_realization_rate ??
    data.realization_rate ??
    (totalPotentialRaw > 0 ? (actualRevenueRaw / totalPotentialRaw) * 100 : 0);

  const totalPotential = safeNumber(totalPotentialRaw);
  const actualRevenue = safeNumber(actualRevenueRaw);
  const realizationRate = normalizeRate(realizationRateRaw);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Potential</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPotential)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actual Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(actualRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Realization Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(realizationRate)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Note for single building */}
      {buildings.length === 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> This report shows data for {buildings[0].building_name || 'one building'} only.
            To see data for all buildings, try asking "Show me financial report for all buildings" or
            "What is the total revenue across all properties?"
          </p>
        </div>
      )}

      {/* Building Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {buildings.length > 1 ? 'Revenue by Building' : 'Building Details'}
          </h3>
          {buildings.length === 1 && (
            <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Showing data for 1 building only
            </span>
          )}
        </div>
        {buildings.map((building: any, idx: number) => {
          const potential = safeNumber(building.total_potential_revenue ?? building.potential)
          const actual = safeNumber(building.actual_revenue ?? building.actual)
          const avgRent = safeNumber(building.avg_private_rent ?? building.avg_rent)
          const rate = normalizeRate(building.revenue_realization_rate ?? (potential > 0 ? (actual / potential) * 100 : 0))

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{building.building_name || building.name}</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  rate >= 70
                    ? 'bg-green-100 text-green-700'
                    : rate >= 50
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {formatPercentage(rate)} realized
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Potential</p>
                  <p className="font-semibold">{formatCurrency(potential)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Actual</p>
                  <p className="font-semibold">{formatCurrency(actual)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Rent</p>
                  <p className="font-semibold">{formatCurrency(avgRent)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rate}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-2 rounded-full ${
                      rate >= 70
                        ? 'bg-green-500'
                        : rate >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Lead Conversion View
const LeadConversionView: React.FC<{ data: any }> = ({ data }) => {
  const statuses = ['new_leads', 'interested', 'application_submitted', 'converted', 'rejected', 'lost'];
  const statusColors: Record<string, string> = {
    new_leads: 'bg-blue-500',
    interested: 'bg-yellow-500',
    application_submitted: 'bg-purple-500',
    converted: 'bg-green-500',
    rejected: 'bg-red-500',
    lost: 'bg-gray-500'
  };

  // Accept various avg time aliases from backend; if absent we will not render the card
  const avgTime = data.average_conversion_time ?? data.avg_conversion_time ?? data.averageTime ?? data.average_time ?? null;

  // Map status keys to possible backend aliases
  const statusAliases: Record<string, string[]> = {
    new_leads: ['new_leads', 'newLeads', 'new'],
    interested: ['interested'],
    application_submitted: ['application_submitted', 'applicationSubmitted', 'applications', 'applied', 'app_submitted'],
    converted: ['converted', 'approved_leads', 'approvedLeads', 'approved'],
    rejected: ['rejected', 'declined'],
    lost: ['lost', 'inactive']
  };

  const getAliased = (key: string) => {
    const candidates = statusAliases[key] ?? [key];
    for (const k of candidates) {
      const v = (data as any)?.[k];
      if (v !== undefined && v !== null) return v;
    }
    return 0;
  };


  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200"
        >
          <Users className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{safeNumber(data.total_leads ?? data.totalLeads ?? data.total ?? 0)}</p>
          <p className="text-sm text-gray-600">Total Leads</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
        >
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{safeNumber(data.converted ?? data.approved_leads ?? data.approved ?? 0)}</p>
          <p className="text-sm text-gray-600">Converted</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200"
        >
          <Target className="w-6 h-6 text-purple-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{formatPercentage(normalizeRate(data.conversion_rate ?? (safeNumber(data.converted ?? data.approved_leads ?? 0) && safeNumber(data.total_leads ?? 0) ? safeNumber(data.converted ?? data.approved_leads ?? 0) / safeNumber(data.total_leads ?? 0) : 0)))}</p>
          <p className="text-sm text-gray-600">Conversion Rate</p>
        </motion.div>

        {avgTime ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200"
          >
            <Activity className="w-6 h-6 text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{typeof avgTime === 'number' ? `${avgTime.toFixed(1)} days` : avgTime}</p>
            <p className="text-sm text-gray-600">Avg Time</p>
          </motion.div>
        ) : (
          data.by_source ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200"
            >
              <Activity className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{Object.keys(data.by_source).length}</p>
              <p className="text-sm text-gray-600">Active Sources</p>
            </motion.div>
          ) : null
        )}
      </div>

      {/* Lead Status Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Breakdown</h3>
        <div className="space-y-3">
          {statuses.map((status, idx) => {
            const value = safeNumber(getAliased(status))
            const total = safeNumber(data.total_leads ?? data.totalLeads ?? data.total ?? 0)
            const percentage = total ? (value / total * 100) : 0

            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {formatLabel(status)}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-gray-900">{value}</span>
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className={`h-2 rounded-full ${statusColors[status]}`}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{percentage.toFixed(0)}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* By Source Breakdown */}
      {data.by_source && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion by Source</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.by_source).map(([source, stats]: [string, any], idx) => (
              <motion.div
                key={source}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-4 bg-gray-50 rounded-lg"
              >
                <p className="text-sm font-medium text-gray-600 mb-1">{formatLabel(source)}</p>
                <p className="text-xl font-bold text-gray-900">{stats.leads}</p>
                <p className="text-sm text-gray-500">leads</p>
                <div className="mt-2">
                  <span className={`text-sm font-medium ${
                    stats.rate >= 0.25 ? 'text-green-600' :
                    stats.rate >= 0.15 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(stats.rate * 100).toFixed(0)}% conversion
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Generic Analytics View
const AnalyticsView: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-2">{formatLabel(data.insight_type || 'Analytics')} Report</h3>
        <p className="text-blue-100">Generated insights from your data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(data).map(([key, value], idx) => {
          if (key === 'insight_type' || typeof value === 'object') return null;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <p className="text-sm text-gray-600 mb-1">{formatLabel(key)}</p>
              <p className="text-xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Collapsible, pretty object explorer for arbitrary JSON
const ObjectExplorer: React.FC<{ data: any; initiallyCollapsed?: boolean }> = ({ data, initiallyCollapsed = true }) => {
  const [collapsed, setCollapsed] = React.useState(initiallyCollapsed)
  const json = JSON.stringify(data, null, 2)
  const lines = json.split('\n')
  const isLarge = lines.length > 30

  return (
    <div className="relative">
      <pre className={`bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm ${collapsed && isLarge ? 'max-h-72' : ''}`}>
        <code>{collapsed && isLarge ? lines.slice(0, 20).join('\n') + '\n...' : json}</code>
      </pre>
      {isLarge && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-4 right-4 px-3 py-1 bg-gray-800 text-gray-200 rounded text-sm hover:bg-gray-700 transition-colors"
        >
          {collapsed ? 'Show all' : 'Collapse'}
        </button>
      )}
    </div>
  )
}
// Helper functions
function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatCellValue(value: any, type: string): string {
  if (value === null || value === undefined) return '-';

  switch (type) {
    case 'currency':
      return formatCurrency(typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value);
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value;
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    default:
      return String(value);
  }
}

function safeNumber(value: any): number {
  if (typeof value === 'number' && !isNaN(value)) return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '')
    const n = parseFloat(cleaned)
    if (!isNaN(n)) return n
  }
  return 0
}


// Helpers
function normalizeRate(value: any): number {
  const n = safeNumber(value)
  if (n <= 1) return n * 100
  return n
}
