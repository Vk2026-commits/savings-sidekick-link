import { DollarSign, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryCardsProps {
  ytdIncome: number;
  ytdBills: number;
  ytdRemaining: number;
  totalSaved: number;
}

const cards = [
  { key: "income", label: "YTD Income", icon: DollarSign, colorClass: "text-primary" },
  { key: "bills", label: "YTD Bills", icon: TrendingDown, colorClass: "text-destructive" },
  { key: "remaining", label: "YTD Remaining", icon: TrendingUp, colorClass: "text-chart-savings" },
  { key: "saved", label: "Total Saved", icon: PiggyBank, colorClass: "text-chart-bills" },
] as const;

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function SummaryCards({ ytdIncome, ytdBills, ytdRemaining, totalSaved }: SummaryCardsProps) {
  const values: Record<string, number> = { income: ytdIncome, bills: ytdBills, remaining: ytdRemaining, saved: totalSaved };

  return (
    <div className="budget-grid">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.35 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
            <card.icon className={`h-5 w-5 ${card.colorClass}`} />
          </div>
          <p className={`stat-value ${card.colorClass}`}>{fmt(values[card.key])}</p>
        </motion.div>
      ))}
    </div>
  );
}
