import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "ready" | "already" | "invalid" | "submitting" | "success" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`, {
      headers: { apikey: supabaseAnonKey },
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) { setState("invalid"); return; }
        if (data.valid === false && data.reason === "already_unsubscribed") { setState("already"); return; }
        if (data.valid === true) { setState("ready"); return; }
        setState("invalid");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState("submitting");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
    if (error) { setErrorMsg(error.message); setState("error"); return; }
    if ((data as any)?.success === false) { setState("already"); return; }
    setState("success");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {state === "loading" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Verifying your link…</p>
            </div>
          )}
          {state === "ready" && (
            <>
              <p className="text-sm text-muted-foreground">
                Click below to unsubscribe from Faithnancial emails. You can resubscribe anytime by contacting support.
              </p>
              <Button onClick={confirm} className="w-full" variant="destructive">
                Confirm Unsubscribe
              </Button>
            </>
          )}
          {state === "submitting" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Processing…</p>
            </div>
          )}
          {state === "success" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="font-medium">You're unsubscribed</p>
              <p className="text-sm text-muted-foreground">You won't receive any more emails from us.</p>
            </div>
          )}
          {state === "already" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="font-medium">Already unsubscribed</p>
              <p className="text-sm text-muted-foreground">This email is already removed from our list.</p>
            </div>
          )}
          {state === "invalid" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="font-medium">Invalid or expired link</p>
              <p className="text-sm text-muted-foreground">This unsubscribe link is no longer valid.</p>
            </div>
          )}
          {state === "error" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm text-muted-foreground">{errorMsg || "Please try again later."}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
