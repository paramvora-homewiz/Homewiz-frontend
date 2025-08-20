'use client';

import React from 'react';
import SmartDataVisualizer from '@/components/chat/SmartDataVisualizer';

export default function TestPaymentPage() {
  // Test payment data in the format the backend should return
  const paymentData = {
    tenants: [
      {
        tenant_id: "t001",
        tenant_name: "John Smith",
        unit_number: "101",
        building_name: "UpMarket Residences",
        amount_due: 1500,
        amount_paid: 1500,
        due_date: "2024-01-01",
        payment_date: "2023-12-28",
        status: "paid",
        payment_method: "Bank Transfer"
      },
      {
        tenant_id: "t002",
        tenant_name: "Jane Doe",
        unit_number: "205",
        building_name: "Prime Student Housing",
        amount_due: 1200,
        amount_paid: 0,
        due_date: "2024-01-01",
        status: "overdue",
        days_overdue: 14
      },
      {
        tenant_id: "t003",
        tenant_name: "Mike Johnson",
        unit_number: "302",
        building_name: "1080 Folsom Residences",
        amount_due: 1800,
        amount_paid: 0,
        due_date: "2024-01-05",
        status: "pending"
      },
      {
        tenant_id: "t004",
        tenant_name: "Sarah Wilson",
        unit_number: "410",
        building_name: "UpMarket Residences",
        amount_due: 2000,
        amount_paid: 2000,
        due_date: "2024-01-01",
        payment_date: "2024-01-01",
        status: "paid",
        payment_method: "Credit Card"
      },
      {
        tenant_id: "t005",
        tenant_name: "Tom Brown",
        unit_number: "115",
        building_name: "Prime Student Housing",
        amount_due: 950,
        amount_paid: 0,
        due_date: "2024-01-01",
        status: "overdue",
        days_overdue: 7
      }
    ],
    summary: {
      total_tenants: 5,
      paid_count: 2,
      overdue_count: 2,
      pending_count: 1,
      total_collected: 3500,
      total_outstanding: 2950,
      collection_rate: 54.3
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Tenant Payment Status Display Test</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Expected Display for Payment Queries</h2>
          <p className="text-gray-600 mb-4">
            When users ask "Which tenants have paid?" or "Who is overdue?", the system should display:
          </p>
          <SmartDataVisualizer 
            data={paymentData}
            title="Tenant Payment Status"
          />
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Summary cards show total tenants, paid, overdue counts</li>
            <li>Financial summary shows collected vs outstanding amounts</li>
            <li>Individual tenant cards with payment status indicators</li>
            <li>Filtering by status (All, Paid, Overdue, Pending)</li>
            <li>Sorting by name, amount, date, or status</li>
            <li>Color-coded status badges for quick identification</li>
          </ul>
        </div>
      </div>
    </div>
  );
}