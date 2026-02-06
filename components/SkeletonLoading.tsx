import React from 'react';
import { Shimmer } from './MicroInteractions';

// ============================================================================
// TRANSACTION CARD SKELETON
// ============================================================================

export const TransactionCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
      <Shimmer className="absolute inset-0" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon skeleton */}
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 animate-pulse" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2 animate-pulse" />
          </div>
        </div>

        {/* Amount skeleton */}
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-20 animate-pulse" />
      </div>
    </div>
  );
};

// ============================================================================
// DASHBOARD STATS SKELETON
// ============================================================================

export const DashboardStatsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Main stat card skeleton */}
      <div className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <Shimmer className="absolute inset-0" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-white/30 dark:bg-slate-900/30 rounded-lg w-32 animate-pulse" />
          <div className="h-8 w-8 bg-white/30 dark:bg-slate-900/30 rounded-full animate-pulse" />
        </div>

        {/* Amount */}
        <div className="h-12 bg-white/40 dark:bg-slate-900/40 rounded-xl w-48 mb-4 animate-pulse" />

        {/* Sub stats */}
        <div className="bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm rounded-xl p-3 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-white/30 dark:bg-slate-900/30 rounded w-24 animate-pulse" />
            <div className="h-4 bg-white/30 dark:bg-slate-900/30 rounded w-16 animate-pulse" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-white/30 dark:bg-slate-900/30 rounded w-24 animate-pulse" />
            <div className="h-4 bg-white/30 dark:bg-slate-900/30 rounded w-16 animate-pulse" />
          </div>

          {/* Progress bar skeleton */}
          <div className="mt-2 pt-2 border-t border-white/20">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/40 rounded-full w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Insights button skeleton */}
      <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse relative overflow-hidden">
        <Shimmer className="absolute inset-0" />
      </div>
    </div>
  );
};

// ============================================================================
// TRANSACTION LIST SKELETON
// ============================================================================

export const TransactionListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse" />
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20 animate-pulse" />
      </div>

      {Array.from({ length: count }).map((_, i) => (
        <TransactionCardSkeleton key={i} />
      ))}
    </div>
  );
};

// ============================================================================
// ACCOUNT CARD SKELETON
// ============================================================================

export const AccountCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
      <Shimmer className="absolute inset-0" />

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon skeleton */}
          <div className="w-12 h-12 rounded-full bg-white/30 dark:bg-slate-900/30 animate-pulse" />

          <div className="flex-1 space-y-2">
            {/* Title */}
            <div className="h-5 bg-white/40 dark:bg-slate-900/40 rounded-lg w-32 animate-pulse" />
            {/* Subtitle */}
            <div className="h-3 bg-white/30 dark:bg-slate-900/30 rounded-lg w-24 animate-pulse" />
            {/* Balance */}
            <div className="h-8 bg-white/50 dark:bg-slate-900/50 rounded-lg w-40 mt-2 animate-pulse" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <div className="w-8 h-8 bg-white/30 dark:bg-slate-900/30 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-white/30 dark:bg-slate-900/30 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CATEGORY CARD SKELETON
// ============================================================================

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
      <Shimmer className="absolute inset-0" />

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon skeleton */}
          <div className="w-10 h-10 rounded-full bg-white/30 dark:bg-slate-900/30 animate-pulse" />

          <div className="flex-1 space-y-2">
            {/* Title */}
            <div className="h-5 bg-white/40 dark:bg-slate-900/40 rounded-lg w-28 animate-pulse" />
            {/* Subtitle */}
            <div className="h-3 bg-white/30 dark:bg-slate-900/30 rounded-lg w-20 animate-pulse" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <div className="w-8 h-8 bg-white/30 dark:bg-slate-900/30 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-white/30 dark:bg-slate-900/30 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BUDGET CARD SKELETON
// ============================================================================

export const BudgetCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
      <Shimmer className="absolute inset-0" />

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-white/40 dark:bg-slate-900/40 rounded-lg w-36 animate-pulse" />
            <div className="h-3 bg-white/30 dark:bg-slate-900/30 rounded-lg w-24 animate-pulse" />
          </div>

          <div className="flex gap-1">
            <div className="w-16 h-6 bg-white/30 dark:bg-slate-900/30 rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-white/30 dark:bg-slate-900/30 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-white/30 dark:bg-slate-900/30 rounded w-32 animate-pulse" />
            <div className="h-4 bg-white/30 dark:bg-slate-900/30 rounded w-12 animate-pulse" />
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-white/40 rounded-full w-2/3 animate-pulse" />
          </div>

          <div className="flex justify-between">
            <div className="h-3 bg-white/30 dark:bg-slate-900/30 rounded w-24 animate-pulse" />
            <div className="h-3 bg-white/30 dark:bg-slate-900/30 rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL SKELETON (for loading modals)
// ============================================================================

export const ModalSkeleton: React.FC<{ title?: string }> = ({ title = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse" />
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse relative overflow-hidden">
              <Shimmer className="absolute inset-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CHART SKELETON
// ============================================================================

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
      <Shimmer className="absolute inset-0" />

      {/* Title */}
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-40 mb-6 animate-pulse" />

      {/* Chart bars */}
      <div className="flex items-end justify-around h-48 gap-2">
        {[40, 70, 55, 85, 60, 75, 50].map((height, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-t-lg animate-pulse"
            style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FULL PAGE SKELETON (for initial load)
// ============================================================================

export const FullPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-24 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Main content */}
      <div className="p-6 space-y-6">
        <DashboardStatsSkeleton />
        <TransactionListSkeleton count={5} />
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const SkeletonLoading = {
  TransactionCard: TransactionCardSkeleton,
  DashboardStats: DashboardStatsSkeleton,
  TransactionList: TransactionListSkeleton,
  AccountCard: AccountCardSkeleton,
  CategoryCard: CategoryCardSkeleton,
  BudgetCard: BudgetCardSkeleton,
  Modal: ModalSkeleton,
  Chart: ChartSkeleton,
  FullPage: FullPageSkeleton,
};

export default SkeletonLoading;
