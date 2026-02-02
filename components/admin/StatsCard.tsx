'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;   // e.g. 12  → means +12 %
    label?: string;  // overrides the default "vs last month"
  };
  accentColor?: string; // tailwind text colour for value, defaults to white
  bgColor?: string;     // optional card-level background override
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  accentColor = 'text-white',
  bgColor,
}) => {
  // Determine trend direction styling
  const trendPositive = trend && trend.value > 0;
  const trendNegative = trend && trend.value < 0;
  const trendNeutral = trend && trend.value === 0;

  const trendColor = trendPositive
    ? 'text-lime-500'
    : trendNegative
    ? 'text-red-400'
    : 'text-gray-500';

  const trendBg = trendPositive
    ? 'bg-lime-500/10'
    : trendNegative
    ? 'bg-red-500/10'
    : 'bg-gray-800';

  const TrendIcon = trendPositive ? TrendingUp : trendNegative ? TrendingDown : Minus;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-gray-800 p-5 transition-all duration-300 hover:border-gray-700 ${
        bgColor || 'bg-slate-800/50'
      }`}
    >
      {/* Subtle glow behind the icon */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500/5 blur-[30px] pointer-events-none" />

      <div className="relative flex items-start justify-between">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-slate-700/60 flex items-center justify-center">
          <Icon className="w-5 h-5 text-lime-500" />
        </div>

        {/* Trend badge */}
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trendBg} ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className={`text-2xl font-bold ${accentColor}`}>{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
        {trend?.label && (
          <p className="text-xs text-gray-600">{trend.label}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;