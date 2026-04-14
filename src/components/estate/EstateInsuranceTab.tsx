import { useState } from "react";
import { useEstateInsurance } from "@/hooks/useEstate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const POLICY_TYPES = [
  { value: "life", label: "Life" }, { value: "ltc", label: "Long-Term Care" },
  { value: "health", label: "Health" }, { value: "home", label: "Home" },
  { value: "auto", label: "Auto" }, { value: "disability", label: "Disability" },
  { value: "umbrella", label: "Umbrella" }, { value: "other", label: "Other" },
];

export default function EstateInsuranceTab({ disableAdd = false }: { disableAdd?: boolean } = {}) {
  const { data, loading, add, update, remove } = useEstateInsurance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ provider: "", policy_number: "", policy_type: "life", coverage_amount: "0", premium: "0", premium_frequency: "monthly", agent_name: "", agent_phone: "", notes: "" });

  const resetForm = () => setForm({ provider: "", policy_number: "", policy_type: "life", coverage_amount: "0", premium: "0", premium_frequency: "monthly", agent_name: "", agent_phone: "", notes: "" });
  const handleSave = async () => {
    if (!form.provider.trim()) return;
    const payload = { ...form, coverage_amount: parseFloat(form.coverage_amount) || 0, premium: parseFloat(form.premium) || 0 };
    if (editing) { await update(editing.id, payload); } else { await add(payload); }
    setOpen(false); setEditing(null); resetForm();
  };
  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ provider: item.provider, policy_number: item.policy_number || "", policy_type: item.policy_type, coverage_amount: String(item.coverage_amount || 0), premium: String(item.premium || 0), premium_frequency: item.premium_frequency || "monthly", agent_name: item.agent_name || "", agent_phone: item.agent_phone || "", notes: item.notes || "" });
    setOpen(true);
  };
  const typeLabel = (v: string) => POLICY_TYPES.find(t => t.value === v)?.label || v;
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Why this matters:</strong> Insurance policies are often the most time-sensitive asset after a death. Knowing all your policies prevents lapsed claims and ensures beneficiaries receive their payouts.
        </p>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Shield className="h-5 w-5" /> Insurance Policies</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); } }}>
          {!disableAdd && <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Policy</Button></DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Policy</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Provider *" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} />
              <Input placeholder="Policy Number" value={form.policy_number} onChange={e => setForm({ ...form, policy_number: e.target.value })} />
              <Select value={form.policy_type} onValueChange={v => setForm({ ...form, policy_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{POLICY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Coverage Amount" type="number" value={form.coverage_amount} onChange={e => setForm({ ...form, coverage_amount: e.target.value })} />
              <Input placeholder="Premium" type="number" value={form.premium} onChange={e => setForm({ ...form, premium: e.target.value })} />
              <Select value={form.premium_frequency} onValueChange={v => setForm({ ...form, premium_frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Agent Name" value={form.agent_name} onChange={e => setForm({ ...form, agent_name: e.target.value })} />
              <Input placeholder="Agent Phone" value={form.agent_phone} onChange={e => setForm({ ...form, agent_phone: e.target.value })} />
              <Textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <Button className="w-full" onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <div className="text-center text-muted-foreground py-8">Loading...</div> : data.length === 0 ? <div className="text-center text-muted-foreground py-8">No policies added yet.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((p: any) => (
            <Card key={p.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div><CardTitle className="text-base">{p.provider}</CardTitle><CardDescription>{p.policy_number}</CardDescription></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <Badge variant="secondary">{typeLabel(p.policy_type)}</Badge>
                <p>Coverage: <span className="font-mono">{fmt(p.coverage_amount)}</span></p>
                <p>Premium: <span className="font-mono">{fmt(p.premium)}</span>/{p.premium_frequency}</p>
                {p.agent_name && <p className="text-muted-foreground">Agent: {p.agent_name} {p.agent_phone}</p>}
                {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
