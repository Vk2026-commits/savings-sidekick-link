import { useNavigate } from "react-router-dom";
import { Shield, Lock, FileText, TrendingUp, PiggyBank, Heart, ScrollText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: PiggyBank, label: "Track your spending" },
  { icon: TrendingUp, label: "Monitor your net worth" },
  { icon: Lock, label: "Store important documents securely" },
  { icon: ScrollText, label: "Organize your estate planning in one place" },
];

const trustItems = [
  { icon: Shield, text: "Bank-level encryption" },
  { icon: Lock, text: "Your data is private" },
  { icon: FileText, text: "No selling of your information" },
  { icon: Heart, text: "Secure document storage" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/30 backdrop-blur-md sticky top-0 z-20 bg-background/80">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight gradient-text">Faithnancial</span>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => navigate("/auth?signup=true")}>Start Free Trial</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="container max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Your financial life and estate plan —{" "}
            <span className="gradient-text">all in one place</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your money, organize your documents, and make sure everything is prepared when it matters most.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button size="lg" className="text-base px-8" onClick={() => navigate("/auth?signup=true")}>
              Start Free 30-Day Trial
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" onClick={() => {
              const el = document.getElementById("faithnancial-network");
              el?.scrollIntoView({ behavior: "smooth" });
            }}>
              Explore Faithnancial Network
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-4 border-t border-border/30">
        <div className="container max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-3xl md:text-4xl font-bold">More than a budget app</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            This platform helps you:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {features.map((f) => (
              <div key={f.label} className="glass-card p-5 flex items-start gap-4 text-left">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium leading-snug pt-2">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Driver */}
      <section className="py-20 px-4 border-t border-border/30 bg-card/30">
        <div className="container max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            If something happened tomorrow, would everything be in order?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Your finances, documents, and plans shouldn't be scattered across different places.
            This platform helps you bring everything together so you and your family are prepared.
          </p>
          <Button size="lg" onClick={() => navigate("/auth?signup=true")}>
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 px-4 border-t border-border/30">
        <div className="container max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustItems.map((t) => (
              <div key={t.text} className="flex flex-col items-center gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <t.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faithnancial Network (secondary) */}
      <section id="faithnancial-network" className="py-16 px-4 border-t border-border/30 bg-card/30">
        <div className="container max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold">Faithnancial Network</h2>
          <p className="text-muted-foreground">Connect, invest, and grow with others — available inside your dashboard.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 border-t border-border/30">
        <div className="container max-w-3xl mx-auto text-center space-y-6">
          <p className="text-lg text-muted-foreground italic">
            If something happened tomorrow, would your family know where everything is?
          </p>
          <Button size="lg" className="text-base px-8" onClick={() => navigate("/auth?signup=true")}>
            Start Your 30-Day Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 px-4">
        <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Faithnancial. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/partners/apply")} className="hover:text-foreground transition-colors">
              Become a Partner
            </button>
            <button onClick={() => navigate("/policies")} className="hover:text-foreground transition-colors">
              Terms & Policies
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
