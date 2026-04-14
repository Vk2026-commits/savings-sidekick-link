import { useState } from "react";
import { useEstateProperty } from "@/hooks/useEstate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PROPERTY_TYPES = [
  { value: "real_estate", label: "Real Estate" }, { value: "vehicle", label: "Vehicle" },
  { value: "valuable", label: "Valuable/Collectible" }, { value: "business", label: "Business Interest" },
  { value: "other", label: "Other" },
];

export default function EstatePropertyTab({ disableAdd = false }: { disableAdd?: boolean } = {}) {
  const { data, loading, add, update, remove } = useEstateProperty();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ property_type: "real_estate", description: "", estimated_value: "0", location: "", title_holder: "", notes: "" });

  const resetForm = () => setForm({ property_type: "real_estate", description: "", estimated_value: "0", location: "", title_holder: "", notes: "" });
  const handleSave = async () => {
    if (!form.description.trim()) return;
    const payload = { ...form, estimated_value: parseFloat(form.estimated_value) || 0 };
    if (editing) { await update(editing.id, payload); } else { await add(payload); }
    setOpen(false); setEditing(null); resetForm();
  };
  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ property_type: item.property_type, description: item.description, estimated_value: String(item.estimated_value || 0), location: item.location || "", title_holder: item.title_holder || "", notes: item.notes || "" });
    setOpen(true);
  };
  const typeLabel = (v: string) => PROPERTY_TYPES.find(t => t.value === v)?.label || v;
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Why this matters:</strong> A thorough inventory of real estate, vehicles, valuables, and business interests helps prevent assets from being forgotten during estate settlement.
        </p>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Home className="h-5 w-5" /> Property & Assets</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); } }}>
          {!disableAdd && <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Property</Button></DialogTrigger> }
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Property</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.property_type} onValueChange={v => setForm({ ...form, property_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Description *" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Input placeholder="Estimated Value" type="number" value={form.estimated_value} onChange={e => setForm({ ...form, estimated_value: e.target.value })} />
              <Input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              <Input placeholder="Title Holder" value={form.title_holder} onChange={e => setForm({ ...form, title_holder: e.target.value })} />
              <Textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <Button className="w-full" onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <div className="text-center text-muted-foreground py-8">Loading...</div> : data.length === 0 ? <div className="text-center text-muted-foreground py-8">No property added yet.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((p: any) => (
            <Card key={p.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div><CardTitle className="text-base">{p.description}</CardTitle><CardDescription>{p.location}</CardDescription></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <Badge variant="secondary">{typeLabel(p.property_type)}</Badge>
                <p className="font-mono font-medium">{fmt(p.estimated_value || 0)}</p>
                {p.title_holder && <p className="text-muted-foreground">Title: {p.title_holder}</p>}
                {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
