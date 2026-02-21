import { motion } from "framer-motion";
import type { Liability } from "@/types/budget";
import { LIABILITY_TYPE_LABELS } from "@/types/budget";

interface DebtPayoffPlannerProps {
  liabilities: Liability[];
  monthlyIncome: number;
  totalMonthlyBills: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function calculatePayoffMonths(balance: number, rate: number, payment: number): number {
  if (payment <= 0 || balance <= 0) return 0;
  if (rate === 0) return Math.ceil(balance / payment);
  const monthlyRate = rate / 100 / 12;
  const interest = balance * monthlyRate;
  if (payment <= interest) return Infinity;
  return Math.ceil(Math.log(payment / (payment - balance * monthlyRate)) / Math.log(1 + monthlyRate));
}

function calculateTotalInterest(balance: number, rate: number, payment: number): number {
  if (payment <= 0 || balance <= 0 || rate === 0) return 0;
  const monthlyRate = rate / 100 / 12;
  let remaining = balance;
  let totalInterest = 0;
  let months = 0;
  while (remaining > 0 && months < 600) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    remaining = remaining + interest - payment;
    months++;
  }
  return totalInterest;
}

export default function DebtPayoffPlanner({ liabilities, monthlyIncome, totalMonthlyBills }: DebtPayoffPlannerProps) {
  if (liabilities.length === 0) {
    return (
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold mb-4">Debt Payoff Planner</h2>
        <p className="text-muted-foreground text-sm text-center py-8">No debts added. Add liabilities in the Net Worth tab to use the payoff planner.</p>
      </div>
    );
  }

  const totalBalance = liabilities.reduce((s, l) => s + l.balance, 0);
  const totalMinPayments = liabilities.reduce((s, l) => s + l.minimumPayment, 0);
  const availableForDebt = Math.max(0, monthlyIncome - totalMonthlyBills);

  // Snowball: sorted by balance (smallest first)
  const snowball = [...liabilities].sort((a, b) => a.balance - b.balance);
  // Avalanche: sorted by interest rate (highest first)
  const avalanche = [...liabilities].sort((a, b) => b.interestRate - a.interestRate);

  const strategies = [
    { name: "Avalanche", description: "Pay highest interest first (saves the most money)", order: avalanche },
    { name: "Snowball", description: "Pay smallest balance first (quick wins for motivation)", order: snowball },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold mb-4">Debt Payoff Planner</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Total Debt</p>
            <p className="font-mono font-semibold text-destructive">{fmt(totalBalance)}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Min. Payments</p>
            <p className="font-mono font-semibold">{fmt(totalMinPayments)}/mo</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Available for Debt</p>
            <p className="font-mono font-semibold text-primary">{fmt(availableForDebt)}/mo</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1"># of Debts</p>
            <p className="font-mono font-semibold">{liabilities.length}</p>
          </div>
        </div>
      </div>

      {/* Strategies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {strategies.map((strategy) => (
          <motion.div
            key={strategy.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold mb-1">{strategy.name} Method</h3>
            <p className="text-xs text-muted-foreground mb-4">{strategy.description}</p>
            <div className="space-y-3">
              {strategy.order.map((debt, i) => {
                const months = calculatePayoffMonths(debt.balance, debt.interestRate, debt.minimumPayment);
                const totalInterest = calculateTotalInterest(debt.balance, debt.interestRate, debt.minimumPayment);
                return (
                  <div key={debt.id} className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <span className="font-medium text-sm">{debt.name}</span>
                      </div>
                      <span className="font-mono text-sm text-destructive">{fmt(debt.balance)}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{debt.interestRate}% APR</span>
                      <span>
                        {months === Infinity ? "Never (payment too low)" : `${months} months to payoff`}
                      </span>
                      <span>Interest: {fmt(totalInterest)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
