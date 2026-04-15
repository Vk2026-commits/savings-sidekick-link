import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned: boolean;
  banned_until: string | null;
  display_name: string | null;
  tier: string;
  trial_expires_at: string | null;
}

export interface UserStats {
  bills: number;
  transactions: number;
  income_sources: number;
  savings_goals: number;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); setLoading(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => {
        setIsAdmin(!!data);
        setLoading(false);
      });
  }, [user]);

  const invokeAdmin = useCallback(async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action, ...params },
    });
    if (error) throw error;
    return data;
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await invokeAdmin("list_users");
      setUsers(data.users || []);
    } finally {
      setUsersLoading(false);
    }
  }, [invokeAdmin]);

  const resetPassword = useCallback(async (userId: string, newPassword: string) => {
    return invokeAdmin("reset_password", { userId, newPassword });
  }, [invokeAdmin]);

  const toggleBan = useCallback(async (userId: string, ban: boolean) => {
    await invokeAdmin("toggle_ban", { userId, ban });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: ban } : u));
  }, [invokeAdmin]);

  const upgradePlan = useCallback(async (userId: string, tier: string) => {
    const { error } = await supabase.rpc("admin_upgrade_subscription" as any, { target_user_id: userId, new_tier: tier });
    if (error) throw error;
    const trialExpires = tier === "trial_30" 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : tier === "trial_90"
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        : null;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier, trial_expires_at: trialExpires } : u));
  }, []);

  const deleteUserData = useCallback(async (userId: string) => {
    return invokeAdmin("delete_user_data", { userId });
  }, [invokeAdmin]);

  const getUserStats = useCallback(async (userId: string): Promise<UserStats> => {
    return invokeAdmin("get_user_stats", { userId });
  }, [invokeAdmin]);

  const sendTrialEmail = useCallback(async (userId: string, trialDays: number) => {
    const code = generateTrialCode();
    const { data, error } = await supabase.functions.invoke("send-trial-email", {
      body: { userId, trialDays, trialCode: code },
    });
    if (error) throw error;
    // Update local state
    const tier = trialDays === 30 ? "trial_30" : "trial_90";
    const trialExpires = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier, trial_expires_at: trialExpires } : u));
    return { ...data, trialCode: code };
  }, []);

  return { isAdmin, loading, users, usersLoading, loadUsers, resetPassword, toggleBan, upgradePlan, deleteUserData, getUserStats, sendTrialEmail };
}

function generateTrialCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "FN-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
