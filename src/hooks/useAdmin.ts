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
    await invokeAdmin("upgrade_plan", { userId, tier });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier } : u));
  }, [invokeAdmin]);

  const deleteUserData = useCallback(async (userId: string) => {
    return invokeAdmin("delete_user_data", { userId });
  }, [invokeAdmin]);

  const getUserStats = useCallback(async (userId: string): Promise<UserStats> => {
    return invokeAdmin("get_user_stats", { userId });
  }, [invokeAdmin]);

  return { isAdmin, loading, users, usersLoading, loadUsers, resetPassword, toggleBan, upgradePlan, deleteUserData, getUserStats };
}
