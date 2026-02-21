import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Transaction } from "@/types/budget";

interface DailySpendingChartProps {
  transactions: Transaction[];
  compact?: boolean;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const tooltipStyle = {
  background: "hsl(220, 18%, 12%)",
  border: "1px solid hsl(220, 14%, 22%)",
  borderRadius: "8px",
  color: "hsl(210, 20%, 92%)",
  fontSize: "13px",
};

export default function DailySpendingChart({ transactions, compact = false }: DailySpendingChartProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Build daily totals for current month
  const dailyMap: Record<number, number> = {};
  transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .forEach((t) => {
      const day = new Date(t.date).getDate();
      dailyMap[day] = (dailyMap[day] || 0) + t.amount;
    });

  const chartData = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    label: `${currentMonth + 1}/${i + 1}`,
    amount: Math.round((dailyMap[i + 1] || 0) * 100) / 100,
  }));

  const totalSpent = Object.values(dailyMap).reduce((s, v) => s + v, 0);
  const daysWithSpending = Object.keys(dailyMap).length;
  const avgDaily = daysWithSpending > 0 ? totalSpent / daysWithSpending : 0;

  const hasData = totalSpent > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={compact ? "" : "glass-card p-5"}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">
          Daily Spending — {now.toLocaleString("default", { month: "long" })}
        </h3>
        {hasData && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Total: <span className="font-mono text-foreground">{fmt(totalSpent)}</span></span>
            <span>Avg: <span className="font-mono text-foreground">{fmt(avgDaily)}/day</span></span>
          </div>
        )}
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={compact ? 180 : 220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis
              dataKey="day"
              stroke="hsl(215, 12%, 55%)"
              fontSize={10}
              tickFormatter={(v) => (v % 5 === 0 || v === 1 ? `${v}` : "")}
            />
            <YAxis
              stroke="hsl(215, 12%, 55%)"
              fontSize={10}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={(v: number) => [fmt(v), "Spent"]}
              labelFormatter={(day) => `Day ${day}`}
              contentStyle={tooltipStyle}
            />
            <Bar
              dataKey="amount"
              fill="hsl(200, 80%, 55%)"
              radius={[2, 2, 0, 0]}
              name="Spent"
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-8">
          Add expense transactions to track daily spending
        </p>
      )}
    </motion.div>
  );
}
