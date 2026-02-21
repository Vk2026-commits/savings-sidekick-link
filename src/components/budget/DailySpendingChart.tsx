import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Bill } from "@/types/budget";
import { getMonthlyAmount } from "@/types/budget";

interface DailySpendingChartProps {
  bills: Bill[];
  month?: string; // "YYYY-MM" — if provided, only bills for that month
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

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DailySpendingChart({ bills, month, compact = false }: DailySpendingChartProps) {
  // Filter bills by month if provided
  const filtered = month ? bills.filter((b) => b.month === month) : bills;

  // Determine the year/month context for mapping due dates to days of the week
  const now = new Date();
  const [ctxYear, ctxMonth] = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  // Group bill amounts by day of week using their dueDate (day of month)
  const dayTotals = new Array(7).fill(0);

  filtered.forEach((bill) => {
    const dueDay = Math.min(bill.dueDate, new Date(ctxYear, ctxMonth, 0).getDate()); // clamp to valid day
    const date = new Date(ctxYear, ctxMonth - 1, dueDay);
    const dow = date.getDay(); // 0=Sun, 6=Sat
    dayTotals[dow] += getMonthlyAmount(bill.amount, bill.frequency);
  });

  const chartData = DAY_NAMES.map((name, i) => ({
    day: DAY_SHORT[i],
    fullDay: name,
    amount: Math.round(dayTotals[i] * 100) / 100,
  }));

  const totalSpent = dayTotals.reduce((s, v) => s + v, 0);
  const hasData = totalSpent > 0;

  const label = month
    ? new Date(ctxYear, ctxMonth - 1).toLocaleString("default", { month: "long", year: "numeric" })
    : "All Months";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={compact ? "" : "glass-card p-5"}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">
          Daily Spending by Day of Week {compact ? "" : `— ${label}`}
        </h3>
        {hasData && (
          <span className="text-xs text-muted-foreground">
            Total: <span className="font-mono text-foreground">{fmt(totalSpent)}</span>
          </span>
        )}
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={compact ? 180 : 220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="day" stroke="hsl(215, 12%, 55%)" fontSize={11} />
            <YAxis stroke="hsl(215, 12%, 55%)" fontSize={10} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(v: number) => [fmt(v), "Spent"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDay || ""}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey="amount" fill="hsl(200, 80%, 55%)" radius={[4, 4, 0, 0]} name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-8">
          Add bills to track daily spending by day of week
        </p>
      )}
    </motion.div>
  );
}
