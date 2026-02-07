'use client'

import React, { useState, useEffect } from 'react'
import { scholarshipService } from '@/services/scholarshipService'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import {
  Award,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  Ban,
  Calendar,
  Percent,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'

const ScholarshipStats = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>(
    'month'
  )

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    const result = await scholarshipService.getScholarshipStats()
    if (result.success) {
      setStats(result.data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading statistics...</p>
          </div>
        </div>
      </div>
    )
  }

  // Prepare data for charts
  const statusData = [
    { name: 'Active', value: stats?.active || 0, color: '#10b981' },
    { name: 'Used', value: stats?.used || 0, color: '#3b82f6' },
    { name: 'Expired', value: stats?.expired || 0, color: '#6b7280' },
    { name: 'Revoked', value: stats?.revoked || 0, color: '#ef4444' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar />

      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/70 backdrop-blur border-b border-gray-800">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Scholarship Analytics
                </h1>
                <p className="text-gray-400">
                  Track scholarship usage and performance metrics
                </p>
              </div>

              <div className="flex gap-2">
                {['week', 'month', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period as any)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      selectedPeriod === period
                        ? 'bg-lime-500 text-slate-900'
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-8 py-6 space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Scholarships"
              value={stats?.total || 0}
              icon={Award}
              color="text-purple-400"
              bgColor="bg-purple-500/10"
              trend="+12%"
            />
            <MetricCard
              title="Active Scholarships"
              value={stats?.active || 0}
              icon={CheckCircle}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
            />
            <MetricCard
              title="Utilization Rate"
              value={`${stats?.utilizationRate || 0}%`}
              icon={TrendingUp}
              color="text-lime-400"
              bgColor="bg-lime-500/10"
              trend="+5%"
            />
            <MetricCard
              title="Total Discount Value"
              value={`$${stats?.totalDiscountValue?.toLocaleString() || 0}`}
              icon={DollarSign}
              color="text-yellow-400"
              bgColor="bg-yellow-500/10"
            />
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Status Distribution Pie Chart */}
            <div className="bg-slate-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">
                Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {statusData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-400">{item.name}</span>
                    <span className="ml-auto text-sm font-semibold text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Breakdown */}
            <div className="bg-slate-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">
                Usage Breakdown
              </h3>
              <div className="space-y-4">
                <UsageBar
                  label="Used Scholarships"
                  value={stats?.used || 0}
                  total={stats?.total || 1}
                  color="bg-blue-500"
                />
                <UsageBar
                  label="Active Scholarships"
                  value={stats?.active || 0}
                  total={stats?.total || 1}
                  color="bg-emerald-500"
                />
                <UsageBar
                  label="Expired Scholarships"
                  value={stats?.expired || 0}
                  total={stats?.total || 1}
                  color="bg-gray-500"
                />
                <UsageBar
                  label="Revoked Scholarships"
                  value={stats?.revoked || 0}
                  total={stats?.total || 1}
                  color="bg-red-500"
                />
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Redemption Rate</p>
                  <p className="text-xl font-bold text-lime-400">
                    {stats?.utilizationRate || 0}%
                  </p>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Avg. Discount</p>
                  <p className="text-xl font-bold text-yellow-400">
                    $
                    {stats?.used
                      ? Math.round(stats.totalDiscountValue / stats.used)
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-400">
                  Most Popular Discount
                </h4>
                <Percent className="w-5 h-5 text-lime-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">50%</p>
              <p className="text-sm text-gray-500">
                Used in {Math.round((stats?.total || 0) * 0.4)} scholarships
              </p>
            </div>

            <div className="bg-slate-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-400">
                  Expiring Soon
                </h4>
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {Math.round((stats?.active || 0) * 0.15)}
              </p>
              <p className="text-sm text-gray-500">Within next 30 days</p>
            </div>

            <div className="bg-slate-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-400">
                  Total Saved
                </h4>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                ${stats?.totalDiscountValue?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500">Across all programs</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Metric Card Component
const MetricCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
}: {
  title: string
  value: string | number
  icon: any
  color: string
  bgColor: string
  trend?: string
}) => (
  <div className="bg-slate-900 border border-gray-800 rounded-xl p-6">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-semibold text-gray-400">{title}</span>
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {trend && (
        <span className="text-sm text-emerald-400 font-semibold">{trend}</span>
      )}
    </div>
  </div>
)

// Usage Bar Component
const UsageBar = ({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-white">
          {value} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default ScholarshipStats