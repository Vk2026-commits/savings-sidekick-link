import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileSignature, ShieldCheck } from "lucide-react";

export const AGREEMENT_VERSION = "v1.0-2026-04-29";

interface Props {
  partnerId: string;
  userId: string;
  defaultName?: string;
  onSigned: () => void;
}

export default function PartnerAgreement({ partnerId, userId, defaultName, onSigned }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState(defaultName ?? "");
  const [agreed, setAgreed] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSign = async () => {
    if (!name.trim()) {
      toast({ title: "Please type your full legal name", variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: "Please confirm you've read and agree", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("affiliate_agreement_acceptances").insert({
      partner_id: partnerId,
      user_id: userId,
      agreement_version: AGREEMENT_VERSION,
      signature_name: name.trim(),
      user_agent: navigator.userAgent,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not record signature", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Agreement signed", description: "Welcome to the Faithnancial Partner Program." });
    onSigned();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) setScrolledToEnd(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Faithnancial Affiliate Partner Agreement
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Please read and electronically sign this agreement to access your Partner Dashboard.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea
            className="h-[420px] rounded-md border bg-muted/30 p-4 text-sm leading-relaxed"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-4">
              <p>
                This Affiliate Partner Agreement ("Agreement") is entered into between
                Faithnancial ("Company") and the approved affiliate partner ("Partner").
              </p>

              <Section title="1. PURPOSE">
                Faithnancial offers a personal finance, budgeting, document organization, and estate
                planning support platform. Partner desires to promote Faithnancial and receive
                commission for eligible referred customers.
              </Section>

              <Section title="2. PARTNER STATUS">
                Partner is an independent contractor and not an employee, agent, legal representative,
                joint venture partner, or franchisee of Faithnancial. Partner has no authority to bind
                Faithnancial, make guarantees, or represent that Partner is acting on behalf of
                Faithnancial.
              </Section>

              <Section title="3. APPROVAL">
                Participation in the affiliate program is subject to approval by Faithnancial.
                Faithnancial may approve, reject, suspend, or terminate any Partner at its discretion.
              </Section>

              <Section title="4. REFERRAL TRACKING">
                Faithnancial will provide Partner with a unique referral link or referral code. To
                qualify for commission, referred customers must sign up through Partner's referral
                link or code within the applicable attribution window. The standard attribution
                window is 60 days. Faithnancial uses last-click attribution unless otherwise stated.
              </Section>

              <Section title="5. COMMISSION STRUCTURE">
                Partner earns commission only when a referred customer becomes a paying subscriber.
                Free trials do not qualify for commission. Default commission is 20% of net
                subscription revenue collected from referred customers for up to 12 months from the
                customer's first paid subscription date. Faithnancial may offer higher commission
                tiers to qualified Partners. Commission is calculated from actual subscription
                revenue collected, excluding taxes, refunds, chargebacks, discounts, credits, and
                payment processing fees.
              </Section>

              <Section title="6. PAYOUTS">
                Commissions are paid monthly. Minimum payout threshold is $50. Commissions are
                subject to a 30-day hold period to account for refunds, cancellations, failed
                payments, or chargebacks. Faithnancial may withhold, reverse, or cancel commissions
                related to fraud, refunds, chargebacks, policy violations, or suspicious activity.
              </Section>

              <Section title="7. PROHIBITED ACTIVITIES">
                Partner may not:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Make false or misleading claims</li>
                  <li>Guarantee financial results</li>
                  <li>Guarantee estate planning outcomes</li>
                  <li>Claim Faithnancial provides legal, tax, or financial advice unless authorized in writing</li>
                  <li>Use spam or unsolicited messages</li>
                  <li>Use deceptive advertising</li>
                  <li>Bid on Faithnancial branded keywords without written permission</li>
                  <li>Refer themselves</li>
                  <li>Create fake accounts</li>
                  <li>Misrepresent pricing, features, or terms</li>
                  <li>Use Faithnancial branding in a way that creates confusion</li>
                </ul>
              </Section>

              <Section title="8. COMPLIANCE">
                Partner is responsible for complying with all applicable laws, advertising rules,
                email marketing rules, privacy laws, and professional regulations. Attorneys, CPAs,
                financial advisors, insurance agents, and other licensed professionals are
                responsible for complying with their own licensing, ethics, and referral fee rules.
                Partner must clearly disclose affiliate relationships when promoting Faithnancial.
                <p className="mt-2 italic">
                  Example disclosure: "I may receive compensation if you sign up through my link."
                </p>
              </Section>

              <Section title="9. BRAND USE">
                Faithnancial grants Partner limited permission to use approved logos, links,
                descriptions, and promotional materials solely for promoting Faithnancial. Partner
                may not alter Faithnancial branding without written permission.
              </Section>

              <Section title="10. CUSTOMER RELATIONSHIP">
                Customers referred to Faithnancial are customers of Faithnancial. Faithnancial
                controls customer accounts, billing, pricing, subscriptions, support, product
                access, and account termination.
              </Section>

              <Section title="11. PRIVACY">
                Partner will not receive access to customers' private financial data, estate
                planning data, uploaded documents, insurance details, beneficiary information, or
                personal account contents. Partner may receive limited referral and commission
                status information.
              </Section>

              <Section title="12. TERMINATION">
                Either party may terminate participation in the affiliate program at any time.
                Faithnancial may immediately terminate Partner for fraud, abuse, legal violations,
                brand misuse, or violation of this Agreement. Upon termination, Partner must stop
                using Faithnancial referral links, branding, and promotional materials.
              </Section>

              <Section title="13. MODIFICATION">
                Faithnancial may update commission rates, program rules, payout schedules, or terms
                with notice to Partner. Continued participation after notice means Partner accepts
                the updated terms.
              </Section>

              <Section title="14. LIMITATION OF LIABILITY">
                Faithnancial is not liable for indirect, incidental, special, consequential, or
                lost-profit damages related to this Agreement.
              </Section>

              <Section title="15. NO GUARANTEE">
                Faithnancial does not guarantee Partner will earn any commission or revenue.
              </Section>

              <Section title="16. GOVERNING LAW">
                This Agreement shall be governed by the laws of the state where Faithnancial is
                legally organized, unless otherwise required by law.
              </Section>

              <Section title="17. ACCEPTANCE">
                By applying for or participating in the Faithnancial Affiliate Program, Partner
                agrees to this Agreement.
              </Section>

              <p className="text-xs text-muted-foreground pt-2 border-t">
                Agreement version: {AGREEMENT_VERSION}
              </p>
            </div>
          </ScrollArea>

          {!scrolledToEnd && (
            <p className="text-xs text-muted-foreground text-center">
              Please scroll to the end of the agreement to continue.
            </p>
          )}

          <div className="space-y-3 pt-2 border-t">
            <div>
              <Label htmlFor="signature-name">Type your full legal name as your signature</Label>
              <Input
                id="signature-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane M. Smith"
                disabled={!scrolledToEnd}
                className="mt-1.5 font-serif italic text-lg"
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(c) => setAgreed(!!c)}
                disabled={!scrolledToEnd}
              />
              <Label htmlFor="agree" className="text-sm font-normal leading-snug">
                I have read, understood, and agree to be legally bound by this Faithnancial
                Affiliate Partner Agreement. I understand that typing my name above and clicking
                "Sign Agreement" constitutes my legal electronic signature.
              </Label>
            </div>

            <Button
              onClick={handleSign}
              disabled={!scrolledToEnd || !agreed || !name.trim() || submitting}
              className="w-full"
              size="lg"
            >
              <FileSignature className="h-4 w-4 mr-2" />
              {submitting ? "Recording signature…" : "Sign Agreement & Access Dashboard"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}
