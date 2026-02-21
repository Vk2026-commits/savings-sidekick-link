import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { Bill } from "@/types/budget";
import { getMonthlyAmount } from "@/types/budget";

interface CashFlowForecastProps {
  income: number;
  bills: Bill[];
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

export default function CashFlowForecast({ income, bills }: CashFlowForecastProps) {
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Calculate total monthly bills using the same normalization as BudgetOverview
  const totalMonthlyBills = bills.reduce((s, b) => s + getMonthlyAmount(b.amount, b.frequency), 0);

  // Build daily cash flow: spread bills across the month based on frequency
  // so the chart matches the normalized monthly totals
  const dailyExpenses: { day: number; amount: number; labels: string[] }[] = Array.from(
    { length: daysInMonth },
    (_, i) => ({ day: i + 1, amount: 0, labels: [] })
  );

  bills.forEach((b) => {
    const billDay = Math.min(b.dueDate, daysInMonth);
    if (b.frequency === "weekly") {
      // Place on every 7 days starting from dueDate, use per-occurrence amount
      for (let d = billDay; d <= daysInMonth; d += 7) {
        dailyExpenses[d - 1].amount += b.amount;
        dailyExpenses[d - 1].labels.push(b.name);
      }
    } else if (b.frequency === "biweekly") {
      // Place on every 14 days starting from dueDate
      for (let d = billDay; d <= daysInMonth; d += 14) {
        dailyExpenses[d - 1].amount += b.amount;
        dailyExpenses[d - 1].labels.push(b.name);
      }
    } else if (b.frequency === "yearly") {
      // Spread yearly as monthly / 1 occurrence
      const monthlyPortion = b.amount / 12;
      dailyExpenses[billDay - 1].amount += monthlyPortion;
      dailyExpenses[billDay - 1].labels.push(b.name);
    } else {
      // monthly or one_time: full amount on due date
      dailyExpenses[billDay - 1].amount += b.amount;
      dailyExpenses[billDay - 1].labels.push(b.name);
    }
  });

  const dailyData: { day: number; balance: number; label: string }[] = [];
  let runningBalance = income;

  for (let day = 1; day <= daysInMonth; day++) {
    runningBalance -= dailyExpenses[day - 1].amount;
    dailyData.push({
      day,
      balance: Math.round(runningBalance * 100) / 100,
      label: dailyExpenses[day - 1].labels.join(", "),
    });
  }
  const monthlyNet = income - totalMonthlyBills;
  const forecast: { month: string; projected: number }[] = [];
  let projBalance = runningBalance;
  for (let i = 1; i <= 6; i++) {
    const m = new Date(now.getFullYear(), now.getMonth() + i, 1);
    projBalance += monthlyNet;
    forecast.push({
      month: m.toLocaleString("default", { month: "short", year: "2-digit" }),
      projected: Math.round(projBalance * 100) / 100,
    });
  }

  const monthName = now.toLocaleString("default", { month: "long" });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
        <h2 className="text-lg font-semibold mb-4">Cash Flow — {monthName}</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Starting Balance</p>
            <p className="font-mono font-semibold text-primary">{fmt(income)}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Total Outgoing</p>
            <p className="font-mono font-semibold text-destructive">{fmt(totalMonthlyBills)}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">End of Month</p>
            <p className={`font-mono font-semibold ${runningBalance >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(runningBalance)}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="day" stroke="hsl(215, 12%, 55%)" fontSize={11} />
            <YAxis stroke="hsl(215, 12%, 55%)" fontSize={11} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(v: number) => fmt(v)}
              labelFormatter={(day) => `Day ${day}`}
              contentStyle={tooltipStyle}
            />
            <ReferenceLine x={currentDay} stroke="hsl(152, 60%, 48%)" strokeDasharray="5 5" label={{ value: "Today", fill: "hsl(152, 60%, 48%)", fontSize: 11 }} />
            <ReferenceLine y={0} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="balance" stroke="hsl(200, 80%, 55%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 6-Month Projection */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
        <h2 className="text-lg font-semibold mb-4">6-Month Projection</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Based on {fmt(income)}/mo income and {fmt(totalMonthlyBills)}/mo expenses (net {fmt(monthlyNet)}/mo)
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="month" stroke="hsl(215, 12%, 55%)" fontSize={12} />
            <YAxis stroke="hsl(215, 12%, 55%)" fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={tooltipStyle} />
            <ReferenceLine y={0} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="projected" stroke="hsl(152, 60%, 48%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(152, 60%, 48%)" }} name="Projected Balance" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
