import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HEIRLOOM_BASE = "https://heirloom.faithnancial.com";

export default function Estate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // Pass current user identity so the embedded app can detect / switch to the
  // correct account instead of showing a stale session from another user.
  const heirloomUrl = useMemo(() => {
    if (!user?.email) return HEIRLOOM_BASE;
    const params = new URLSearchParams({
      user_email: user.email,
      user_id: user.id,
      // cache-bust per user so the iframe is not reused across accounts
      _u: user.id,
    });
    return `${HEIRLOOM_BASE}/?${params.toString()}`;
  }, [user?.id, user?.email]);

  useEffect(() => {
    setStatus("loading");
    const timer = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "error" : s));
    }, 10000);
    return () => clearTimeout(timer);
  }, [heirloomUrl]);

  const reload = () => {
    setStatus("loading");
    if (iframeRef.current) iframeRef.current.src = heirloomUrl;
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate("/")}
        className="absolute top-3 left-3 z-20 shadow-lg backdrop-blur bg-background/80 hover:bg-background border border-border/60"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => window.open(heirloomUrl, "_blank", "noopener,noreferrer")}
        className="absolute top-3 right-3 z-20 shadow-lg backdrop-blur bg-background/80 hover:bg-background border border-border/60"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
        title="Open in a new tab and sign in if you see someone else's data"
      >
        <ExternalLink className="h-4 w-4 mr-1" /> Open in new tab
      </Button>

      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading Estate & Legacy…</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background p-6">
          <div className="max-w-md text-center space-y-4">
            <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">Estate planning is temporarily unavailable</h2>
            <p className="text-sm text-muted-foreground">
              We couldn't reach the Estate & Legacy service. Please try again in a few minutes.
            </p>
            <Button onClick={reload} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" /> Try again
            </Button>
          </div>
        </div>
      )}

      {/* key forces a full iframe remount whenever the signed-in user changes,
          so we never leak another user's cached session into the embed. */}
      <iframe
        key={user?.id ?? "anon"}
        ref={iframeRef}
        src={heirloomUrl}
        title="Heirloom Estate Planning"
        className="absolute inset-0 w-full h-full border-0 block"
        allow="clipboard-read; clipboard-write; fullscreen; payment"
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}
