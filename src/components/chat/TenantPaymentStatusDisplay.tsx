'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Filter,
  Download
} from 'lucide-react';

interface TenantPayment {
  tenant_id?: string;
  tenant_name: string;
  unit_number?: string;
  building_name?: string;
  amount_due: number;
  amount_paid?: number;
  due_date: string;
  payment_date?: string;
  status: 'paid' | 'overdue' | 'pending' | 'partial';
  days_overdue?: number;
  payment_method?: string;
}

interface PaymentSummary {
  total_tenants: number;
  paid_count: number;
  overdue_count: number;
  pending_count: number;
  total_collected: number;
  total_outstanding: number;
  collection_rate: number;
}

interface TenantPaymentStatusDisplayProps {
  data: {
    tenants?: TenantPayment[];
    payments?: TenantPayment[];
    summary?: PaymentSummary;
    [key: string]: any;
  };
  title?: string;
}

export default function TenantPaymentStatusDisplay({ data, title = "Tenant Payment Status" }: TenantPaymentStatusDisplayProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'overdue' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'date' | 'status'>('status');

  // Extract payment data from various possible structures
  const payments: TenantPayment[] = data.tenants || data.payments || data.payment_status || [];
  
  // Calculate summary if not provided
  const summary: PaymentSummary = data.summary || {
    total_tenants: payments.length,
    paid_count: payments.filter(p => p.status === 'paid').length,
    overdue_count: payments.filter(p => p.status === 'overdue').length,
    pending_count: payments.filter(p => p.status === 'pending' || p.status === 'partial').length,
    total_collected: payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0),
    total_outstanding: payments.reduce((sum, p) => sum + (p.amount_due - (p.amount_paid || 0)), 0),
    collection_rate: 0
  };
  
  // Calculate collection rate if not provided
  if (!data.summary?.collection_rate && summary.total_collected + summary.total_outstanding > 0) {
    summary.collection_rate = (summary.total_collected / (summary.total_collected + summary.total_outstanding)) * 100;
  }

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (filterStatus === 'all') return true;
    return payment.status === filterStatus;
  });

  // Sort payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.tenant_name.localeCompare(b.tenant_name);
      case 'amount':
        return b.amount_due - a.amount_due;
      case 'date':
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      case 'status':
        const statusOrder = { overdue: 0, pending: 1, partial: 2, paid: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      default:
        return 0;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
      case 'partial':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-white" />
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          <button className="text-white/80 hover:text-white transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-2xl font-bold text-gray-900">{summary.total_tenants}</span>
            </div>
            <p className="text-sm text-gray-600">Total Tenants</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{summary.paid_count}</span>
            </div>
            <p className="text-sm text-gray-600">Paid</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{summary.overdue_count}</span>
            </div>
            <p className="text-sm text-gray-600">Overdue</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{summary.collection_rate.toFixed(1)}%</span>
            </div>
            <p className="text-sm text-gray-600">Collection Rate</p>
          </motion.div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 mb-1">Total Collected</p>
            <p className="text-xl font-bold text-green-900">{formatCurrency(summary.total_collected)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 mb-1">Outstanding</p>
            <p className="text-xl font-bold text-red-900">{formatCurrency(summary.total_outstanding)}</p>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="p-4 border-b bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex space-x-2">
              {(['all', 'paid', 'overdue', 'pending'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-1 text-xs">
                      ({status === 'paid' ? summary.paid_count : 
                        status === 'overdue' ? summary.overdue_count : 
                        summary.pending_count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 rounded-lg border border-gray-300 text-sm"
          >
            <option value="status">Sort by Status</option>
            <option value="name">Sort by Name</option>
            <option value="amount">Sort by Amount</option>
            <option value="date">Sort by Due Date</option>
          </select>
        </div>
      </div>

      {/* Payment List */}
      <div className="p-6">
        {sortedPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No {filterStatus !== 'all' ? filterStatus : ''} payments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPayments.map((payment, index) => (
              <motion.div
                key={payment.tenant_id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{payment.tenant_name}</h4>
                        <p className="text-sm text-gray-600">
                          {payment.unit_number && `Unit ${payment.unit_number}`}
                          {payment.building_name && ` • ${payment.building_name}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(payment.amount_due)}</p>
                      <p className="text-sm text-gray-600">
                        Due {formatDate(payment.due_date)}
                      </p>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      {payment.days_overdue && payment.days_overdue > 0 && (
                        <span className="ml-1">({payment.days_overdue}d)</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {payment.payment_date && (
                  <div className="mt-2 text-sm text-gray-600">
                    Paid on {formatDate(payment.payment_date)}
                    {payment.payment_method && ` via ${payment.payment_method}`}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}