import { useState } from "react";
import { Plus, Trash2, Check, X, Pencil, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PaymentAccount } from "@/types/budget";
import { PAYMENT_ACCOUNT_TYPE_LABELS } from "@/types/budget";

interface PaymentAccountsManagerProps {
  accounts: PaymentAccount[];
  onAdd: (account: Omit<PaymentAccount, "id">) => void;
  onUpdate: (id: string, updates: Partial<PaymentAccount>) => void;
  onDelete: (id: string) => void;
}

const emptyAccount = (): Omit<PaymentAccount, "id"> => ({
  name: "",
  nickname: "",
  type: "bank_account",
});

export default function PaymentAccountsManager({ accounts, onAdd, onUpdate, onDelete }: PaymentAccountsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAccount());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PaymentAccount>>({});

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
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Payment Accounts</h2>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
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
            <Input
              placeholder="Account name (e.g. Chase Sapphire)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Nickname (e.g. Chase CC)"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            />
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as PaymentAccount["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_ACCOUNT_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {accounts.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-6">No accounts added. Click "Add Account" to get started.</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {accounts.map((acc) => {
              if (editingId === acc.id) {
                return (
                  <motion.div key={acc.id} layout className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center px-3 py-3 rounded-lg bg-accent/50 border border-primary/20">
                    <Input value={editForm.name ?? ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Account name" />
                    <Input value={editForm.nickname ?? ""} onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })} placeholder="Nickname" />
                    <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v as PaymentAccount["type"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_ACCOUNT_TYPE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(acc.id)}><Check className="h-4 w-4 mr-1" /> Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={acc.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{acc.nickname || acc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {acc.name !== acc.nickname && acc.name + " · "}{PAYMENT_ACCOUNT_TYPE_LABELS[acc.type]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(acc)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(acc.id)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
