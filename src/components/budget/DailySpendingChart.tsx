import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Bill, IncomeSource } from "@/types/budget";
import { getMonthlyAmount } from "@/types/budget";

interface DailySpendingChartProps {
  bills: Bill[];
  incomeSources?: IncomeSource[];
  monthlyIncome?: number;
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

export default function DailySpendingChart({ bills, incomeSources = [], monthlyIncome = 0, month, compact = false }: DailySpendingChartProps) {
  const filtered = month ? bills.filter((b) => b.month === month) : bills;

  const now = new Date();
  const [ctxYear, ctxMonth] = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const daysInMonth = new Date(ctxYear, ctxMonth, 0).getDate();

  // Count how many of each weekday exist in the month
  const weekdayCounts = new Array(7).fill(0);
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(ctxYear, ctxMonth - 1, d).getDay();
    weekdayCounts[dow]++;
  }

  // Group bill amounts by day of week
  const spendTotals = new Array(7).fill(0);
  filtered.forEach((bill) => {
    const dueDay = Math.min(bill.dueDate, daysInMonth);
    const date = new Date(ctxYear, ctxMonth - 1, dueDay);
    const dow = date.getDay();
    spendTotals[dow] += getMonthlyAmount(bill.amount, bill.frequency);
  });

  // Spread monthly income evenly across weekdays proportional to how many of each day exist
  const dailyIncome = monthlyIncome / daysInMonth;
  const incomeTotals = weekdayCounts.map((count) => dailyIncome * count);

  const chartData = DAY_NAMES.map((name, i) => ({
    day: DAY_SHORT[i],
    fullDay: name,
    income: Math.round(incomeTotals[i] * 100) / 100,
    spent: Math.round(spendTotals[i] * 100) / 100,
  }));

  const totalSpent = spendTotals.reduce((s, v) => s + v, 0);
  const hasData = totalSpent > 0 || monthlyIncome > 0;

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
          Income vs Spending by Day {compact ? "" : `— ${label}`}
        </h3>
        {hasData && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(200, 80%, 55%)" }} />
              Income: <span className="font-mono text-foreground">{fmt(monthlyIncome)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(0, 72%, 55%)" }} />
              Spent: <span className="font-mono text-foreground">{fmt(totalSpent)}</span>
            </span>
          </div>
        )}
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={compact ? 200 : 260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="day" stroke="hsl(215, 12%, 55%)" fontSize={11} />
            <YAxis stroke="hsl(215, 12%, 55%)" fontSize={10} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(v: number, name: string) => [fmt(v), name === "income" ? "Daily Income" : "Daily Spent"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDay || ""}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey="income" fill="hsl(200, 80%, 55%)" radius={[4, 4, 0, 0]} name="Income" />
            <Bar dataKey="spent" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-8">
          Add bills and income to see daily comparison
        </p>
      )}
    </motion.div>
  );
}
