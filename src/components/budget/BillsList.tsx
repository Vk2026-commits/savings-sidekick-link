import { useState } from "react";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Bill, BillCategory, BillFrequency, BillOwner, PaymentAccount } from "@/types/budget";
import { CATEGORY_LABELS, FREQUENCY_LABELS, getMonthlyAmount } from "@/types/budget";

interface BillsListProps {
  bills: Bill[];
  onAdd: (bill: Omit<Bill, "id">) => void;
  onUpdate: (id: string, updates: Partial<Bill>) => void;
  onDelete: (id: string) => void;
  title?: string;
  owner?: BillOwner;
  paymentAccounts?: PaymentAccount[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const emptyBill = (owner: BillOwner = "household") => ({
  name: "",
  amount: 0,
  category: "other" as BillCategory,
  frequency: "monthly" as BillFrequency,
  dueDate: 1,
  isPaid: false,
  autoPay: false,
  owner,
  paymentAccountId: "" as string,
});

export default function BillsList({ bills, onAdd, onUpdate, onDelete, title = "Bills & Expenses", owner = "household", paymentAccounts = [] }: BillsListProps) {
  const filteredBills = bills.filter((b) => (b.owner ?? "household") === owner);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyBill(owner));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bill>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.amount <= 0) return;
    onAdd(form);
    setForm(emptyBill(owner));
    setShowForm(false);
  };

  const startEdit = (bill: Bill) => {
    setEditingId(bill.id);
    setEditForm({ name: bill.name, amount: bill.amount, category: bill.category, frequency: bill.frequency, dueDate: bill.dueDate, autoPay: bill.autoPay, paymentAccountId: bill.paymentAccountId });
  };

  const saveEdit = (id: string) => {
    if (editForm.name && (editForm.amount ?? 0) > 0) {
      onUpdate(id, editForm);
    }
    setEditingId(null);
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showForm ? "Cancel" : "Add Bill"}
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
              placeholder="Bill name"
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
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as BillCategory })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as BillFrequency })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Due day (1-31)"
              min={1}
              max={31}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: parseInt(e.target.value) || 1 })}
            />
            <div className="flex items-center gap-2">
              <Switch checked={form.autoPay} onCheckedChange={(v) => setForm({ ...form, autoPay: v })} />
              <span className="text-sm text-muted-foreground">Auto-pay</span>
            </div>
            {paymentAccounts.length > 0 && (
              <Select value={form.paymentAccountId || "none"} onValueChange={(v) => setForm({ ...form, paymentAccountId: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Account</SelectItem>
                  {paymentAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.nickname || acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button type="submit" className="col-span-2 md:col-span-1">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {filteredBills.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No expenses added yet. Click "Add Bill" to get started.</p>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr,auto,auto,auto,auto,auto] gap-3 text-xs text-muted-foreground font-medium px-3 pb-1">
            <span>Name</span>
            <span className="w-20 text-right">Amount</span>
            <span className="w-20 text-right">Monthly</span>
            <span className="w-16 text-center">Paid</span>
            <span className="w-8" />
            <span className="w-8" />
          </div>
          <AnimatePresence>
            {filteredBills.map((bill) => {
              const isEditing = editingId === bill.id;

              if (isEditing) {
                return (
                  <motion.div
                    key={bill.id}
                    layout
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center px-3 py-3 rounded-lg bg-accent/50 border border-primary/20"
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
                    <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v as BillCategory })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={editForm.frequency} onValueChange={(v) => setEditForm({ ...editForm, frequency: v as BillFrequency })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Due day"
                      min={1}
                      max={31}
                      value={editForm.dueDate ?? 1}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: parseInt(e.target.value) || 1 })}
                    />
                    <div className="flex items-center gap-2">
                      <Switch checked={editForm.autoPay ?? false} onCheckedChange={(v) => setEditForm({ ...editForm, autoPay: v })} />
                      <span className="text-sm text-muted-foreground">Auto-pay</span>
                    </div>
                    {paymentAccounts.length > 0 && (
                      <Select value={editForm.paymentAccountId || "none"} onValueChange={(v) => setEditForm({ ...editForm, paymentAccountId: v === "none" ? "" : v })}>
                        <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Account</SelectItem>
                          {paymentAccounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.nickname || acc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <div className="flex gap-2 col-span-2 md:col-span-1">
                      <Button size="sm" onClick={() => saveEdit(bill.id)}>
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={bill.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="grid grid-cols-[1fr,auto,auto,auto,auto,auto] gap-3 items-center px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{bill.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[bill.category]} · Due {bill.dueDate}th · {FREQUENCY_LABELS[bill.frequency]}
                      {bill.autoPay && " · Auto"}
                      {bill.paymentAccountId && paymentAccounts.length > 0 && (() => {
                        const acc = paymentAccounts.find(a => a.id === bill.paymentAccountId);
                        return acc ? ` · ${acc.nickname || acc.name}` : "";
                      })()}
                    </p>
                  </div>
                  <span className="w-20 text-right font-mono text-sm">{fmt(bill.amount)}</span>
                  <span className="w-20 text-right font-mono text-sm text-muted-foreground">
                    {fmt(getMonthlyAmount(bill.amount, bill.frequency))}
                  </span>
                  <div className="w-16 flex justify-center">
                    <button
                      onClick={() => onUpdate(bill.id, { isPaid: !bill.isPaid })}
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        bill.isPaid
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/30 hover:border-primary/50"
                      }`}
                    >
                      {bill.isPaid && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                    </button>
                  </div>
                  <button onClick={() => startEdit(bill)} className="w-8 text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(bill.id)} className="w-8 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
