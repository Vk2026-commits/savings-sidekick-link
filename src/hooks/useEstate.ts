import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Row = Record<string, any>;

function useEstateTable<T extends Row>(tableName: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: rows, error } = await (supabase as any)
      .from(tableName)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading data", description: error.message, variant: "destructive" });
    } else {
      setData(rows || []);
    }
    setLoading(false);
  }, [user, tableName]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (row: Partial<T>) => {
    if (!user) return;
    const { error } = await (supabase as any)
      .from(tableName)
      .insert({ ...row, user_id: user.id });
    if (error) {
      toast({ title: "Error adding", description: error.message, variant: "destructive" });
    } else {
      await fetch();
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    if (!user) return;
    const { error } = await (supabase as any)
      .from(tableName)
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error updating", description: error.message, variant: "destructive" });
    } else {
      await fetch();
    }
  };

  const remove = async (id: string) => {
    if (!user) return;
    const { error } = await (supabase as any)
      .from(tableName)
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      await fetch();
    }
  };

  return { data, loading, add, update, remove, refetch: fetch };
}

export function useEstatePeople() { return useEstateTable("estate_people"); }
export function useEstateBeneficiaries() { return useEstateTable("estate_beneficiaries"); }
export function useEstateAccounts() { return useEstateTable("estate_accounts"); }
export function useEstateInsurance() { return useEstateTable("estate_insurance"); }
export function useEstateProperty() { return useEstateTable("estate_property"); }
export function useEstateDigitalAccess() { return useEstateTable("estate_digital_access"); }
export function useEstateLegalDocuments() { return useEstateTable("estate_legal_documents"); }
export function useEstateDocuments() { return useEstateTable("estate_documents"); }
export function useEstateWishes() { return useEstateTable("estate_wishes"); }
export function useEstateTrustedContacts() { return useEstateTable("estate_trusted_contacts"); }
export function useEstateAccessRequests() { return useEstateTable("estate_access_requests"); }
export function useEstateAuditLog() { return useEstateTable("estate_audit_log"); }
export function useEstateTabStatus() { return useEstateTable("estate_tab_status"); }
export function useEstateBeneficiaryLinks() { return useEstateTable("estate_beneficiary_links"); }
