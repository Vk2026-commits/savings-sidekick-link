import { useState } from "react";
import { useEstateWishes } from "@/hooks/useEstate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const WISH_TYPES = [
  { value: "funeral", label: "Funeral Arrangements" }, { value: "burial", label: "Burial / Cremation" },
  { value: "organ_donation", label: "Organ Donation" }, { value: "memorial", label: "Memorial Service" },
  { value: "personal_message", label: "Personal Message" }, { value: "other", label: "Other" },
];

export default function EstateWishesTab({ disableAdd = false }: { disableAdd?: boolean } = {}) {
  const { data, loading, add, update, remove } = useEstateWishes();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ wish_type: "funeral", title: "", content: "" });

  const resetForm = () => setForm({ wish_type: "funeral", title: "", content: "" });
  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (editing) { await update(editing.id, form); } else { await add(form); }
    setOpen(false); setEditing(null); resetForm();
  };
  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ wish_type: item.wish_type, title: item.title, content: item.content || "" });
    setOpen(true);
  };
  const typeLabel = (v: string) => WISH_TYPES.find(t => t.value === v)?.label || v;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Why this matters:</strong> Documenting your final wishes—funeral preferences, organ donation decisions, and personal messages—relieves your loved ones of making these difficult decisions during grief.
        </p>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Heart className="h-5 w-5" /> Wishes</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); } }}>
          {!disableAdd && <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Wish</Button></DialogTrigger> }
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Wish</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.wish_type} onValueChange={v => setForm({ ...form, wish_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{WISH_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Details..." rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              <Button className="w-full" onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <div className="text-center text-muted-foreground py-8">Loading...</div> : data.length === 0 ? <div className="text-center text-muted-foreground py-8">No wishes documented yet.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((w: any) => (
            <Card key={w.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{w.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(w)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(w.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <Badge variant="secondary">{typeLabel(w.wish_type)}</Badge>
                {w.content && <p className="text-muted-foreground whitespace-pre-wrap">{w.content}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
