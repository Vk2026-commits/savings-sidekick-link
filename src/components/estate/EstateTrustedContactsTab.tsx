import { useState } from "react";
import { useEstateTrustedContacts, useEstateAccessRequests, useEstateAuditLog } from "@/hooks/useEstate";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, ShieldCheck, Clock, Check, X, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function EstateTrustedContactsTab({ disableAdd = false }: { disableAdd?: boolean } = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const contacts = useEstateTrustedContacts();
  const requests = useEstateAccessRequests();
  const auditLog = useEstateAuditLog();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ contact_name: "", contact_email: "", waiting_period_days: "7" });
  const [showAuditLog, setShowAuditLog] = useState(false);

  const handleAddContact = async () => {
    if (!form.contact_name.trim() || !form.contact_email.trim()) return;
    await contacts.add({ ...form, waiting_period_days: parseInt(form.waiting_period_days), status: "approved" });
    await auditLog.add({ action: "trusted_contact_added", resource_type: "trusted_contact", actor_id: user?.id, actor_email: user?.email, details: { contact_email: form.contact_email } });
    setOpen(false);
    setForm({ contact_name: "", contact_email: "", waiting_period_days: "7" });
  };

  const handleRevokeContact = async (contact: any) => {
    await contacts.update(contact.id, { status: "revoked", revoked_at: new Date().toISOString() });
    await auditLog.add({ action: "trusted_contact_revoked", resource_type: "trusted_contact", resource_id: contact.id, actor_id: user?.id, actor_email: user?.email });
  };

  const handleApproveRequest = async (request: any) => {
    await requests.update(request.id, { status: "approved", resolved_at: new Date().toISOString() });
    await auditLog.add({ action: "access_request_approved", resource_type: "access_request", resource_id: request.id, actor_id: user?.id, actor_email: user?.email });
    toast({ title: "Access granted" });
  };

  const handleDenyRequest = async (request: any) => {
    await requests.update(request.id, { status: "denied", resolved_at: new Date().toISOString() });
    await auditLog.add({ action: "access_request_denied", resource_type: "access_request", resource_id: request.id, actor_id: user?.id, actor_email: user?.email });
    toast({ title: "Access denied" });
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "default";
    if (s === "pending") return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Why this matters:</strong> Trusted contacts can request emergency access to your estate information if something happens to you. You control who has access and set a waiting period before access is granted.
        </p>
      </div>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertDescription className="text-sm">
          When a trusted contact requests emergency access, they must wait the specified number of days. If you don't deny the request within that period, read-only access is automatically granted. All access is logged.
        </AlertDescription>
      </Alert>

      {/* Trusted Contacts */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Trusted Contacts</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          {!disableAdd && <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Contact</Button></DialogTrigger> }
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Trusted Contact</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Name *" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
              <Input placeholder="Email *" type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
              <Select value={form.waiting_period_days} onValueChange={v => setForm({ ...form, waiting_period_days: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleAddContact}>Add Trusted Contact</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {contacts.loading ? <div className="text-center text-muted-foreground py-4">Loading...</div> : contacts.data.length === 0 ? (
        <div className="text-center text-muted-foreground py-4">No trusted contacts added.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.data.map((c: any) => (
            <Card key={c.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div><CardTitle className="text-base">{c.contact_name}</CardTitle><CardDescription>{c.contact_email}</CardDescription></div>
                  <div className="flex gap-1">
                    {c.status !== "revoked" && <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => handleRevokeContact(c)}>Revoke</Button>}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => contacts.remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex gap-2">
                  <Badge variant={statusColor(c.status) as any}>{c.status}</Badge>
                  <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{c.waiting_period_days} day wait</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Access Requests */}
      {requests.data.filter((r: any) => r.status === "pending").length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Pending Access Requests</h3>
          {requests.data.filter((r: any) => r.status === "pending").map((r: any) => (
            <Card key={r.id} className="glass-card border-warning/50">
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.requester_email}</p>
                  <p className="text-xs text-muted-foreground">Requested: {new Date(r.requested_at).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Expires: {new Date(r.expires_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApproveRequest(r)}><Check className="h-4 w-4 mr-1" /> Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDenyRequest(r)}><X className="h-4 w-4 mr-1" /> Deny</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Audit Log */}
      <div className="space-y-2">
        <Button variant="outline" size="sm" onClick={() => setShowAuditLog(!showAuditLog)}>
          <ScrollText className="h-4 w-4 mr-1" /> {showAuditLog ? "Hide" : "Show"} Audit Log
        </Button>
        {showAuditLog && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {auditLog.data.length === 0 ? <p className="text-sm text-muted-foreground">No audit entries yet.</p> : (
              auditLog.data.map((entry: any) => (
                <div key={entry.id} className="glass-card p-2 text-xs flex justify-between">
                  <span>{entry.action} · {entry.actor_email}</span>
                  <span className="text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
