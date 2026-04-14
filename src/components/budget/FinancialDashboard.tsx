import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import type { Transaction, Bill } from "@/types/budget";
import { CATEGORY_LABELS, getMonthlyAmount } from "@/types/budget";

interface FinancialDashboardProps {
  transactions: Transaction[];
  bills: Bill[];
  income: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const COLORS = [
  "hsl(152,60%,48%)", "hsl(200,80%,55%)", "hsl(38,92%,55%)",
  "hsl(280,60%,55%)", "hsl(0,72%,55%)", "hsl(180,50%,50%)",
  "hsl(320,60%,55%)", "hsl(60,70%,50%)",
];

const tooltipStyle = {
  background: "hsl(220, 18%, 12%)",
  border: "1px solid hsl(220, 14%, 22%)",
  borderRadius: "8px",
  color: "hsl(210, 20%, 92%)",
  fontSize: "13px",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function FinancialDashboard({ transactions, bills, income }: FinancialDashboardProps) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const goBack = () => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
  };
  const goForward = () => {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0; }
      return m + 1;
    });
  };

  const monthlyTxns = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  });

  const spendingByCategory = monthlyTxns
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Also include bills for the viewed month
  const viewMonthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  bills
    .filter((b) => {
      const billMonth = b.month || viewMonthStr;
      return billMonth === viewMonthStr;
    })
    .forEach((b) => {
      const cat = b.category || "other";
      spendingByCategory[cat] = (spendingByCategory[cat] || 0) + getMonthlyAmount(b.amount, b.frequency);
    });

  const categoryData = Object.entries(spendingByCategory)
    .map(([cat, amount]) => ({
      name: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat,
      value: Math.round(amount * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value);

  // Last 6 months trend ending at viewed month
  const monthlyTrend: { month: string; income: number; expenses: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(viewYear, viewMonth - i, 1);
    const mStr = m.toLocaleString("default", { month: "short" });
    const mTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    });
    monthlyTrend.push({
      month: mStr,
      income: mTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expenses: mTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    });
  }

  const totalBillsMonthly = bills.reduce((s, b) => s + getMonthlyAmount(b.amount, b.frequency), 0);
  const totalActualExpenses = monthlyTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalActualIncome = monthlyTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Financial Reports</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-sm min-w-[140px] text-center">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <Button variant="ghost" size="icon" onClick={goForward} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Budgeted Income</p>
            <p className="font-mono font-semibold text-primary">{fmt(income)}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Actual Income</p>
            <p className="font-mono font-semibold text-primary">{fmt(totalActualIncome)}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Planned Bills</p>
            <p className="font-mono font-semibold text-chart-bills">{fmt(totalBillsMonthly)}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Actual Spending</p>
            <p className="font-mono font-semibold text-destructive">{fmt(totalActualExpenses)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="font-semibold mb-4">Income vs Expenses (6 months)</h3>
          {monthlyTrend.some((m) => m.income > 0 || m.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(215, 12%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 12%, 55%)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={tooltipStyle} />
                <Bar dataKey="income" fill="hsl(152, 60%, 48%)" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">Add transactions to see trends</p>
          )}
        </motion.div>

        {/* Spending by Category */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="font-semibold mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {categoryData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground text-xs">{item.name}</span>
                    </div>
                    <span className="font-mono text-xs">{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">Add expense transactions to see breakdown</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
