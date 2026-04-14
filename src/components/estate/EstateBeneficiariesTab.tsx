import { useState } from "react";
import { useEstateBeneficiaries, useEstateAccounts, useEstateInsurance, useEstateBeneficiaryLinks } from "@/hooks/useEstate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, UserCheck, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EstateUpgradeDialog from "./EstateUpgradeDialog";

export default function EstateBeneficiariesTab({ disableAdd = false }: { disableAdd?: boolean } = {}) {
  const { data, loading, add, update, remove } = useEstateBeneficiaries();
  const accounts = useEstateAccounts();
  const insurance = useEstateInsurance();
  const links = useEstateBeneficiaryLinks();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", relationship: "", beneficiary_type: "primary", percentage: "0", notes: "" });
  const [linkOpen, setLinkOpen] = useState<string | null>(null);

  const resetForm = () => setForm({ name: "", relationship: "", beneficiary_type: "primary", percentage: "0", notes: "" });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = { ...form, percentage: parseFloat(form.percentage) || 0 };
    if (editing) { await update(editing.id, payload); } else { await add(payload); }
    setOpen(false); setEditing(null); resetForm();
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ name: item.name, relationship: item.relationship, beneficiary_type: item.beneficiary_type, percentage: String(item.percentage), notes: item.notes || "" });
    setOpen(true);
  };

  const addLink = async (beneficiaryId: string, linkedType: string, linkedId: string) => {
    await links.add({ beneficiary_id: beneficiaryId, linked_type: linkedType, linked_id: linkedId });
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Why this matters:</strong> Clearly naming primary and contingent beneficiaries—and linking them to specific accounts and policies—prevents costly legal disputes and ensures your wishes are honored.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><UserCheck className="h-5 w-5" /> Beneficiaries</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); } }}>
          {disableAdd ? <EstateUpgradeDialog label="Add Beneficiary" /> : <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Beneficiary</Button></DialogTrigger>}
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Beneficiary</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Relationship" value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })} />
              <Select value={form.beneficiary_type} onValueChange={v => setForm({ ...form, beneficiary_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="contingent">Contingent</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Percentage (%)" type="number" value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} />
              <Textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <Button className="w-full" onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No beneficiaries added yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((b: any) => {
            const bLinks = links.data.filter((l: any) => l.beneficiary_id === b.id);
            return (
              <Card key={b.id} className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{b.name}</CardTitle>
                      <CardDescription>{b.relationship}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <Badge variant={b.beneficiary_type === "primary" ? "default" : "secondary"}>{b.beneficiary_type}</Badge>
                    <Badge variant="outline">{b.percentage}%</Badge>
                  </div>
                  {bLinks.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Linked to:</p>
                      {bLinks.map((l: any) => (
                        <div key={l.id} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1"><Link className="h-3 w-3" /> {l.linked_type}: {l.linked_id.slice(0, 8)}...</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => links.remove(l.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Dialog open={linkOpen === b.id} onOpenChange={v => setLinkOpen(v ? b.id : null)}>
                    <DialogTrigger asChild><Button variant="outline" size="sm" className="text-xs"><Link className="h-3 w-3 mr-1" /> Link to Account/Policy</Button></DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader><DialogTitle>Link Beneficiary</DialogTitle></DialogHeader>
                      <div className="space-y-2">
                        {accounts.data.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">Accounts</p>
                            {accounts.data.map((a: any) => (
                              <Button key={a.id} variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={async () => { await addLink(b.id, "account", a.id); setLinkOpen(null); }}>
                                {a.title || a.institution} ({a.account_type})
                              </Button>
                            ))}
                          </div>
                        )}
                        {insurance.data.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">Insurance Policies</p>
                            {insurance.data.map((p: any) => (
                              <Button key={p.id} variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={async () => { await addLink(b.id, "insurance", p.id); setLinkOpen(null); }}>
                                {p.provider} ({p.policy_type})
                              </Button>
                            ))}
                          </div>
                        )}
                        {accounts.data.length === 0 && insurance.data.length === 0 && (
                          <p className="text-sm text-muted-foreground">Add accounts or insurance policies first.</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  {b.notes && <p className="text-xs text-muted-foreground">{b.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
