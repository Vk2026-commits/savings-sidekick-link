import { useState } from "react";
import { Plus, Trash2, X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { SavingsGoal } from "@/types/budget";

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAdd: (goal: Omit<SavingsGoal, "id">) => void;
  onUpdate: (id: string, updates: Partial<SavingsGoal>) => void;
  onDelete: (id: string) => void;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const COLORS = ["hsl(152,60%,48%)", "hsl(200,80%,55%)", "hsl(38,92%,55%)", "hsl(280,60%,55%)", "hsl(0,72%,55%)"];

export default function SavingsGoals({ goals, onAdd, onUpdate, onDelete }: SavingsGoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", targetAmount: 0, currentAmount: 0 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.targetAmount <= 0) return;
    onAdd({ ...form, color: COLORS[goals.length % COLORS.length] });
    setForm({ name: "", targetAmount: 0, currentAmount: 0 });
    setShowForm(false);
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Savings Goals</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showForm ? "Cancel" : "Add Goal"}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 overflow-hidden"
          >
            <Input placeholder="Goal name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input type="number" placeholder="Target amount" min={0} step={0.01} value={form.targetAmount || ""} onChange={(e) => setForm({ ...form, targetAmount: parseFloat(e.target.value) || 0 })} />
            <Input type="number" placeholder="Saved so far" min={0} step={0.01} value={form.currentAmount || ""} onChange={(e) => setForm({ ...form, currentAmount: parseFloat(e.target.value) || 0 })} />
            <Button type="submit"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </motion.form>
        )}
      </AnimatePresence>

      {goals.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No savings goals yet. Start planning for the future!</p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: goal.color }} />
                    <span className="font-medium text-sm">{goal.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">
                      {fmt(goal.currentAmount)} <span className="text-muted-foreground">/ {fmt(goal.targetAmount)}</span>
                    </span>
                    <button onClick={() => onDelete(goal.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <Progress value={pct} className="h-2" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{pct.toFixed(0)}% complete</span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      placeholder="Add funds"
                      min={0}
                      step={0.01}
                      className="h-7 w-24 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = parseFloat((e.target as HTMLInputElement).value);
                          if (val > 0) {
                            onUpdate(goal.id, { currentAmount: goal.currentAmount + val });
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
