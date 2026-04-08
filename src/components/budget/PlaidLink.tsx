import { useState, useCallback, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, RefreshCw, Unlink, Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LinkedAccount {
  id: string;
  institution_name: string;
  institution_id: string | null;
  created_at: string;
}

const PlaidLink = () => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchLinkedAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from("linked_accounts")
      .select("id, institution_name, institution_id, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLinkedAccounts(data);
    }
  }, []);

  const createLinkToken = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const { data, error } = await supabase.functions.invoke("create-link-token", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      setLinkToken(data.link_token);
    } catch (err) {
      toast.error("Failed to initialize bank connection");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinkedAccounts();
  }, [fetchLinkedAccounts]);

  const onSuccess = useCallback(async (publicToken: string, metadata: { institution?: { name: string; institution_id: string } }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const { data, error } = await supabase.functions.invoke("exchange-public-token", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          public_token: publicToken,
          institution: metadata.institution,
        },
      });

      if (error) throw error;
      toast.success(`${metadata.institution?.name || "Bank"} connected successfully!`);
      fetchLinkedAccounts();
      setLinkToken(null);
    } catch (err) {
      toast.error("Failed to link account");
      console.error(err);
    }
  }, [fetchLinkedAccounts]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: () => setLinkToken(null),
  });

  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  const syncTransactions = useCallback(async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const { data, error } = await supabase.functions.invoke("sync-transactions", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      toast.success(`Synced ${data.imported} transactions`);
    } catch (err) {
      toast.error("Failed to sync transactions");
      console.error(err);
    } finally {
      setSyncing(false);
    }
  }, []);

  const unlinkAccount = useCallback(async (id: string) => {
    const { error } = await supabase.from("linked_accounts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to unlink account");
    } else {
      toast.success("Account unlinked");
      fetchLinkedAccounts();
    }
  }, [fetchLinkedAccounts]);

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            Linked Bank Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={createLinkToken} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Building2 className="h-4 w-4 mr-2" />}
              Link Bank Account
            </Button>
            {linkedAccounts.length > 0 && (
              <Button variant="outline" onClick={syncTransactions} disabled={syncing}>
                {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Sync Transactions
              </Button>
            )}
          </div>

          {linkedAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bank accounts linked yet. Click "Link Bank Account" to connect your bank or credit card.
            </p>
          ) : (
            <div className="space-y-2">
              {linkedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{account.institution_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Connected {new Date(account.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => unlinkAccount(account.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaidLink;
