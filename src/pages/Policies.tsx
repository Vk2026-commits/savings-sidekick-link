import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Policies() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div>
          <h1 className="text-3xl font-bold mb-2">Terms of Service, Privacy Policy & Disclaimers</h1>
          <p className="text-sm text-muted-foreground">Last updated: April 15, 2026</p>
        </div>

        {/* Financial Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Financial Disclaimer</h2>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm leading-relaxed space-y-2">
            <p><strong>Faithnancial is not a financial advisor, tax advisor, legal advisor, or investment advisor.</strong></p>
            <p>
              The information, tools, and content provided through this platform — including budgeting features, 
              spending tips, net worth tracking, and estate planning organization — are for <strong>informational 
              and organizational purposes only</strong>. Nothing on this platform constitutes financial advice, 
              investment advice, tax advice, legal advice, or any other form of professional advice.
            </p>
            <p>
              You should consult with a qualified financial advisor, tax professional, or attorney before making 
              any financial decisions. Faithnancial does not guarantee the accuracy, completeness, or timeliness 
              of any information provided.
            </p>
            <p>
              Any AI-generated tips, analytics, or comparisons are based on publicly available data (such as 
              Bureau of Labor Statistics averages) and are provided as general guidance only. They do not take 
              into account your specific financial situation, goals, or risk tolerance.
            </p>
          </div>
        </section>

        {/* Terms of Service */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Terms of Service</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-1">1. Acceptance of Terms</h3>
              <p>By accessing or using Faithnancial, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">2. Description of Service</h3>
              <p>Faithnancial is a personal finance organization tool that provides budget tracking, expense management, net worth monitoring, document storage, and estate planning organization features. The platform is a tool — not a substitute for professional financial guidance.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">3. Account & Subscription</h3>
              <p>You are responsible for maintaining the confidentiality of your account credentials. Subscriptions are offered on a monthly ($9.99/mo) or annual ($99/yr) basis. Free trial periods are 30 days with full access. You may cancel at any time through your profile menu.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">4. Cancellation & Data Retention</h3>
              <p>Upon cancellation or plan expiration, your account will be downgraded to the free tier. Your data will be retained and remain accessible if you reactivate your subscription. After 90 days of inactivity on a free plan, data may be permanently deleted as part of routine maintenance. We will attempt to notify you via email before any data deletion occurs.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">5. Refund Policy</h3>
              <p>Subscription fees are non-refundable except as required by applicable law. You may cancel at any time to prevent future charges.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">6. Acceptable Use</h3>
              <p>You agree not to misuse the platform, attempt to gain unauthorized access, or use the service for any unlawful purpose. You must not upload malicious files or attempt to compromise the security of the platform.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">7. Limitation of Liability</h3>
              <p>Faithnancial is provided "as is" and "as available" without warranties of any kind, either express or implied. We are not liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the platform, including but not limited to financial losses resulting from reliance on information provided through the service.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">8. Indemnification</h3>
              <p>You agree to indemnify and hold harmless Faithnancial, its operators, and affiliates from any claims, damages, or expenses arising from your use of the service or violation of these terms.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">9. Modifications</h3>
              <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
            </div>
          </div>
        </section>

        {/* Privacy Policy */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Privacy Policy</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-1">Information We Collect</h3>
              <p>We collect your email address, display name, and the financial data you voluntarily enter (bills, income, transactions, documents, estate information). If you connect a bank account via Plaid, we receive transaction data from your linked accounts.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">How We Use Your Data</h3>
              <p>Your data is used solely to provide the budgeting, tracking, and estate organization services you've signed up for. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Data Security</h3>
              <p>We use bank-level encryption (AES-256-GCM for sensitive fields, TLS for data in transit) and row-level security policies to ensure your data is accessible only to you. Sensitive credentials (e.g., bank tokens) are stored in isolated, restricted-access tables.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Data Retention</h3>
              <p>Active account data is retained as long as your account is active. After cancellation, data is retained for up to 90 days to allow for easy reactivation. After 90 days of inactivity on a free plan, data may be permanently deleted.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Third-Party Services</h3>
              <p>We may use third-party services (such as Plaid for bank connections and email delivery services for notifications). These services have their own privacy policies and data handling practices.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Your Rights</h3>
              <p>You may request deletion of your account and all associated data at any time by contacting support. You can export your data through the platform's features.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Cookies</h3>
              <p>We use essential cookies and local storage for authentication and session management only. We do not use tracking cookies or third-party advertising cookies.</p>
            </div>
          </div>
        </section>

        {/* No Investment Advice */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">No Investment or Tax Advice</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>Faithnancial does not provide investment recommendations, tax planning, or legal advice. Features such as net worth tracking, debt payoff planning, and spending analytics are organizational tools designed to help you visualize your financial data.</p>
            <p>AI-generated spending tips compare your data against national averages and are not personalized financial recommendations. Always consult a licensed professional for decisions regarding investments, taxes, insurance, or estate planning.</p>
            <p>Estate planning features (document storage, beneficiary tracking, trusted contacts) are organizational tools only and do not constitute legal estate planning. Consult an estate planning attorney for legally binding arrangements.</p>
          </div>
        </section>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Faithnancial. All rights reserved. For questions about these policies, contact support.
          </p>
        </div>
      </div>
    </div>
  );
}