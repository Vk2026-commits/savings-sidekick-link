import { useState } from "react";
import { useEstateAccounts } from "@/hooks/useEstate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ACCOUNT_TYPES = [
  { value: "bank", label: "Bank Account" },
  { value: "retirement", label: "Retirement (401k/IRA)" },
  { value: "brokerage", label: "Brokerage" },
  { value: "credit_card", label: "Credit Card" },
  { value: "loan", label: "Loan" },
  { value: "safe_deposit", label: "Safe Deposit Box" },
  { value: "other", label: "Other" },
];

export default function EstateAccountsTab({ disableAdd = false }: { disableAdd?: boolean } = {}) {
  const { data, loading, add, update, remove } = useEstateAccounts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", institution: "", account_type: "bank", account_number_last4: "", estimated_value: "0", notes: "" });

  const resetForm = () => setForm({ title: "", institution: "", account_type: "bank", account_number_last4: "", estimated_value: "0", notes: "" });

  const handleSave = async () => {
    if (!form.title.trim() && !form.institution.trim()) return;
    const payload = { ...form, estimated_value: parseFloat(form.estimated_value) || 0 };
    if (editing) { await update(editing.id, payload); } else { await add(payload); }
    setOpen(false); setEditing(null); resetForm();
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ title: item.title, institution: item.institution, account_type: item.account_type, account_number_last4: item.account_number_last4 || "", estimated_value: String(item.estimated_value || 0), notes: item.notes || "" });
    setOpen(true);
  };

  const typeLabel = (v: string) => ACCOUNT_TYPES.find(t => t.value === v)?.label || v;
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Why this matters:</strong> A complete inventory of your financial accounts ensures nothing is overlooked and your executor can efficiently settle your estate.
        </p>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Landmark className="h-5 w-5" /> Accounts</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); } }}>
          {!disableAdd && <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Account</Button></DialogTrigger> }
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Account</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Account Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="Institution" value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} />
              <Select value={form.account_type} onValueChange={v => setForm({ ...form, account_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ACCOUNT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Last 4 digits" maxLength={4} value={form.account_number_last4} onChange={e => setForm({ ...form, account_number_last4: e.target.value })} />
              <Input placeholder="Estimated Value" type="number" value={form.estimated_value} onChange={e => setForm({ ...form, estimated_value: e.target.value })} />
              <Textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <Button className="w-full" onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No accounts added yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((a: any) => (
            <Card key={a.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{a.title || a.institution}</CardTitle>
                    <CardDescription>{a.institution}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <Badge variant="secondary">{typeLabel(a.account_type)}</Badge>
                  {a.account_number_last4 && <Badge variant="outline">···{a.account_number_last4}</Badge>}
                </div>
                <p className="font-mono font-medium">{fmt(a.estimated_value || 0)}</p>
                {a.notes && <p className="text-xs text-muted-foreground">{a.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
