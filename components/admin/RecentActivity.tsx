'use client';

import React, { useState } from 'react';
import { UserPlus, BookOpen, Award, Clock } from 'lucide-react';

interface RecentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface RecentEnrollment {
  _id: string;
  studentId: {
    firstName: string;
    lastName: string;
    email?: string;
  };
  program?: {
    title: string;
  };
  enrollmentDate?: string;
  status?: string;
}

interface RecentActivityProps {
  recentUsers?: RecentUser[];
  recentEnrollments?: RecentEnrollment[];
}

// ──────────────────────────────────────
// Helpers
// ──────────────────────────────────────
function initials(first: string, last: string): string {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}

function roleBadge(role: string) {
  const map: Record<string, string> = {
    admin: 'bg-purple-500/15 text-purple-400',
    instructor: 'bg-blue-500/15 text-blue-400',
    student: 'bg-lime-500/15 text-lime-400',
  };
  return map[role] || 'bg-gray-800 text-gray-400';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ──────────────────────────────────────
// Sub-components
// ──────────────────────────────────────
function UserRow({ user }: { user: RecentUser }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/60 transition-colors">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-gray-300 flex-shrink-0">
        {initials(user.firstName, user.lastName)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>

      {/* Role badge */}
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${roleBadge(user.role)}`}>
        {user.role}
      </span>
    </div>
  );
}

function EnrollmentRow({ enrollment }: { enrollment: RecentEnrollment }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/60 transition-colors">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-gray-300 flex-shrink-0">
        {initials(enrollment.studentId.firstName, enrollment.studentId.lastName)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {enrollment.studentId.firstName} {enrollment.studentId.lastName}
        </p>
        <p className="text-xs text-gray-500 truncate">
          Enrolled in <span className="text-gray-400">{enrollment.program?.title || 'Unknown Program'}</span>
        </p>
      </div>

      {/* Date */}
      {enrollment.enrollmentDate && (
        <span className="text-xs text-gray-600 shrink-0 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(enrollment.enrollmentDate)}
        </span>
      )}
    </div>
  );
}

// ──────────────────────────────────────
// Main
// ──────────────────────────────────────
const RecentActivity: React.FC<RecentActivityProps> = ({
  recentUsers = [],
  recentEnrollments = [],
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'enrollments'>('users');

  return (
    <div className="rounded-xl border border-gray-800 bg-slate-800/50">
      {/* Header + tabs */}
      <div className="flex items-center justify-between p-5 border-b border-gray-800">
        <h3 className="text-lg font-bold text-white">Recent Activity</h3>

        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-slate-700 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Users
            {recentUsers.length > 0 && (
              <span className="bg-slate-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                {recentUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('enrollments')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'enrollments'
                ? 'bg-slate-700 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Enrollments
            {recentEnrollments.length > 0 && (
              <span className="bg-slate-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                {recentEnrollments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        {activeTab === 'users' && (
          <>
            {recentUsers.length === 0 ? (
              <div className="py-10 text-center">
                <UserPlus className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No recent users</p>
              </div>
            ) : (
              recentUsers.map((user) => <UserRow key={user._id} user={user} />)
            )}
          </>
        )}

        {activeTab === 'enrollments' && (
          <>
            {recentEnrollments.length === 0 ? (
              <div className="py-10 text-center">
                <BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No recent enrollments</p>
              </div>
            ) : (
              recentEnrollments.map((enrollment) => (
                <EnrollmentRow key={enrollment._id} enrollment={enrollment} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;