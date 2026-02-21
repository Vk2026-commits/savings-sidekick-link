import { useState } from "react";
import { Plus, Trash2, X, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Transaction, BillCategory, TransactionType } from "@/types/budget";
import { CATEGORY_LABELS } from "@/types/budget";

interface TransactionLogProps {
  transactions: Transaction[];
  onAdd: (txn: Omit<Transaction, "id">) => void;
  onDelete: (id: string) => void;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const emptyTxn = {
  date: new Date().toISOString().split("T")[0],
  description: "",
  amount: 0,
  type: "expense" as TransactionType,
  category: "other" as BillCategory,
  notes: "",
};

export default function TransactionLog({ transactions, onAdd, onDelete }: TransactionLogProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyTxn);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0) return;
    onAdd(form);
    setForm(emptyTxn);
    setShowForm(false);
  };

  const sorted = [...transactions]
    .filter((t) => filter === "all" || t.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showForm ? "Cancel" : "Add Transaction"}
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-secondary/50 text-center">
          <p className="text-xs text-muted-foreground mb-1">Income</p>
          <p className="font-mono text-sm font-semibold text-primary">{fmt(totalIncome)}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 text-center">
          <p className="text-xs text-muted-foreground mb-1">Expenses</p>
          <p className="font-mono text-sm font-semibold text-destructive">{fmt(totalExpenses)}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 text-center">
          <p className="text-xs text-muted-foreground mb-1">Net</p>
          <p className={`font-mono text-sm font-semibold ${totalIncome - totalExpenses >= 0 ? "text-primary" : "text-destructive"}`}>
            {fmt(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 overflow-hidden"
          >
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Amount"
              min={0}
              step={0.01}
              value={form.amount || ""}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            />
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TransactionType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as BillCategory })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No transactions logged yet.</p>
      ) : (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          {sorted.map((txn) => (
            <motion.div
              key={txn.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center ${
                  txn.type === "income" ? "bg-primary/20" : "bg-destructive/20"
                }`}>
                  {txn.type === "income"
                    ? <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                    : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
                  }
                </div>
                <div>
                  <p className="font-medium text-sm">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(txn.date).toLocaleDateString()} · {CATEGORY_LABELS[txn.category]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono text-sm font-medium ${txn.type === "income" ? "text-primary" : "text-destructive"}`}>
                  {txn.type === "income" ? "+" : "-"}{fmt(txn.amount)}
                </span>
                <button onClick={() => onDelete(txn.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
