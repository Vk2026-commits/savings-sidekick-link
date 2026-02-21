import { useState } from "react";
import { Plus, Trash2, X, DollarSign, Briefcase, Building2, Gift, TrendingUp, Package, Pencil, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type IncomeSource = {
  id: string;
  name: string;
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly" | "yearly";
  type: "salary" | "freelance" | "business" | "investment" | "gift" | "other";
};

const INCOME_TYPE_LABELS: Record<IncomeSource["type"], string> = {
  salary: "Salary / Wages",
  freelance: "Freelance / Contract",
  business: "Business Income",
  investment: "Investment / Dividends",
  gift: "Gift / Other Income",
  other: "Other",
};

const FREQ_LABELS: Record<IncomeSource["frequency"], string> = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const typeIcons: Record<IncomeSource["type"], typeof DollarSign> = {
  salary: Briefcase,
  freelance: DollarSign,
  business: Building2,
  investment: TrendingUp,
  gift: Gift,
  other: Package,
};

function getMonthly(amount: number, freq: IncomeSource["frequency"]): number {
  switch (freq) {
    case "weekly": return amount * 4.33;
    case "biweekly": return amount * 2.17;
    case "monthly": return amount;
    case "yearly": return amount / 12;
  }
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

interface IncomeManagerProps {
  sources: IncomeSource[];
  onAdd: (source: Omit<IncomeSource, "id">) => void;
  onUpdate: (id: string, updates: Partial<IncomeSource>) => void;
  onDelete: (id: string) => void;
  totalMonthlyIncome: number;
}

const emptyForm = {
  name: "",
  amount: 0,
  frequency: "monthly" as IncomeSource["frequency"],
  type: "salary" as IncomeSource["type"],
};

export default function IncomeManager({ sources, onAdd, onUpdate, onDelete, totalMonthlyIncome }: IncomeManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<IncomeSource>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.amount <= 0) return;
    onAdd(form);
    setForm(emptyForm);
    setShowForm(false);
  };

  const startEdit = (source: IncomeSource) => {
    setEditingId(source.id);
    setEditForm({ name: source.name, amount: source.amount, frequency: source.frequency, type: source.type });
  };

  const saveEdit = (id: string) => {
    if (editForm.name && (editForm.amount ?? 0) > 0) {
      onUpdate(id, editForm);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Income Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Monthly Income</p>
            <p className="font-mono text-xl font-bold text-primary">{fmt(totalMonthlyIncome)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Weekly Income</p>
            <p className="font-mono text-xl font-bold text-primary">{fmt(totalMonthlyIncome / 4.33)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Annual Income</p>
            <p className="font-mono text-xl font-bold text-primary">{fmt(totalMonthlyIncome * 12)}</p>
          </div>
        </div>
      </div>

      {/* Income Sources */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Income Sources</h2>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "Add Income"}
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 overflow-hidden"
            >
              <Input
                placeholder="Income name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="col-span-2 md:col-span-1"
              />
              <Input
                type="number"
                placeholder="Amount"
                min={0}
                step={0.01}
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              />
              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as IncomeSource["frequency"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FREQ_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as IncomeSource["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(INCOME_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="col-span-2 md:col-span-1">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {sources.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No income sources added yet. Click "Add Income" to get started.</p>
        ) : (
          <div className="space-y-2">
            {sources.map((source) => {
              const Icon = typeIcons[source.type] || DollarSign;
              const isEditing = editingId === source.id;

              if (isEditing) {
                return (
                  <motion.div
                    key={source.id}
                    layout
                    className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center px-3 py-3 rounded-lg bg-accent/50 border border-primary/20"
                  >
                    <Input
                      value={editForm.name ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="col-span-2 md:col-span-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={editForm.amount ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                    />
                    <Select value={editForm.frequency} onValueChange={(v) => setEditForm({ ...editForm, frequency: v as IncomeSource["frequency"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(FREQ_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v as IncomeSource["type"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(INCOME_TYPE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(source.id)}>
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              }

              const monthly = getMonthly(source.amount, source.frequency);
              return (
                <motion.div
                  key={source.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between px-3 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {INCOME_TYPE_LABELS[source.type]} · {FREQ_LABELS[source.frequency]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium text-primary">{fmt(source.amount)}</p>
                      <p className="font-mono text-xs text-muted-foreground">{fmt(monthly)}/mo</p>
                    </div>
                    <button onClick={() => startEdit(source)} className="text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(source.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
