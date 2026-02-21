import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Bill, Transaction } from "@/types/budget";
import { CATEGORY_LABELS, getMonthlyAmount, getWeeklyAmount } from "@/types/budget";
import DailySpendingChart from "./DailySpendingChart";

interface BudgetOverviewProps {
  bills: Bill[];
  income: number;
  transactions?: Transaction[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const COLORS = [
  "hsl(152,60%,48%)", "hsl(200,80%,55%)", "hsl(38,92%,55%)",
  "hsl(280,60%,55%)", "hsl(0,72%,55%)", "hsl(180,50%,50%)",
  "hsl(320,60%,55%)", "hsl(60,70%,50%)",
];

export default function BudgetOverview({ bills, income, transactions = [] }: BudgetOverviewProps) {
  const categoryTotals = bills.reduce((acc, bill) => {
    const monthly = getMonthlyAmount(bill.amount, bill.frequency);
    acc[bill.category] = (acc[bill.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
      value: Math.round(amount * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value);

  const totalWeekly = bills.reduce((sum, b) => sum + getWeeklyAmount(b.amount, b.frequency), 0);
  const totalMonthly = bills.reduce((sum, b) => sum + getMonthlyAmount(b.amount, b.frequency), 0);
  const weeklyIncome = income / 4.33;
  const weeklyAvailable = weeklyIncome - totalWeekly;
  const monthlyAvailable = income - totalMonthly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5"
    >
      <h2 className="text-lg font-semibold mb-4">Budget Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="flex items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => fmt(value)}
                  contentStyle={{
                    background: "hsl(220, 18%, 12%)",
                    border: "1px solid hsl(220, 14%, 22%)",
                    borderRadius: "8px",
                    color: "hsl(210, 20%, 92%)",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm">Add bills to see breakdown</p>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Weekly Income</p>
              <p className="font-mono font-semibold text-primary">{fmt(weeklyIncome)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Monthly Income</p>
              <p className="font-mono font-semibold text-primary">{fmt(income)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Weekly Expenses</p>
              <p className="font-mono font-semibold text-chart-expense">{fmt(totalWeekly)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Monthly Expenses</p>
              <p className="font-mono font-semibold text-chart-expense">{fmt(totalMonthly)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Weekly Available</p>
              <p className={`font-mono font-semibold ${weeklyAvailable >= 0 ? 'text-chart-savings' : 'text-destructive'}`}>{fmt(weeklyAvailable)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Monthly Available</p>
              <p className={`font-mono font-semibold ${monthlyAvailable >= 0 ? 'text-chart-savings' : 'text-destructive'}`}>{fmt(monthlyAvailable)}</p>
            </div>
          </div>

          {/* Category legend */}
          <div className="space-y-1.5">
            {chartData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-mono text-xs">{fmt(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Spending Chart */}
      {transactions.length > 0 && (
        <div className="mt-5 pt-5 border-t border-border/30">
          <DailySpendingChart transactions={transactions} compact />
        </div>
      )}
    </motion.div>
  );
}
