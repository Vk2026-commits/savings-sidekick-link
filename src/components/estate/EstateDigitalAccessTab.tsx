import { useState } from "react";
import { useEstateDigitalAccess } from "@/hooks/useEstate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Pencil, Globe, Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";
import EstateUpgradeDialog from "./EstateUpgradeDialog";
import { encryptSecret, decryptSecret } from "@/lib/vault-crypto";
import { useToast } from "@/hooks/use-toast";

export default function EstateDigitalAccessTab({ disableAdd = false }: { disableAdd?: boolean } = {}) {
  const { data, loading, add, update, remove } = useEstateDigitalAccess();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ service_name: "", username: "", email: "", url: "", notes: "" });
  const [secretField, setSecretField] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [decryptedSecrets, setDecryptedSecrets] = useState<Record<string, string>>({});
  const [decryptPassphrase, setDecryptPassphrase] = useState("");
  const [decryptingId, setDecryptingId] = useState<string | null>(null);

  const resetForm = () => { setForm({ service_name: "", username: "", email: "", url: "", notes: "" }); setSecretField(""); setPassphrase(""); };

  const handleSave = async () => {
    if (!form.service_name.trim()) return;
    let encryptedData: any = {};
    if (secretField && passphrase) {
      try {
        const enc = await encryptSecret(secretField, passphrase);
        encryptedData = { encrypted_secret: enc.ciphertext, encryption_iv: enc.iv, encryption_salt: enc.salt };
      } catch {
        toast({ title: "Encryption failed", variant: "destructive" });
        return;
      }
    }
    const payload = { ...form, ...encryptedData };
    if (editing) { await update(editing.id, payload); } else { await add(payload); }
    setOpen(false); setEditing(null); resetForm();
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ service_name: item.service_name, username: item.username || "", email: item.email || "", url: item.url || "", notes: item.notes || "" });
    setSecretField(""); setPassphrase("");
    setOpen(true);
  };

  const handleDecrypt = async (item: any) => {
    if (!decryptPassphrase) return;
    try {
      const plaintext = await decryptSecret(item.encrypted_secret, item.encryption_iv, item.encryption_salt, decryptPassphrase);
      setDecryptedSecrets(prev => ({ ...prev, [item.id]: plaintext }));
      setDecryptingId(null); setDecryptPassphrase("");
    } catch {
      toast({ title: "Wrong passphrase or corrupted data", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Why this matters:</strong> Digital accounts (email, social media, banking) can be difficult to recover after death. Documenting access info helps your loved ones manage or close accounts.
        </p>
      </div>

      <Alert className="border-warning/50 bg-warning/10">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-sm">
          <strong>Vault Lock:</strong> Secrets are encrypted client-side with your vault passphrase using AES-256-GCM. Only ciphertext is stored. <strong>If you lose your passphrase, your secrets cannot be recovered.</strong>
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Globe className="h-5 w-5" /> Digital Access</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); } }}>
          {!disableAdd && <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Account</Button></DialogTrigger> }
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Digital Account</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Service Name *" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} />
              <Input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
              <Textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-medium flex items-center gap-1"><Lock className="h-3 w-3" /> Encrypted Vault (optional)</p>
                <Input placeholder="Secret (password, key, etc.)" type="password" value={secretField} onChange={e => setSecretField(e.target.value)} />
                <div className="relative">
                  <Input placeholder="Vault Passphrase" type={showPassphrase ? "text" : "password"} value={passphrase} onChange={e => setPassphrase(e.target.value)} />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassphrase(!showPassphrase)}>
                    {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button className="w-full" onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <div className="text-center text-muted-foreground py-8">Loading...</div> : data.length === 0 ? <div className="text-center text-muted-foreground py-8">No digital accounts added yet.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item: any) => (
            <Card key={item.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div><CardTitle className="text-base">{item.service_name}</CardTitle><CardDescription>{item.url}</CardDescription></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {item.username && <p>Username: {item.username}</p>}
                {item.email && <p>Email: {item.email}</p>}
                {item.encrypted_secret && (
                  <div className="border rounded-lg p-2 space-y-1">
                    <p className="text-xs font-medium flex items-center gap-1"><Lock className="h-3 w-3" /> Encrypted Secret</p>
                    {decryptedSecrets[item.id] ? (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-secondary p-1 rounded flex-1 break-all">{decryptedSecrets[item.id]}</code>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setDecryptedSecrets(prev => { const n = { ...prev }; delete n[item.id]; return n; })}>Hide</Button>
                      </div>
                    ) : decryptingId === item.id ? (
                      <div className="flex gap-1">
                        <Input placeholder="Vault Passphrase" type="password" className="h-7 text-xs" value={decryptPassphrase} onChange={e => setDecryptPassphrase(e.target.value)} onKeyDown={e => e.key === "Enter" && handleDecrypt(item)} />
                        <Button size="sm" className="h-7 text-xs" onClick={() => handleDecrypt(item)}>Unlock</Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => { setDecryptingId(item.id); setDecryptPassphrase(""); }}>
                        <Eye className="h-3 w-3 mr-1" /> Reveal
                      </Button>
                    )}
                  </div>
                )}
                {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
