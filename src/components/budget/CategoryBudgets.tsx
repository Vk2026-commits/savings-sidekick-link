import { useState } from "react";
import { Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import type { CategoryBudget, BillCategory, Transaction } from "@/types/budget";
import { CATEGORY_LABELS } from "@/types/budget";

interface CategoryBudgetsProps {
  budgets: CategoryBudget[];
  transactions: Transaction[];
  onAdd: (budget: Omit<CategoryBudget, "id">) => void;
  onUpdate: (id: string, updates: Partial<CategoryBudget>) => void;
  onDelete: (id: string) => void;
  maxItems?: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function CategoryBudgets({ budgets, transactions, onAdd, onUpdate, onDelete, maxItems }: CategoryBudgetsProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "food" as BillCategory, limit: 0 });

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlySpending = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.limit <= 0) return;
    if (budgets.some((b) => b.category === form.category)) return;
    onAdd(form);
    setForm({ category: "food", limit: 0 });
    setShowForm(false);
  };

  const usedCategories = new Set(budgets.map((b) => b.category));
  const availableCategories = Object.keys(CATEGORY_LABELS).filter((k) => !usedCategories.has(k as BillCategory));

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Category Budgets</h2>
        {availableCategories.length > 0 && (!maxItems || budgets.length < maxItems) && (
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "Set Limit"}
          </Button>
        )}
        {maxItems && budgets.length >= maxItems && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Free limit: {maxItems} budgets · Upgrade to Pro for unlimited</span>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 overflow-hidden"
          >
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as BillCategory })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableCategories.map((k) => (
                  <SelectItem key={k} value={k}>{CATEGORY_LABELS[k as BillCategory]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Monthly limit"
              min={0}
              step={0.01}
              value={form.limit || ""}
              onChange={(e) => setForm({ ...form, limit: parseFloat(e.target.value) || 0 })}
            />
            <Button type="submit"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </motion.form>
        )}
      </AnimatePresence>

      {budgets.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          Set spending limits per category to track your budget. Add transactions to see progress.
        </p>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const spent = monthlySpending[budget.category] || 0;
            const pct = Math.min((spent / budget.limit) * 100, 100);
            const isOver = spent > budget.limit;
            const isWarning = pct >= 80 && !isOver;

            return (
              <motion.div
                key={budget.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{CATEGORY_LABELS[budget.category]}</span>
                    {(isOver || isWarning) && (
                      <AlertTriangle className={`h-4 w-4 ${isOver ? "text-destructive" : "text-warning"}`} />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">
                      <span className={isOver ? "text-destructive" : ""}>{fmt(spent)}</span>
                      <span className="text-muted-foreground"> / {fmt(budget.limit)}</span>
                    </span>
                    <button onClick={() => onDelete(budget.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <Progress
                  value={pct}
                  className={`h-2 ${isOver ? "[&>div]:bg-destructive" : isWarning ? "[&>div]:bg-warning" : ""}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isOver
                    ? `Over budget by ${fmt(spent - budget.limit)}`
                    : `${fmt(budget.limit - spent)} remaining`}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
