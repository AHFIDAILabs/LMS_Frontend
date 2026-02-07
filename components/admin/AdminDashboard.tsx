'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminContext } from '@/lib/context/adminContext';
import {
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Award,
  TrendingUp,
  UserCheck,
  Layers,
  FileText,
} from 'lucide-react';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import DashboardSidebar from '@/components/dashboard/StudentSidebar';
import { CircularProgress } from '@/components/ui/ProgressBar';
import AdminSidebar from '../dashboard/AdminSidebar';
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";

const AdminDashboard = () => {
  const { dashboardStats } = useAdminContext();
  const { data, loading, error } = dashboardStats;

  const { user } = useAuth();


  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <DashboardSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <DashboardSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-red-400 text-lg font-semibold mb-2">Something went wrong</p>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#EFB14A] hover:bg-[#EFB14A]/90 text-slate-900 rounded-lg text-sm font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Derived metrics ───────────────────────────────────
  const totalUsers = data?.users?.total ?? 0;
  console.log("admin total users", totalUsers);
  const completionRate =
    data?.enrollments?.total && data.enrollments.total > 0
      ? Math.round((data.enrollments.completed / data.enrollments.total) * 100)
      : 0;

  // ── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar />

      <div className="flex-1 ml-64 px-3">
        {/* ─── Sticky Header ──────────────────────────── */}
        <header className="sticky top-0 z-40 bg-slate-800/70 backdrop-blur border-b border-gray-800">
          <div className="container-custom p-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">Platform overview & analytics</p>
            </div>

            <Link
              href="/admin/settings"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Settings →
            </Link>
          </div>
        </header>

        {/* ─── Main Content ───────────────────────────── */}
        <main className="container-custom py-8 space-y-8">

          {/* Welcome banner — mirrors student dashboard's hero card */}
          <section className="relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-slate-800 via-slate-900 to-slate-950 p-8">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 blur-[140px]" />
            </div>

            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Platform Overview
                </h2>
                <p className="text-gray-400 text-lg">
                  {totalUsers > 0
                    ? `Managing ${totalUsers} users across your platform`
                    : 'No users yet — start by inviting students'}
                </p>
              </div>

              {/* Completion-rate ring — same component the student page uses */}
              <div className="text-center">
                <CircularProgress value={completionRate} size={120} />
                <p className="text-xs text-gray-500 mt-2">Completion Rate</p>
              </div>
            </div>
          </section>

          {/* ─── Stats Grid ───────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Total Users"
              value={data?.users?.total ?? 0}
              icon={Users}
              trend={{ value: 12, label: 'vs last month' }}
            />
            <StatsCard
              title="Students"
              value={data?.users?.students ?? 0}
              icon={GraduationCap}
              accentColor="text-lime-400"
            />
            <StatsCard
              title="Instructors"
              value={data?.users?.instructors ?? 0}
              icon={UserCheck}
              accentColor="text-blue-400"
            />
            <StatsCard
              title="Active Users"
              value={data?.users?.active ?? 0}
              icon={TrendingUp}
              trend={{ value: 8 }}
              accentColor="text-emerald-400"
            />
            <StatsCard
              title="Graduated"
              value={data?.users?.graduated ?? 0}
              icon={Award}
              accentColor="text-yellow-400"
            />
          </div>

          {/* ─── Two-column layout (main + sidebar) ──── */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: course & enrollment stats */}
            <div className="lg:col-span-2 space-y-6">

              {/* Course stats row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <StatsCard
                  title="Total Courses"
                  value={data?.courses?.total ?? 0}
                  icon={Layers}
                />
                <StatsCard
                  title="Published Courses"
                  value={data?.courses?.published ?? 0}
                  icon={FileText}
                  trend={{ value: 5, label: 'new this month' }}
                  accentColor="text-lime-400"
                />
              </div>

              {/* Enrollment stats row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <StatsCard
                  title="Total Enrollments"
                  value={data?.enrollments?.total ?? 0}
                  icon={BookOpen}
                  trend={{ value: 15 }}
                />
                <StatsCard
                  title="Completed Enrollments"
                  value={data?.enrollments?.completed ?? 0}
                  icon={Award}
                  accentColor="text-emerald-400"
                />
              </div>

              {/* Recent activity lives here so it gets the wider column */}
              <RecentActivity
                recentUsers={data?.recentActivity?.users}
                recentEnrollments={data?.recentActivity?.enrollments}
              />
            </div>

            {/* Right: quick-stats sidebar card — mirrors student dashboard's aside */}
            <aside className="space-y-6">
              <div className="rounded-xl border border-gray-800 bg-slate-800/50">
                <div className="p-5 border-b border-gray-800">
                  <h3 className="text-lg font-bold text-white">Quick Stats</h3>
                  <p className="text-sm text-gray-500">Platform summary</p>
                </div>

                <div className="p-4 space-y-3">
                  {[
                    { label: 'Certificates Issued', value: data?.certificates?.issued ?? 0, color: 'text-yellow-400' },
                    { label: 'Active Enrollments', value: (data?.enrollments?.total ?? 0) - (data?.enrollments?.completed ?? 0), color: 'text-lime-400' },
                    { label: 'Completion Rate', value: `${completionRate}%`, color: 'text-emerald-400' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg"
                    >
                      <span className="text-gray-400 text-sm">{stat.label}</span>
                      <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick-links card */}
              <div className="rounded-xl border border-gray-800 bg-slate-800/50">
                <div className="p-5 border-b border-gray-800">
                  <h3 className="text-lg font-bold text-white">Quick Links</h3>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { href: '/dashboard/admin/programes', label: 'Manage Programs' },
                    { href: '/dashboard/admin/courses', label: 'Manage Courses' },
                    { href: '/dashboard/admin/instructors', label: 'Manage Instructors' },
                    { href: '/dashboard/admin/users', label: 'Manage Users' },
                    
                    { href: '/dashboard/admin/enrollment', label: 'View Enrollments' },
                    { href: '/dashboard/admin/certificates', label: 'Certificates' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-sm text-gray-400 hover:text-white hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors"
                    >
                      {link.label} →
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;