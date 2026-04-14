import { useState } from "react";
import { useEstatePeople } from "@/hooks/useEstate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Users, Phone, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ROLES = [
  { value: "next_of_kin", label: "Next of Kin" },
  { value: "attorney", label: "Attorney" },
  { value: "accountant", label: "Accountant" },
  { value: "financial_advisor", label: "Financial Advisor" },
  { value: "executor", label: "Executor" },
  { value: "trustee", label: "Trustee" },
  { value: "guardian", label: "Guardian" },
  { value: "power_of_attorney", label: "Power of Attorney" },
  { value: "other", label: "Other" },
];

export default function EstatePeopleTab({ disableAdd = false }: { disableAdd?: boolean } = {}) {
  const { data, loading, add, update, remove } = useEstatePeople();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", relationship: "", role: "next_of_kin", phone: "", email: "", address: "", notes: "" });

  const resetForm = () => setForm({ name: "", relationship: "", role: "next_of_kin", phone: "", email: "", address: "", notes: "" });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await update(editing.id, form);
    } else {
      await add(form);
    }
    setOpen(false);
    setEditing(null);
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ name: item.name, relationship: item.relationship, role: item.role, phone: item.phone || "", email: item.email || "", address: item.address || "", notes: item.notes || "" });
    setOpen(true);
  };

  const roleLabel = (val: string) => ROLES.find(r => r.value === val)?.label || val;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Why this matters:</strong> Identifying your key contacts—family, attorneys, financial advisors, and fiduciaries—ensures your loved ones know who to reach out to when it matters most.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5" /> People</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Person</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Person" : "Add Person"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Relationship (e.g., Spouse, Brother)" value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })} />
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              <Textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <Button className="w-full" onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No people added yet. Click "Add Person" to get started.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((person: any) => (
            <Card key={person.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{person.name}</CardTitle>
                    <CardDescription>{person.relationship}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(person)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(person.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <Badge variant="secondary" className="mb-2">{roleLabel(person.role)}</Badge>
                {person.phone && <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {person.phone}</p>}
                {person.email && <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {person.email}</p>}
                {person.address && <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {person.address}</p>}
                {person.notes && <p className="text-muted-foreground mt-2 text-xs">{person.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
