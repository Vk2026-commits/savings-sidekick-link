import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowUpRight, ArrowDownRight, Check, X, RefreshCw, Loader2 } from "lucide-react";
import { CATEGORY_LABELS, type BillCategory, type TransactionType } from "@/types/budget";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface UnreconciledTxn {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  notes: string | null;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function ReconcileTransactions() {
  const [txns, setTxns] = useState<UnreconciledTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [edits, setEdits] = useState<Record<string, { category?: string; type?: string }>>({});

  const fetchUnreconciled = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("id, date, description, amount, type, category, notes")
      .eq("source" as any, "plaid")
      .eq("is_reconciled" as any, false)
      .order("date", { ascending: false });

    if (!error && data) {
      setTxns(data as UnreconciledTxn[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUnreconciled();
  }, [fetchUnreconciled]);

  const updateEdit = (id: string, field: "category" | "type", value: string) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const reconcileSingle = async (txn: UnreconciledTxn) => {
    const edit = edits[txn.id] || {};
    const { error } = await supabase
      .from("transactions")
      .update({
        category: edit.category || txn.category,
        type: (edit.type || txn.type) as any,
        is_reconciled: true,
      } as any)
      .eq("id", txn.id);

    if (error) {
      toast.error("Failed to reconcile transaction");
    } else {
      setTxns((prev) => prev.filter((t) => t.id !== txn.id));
      toast.success("Transaction reconciled");
    }
  };

  const reconcileAll = async () => {
    setReconciling(true);
    let count = 0;
    for (const txn of txns) {
      const edit = edits[txn.id] || {};
      const { error } = await supabase
        .from("transactions")
        .update({
          category: edit.category || txn.category,
          type: (edit.type || txn.type) as any,
          is_reconciled: true,
        } as any)
        .eq("id", txn.id);
      if (!error) count++;
    }
    toast.success(`Reconciled ${count} transactions`);
    setTxns([]);
    setReconciling(false);
  };

  const dismissTxn = async (id: string) => {
    await supabase.from("transactions").delete().eq("id", id);
    setTxns((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Reconcile Transactions
            {txns.length > 0 && (
              <span className="ml-2 text-xs font-normal bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                {txns.length} pending
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={fetchUnreconciled}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            {txns.length > 0 && (
              <Button size="sm" onClick={reconcileAll} disabled={reconciling}>
                {reconciling ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                Reconcile All ({txns.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {txns.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            All imported transactions have been reconciled! Sync your bank to import new ones.
          </p>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            <AnimatePresence>
              {txns.map((txn) => {
                const edit = edits[txn.id] || {};
                const currentType = (edit.type || txn.type) as TransactionType;
                const currentCategory = (edit.category || txn.category) as BillCategory;

                return (
                  <motion.div
                    key={txn.id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
                  >
                    {/* Icon + details */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        currentType === "income" ? "bg-primary/20" : "bg-destructive/20"
                      }`}>
                        {currentType === "income"
                          ? <ArrowUpRight className="h-4 w-4 text-primary" />
                          : <ArrowDownRight className="h-4 w-4 text-destructive" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{txn.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.date).toLocaleDateString()} · {fmt(txn.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Type selector */}
                    <Select value={currentType} onValueChange={(v) => updateEdit(txn.id, "type", v)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Category selector */}
                    <Select value={currentCategory} onValueChange={(v) => updateEdit(txn.id, "category", v)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => reconcileSingle(txn)} className="text-primary hover:text-primary">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => dismissTxn(txn.id)} className="text-destructive hover:text-destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
