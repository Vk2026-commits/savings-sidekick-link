import { useState } from "react";
import { useEstateLegalDocuments } from "@/hooks/useEstate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DOC_TYPES = [
  { value: "will", label: "Last Will & Testament" }, { value: "trust", label: "Trust" },
  { value: "poa_financial", label: "Financial Power of Attorney" }, { value: "poa_healthcare", label: "Healthcare Power of Attorney" },
  { value: "advance_directive", label: "Advance Directive" }, { value: "living_will", label: "Living Will" },
  { value: "beneficiary_designation", label: "Beneficiary Designation" }, { value: "other", label: "Other" },
];

export default function EstateLegalDocumentsTab() {
  const { data, loading, add, update, remove } = useEstateLegalDocuments();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ document_type: "will", title: "", location: "", attorney: "", date_signed: "", expiration_date: "", notes: "" });

  const resetForm = () => setForm({ document_type: "will", title: "", location: "", attorney: "", date_signed: "", expiration_date: "", notes: "" });
  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (editing) { await update(editing.id, form); } else { await add(form); }
    setOpen(false); setEditing(null); resetForm();
  };
  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ document_type: item.document_type, title: item.title, location: item.location || "", attorney: item.attorney || "", date_signed: item.date_signed || "", expiration_date: item.expiration_date || "", notes: item.notes || "" });
    setOpen(true);
  };
  const typeLabel = (v: string) => DOC_TYPES.find(t => t.value === v)?.label || v;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Why this matters:</strong> Legal documents like wills, trusts, and powers of attorney form the backbone of your estate plan. Knowing where they are and who prepared them saves critical time.
        </p>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><FileText className="h-5 w-5" /> Legal Documents</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); } }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Document</Button></DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Legal Document</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.document_type} onValueChange={v => setForm({ ...form, document_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="Physical Location (e.g., Safe, Attorney Office)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              <Input placeholder="Attorney / Preparer" value={form.attorney} onChange={e => setForm({ ...form, attorney: e.target.value })} />
              <Input placeholder="Date Signed" type="date" value={form.date_signed} onChange={e => setForm({ ...form, date_signed: e.target.value })} />
              <Input placeholder="Expiration Date" type="date" value={form.expiration_date} onChange={e => setForm({ ...form, expiration_date: e.target.value })} />
              <Textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <Button className="w-full" onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <div className="text-center text-muted-foreground py-8">Loading...</div> : data.length === 0 ? <div className="text-center text-muted-foreground py-8">No legal documents added yet.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((d: any) => (
            <Card key={d.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div><CardTitle className="text-base">{d.title}</CardTitle><CardDescription>{d.attorney}</CardDescription></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <Badge variant="secondary">{typeLabel(d.document_type)}</Badge>
                {d.location && <p className="text-muted-foreground">Location: {d.location}</p>}
                {d.date_signed && <p className="text-muted-foreground">Signed: {d.date_signed}</p>}
                {d.notes && <p className="text-xs text-muted-foreground">{d.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
