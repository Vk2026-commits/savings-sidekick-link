import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Handshake, Check, X, Copy, Pause, Play, UserPlus } from "lucide-react";

interface Application {
  id: string;
  first_name: string; last_name: string; email: string; phone: string | null;
  business_name: string | null; website: string | null;
  partner_type: string; audience_size: string | null;
  promotion_plan: string; payment_method: string;
  status: string; created_at: string;
}

interface Partner {
  id: string; first_name: string; last_name: string; email: string;
  business_name: string | null; partner_type: string;
  referral_code: string; commission_rate: number; payout_duration_months: number;
  status: string; total_clicks: number; total_signups: number; total_paid_conversions: number;
  created_at: string;
}

export default function AffiliateAdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<Application[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [reviewApp, setReviewApp] = useState<Application | null>(null);
  const [commissionRate, setCommissionRate] = useState("20");
  const [payoutMonths, setPayoutMonths] = useState("12");
  const [refreshKey, setRefreshKey] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({
    email: "", first_name: "", last_name: "", business_name: "",
    partner_type: "individual", commission_rate: "20", payout_months: "12",
  });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: a }, { data: p }] = await Promise.all([
        supabase.from("affiliate_applications").select("*").order("created_at", { ascending: false }),
        supabase.from("affiliate_partners").select("*").order("created_at", { ascending: false }),
      ]);
      setApps((a as any) ?? []);
      setPartners((p as any) ?? []);
    })();
  }, [refreshKey]);

  const approve = async () => {
    if (!reviewApp) return;
    const { data: newPartnerId, error } = await supabase.rpc("approve_affiliate_application" as any, {
      app_id: reviewApp.id,
      custom_commission_rate: parseFloat(commissionRate),
      custom_payout_months: parseInt(payoutMonths, 10),
    });
    if (error) {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
      return;
    }
    try {
      const { data: partnerRow } = await supabase
        .from("affiliate_partners")
        .select("referral_code, commission_rate, payout_duration_months")
        .eq("id", newPartnerId as any)
        .maybeSingle();
      const code = (partnerRow as any)?.referral_code;
      if (code) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "affiliate-welcome",
            recipientEmail: reviewApp.email,
            idempotencyKey: `affiliate-welcome-${newPartnerId}`,
            templateData: {
              firstName: reviewApp.first_name || "",
              referralCode: code,
              referralLink: `${window.location.origin}/auth?signup=true&ref=${code}`,
              commissionRate: (partnerRow as any)?.commission_rate ?? parseFloat(commissionRate),
              payoutDurationMonths: (partnerRow as any)?.payout_duration_months ?? parseInt(payoutMonths, 10),
              portalUrl: `${window.location.origin}/partner-dashboard`,
            },
          },
        });
      }
    } catch (e: any) {
      console.error("Welcome email failed", e);
    }

    toast({ title: "Partner approved", description: "Referral code generated and welcome email sent." });
    setReviewApp(null);
    setRefreshKey(k => k + 1);
  };

  const reject = async (app: Application) => {
    if (!user) return;
    const { error } = await supabase
      .from("affiliate_applications")
      .update({ status: "rejected", reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq("id", app.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Application rejected" });
    setRefreshKey(k => k + 1);
  };

  const togglePartnerStatus = async (p: Partner) => {
    const newStatus = p.status === "active" ? "suspended" : "active";
    const { error } = await supabase.from("affiliate_partners").update({ status: newStatus }).eq("id", p.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Partner ${newStatus}` });
    setRefreshKey(k => k + 1);
  };

  const updateCommissionRate = async (p: Partner, newRate: number) => {
    const { error } = await supabase.from("affiliate_partners").update({ commission_rate: newRate }).eq("id", p.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Commission rate updated" });
    setRefreshKey(k => k + 1);
  };

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/auth?signup=true&ref=${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Referral link copied" });
  };

  const submitInvite = async () => {
    if (!invite.email.trim()) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }
    setInviting(true);
    const { data, error } = await supabase.rpc("admin_invite_affiliate_partner" as any, {
      p_email: invite.email.trim(),
      p_first_name: invite.first_name.trim(),
      p_last_name: invite.last_name.trim(),
      p_partner_type: invite.partner_type,
      p_business_name: invite.business_name.trim() || null,
      p_commission_rate: parseFloat(invite.commission_rate),
      p_payout_duration_months: parseInt(invite.payout_months, 10),
    });
    setInviting(false);
    if (error) {
      toast({ title: "Invite failed", description: error.message, variant: "destructive" });
      return;
    }
    const code = (data as any)?.[0]?.referral_code;
    const partnerId = (data as any)?.[0]?.partner_id;
    const url = code ? `${window.location.origin}/auth?signup=true&ref=${code}` : "";
    if (url) await navigator.clipboard.writeText(url).catch(() => {});

    if (code) {
      try {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "affiliate-welcome",
            recipientEmail: invite.email.trim(),
            idempotencyKey: `affiliate-welcome-${partnerId || code}`,
            templateData: {
              firstName: invite.first_name.trim(),
              referralCode: code,
              referralLink: url,
              commissionRate: parseFloat(invite.commission_rate),
              payoutDurationMonths: parseInt(invite.payout_months, 10),
              portalUrl: `${window.location.origin}/partner-dashboard`,
            },
          },
        });
      } catch (e: any) {
        console.error("Welcome email failed", e);
      }
    }

    toast({
      title: "Partner created",
      description: code ? `Code ${code} • Link copied & welcome email sent` : "Partner created",
    });
    setInviteOpen(false);
    setInvite({ email: "", first_name: "", last_name: "", business_name: "", partner_type: "individual", commission_rate: "20", payout_months: "12" });
    setRefreshKey(k => k + 1);
  };

  const pending = apps.filter(a => a.status === "pending");

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold">Affiliate Management (Admin)</h2>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4 mr-1" /> Invite Partner
        </Button>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">
            Applications {pending.length > 0 && <Badge className="ml-2" variant="secondary">{pending.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="partners">Active Partners ({partners.filter(p => p.status === "active").length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({partners.filter(p => p.status === "suspended").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card>
            <CardHeader><CardTitle>Partner Applications</CardTitle></CardHeader>
            <CardContent>
              {apps.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {apps.map(a => (
                    <div key={a.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong>{a.first_name} {a.last_name}</strong>
                            <Badge variant="outline" className="text-xs">{a.partner_type.replace("_", " ")}</Badge>
                            <Badge variant={a.status === "pending" ? "default" : a.status === "approved" ? "secondary" : "destructive"} className="text-xs">{a.status}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {a.email} {a.business_name && `• ${a.business_name}`} {a.website && <a href={a.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">• site</a>}
                          </div>
                          {a.audience_size && <div className="text-xs text-muted-foreground mt-1">Audience: {a.audience_size}</div>}
                          <p className="text-sm mt-2 text-foreground/80">{a.promotion_plan}</p>
                        </div>
                        {a.status === "pending" && (
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" onClick={() => setReviewApp(a)}><Check className="h-4 w-4 mr-1" /> Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => reject(a)}><X className="h-4 w-4" /></Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners">
          <PartnerTable partners={partners.filter(p => p.status === "active")} onToggle={togglePartnerStatus} onCopy={copyLink} onRateChange={updateCommissionRate} />
        </TabsContent>

        <TabsContent value="suspended">
          <PartnerTable partners={partners.filter(p => p.status === "suspended")} onToggle={togglePartnerStatus} onCopy={copyLink} onRateChange={updateCommissionRate} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!reviewApp} onOpenChange={(o) => !o && setReviewApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Partner</DialogTitle>
            <DialogDescription>Set commission terms for {reviewApp?.first_name} {reviewApp?.last_name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Commission rate (%)</Label>
              <Input type="number" step="0.01" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} />
              <p className="text-xs text-muted-foreground">Default: 20% recurring</p>
            </div>
            <div className="space-y-2">
              <Label>Payout duration (months)</Label>
              <Input type="number" value={payoutMonths} onChange={e => setPayoutMonths(e.target.value)} />
              <p className="text-xs text-muted-foreground">Default: 12 months from first paid date</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewApp(null)}>Cancel</Button>
            <Button onClick={approve}>Approve & Generate Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Partner</DialogTitle>
            <DialogDescription>Create an approved partner directly. Their referral code will be generated and copied to your clipboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={invite.first_name} onChange={e => setInvite({ ...invite, first_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={invite.last_name} onChange={e => setInvite({ ...invite, last_name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={invite.email} onChange={e => setInvite({ ...invite, email: e.target.value })} />
              <p className="text-xs text-muted-foreground">When they sign up with this email, they'll be auto-linked to this partner record.</p>
            </div>
            <div className="space-y-2">
              <Label>Business name (optional)</Label>
              <Input value={invite.business_name} onChange={e => setInvite({ ...invite, business_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Commission rate (%)</Label>
                <Input type="number" step="0.01" value={invite.commission_rate} onChange={e => setInvite({ ...invite, commission_rate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Payout duration (months)</Label>
                <Input type="number" value={invite.payout_months} onChange={e => setInvite({ ...invite, payout_months: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={submitInvite} disabled={inviting}>
              {inviting ? "Creating…" : "Create & Copy Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function PartnerTable({ partners, onToggle, onCopy, onRateChange }: {
  partners: Partner[];
  onToggle: (p: Partner) => void;
  onCopy: (code: string) => void;
  onRateChange: (p: Partner, rate: number) => void;
}) {
  if (partners.length === 0) {
    return <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">No partners in this category.</CardContent></Card>;
  }
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-muted-foreground bg-muted/30">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Partner</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Code</th>
                <th className="text-right py-3 px-4 font-medium">Clicks</th>
                <th className="text-right py-3 px-4 font-medium">Signups</th>
                <th className="text-right py-3 px-4 font-medium">Paid</th>
                <th className="text-right py-3 px-4 font-medium">Rate</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3 px-4">
                    <div className="font-medium">{p.first_name} {p.last_name}</div>
                    <div className="text-xs text-muted-foreground">{p.email}</div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{p.partner_type.replace("_", " ")}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs">{p.referral_code}</code>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onCopy(p.referral_code)}><Copy className="h-3 w-3" /></Button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">{p.total_clicks}</td>
                  <td className="py-3 px-4 text-right">{p.total_signups}</td>
                  <td className="py-3 px-4 text-right">{p.total_paid_conversions}</td>
                  <td className="py-3 px-4 text-right">
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={p.commission_rate}
                      className="w-20 h-8 text-right ml-auto"
                      onBlur={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v) && v !== Number(p.commission_rate)) onRateChange(p, v);
                      }}
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button size="sm" variant="outline" onClick={() => onToggle(p)}>
                      {p.status === "active" ? <><Pause className="h-3 w-3 mr-1" /> Suspend</> : <><Play className="h-3 w-3 mr-1" /> Reactivate</>}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
