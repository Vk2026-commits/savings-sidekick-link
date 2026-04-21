import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";

const HEIRLOOM_URL = "https://heirloom.faithnancial.com";

export default function Estate() {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    setStatus("loading");
    const timer = setTimeout(() => {
      // If onLoad never fires within 8s, assume the domain is unreachable.
      setStatus((s) => (s === "loading" ? "error" : s));
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const reload = () => {
    setStatus("loading");
    if (iframeRef.current) iframeRef.current.src = HEIRLOOM_URL;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Budget
        </Button>
        <h1 className="text-base font-semibold">Estate & Legacy Planning</h1>
      </header>

      <div className="relative flex-1">
        {status === "error" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background p-6">
            <div className="max-w-md text-center space-y-4">
              <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground" />
              <h2 className="text-lg font-semibold">Estate planning is temporarily unavailable</h2>
              <p className="text-sm text-muted-foreground">
                We couldn't reach the Estate & Legacy service. This usually means the
                connection is still being set up or there's a brief outage. Please try again
                in a few minutes.
              </p>
              <Button onClick={reload} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" /> Try again
              </Button>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={HEIRLOOM_URL}
          title="Heirloom Estate Planning"
          className="absolute inset-0 w-full h-full border-0"
          allow="clipboard-read; clipboard-write; fullscreen"
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
        />
      </div>
    </div>
  );
}
