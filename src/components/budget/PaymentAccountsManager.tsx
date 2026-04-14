import { useState } from "react";
import { Plus, Trash2, Check, X, Pencil, CreditCard, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { PaymentAccount, Bill } from "@/types/budget";
import { PAYMENT_ACCOUNT_TYPE_LABELS, getMonthlyAmount } from "@/types/budget";

interface PaymentAccountsManagerProps {
  accounts: PaymentAccount[];
  bills: Bill[];
  onAdd: (account: Omit<PaymentAccount, "id">) => void;
  onUpdate: (id: string, updates: Partial<PaymentAccount>) => void;
  onDelete: (id: string) => void;
}

const emptyAccount = (): Omit<PaymentAccount, "id"> => ({
  name: "",
  nickname: "",
  type: "bank_account",
});

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function PaymentAccountsManager({ accounts, bills, onAdd, onUpdate, onDelete, onAddExpenseGroup }: PaymentAccountsManagerProps) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAccount());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PaymentAccount>>({});
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    onAdd({ ...form, nickname: form.nickname || form.name });
    setForm(emptyAccount());
    setShowForm(false);
  };

  const startEdit = (acc: PaymentAccount) => {
    setEditingId(acc.id);
    setEditForm({ name: acc.name, nickname: acc.nickname, type: acc.type });
  };

  const saveEdit = (id: string) => {
    if (editForm.name) {
      onUpdate(id, { ...editForm, nickname: editForm.nickname || editForm.name });
    }
    setEditingId(null);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="glass-card">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-3 hover:bg-secondary/30 transition-colors rounded-lg">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Payment Accounts</span>
          <span className="text-xs text-muted-foreground">({accounts.length})</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>

      <CollapsibleContent className="px-5 pb-4">
        <div className="flex justify-end mb-3 pt-1">
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "Add Account"}
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
              <Input placeholder="Account name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Nickname" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as PaymentAccount["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {Object.entries(PAYMENT_ACCOUNT_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit"><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Summary by account */}
        {accounts.length > 0 && bills.length > 0 && (
          <div className="mb-3 rounded-lg bg-accent/30 p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Monthly Totals by Account</p>
            {accounts.map((acc) => {
              const accBills = bills.filter((b) => b.paymentAccountId === acc.id);
              const total = accBills.reduce((sum, b) => sum + getMonthlyAmount(b.amount, b.frequency), 0);
              if (accBills.length === 0) return null;
              return (
                <div key={acc.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{acc.nickname || acc.name} <span className="text-xs">({accBills.length})</span></span>
                  <span className="font-mono font-medium">{fmt(total)}</span>
                </div>
              );
            })}
            {(() => {
              const unassigned = bills.filter((b) => !b.paymentAccountId);
              if (unassigned.length === 0) return null;
              const total = unassigned.reduce((sum, b) => sum + getMonthlyAmount(b.amount, b.frequency), 0);
              return (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Unassigned <span className="text-xs">({unassigned.length})</span></span>
                  <span className="font-mono font-medium">{fmt(total)}</span>
                </div>
              );
            })()}
          </div>
        )}

        {accounts.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No accounts added yet.</p>
        ) : (
          <div className="space-y-1.5">
            {accounts.map((acc) => {
              if (editingId === acc.id) {
                return (
                  <div key={acc.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center px-3 py-2.5 rounded-lg bg-accent/50 border border-primary/20">
                    <Input value={editForm.name ?? ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Account name" />
                    <Input value={editForm.nickname ?? ""} onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })} placeholder="Nickname" />
                    <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v as PaymentAccount["type"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {Object.entries(PAYMENT_ACCOUNT_TYPE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(acc.id)}><Check className="h-4 w-4 mr-1" /> Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={acc.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div>
                    <p className="font-medium text-sm">{acc.nickname || acc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {acc.name !== acc.nickname && acc.name + " · "}{PAYMENT_ACCOUNT_TYPE_LABELS[acc.type]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(acc)} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onDelete(acc.id)} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Add Expense Group */}
        {onAddExpenseGroup && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Expense Groups</span>
            </div>
            {showAddGroup ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="New group name..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newGroupName.trim()) {
                      onAddExpenseGroup(newGroupName.trim());
                      setNewGroupName("");
                      setShowAddGroup(false);
                    }
                  }}
                />
                <Button size="sm" onClick={() => {
                  if (newGroupName.trim()) {
                    onAddExpenseGroup(newGroupName.trim());
                    setNewGroupName("");
                    setShowAddGroup(false);
                  }
                }}>
                  <Check className="h-4 w-4 mr-1" /> Add
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAddGroup(false); setNewGroupName(""); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowAddGroup(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Expense Group
              </Button>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
