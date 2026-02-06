import React from "react";
import { Transaction, DailyStats, FinancialInsight, UseCase } from "../types";
import { WalletIcon, TrendingUpIcon, ReceiptIcon, SparklesIcon, XIcon } from "./Icons";

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
  // Context-aware labels
  const isPersonal = useCase === "personal";
  const positiveLabel = isPersonal ? "Income" : "Sales";
  const negativeLabel = isPersonal ? "Spent" : "Expenses";
  const netLabel = isPersonal ? "Balance" : "Net Profit";

  const positiveAmount = isPersonal ? stats.totalIncome : stats.totalSales;
  const negativeAmount = isPersonal ? stats.totalSpent : stats.totalExpenses;
  const netAmount = stats.netAmount;
  const isPositive = netAmount >= 0;

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-40">
      {/* Header Stats - Context Aware */}
      <div
        className={`${isPositive ? "bg-gradient-to-br from-emerald-600 to-teal-700" : "bg-gradient-to-br from-red-600 to-rose-700"} dark:${isPositive ? "from-emerald-700 to-teal-800" : "from-red-700 to-rose-800"} text-white rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all`}
      >
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <WalletIcon className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <p className="text-white/80 text-xs font-medium mb-1 uppercase tracking-wider">
            {netLabel} Today
          </p>
          <h2 className="text-5xl font-bold tracking-tight mb-1">
            {isPositive ? "+" : ""} RM {Math.abs(netAmount).toFixed(2)}
          </h2>
          <p className="text-white/60 text-xs mb-6">
            {stats.transactionCount} transaction{stats.transactionCount !== 1 ? "s" : ""} •{" "}
            {isPersonal ? "Personal" : "Business"} Mode
          </p>

          {/* Cash Flow Breakdown */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                <span className="text-white/90 text-sm font-medium">{positiveLabel}</span>
              </div>
              <span className="text-white font-bold text-sm">+ RM {positiveAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-300"></div>
                <span className="text-white/90 text-sm font-medium">{negativeLabel}</span>
              </div>
              <span className="text-white font-bold text-sm">- RM {negativeAmount.toFixed(2)}</span>
            </div>

            {/* Visual Cash Flow Bar */}
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex h-2 rounded-full overflow-hidden bg-white/20">
                {positiveAmount > 0 && (
                  <div
                    className="bg-emerald-400"
                    style={{
                      width: `${(positiveAmount / (positiveAmount + negativeAmount)) * 100}%`,
                    }}
                  ></div>
                )}
                {negativeAmount > 0 && (
                  <div
                    className="bg-red-400"
                    style={{
                      width: `${(negativeAmount / (positiveAmount + negativeAmount)) * 100}%`,
                    }}
                  ></div>
                )}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-white/60">
                <span>
                  {stats.incomeCount} {isPersonal ? "income" : "sales"}
                </span>
                <span>
                  {stats.expenseCount} {isPersonal ? "expense" : "cost"}
                  {stats.expenseCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Action */}
      <button
        onClick={onGenerateInsights}
        disabled={isAnalyzing}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-700 dark:to-indigo-700 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between group active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <SparklesIcon className={`w-5 h-5 ${isAnalyzing ? "animate-spin" : ""}`} />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm">{t.generateReport}</p>
            <p className="text-xs text-indigo-100 opacity-80">Analyze anomalies & profit margins</p>
          </div>
        </div>
        <div className="text-indigo-100 group-hover:translate-x-1 transition-transform">→</div>
      </button>

      {/* Insight Modal */}
      {insightData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-0 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="bg-violet-600 dark:bg-violet-800 p-6 text-white shrink-0">
              <button
                onClick={onCloseInsight}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-5 h-5 text-violet-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-violet-200">
                  {t.aiReport}
                </span>
              </div>
              <h2 className="text-xl font-bold leading-tight">{insightData.financialHealth}</h2>
            </div>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto p-6 space-y-8 bg-slate-50 dark:bg-slate-900 custom-scrollbar">
              {/* Anomalies Section */}
              {insightData.anomalies.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    {t.anomalies}
                  </h3>
                  <div className="space-y-3">
                    {insightData.anomalies.map((a, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border-l-4 shadow-sm bg-white dark:bg-slate-800 ${
                          a.severity === "critical"
                            ? "border-red-500"
                            : a.severity === "warning"
                              ? "border-orange-400"
                              : "border-blue-400"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              a.severity === "critical"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                : a.severity === "warning"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}
                          >
                            {a.severity.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                          {a.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {a.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Profitability Table (New) */}
              {insightData.itemProfitability && insightData.itemProfitability.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    {t.profitAnalysis}
                  </h3>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Item
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">
                            Cost/Price
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">
                            Margin
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {insightData.itemProfitability.slice(0, 5).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {item.advice}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                RM{(item.avgSellingPrice || 0).toFixed(2)}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                Est: RM{(item.estimatedCost || 0).toFixed(2)}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                  (item.marginPercent || 0) > 50
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    : (item.marginPercent || 0) > 30
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                }`}
                              >
                                {(item.marginPercent || 0).toFixed(0)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Margins Summary */}
              <section className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                  {t.overallProfit}
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.netMargin}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {insightData.margins.overall}%
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="mb-1">
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                        {t.bestItem}
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 line-clamp-1">
                        {insightData.margins.highestMarginItem}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">
                        {t.worstItem}
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 line-clamp-1">
                        {insightData.margins.lowestMarginItem}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cash Flow Text */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {t.cashFlow}
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-sm text-blue-900 dark:text-blue-200 leading-relaxed border border-blue-100 dark:border-blue-800/50">
                  {insightData.cashFlowAnalysis}
                </div>
              </section>

              {/* Advice */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {t.advice}
                </h3>
                <ul className="space-y-2">
                  {insightData.actionableAdvice.map((advice, idx) => (
                    <li
                      key={idx}
                      className="flex gap-3 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                      <span className="text-violet-500 font-bold">•</span>
                      {advice}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Section */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t.recentActivity}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            {t.tapToView}
          </span>
        </div>

        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
              <div className="bg-slate-50 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <ReceiptIcon className="w-8 h-8 text-slate-300 dark:text-slate-500" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-sm">{t.noTransTitle}</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{t.noTransDesc}</p>
            </div>
          ) : (
            recentTransactions.map((t) => (
              <div
                key={t.id}
                onClick={() => onEditTransaction(t)}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between hover:shadow-md transition-all cursor-pointer active:bg-slate-50 dark:active:bg-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      t.type === "sale"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {t.type === "sale" ? (
                      <TrendingUpIcon className="w-5 h-5" />
                    ) : (
                      <WalletIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm line-clamp-1">
                      {t.item}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.receipt
                        ? `${t.receipt.items.length} items`
                        : `${t.quantity} x RM ${(t.price || 0).toFixed(2)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-sm ${t.type === "sale" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"}`}
                  >
                    {t.type === "sale" ? "+" : "-"} RM {(t.total || 0).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(t.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
