import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBudget } from "@/hooks/useBudget";

export type PreparednessItemKey =
  // auto-detected keys
  | "budget_started"
  | "emergency_fund"
  | "debt_plan"
  | "giving_plan"
  | "investments_tracked"
  | "assets_tracked"
  | "will_completed"
  | "power_of_attorney"
  | "beneficiaries_assigned"
  | "insurance_recorded"
  | "financial_accounts_documented"
  // manual keys
  | "emergency_contacts_saved"
  | "instructions_for_family"
  | "trusted_contact_assigned";

export interface PreparednessItem {
  key: PreparednessItemKey;
  label: string;
  description: string;
  category: "financial" | "legal" | "family";
  weight: number;
  isComplete: boolean;
  isManual: boolean;
  ctaTab?: string; // tab id to navigate to (in main app)
}

const STATIC_DEFS: Omit<PreparednessItem, "isComplete">[] = [
  // financial foundations
  { key: "budget_started", label: "Budget started", description: "Add your bills and income to begin tracking.", category: "financial", weight: 8, isManual: false, ctaTab: "bills" },
  { key: "emergency_fund", label: "Emergency fund started", description: "Create a savings goal for unexpected expenses.", category: "financial", weight: 10, isManual: false, ctaTab: "savings" },
  { key: "debt_plan", label: "Debt plan in place", description: "Track liabilities and pick a payoff strategy.", category: "financial", weight: 8, isManual: false, ctaTab: "networth" },
  { key: "giving_plan", label: "Giving plan", description: "Add a giving / tithe category to your budget.", category: "financial", weight: 5, isManual: false, ctaTab: "budget" },
  { key: "investments_tracked", label: "Investments tracked", description: "Log retirement or brokerage accounts as assets.", category: "financial", weight: 6, isManual: false, ctaTab: "networth" },
  { key: "assets_tracked", label: "Assets tracked", description: "Add at least one asset to your net worth.", category: "financial", weight: 5, isManual: false, ctaTab: "networth" },
  { key: "financial_accounts_documented", label: "Financial accounts documented", description: "Record your bank, investment, and credit accounts in the legacy binder.", category: "legal", weight: 8, isManual: false, ctaTab: "estate" },
  // legacy / legal
  { key: "will_completed", label: "Will on file", description: "Upload or record your will details.", category: "legal", weight: 12, isManual: false, ctaTab: "estate" },
  { key: "power_of_attorney", label: "Power of attorney assigned", description: "Document who can act on your behalf.", category: "legal", weight: 10, isManual: false, ctaTab: "estate" },
  { key: "beneficiaries_assigned", label: "Beneficiaries listed", description: "Add the people who should inherit your accounts.", category: "legal", weight: 8, isManual: false, ctaTab: "estate" },
  { key: "insurance_recorded", label: "Insurance policies recorded", description: "Capture life, health, and property policies.", category: "legal", weight: 6, isManual: false, ctaTab: "estate" },
  // family / manual
  { key: "trusted_contact_assigned", label: "Trusted contact assigned", description: "Invite someone who can request access in an emergency.", category: "family", weight: 4, isManual: false, ctaTab: "estate" },
  { key: "emergency_contacts_saved", label: "Emergency contacts saved", description: "List the people your family should call first.", category: "family", weight: 5, isManual: true },
  { key: "instructions_for_family", label: "Instructions for family written", description: "Leave a note about how to access important info.", category: "family", weight: 5, isManual: true },
];

export function usePreparedness() {
  const { user } = useAuth();
  const budget = useBudget();
  const uid = user?.id;

  // manual checklist rows
  const [manual, setManual] = useState<Record<string, boolean>>({});
  // estate-derived counts
  const [estateCounts, setEstateCounts] = useState({
    beneficiaries: 0,
    accounts: 0,
    insurance: 0,
    legalDocs: 0,
    legalDocTypes: [] as string[],
    trustedContacts: 0,
    digitalAccess: 0,
  });
  const [loaded, setLoaded] = useState(false);

  const loadAll = useCallback(async () => {
    if (!uid) return;
    const [mRes, bRes, aRes, iRes, lRes, tRes, dRes] = await Promise.all([
      supabase.from("preparedness_checklist").select("item_key, is_complete").eq("user_id", uid),
      supabase.from("estate_beneficiaries").select("id", { count: "exact", head: true }).eq("user_id", uid),
      supabase.from("estate_accounts").select("id", { count: "exact", head: true }).eq("user_id", uid),
      supabase.from("estate_insurance").select("id", { count: "exact", head: true }).eq("user_id", uid),
      supabase.from("estate_legal_documents").select("document_type").eq("user_id", uid),
      supabase.from("estate_trusted_contacts").select("id", { count: "exact", head: true }).eq("user_id", uid),
      supabase.from("estate_digital_access").select("id", { count: "exact", head: true }).eq("user_id", uid),
    ]);

    const manualMap: Record<string, boolean> = {};
    (mRes.data || []).forEach((r: any) => { manualMap[r.item_key] = !!r.is_complete; });
    setManual(manualMap);

    const legalTypes = (lRes.data || []).map((r: any) => r.document_type);
    setEstateCounts({
      beneficiaries: bRes.count || 0,
      accounts: aRes.count || 0,
      insurance: iRes.count || 0,
      legalDocs: legalTypes.length,
      legalDocTypes: legalTypes,
      trustedContacts: tRes.count || 0,
      digitalAccess: dRes.count || 0,
    });
    setLoaded(true);
  }, [uid]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const toggleManual = useCallback(async (key: PreparednessItemKey, isComplete: boolean) => {
    if (!uid) return;
    setManual(prev => ({ ...prev, [key]: isComplete })); // optimistic
    const { error } = await supabase
      .from("preparedness_checklist")
      .upsert(
        { user_id: uid, item_key: key, is_complete: isComplete, completed_at: isComplete ? new Date().toISOString() : null },
        { onConflict: "user_id,item_key" }
      );
    if (error) {
      // revert
      setManual(prev => ({ ...prev, [key]: !isComplete }));
    }
  }, [uid]);

  const items: PreparednessItem[] = useMemo(() => {
    const hasGiving = budget.bills.some(b => /giv|tith|charit|donat/i.test(b.name) || b.category === "giving") ||
      budget.categoryBudgets.some(c => /giv|tith|charit/i.test(c.category));
    const hasInvestmentAsset = budget.assets.some(a => /invest|retire|401|ira|brok|stock|bond/i.test(a.type) || /invest|retire|401|ira|brok/i.test(a.name));

    const autoComplete: Record<string, boolean> = {
      budget_started: budget.bills.length > 0 && budget.incomeSources.length > 0,
      emergency_fund: budget.savingsGoals.some(g => /emergency|rainy/i.test(g.name)) || budget.savingsGoals.some(g => g.currentAmount > 0),
      debt_plan: budget.liabilities.length > 0,
      giving_plan: hasGiving,
      investments_tracked: hasInvestmentAsset,
      assets_tracked: budget.assets.length > 0,
      financial_accounts_documented: estateCounts.accounts > 0 || budget.paymentAccounts.length > 1,
      will_completed: estateCounts.legalDocTypes.some(t => /will/i.test(t)),
      power_of_attorney: estateCounts.legalDocTypes.some(t => /power|poa|attorney/i.test(t)),
      beneficiaries_assigned: estateCounts.beneficiaries > 0,
      insurance_recorded: estateCounts.insurance > 0,
      trusted_contact_assigned: estateCounts.trustedContacts > 0,
    };

    return STATIC_DEFS.map(def => ({
      ...def,
      isComplete: def.isManual ? !!manual[def.key] : !!autoComplete[def.key],
    }));
  }, [budget.bills, budget.incomeSources, budget.savingsGoals, budget.liabilities, budget.assets, budget.categoryBudgets, budget.paymentAccounts, estateCounts, manual]);

  const totalWeight = useMemo(() => items.reduce((s, i) => s + i.weight, 0), [items]);
  const earnedWeight = useMemo(() => items.filter(i => i.isComplete).reduce((s, i) => s + i.weight, 0), [items]);
  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  const recommendations = useMemo(() => {
    return items
      .filter(i => !i.isComplete)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
  }, [items]);

  return {
    loaded,
    score,
    items,
    recommendations,
    toggleManual,
    refetch: loadAll,
  };
}
