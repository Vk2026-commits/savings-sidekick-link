import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { maskEmail } from "@/lib/affiliate-tracking";
import PartnerAgreement, { AGREEMENT_VERSION } from "@/components/PartnerAgreement";
import {
  ArrowLeft, Copy, Link2, MousePointerClick, UserPlus, CreditCard,
  DollarSign, TrendingUp, CheckCircle2, Clock,
} from "lucide-react";

interface Partner {
  id: string;
  referral_code: string;
  commission_rate: number;
  payout_duration_months: number;
  status: string;
  total_clicks: number;
  total_signups: number;
  total_paid_conversions: number;
  first_name: string;
}

interface Referral {
  id: string;
  referred_email: string;
  referred_first_name: string | null;
  conversion_status: string;
  plan_type: string | null;
  created_at: string;
  first_paid_at: string | null;
}

interface Commission {
  id: string;
  net_revenue: number;
  commission_amount: number;
  status: string;
  collected_at: string;
  paid_at: string | null;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    signed_up: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    trial: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    cancelled: "bg-gray-500/10 text-gray-600 border-gray-500/30",
    refunded: "bg-red-500/10 text-red-600 border-red-500/30",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    approved: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    held: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    reversed: "bg-red-500/10 text-red-600 border-red-500/30",
  };
  return <Badge className={map[status] ?? ""} variant="outline">{status.replace("_", " ")}</Badge>;
}

export default function PartnerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [hasSigned, setHasSigned] = useState<boolean | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const { data: p } = await supabase
      .from("affiliate_partners")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (p) {
      setPartner(p as any);
      const [{ data: refs }, { data: comms }, { data: sig }] = await Promise.all([
        supabase.from("affiliate_referrals").select("*").eq("partner_id", p.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("affiliate_commissions").select("*").eq("partner_id", p.id).order("collected_at", { ascending: false }).limit(50),
        supabase.from("affiliate_agreement_acceptances").select("id").eq("partner_id", p.id).eq("agreement_version", AGREEMENT_VERSION).maybeSingle(),
      ]);
      setReferrals((refs as any) ?? []);
      setCommissions((comms as any) ?? []);
      setHasSigned(!!sig);
    } else {
      setHasSigned(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading partner data…</div>;

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center space-y-4">
            <h2 className="text-xl font-semibold">You're not a partner yet</h2>
            <p className="text-muted-foreground text-sm">
              Apply to the Faithnancial Partner Program to start earning commissions.
            </p>
            <Button asChild><Link to="/partners/apply">Apply now</Link></Button>
            <div><Button asChild variant="ghost" size="sm"><Link to="/">Back to dashboard</Link></Button></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const referralUrl = `${window.location.origin}/auth?signup=true&ref=${partner.referral_code}`;

  const pendingCommission = commissions.filter(c => c.status === "pending" || c.status === "held").reduce((s, c) => s + Number(c.commission_amount), 0);
  const approvedCommission = commissions.filter(c => c.status === "approved").reduce((s, c) => s + Number(c.commission_amount), 0);
  const paidCommission = commissions.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.commission_amount), 0);
  const trialCount = referrals.filter(r => r.conversion_status === "trial").length;
  const activeCount = referrals.filter(r => r.conversion_status === "paid").length;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
            <div>
              <h1 className="text-xl font-semibold">Partner Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome back, {partner.first_name}</p>
            </div>
          </div>
          <Badge className={partner.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : ""} variant="outline">
            {partner.status}
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Referral link card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-primary" /> Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input readOnly value={referralUrl} className="font-mono text-sm" />
              <Button onClick={() => copy(referralUrl, "Link")} variant="secondary"><Copy className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Code: <code className="text-foreground font-mono">{partner.referral_code}</code></span>
              <span>Commission: <strong className="text-foreground">{partner.commission_rate}%</strong></span>
              <span>Duration: <strong className="text-foreground">{partner.payout_duration_months} months</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={MousePointerClick} label="Total clicks" value={partner.total_clicks} />
          <StatCard icon={UserPlus} label="Signups" value={partner.total_signups} />
          <StatCard icon={Clock} label="On trial" value={trialCount} />
          <StatCard icon={CreditCard} label="Active paying" value={activeCount} />
          <StatCard icon={Clock} label="Pending" value={`$${pendingCommission.toFixed(2)}`} accent="amber" />
          <StatCard icon={TrendingUp} label="Approved" value={`$${approvedCommission.toFixed(2)}`} accent="blue" />
          <StatCard icon={CheckCircle2} label="Paid out" value={`$${paidCommission.toFixed(2)}`} accent="emerald" />
          <StatCard icon={DollarSign} label="Lifetime earnings" value={`$${(pendingCommission + approvedCommission + paidCommission).toFixed(2)}`} accent="emerald" />
        </div>

        {/* Recent referrals */}
        <Card>
          <CardHeader><CardTitle>Recent Referrals</CardTitle></CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No referrals yet — share your link to start earning.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-left py-2 font-medium">Referred user</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-left py-2 font-medium">Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map(r => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td className="py-3">{r.referred_first_name || maskEmail(r.referred_email)}</td>
                        <td className="py-3">{statusBadge(r.conversion_status)}</td>
                        <td className="py-3 text-muted-foreground">{r.plan_type ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commission history */}
        <Card>
          <CardHeader><CardTitle>Commission History</CardTitle></CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No commissions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-right py-2 font-medium">Net revenue</th>
                      <th className="text-right py-2 font-medium">Commission</th>
                      <th className="text-left py-2 font-medium pl-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map(c => (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="py-3 text-muted-foreground">{new Date(c.collected_at).toLocaleDateString()}</td>
                        <td className="py-3 text-right">${Number(c.net_revenue).toFixed(2)}</td>
                        <td className="py-3 text-right font-semibold text-emerald-600">${Number(c.commission_amount).toFixed(2)}</td>
                        <td className="py-3 pl-4">{statusBadge(c.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center pt-4">
          Commissions are subject to a 30-day hold period for refund protection. Minimum payout: $50.
        </p>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent?: string }) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          <Icon className={`h-4 w-4 ${accent ? colorMap[accent] : "text-muted-foreground"}`} />
        </div>
        <div className={`text-2xl font-bold ${accent ? colorMap[accent] : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
