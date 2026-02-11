import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Transaction, DailyStats, FinancialInsight, UseCase } from "../types";
import { WalletIcon, TrendingUpIcon, ReceiptIcon, SparklesIcon, XIcon } from "./Icons";
import IOSDesign from "../utils/iosDesignSystem";
import IOSAnimations from "../utils/iosAnimations";

interface DashboardProps {
  stats: DailyStats;
  recentTransactions: Transaction[];
  onGenerateInsights: () => void;
  onEditTransaction: (t: Transaction) => void;
  insightData: FinancialInsight | null;
  onCloseInsight: () => void;
  isAnalyzing: boolean;
  useCase?: UseCase;
  t: any;
}

// Animated Counter Component with iOS spring physics
const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string; decimals?: number }> = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, IOSDesign.animations.springGentle);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.onChange((latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <span>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const Dashboard: React.FC<DashboardProps> = ({
  stats,
  recentTransactions,
  onGenerateInsights,
  onEditTransaction,
  insightData,
  onCloseInsight,
  isAnalyzing,
  useCase = "business",
  t,
}) => {
  const isPersonal = useCase === "personal";
  const positiveLabel = isPersonal ? "Income" : "Sales";
  const negativeLabel = isPersonal ? "Spent" : "Expenses";
  const netLabel = isPersonal ? "Balance" : "Net Profit";

  const positiveAmount = isPersonal ? stats.totalIncome : stats.totalSales;
  const negativeAmount = isPersonal ? stats.totalSpent : stats.totalExpenses;
  const netAmount = stats.netAmount;
  const isPositive = netAmount >= 0;

  const glassStyle = IOSDesign.getGlassMorphismStyle('light', 'regular');

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24 px-4">
      {/* 💰 Premium iOS Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={IOSDesign.animations.spring}
      >
        <div
          className="relative overflow-hidden rounded-3xl p-6 text-white"
          style={{
            background: isPositive 
              ? 'linear-gradient(135deg, #34C759 0%, #28A745 100%)'
              : 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)',
            boxShadow: isPositive
              ? '0 20px 60px rgba(52, 199, 89, 0.3), 0 8px 24px rgba(52, 199, 89, 0.2)'
              : '0 20px 60px rgba(255, 59, 48, 0.3), 0 8px 24px rgba(255, 59, 48, 0.2)',
          }}
        >
          {/* Background Icon */}
          <motion.div
            className="absolute top-0 right-0 opacity-10"
            style={{ transform: 'translate(25%, -25%)' }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <WalletIcon className="w-40 h-40" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            <motion.p 
              className="text-white/70 text-xs font-semibold mb-1 uppercase tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {netLabel} Today
            </motion.p>

            <motion.h2 
              className="text-4xl font-bold tracking-tight mb-1"
              style={{ fontFamily: IOSDesign.typography.fontFamily.system }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, ...IOSDesign.animations.springBounce }}
            >
              {isPositive ? "+" : ""}
              <AnimatedCounter value={Math.abs(netAmount)} prefix=" RM " decimals={2} />
            </motion.h2>

            <motion.p 
              className="text-white/60 text-xs mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {stats.transactionCount} transaction{stats.transactionCount !== 1 ? "s" : ""} •{" "}
              {isPersonal ? "Personal" : "Business"} Mode
            </motion.p>

            {/* 📊 Cash Flow Breakdown - Glassmorphism */}
            <motion.div
              className="rounded-2xl p-4 space-y-3"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, ...IOSDesign.animations.spring }}
            >
              {/* Income/Sales Row */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-white shadow-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-white/95 text-sm font-semibold">{positiveLabel}</span>
                </div>
                <span className="text-white font-bold text-base">
                  + <AnimatedCounter value={positiveAmount} prefix="RM " decimals={2} />
                </span>
              </div>

              {/* Expense Row */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/70" />
                  <span className="text-white/95 text-sm font-semibold">{negativeLabel}</span>
                </div>
                <span className="text-white font-bold text-base">
                  - <AnimatedCounter value={negativeAmount} prefix="RM " decimals={2} />
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex h-2.5 rounded-full overflow-hidden bg-white/20 shadow-inner">
                  {positiveAmount > 0 && (
                    <motion.div
                      className="bg-white shadow-sm"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(positiveAmount / (positiveAmount + negativeAmount)) * 100}%`,
                      }}
                      transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
                    />
                  )}
                  {negativeAmount > 0 && (
                    <motion.div
                      className="bg-white/60"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(negativeAmount / (positiveAmount + negativeAmount)) * 100}%`,
                      }}
                      transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
                    />
                  )}
                </div>
                <div className="flex justify-between mt-2 text-[11px] text-white/60 font-medium">
                  <span>
                    {stats.incomeCount} {isPersonal ? "income" : "sales"}
                  </span>
                  <span>
                    {stats.expenseCount} {isPersonal ? "expense" : "cost"}
                    {stats.expenseCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 🤖 AI Insights Button */}
      <motion.button
        onClick={() => {
          IOSDesign.haptics.medium();
          onGenerateInsights();
        }}
        disabled={isAnalyzing}
        className="w-full p-4 rounded-2xl flex items-center justify-between group disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: IOSDesign.gradients.purple,
          boxShadow: '0 12px 32px rgba(175, 82, 222, 0.3), 0 4px 12px rgba(175, 82, 222, 0.2)',
        }}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        transition={IOSDesign.animations.spring}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        viewport={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"
            animate={{ rotate: isAnalyzing ? 360 : 0 }}
            transition={{ duration: 1, repeat: isAnalyzing ? Infinity : 0, ease: 'linear' }}
          >
            <SparklesIcon className="w-5 h-5 text-white" />
          </motion.div>
          <div className="text-left">
            <p className="font-bold text-white text-base">{t.generateReport}</p>
            <p className="text-xs text-white/70">AI insights & analysis</p>
          </div>
        </div>
        <motion.div
          className="text-white text-xl"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.div>
      </motion.button>

      {/* 📋 Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, ...IOSDesign.animations.spring }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5" style={{ color: IOSDesign.colors.light.primary }} />
            {t.recentActivity}
          </h3>
          <span 
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              background: IOSDesign.colors.light.background,
              color: IOSDesign.colors.light.textTertiary,
            }}
          >
            {t.tapToView}
          </span>
        </div>

        <div className="space-y-2">
          {recentTransactions.length === 0 ? (
            <motion.div
              className="text-center py-10 rounded-2xl"
              style={{
                background: glassStyle.background,
                backdropFilter: glassStyle.backdropFilter,
                WebkitBackdropFilter: glassStyle.backdropFilter,
                border: glassStyle.border,
                boxShadow: IOSDesign.getIOSShadow('sm'),
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={IOSDesign.animations.spring}
            >
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: IOSDesign.colors.light.background }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ReceiptIcon className="w-8 h-8" style={{ color: IOSDesign.colors.light.textQuaternary }} />
              </motion.div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">{t.noTransTitle}</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{t.noTransDesc}</p>
            </motion.div>
          ) : (
            recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                onClick={() => {
                  IOSDesign.haptics.light();
                  onEditTransaction(transaction);
                }}
                className="px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer"
                style={{
                  // Solid background with clear contrast
                  background: transaction.type === "sale"
                    ? 'linear-gradient(135deg, #D4F4DD 0%, #B8F1CC 100%)' // Light green for sales
                    : 'linear-gradient(135deg, #FFE5E5 0%, #FFD6D6 100%)', // Light red for expenses
                  border: transaction.type === "sale"
                    ? '1px solid rgba(52, 199, 89, 0.2)'
                    : '1px solid rgba(255, 59, 48, 0.2)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                }}
                variants={IOSAnimations.list.item}
                custom={index}
                initial="hidden"
                animate="visible"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01, boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)' }}
                transition={IOSDesign.animations.spring}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Compact Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: transaction.type === "sale"
                        ? '#34C759' // Solid green
                        : '#FF3B30', // Solid red
                    }}
                  >
                    {transaction.type === "sale" ? (
                      <TrendingUpIcon className="w-4 h-4 text-white" />
                    ) : (
                      <WalletIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  {/* Transaction Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 text-sm line-clamp-1">
                      {transaction.item}
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-1 font-medium">
                      {transaction.receipt
                        ? `${transaction.receipt.items.length} items`
                        : `${transaction.quantity} x RM ${(transaction.price || 0).toFixed(2)}`}
                    </p>
                  </div>
                </div>
                
                {/* Amount & Time */}
                <div className="text-right shrink-0 ml-2">
                  <p
                    className="font-bold text-sm"
                    style={{
                      color: transaction.type === "sale" 
                        ? '#059669' // Darker green (emerald-600)
                        : '#DC2626', // Darker red (red-600)
                    }}
                  >
                    {transaction.type === "sale" ? "+" : "-"} RM {(transaction.total || 0).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium">
                    {new Date(transaction.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* 🔮 Insight Modal - iOS Bottom Sheet Style */}
      <AnimatePresence>
        {insightData && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{ background: IOSDesign.colors.light.overlay }}
              onClick={onCloseInsight}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
              style={{
                background: IOSDesign.colors.light.backgroundSecondary,
                boxShadow: IOSDesign.getIOSShadow('xl'),
              }}
              variants={IOSAnimations.modal.modal}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              <div
                className="p-6 text-white shrink-0"
                style={{ background: IOSDesign.gradients.purple }}
              >
                <motion.button
                  onClick={() => {
                    IOSDesign.haptics.light();
                    onCloseInsight();
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/20 rounded-full"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ background: 'rgba(255, 255, 255, 0.3)' }}
                >
                  <XIcon className="w-5 h-5 text-white" />
                </motion.button>
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-5 h-5 text-white/80" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                    {t.aiReport}
                  </span>
                </div>
                <h2 className="text-2xl font-bold leading-tight">{insightData.financialHealth}</h2>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-6 space-y-6">
                {/* Content sections remain the same but with iOS styling */}
                {/* For brevity, keeping original content structure */}
                {insightData.anomalies.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: IOSDesign.colors.light.textTertiary }}>
                      {t.anomalies}
                    </h3>
                    <div className="space-y-2">
                      {insightData.anomalies.map((a, i) => (
                        <motion.div
                          key={i}
                          className="p-4 rounded-2xl border-l-4"
                          style={{
                            background: glassStyle.background,
                            backdropFilter: glassStyle.backdropFilter,
                            boxShadow: IOSDesign.getIOSShadow('sm'),
                            borderColor: a.severity === "critical"
                              ? IOSDesign.colors.light.error
                              : a.severity === "warning"
                                ? IOSDesign.colors.light.warning
                                : IOSDesign.colors.light.primary,
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <h4 className="font-semibold text-sm mb-1">{a.title}</h4>
                          <p className="text-xs" style={{ color: IOSDesign.colors.light.textSecondary }}>
                            {a.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
