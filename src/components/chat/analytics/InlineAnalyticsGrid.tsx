'use client'

import React from 'react';
import { Building, DollarSign, Users, Wrench, TrendingUp, Clock } from 'lucide-react';
import { InlineMetricCard } from './InlineMetricCard';

interface InlineAnalyticsGridProps {
  data: any;
  type: 'occupancy' | 'financial' | 'maintenance' | 'leads' | 'all';
}

export function InlineAnalyticsGrid({ data, type }: InlineAnalyticsGridProps) {
  const renderOccupancyMetrics = () => (
    <div className="grid grid-cols-2 gap-3">
      <InlineMetricCard
        title="Current Occupancy"
        value={`${data.current_occupancy_rate || 0}%`}
        icon={Building}
        trend={data.occupancy_trend}
        color="blue"
        description={`${data.occupied_units || 0} of ${data.total_units || 0} units occupied`}
      />
      <InlineMetricCard
        title="Vacant Units"
        value={data.vacant_units || 0}
        icon={Building}
        color="orange"
        description="Available for lease"
      />
    </div>
  );

  const renderFinancialMetrics = () => (
    <div className="grid grid-cols-2 gap-3">
      <InlineMetricCard
        title="Total Revenue"
        value={`$${(data.total_revenue || 0).toLocaleString()}`}
        icon={DollarSign}
        trend={data.revenue_growth}
        trendLabel="vs last month"
        color="green"
      />
      <InlineMetricCard
        title="Average Rent"
        value={`$${(data.average_rent || 0).toLocaleString()}`}
        icon={DollarSign}
        color="purple"
        description="Per unit per month"
      />
    </div>
  );

  const renderMaintenanceMetrics = () => (
    <div className="grid grid-cols-2 gap-3">
      <InlineMetricCard
        title="Open Requests"
        value={data.pending_requests || 0}
        icon={Wrench}
        color="orange"
        description="Awaiting service"
      />
      <InlineMetricCard
        title="Avg Resolution Time"
        value={`${data.average_resolution_time || 0}d`}
        icon={Clock}
        color="blue"
        trend={data.resolution_trend}
      />
    </div>
  );

  const renderLeadMetrics = () => (
    <div className="grid grid-cols-2 gap-3">
      <InlineMetricCard
        title="Total Leads"
        value={data.total_leads || 0}
        icon={Users}
        trend={data.lead_growth}
        color="purple"
      />
      <InlineMetricCard
        title="Conversion Rate"
        value={`${data.conversion_rate || 0}%`}
        icon={TrendingUp}
        color="green"
        description={`${data.converted_leads || 0} converted`}
      />
    </div>
  );

  const renderAllMetrics = () => (
    <div className="space-y-3">
      {data.occupancy && renderOccupancyMetrics()}
      {data.financial && renderFinancialMetrics()}
      {data.maintenance && renderMaintenanceMetrics()}
      {data.leads && renderLeadMetrics()}
    </div>
  );

  return (
    <div className="w-full">
      {type === 'occupancy' && renderOccupancyMetrics()}
      {type === 'financial' && renderFinancialMetrics()}
      {type === 'maintenance' && renderMaintenanceMetrics()}
      {type === 'leads' && renderLeadMetrics()}
      {type === 'all' && renderAllMetrics()}
    </div>
  );
}