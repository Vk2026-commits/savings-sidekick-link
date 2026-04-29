import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Handshake, CheckCircle2, ArrowLeft } from "lucide-react";

const applicationSchema = z.object({
  first_name: z.string().trim().min(1, "Required").max(80),
  last_name: z.string().trim().min(1, "Required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  business_name: z.string().trim().max(200).optional().or(z.literal("")),
  website: z.string().trim().max(500).optional().or(z.literal("")),
  partner_type: z.enum(["attorney","cpa","financial_advisor","insurance_agent","influencer","church_community","other"]),
  audience_size: z.string().trim().max(100).optional().or(z.literal("")),
  promotion_plan: z.string().trim().min(20, "Please describe your plan (20+ chars)").max(2000),
  payment_method: z.enum(["ach","paypal","stripe_connect","manual","other"]),
  agreement_accepted: z.literal(true, { errorMap: () => ({ message: "You must accept the agreement" }) }),
});

const PARTNER_TYPES = [
  { value: "attorney", label: "Attorney" },
  { value: "cpa", label: "CPA / Accountant" },
  { value: "financial_advisor", label: "Financial Advisor" },
  { value: "insurance_agent", label: "Insurance Agent" },
  { value: "influencer", label: "Influencer / Creator" },
  { value: "church_community", label: "Church / Community Leader" },
  { value: "other", label: "Other" },
];

const PAYMENT_METHODS = [
  { value: "ach", label: "ACH Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "stripe_connect", label: "Stripe Connect" },
  { value: "manual", label: "Manual / Check" },
  { value: "other", label: "Other" },
];

export default function PartnersApply() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    business_name: "",
    website: "",
    partner_type: "" as any,
    audience_size: "",
    promotion_plan: "",
    payment_method: "" as any,
    agreement_accepted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      toast({ title: "Please check the form", description: first.message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("affiliate_applications").insert(parsed.data);
    setSubmitting(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Application received</h2>
            <p className="text-muted-foreground">
              Thanks for applying to the Faithnancial Partner Program. We review applications within
              5 business days and will email you at <strong>{form.email}</strong> with our decision.
            </p>
            <Button onClick={() => navigate("/landing")} variant="outline">Back to home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/landing" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Handshake className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Become a Faithnancial Partner</h1>
          <p className="text-muted-foreground mt-2">
            Earn 20% recurring commission for 12 months on every paying customer you refer.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Partner Application</CardTitle>
            <CardDescription>Tell us about you and how you'd like to promote Faithnancial.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First name *</Label>
                  <Input id="first_name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last name *</Label>
                  <Input id="last_name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business name</Label>
                  <Input id="business_name" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website / social media link</Label>
                  <Input id="website" placeholder="https://" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Partner type *</Label>
                <Select value={form.partner_type} onValueChange={v => setForm({ ...form, partner_type: v as any })}>
                  <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                  <SelectContent>
                    {PARTNER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience_size">Audience size</Label>
                <Input id="audience_size" placeholder="e.g. 500 clients, 10K followers, etc." value={form.audience_size} onChange={e => setForm({ ...form, audience_size: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promotion_plan">How do you plan to promote Faithnancial? *</Label>
                <Textarea id="promotion_plan" rows={4} placeholder="Tell us about your channels, content, or audience…" value={form.promotion_plan} onChange={e => setForm({ ...form, promotion_plan: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label>Payout method preference *</Label>
                <Select value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v as any })}>
                  <SelectTrigger><SelectValue placeholder="How would you like to be paid?" /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
                <Checkbox id="agreement" checked={form.agreement_accepted} onCheckedChange={(c) => setForm({ ...form, agreement_accepted: !!c })} />
                <label htmlFor="agreement" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to promote Faithnancial honestly, follow brand guidelines, and not make
                  unauthorized claims. I understand commissions are paid only on net subscription
                  revenue collected, with a 30-day hold for refund protection.
                </label>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
