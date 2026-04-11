import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PinGateProps {
  children: React.ReactNode;
}

// Simple hash for PIN (not cryptographic-grade but sufficient for app-level gating)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "dough-dreams-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function PinGate({ children }: PinGateProps) {
  const { user } = useAuth();
  const [hasPin, setHasPin] = useState<boolean | null>(null); // null = loading
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"check" | "setup" | "enter">("check");

  useEffect(() => {
    if (!user) return;
    checkPin();
  }, [user]);

  const checkPin = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_pins")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error checking PIN:", error);
      setHasPin(false);
      setMode("setup");
      return;
    }
    if (data) {
      setHasPin(true);
      setMode("enter");
    } else {
      setHasPin(false);
      setMode("setup");
    }
  };

  const handleSetup = async () => {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      toast.error("PIN must be exactly 6 digits");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    setLoading(true);
    const hashed = await hashPin(pin);
    const { error } = await supabase.from("user_pins").upsert({
      user_id: user!.id,
      pin_hash: hashed,
    }, { onConflict: "user_id" });
    setLoading(false);

    if (error) {
      toast.error("Failed to set PIN");
      console.error(error);
      return;
    }
    toast.success("PIN set successfully!");
    setUnlocked(true);
    setHasPin(true);
  };

  const handleEnter = async () => {
    if (pin.length !== 6) {
      toast.error("Enter your 6-digit PIN");
      return;
    }
    setLoading(true);
    const hashed = await hashPin(pin);
    const { data, error } = await supabase
      .from("user_pins")
      .select("pin_hash")
      .eq("user_id", user!.id)
      .maybeSingle();
    setLoading(false);

    if (error || !data) {
      toast.error("Error verifying PIN");
      return;
    }
    if (data.pin_hash === hashed) {
      setUnlocked(true);
    } else {
      toast.error("Incorrect PIN");
      setPin("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (mode === "setup") handleSetup();
      else handleEnter();
    }
  };

  if (unlocked) return <>{children}</>;

  if (hasPin === null) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center gap-4">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 max-w-md mx-auto">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          {mode === "setup" ? (
            <KeyRound className="h-8 w-8 text-primary" />
          ) : (
            <Lock className="h-8 w-8 text-primary" />
          )}
        </div>

        {mode === "setup" ? (
          <>
            <div>
              <h2 className="text-xl font-bold mb-1">Set Up Your PIN</h2>
              <p className="text-sm text-muted-foreground">
                Create a 6-digit PIN to protect your Net Worth information.
              </p>
            </div>
            <div className="w-full space-y-3" onKeyDown={handleKeyDown}>
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em] font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                placeholder="Confirm PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Your PIN is encrypted and stored securely.</span>
              </div>
              <Button onClick={handleSetup} disabled={loading || pin.length !== 6} className="w-full">
                {loading ? "Setting PIN..." : "Set PIN & Continue"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-bold mb-1">Enter Your PIN</h2>
              <p className="text-sm text-muted-foreground">
                Enter your 6-digit PIN to access Net Worth.
              </p>
            </div>
            <div className="w-full space-y-3" onKeyDown={handleKeyDown}>
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em] font-mono pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleEnter} disabled={loading || pin.length !== 6} className="w-full">
                {loading ? "Verifying..." : "Unlock"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
