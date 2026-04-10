import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import type { Bill, SavingsGoal, CategoryBudget, Transaction, Asset, Liability, IncomeSource, ExpenseGroup, PaymentAccount, BudgetState } from "@/types/budget";
import { getMonthlyAmount, DEFAULT_EXPENSE_GROUPS, DEFAULT_PAYMENT_ACCOUNTS, getAssignedBillMonth } from "@/types/budget";
import { useToast } from "@/hooks/use-toast";

function getMonthlyIncome(amount: number, freq: IncomeSource["frequency"]): number {
  switch (freq) {
    case "weekly": return amount * 4.33;
    case "biweekly": return amount * 2.17;
    case "monthly": return amount;
    case "yearly": return amount / 12;
  }
}

// Map DB row to app type helpers
function mapBill(r: any): Bill {
  return {
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    category: r.category,
    frequency: r.frequency,
    dueDate: r.due_date,
    isPaid: r.is_paid,
    autoPay: r.auto_pay,
    owner: r.owner,
    paymentAccountId: r.payment_account_id ?? undefined,
    month: getAssignedBillMonth({ month: r.month ?? undefined, paidDate: r.paid_date ?? undefined }),
    isRecurring: r.is_recurring ?? false,
    pendingReview: r.pending_review ?? false,
    paidDate: r.paid_date ?? undefined,
  };
}
function mapIncome(r: any): IncomeSource {
  return { id: r.id, name: r.name, amount: Number(r.amount), frequency: r.frequency, type: r.type };
}
function mapGoal(r: any): SavingsGoal {
  return { id: r.id, name: r.name, targetAmount: Number(r.target_amount), currentAmount: Number(r.current_amount), color: r.color };
}
function mapCatBudget(r: any): CategoryBudget {
  return { id: r.id, category: r.category, limit: Number(r.budget_limit) };
}
function mapTxn(r: any): Transaction {
  return { id: r.id, date: r.date, description: r.description, amount: Number(r.amount), type: r.type, category: r.category, notes: r.notes ?? undefined };
}
function mapExpGroup(r: any): ExpenseGroup {
  return { id: r.id, name: r.name };
}
function mapPayAcct(r: any): PaymentAccount {
  return { id: r.id, name: r.name, nickname: r.nickname, type: r.type };
}
function mapAsset(r: any): Asset {
  return { id: r.id, name: r.name, value: Number(r.value), type: r.type };
}
function mapLiability(r: any): Liability {
  return { id: r.id, name: r.name, balance: Number(r.balance), interestRate: Number(r.interest_rate), minimumPayment: Number(r.minimum_payment), type: r.type };
}

export function useBudget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const uid = user?.id;

  const [bills, setBills] = useState<Bill[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load all data on mount
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      const [bRes, iRes, sRes, cRes, tRes, eRes, pRes, aRes, lRes] = await Promise.all([
        supabase.from("bills").select("*"),
        supabase.from("income_sources").select("*"),
        supabase.from("savings_goals").select("*"),
        supabase.from("category_budgets").select("*"),
        supabase.from("transactions").select("*"),
        supabase.from("expense_groups").select("*"),
        supabase.from("payment_accounts").select("*"),
        supabase.from("assets").select("*"),
        supabase.from("liabilities").select("*"),
      ]);
      if (cancelled) return;
      setBills((bRes.data || []).map(mapBill));
      setIncomeSources((iRes.data || []).map(mapIncome));
      setSavingsGoals((sRes.data || []).map(mapGoal));
      setCategoryBudgets((cRes.data || []).map(mapCatBudget));
      setTransactions((tRes.data || []).map(mapTxn));
      setExpenseGroups((eRes.data || []).map(mapExpGroup));
      setPaymentAccounts((pRes.data || []).map(mapPayAcct));
      setAssets((aRes.data || []).map(mapAsset));
      setLiabilities((lRes.data || []).map(mapLiability));
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [uid]);

  // Seed defaults if first time
  useEffect(() => {
    if (!uid || !loaded) return;
    if (expenseGroups.length === 0) {
      // seed default expense groups
      DEFAULT_EXPENSE_GROUPS.forEach(g => {
        supabase.from("expense_groups").insert({ user_id: uid, name: g.name }).select().single().then(({ data }) => {
          if (data) setExpenseGroups(prev => [...prev, mapExpGroup(data)]);
        });
      });
    }
    if (paymentAccounts.length === 0) {
      DEFAULT_PAYMENT_ACCOUNTS.forEach(a => {
        supabase.from("payment_accounts").insert({ user_id: uid, name: a.name, nickname: a.nickname, type: a.type }).select().single().then(({ data }) => {
          if (data) setPaymentAccounts(prev => [...prev, mapPayAcct(data)]);
        });
      });
    }
  }, [uid, loaded]);

  const showError = (msg: string) => toast({ title: "Error", description: msg, variant: "destructive" });

  // Monthly income computed from sources
  const monthlyIncome = useMemo(() => incomeSources.reduce((sum, src) => sum + getMonthlyIncome(src.amount, src.frequency), 0), [incomeSources]);

  const setMonthlyIncome = useCallback((_income: number) => {
    // no-op, income derived from sources
  }, []);

  // ---- BILLS ----
  const addBill = useCallback(async (bill: Omit<Bill, "id">) => {
    if (!uid) return;
    const assignedMonth = getAssignedBillMonth({ month: bill.month, paidDate: bill.paidDate });
    const { data, error } = await supabase.from("bills").insert({
      user_id: uid, name: bill.name, amount: bill.amount, category: bill.category, frequency: bill.frequency,
      due_date: bill.dueDate, is_paid: bill.isPaid, auto_pay: bill.autoPay, owner: bill.owner,
      payment_account_id: bill.paymentAccountId ?? null, month: assignedMonth ?? null,
      is_recurring: bill.isRecurring ?? false, pending_review: bill.pendingReview ?? false, paid_date: bill.paidDate ?? null,
    }).select().single();
    if (error) return showError(error.message);
    if (data) setBills(prev => [...prev, mapBill(data)]);
  }, [uid]);

  const updateBill = useCallback(async (id: string, updates: Partial<Bill>) => {
    const existingBill = bills.find((bill) => bill.id === id);
    const shouldRecalculateMonth = updates.paidDate !== undefined || updates.month !== undefined;
    const nextMonth = shouldRecalculateMonth
      ? getAssignedBillMonth({
          month: updates.month !== undefined ? updates.month : existingBill?.month,
          paidDate: updates.paidDate !== undefined ? updates.paidDate : existingBill?.paidDate,
        })
      : existingBill?.month;
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
    if (updates.autoPay !== undefined) dbUpdates.auto_pay = updates.autoPay;
    if (updates.owner !== undefined) dbUpdates.owner = updates.owner;
    if (updates.paymentAccountId !== undefined) dbUpdates.payment_account_id = updates.paymentAccountId;
    if (shouldRecalculateMonth) dbUpdates.month = nextMonth ?? null;
    if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
    if (updates.pendingReview !== undefined) dbUpdates.pending_review = updates.pendingReview;
    if (updates.paidDate !== undefined) dbUpdates.paid_date = updates.paidDate;
    const { error } = await supabase.from("bills").update(dbUpdates).eq("id", id);
    if (error) return showError(error.message);
    setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates, ...(shouldRecalculateMonth ? { month: nextMonth } : {}) } : b));
  }, [bills]);

  const deleteBill = useCallback(async (id: string) => {
    const { error } = await supabase.from("bills").delete().eq("id", id);
    if (error) return showError(error.message);
    setBills(prev => prev.filter(b => b.id !== id));
  }, []);

  // ---- INCOME SOURCES ----
  const addIncomeSource = useCallback(async (source: Omit<IncomeSource, "id">) => {
    if (!uid) return;
    const { data, error } = await supabase.from("income_sources").insert({
      user_id: uid, name: source.name, amount: source.amount, frequency: source.frequency, type: source.type,
    }).select().single();
    if (error) return showError(error.message);
    if (data) setIncomeSources(prev => [...prev, mapIncome(data)]);
  }, [uid]);

  const updateIncomeSource = useCallback(async (id: string, updates: Partial<IncomeSource>) => {
    const { error } = await supabase.from("income_sources").update(updates).eq("id", id);
    if (error) return showError(error.message);
    setIncomeSources(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteIncomeSource = useCallback(async (id: string) => {
    const { error } = await supabase.from("income_sources").delete().eq("id", id);
    if (error) return showError(error.message);
    setIncomeSources(prev => prev.filter(s => s.id !== id));
  }, []);

  // ---- SAVINGS GOALS ----
  const addSavingsGoal = useCallback(async (goal: Omit<SavingsGoal, "id">) => {
    if (!uid) return;
    const { data, error } = await supabase.from("savings_goals").insert({
      user_id: uid, name: goal.name, target_amount: goal.targetAmount, current_amount: goal.currentAmount, color: goal.color,
    }).select().single();
    if (error) return showError(error.message);
    if (data) setSavingsGoals(prev => [...prev, mapGoal(data)]);
  }, [uid]);

  const updateSavingsGoal = useCallback(async (id: string, updates: Partial<SavingsGoal>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
    if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    const { error } = await supabase.from("savings_goals").update(dbUpdates).eq("id", id);
    if (error) return showError(error.message);
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteSavingsGoal = useCallback(async (id: string) => {
    const { error } = await supabase.from("savings_goals").delete().eq("id", id);
    if (error) return showError(error.message);
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  // ---- CATEGORY BUDGETS ----
  const addCategoryBudget = useCallback(async (budget: Omit<CategoryBudget, "id">) => {
    if (!uid) return;
    const { data, error } = await supabase.from("category_budgets").insert({
      user_id: uid, category: budget.category, budget_limit: budget.limit,
    }).select().single();
    if (error) return showError(error.message);
    if (data) setCategoryBudgets(prev => [...prev, mapCatBudget(data)]);
  }, [uid]);

  const updateCategoryBudget = useCallback(async (id: string, updates: Partial<CategoryBudget>) => {
    const dbUpdates: any = {};
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.limit !== undefined) dbUpdates.budget_limit = updates.limit;
    const { error } = await supabase.from("category_budgets").update(dbUpdates).eq("id", id);
    if (error) return showError(error.message);
    setCategoryBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const deleteCategoryBudget = useCallback(async (id: string) => {
    const { error } = await supabase.from("category_budgets").delete().eq("id", id);
    if (error) return showError(error.message);
    setCategoryBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  // ---- TRANSACTIONS ----
  const addTransaction = useCallback(async (txn: Omit<Transaction, "id">) => {
    if (!uid) return;
    const { data, error } = await supabase.from("transactions").insert({
      user_id: uid, date: txn.date, description: txn.description, amount: txn.amount, type: txn.type, category: txn.category, notes: txn.notes ?? null,
    }).select().single();
    if (error) return showError(error.message);
    if (data) setTransactions(prev => [...prev, mapTxn(data)]);
  }, [uid]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const { error } = await supabase.from("transactions").update(updates).eq("id", id);
    if (error) return showError(error.message);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) return showError(error.message);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // ---- EXPENSE GROUPS ----
  const addExpenseGroup = useCallback(async (name: string) => {
    if (!uid) return;
    const { data, error } = await supabase.from("expense_groups").insert({ user_id: uid, name }).select().single();
    if (error) return showError(error.message);
    if (data) setExpenseGroups(prev => [...prev, mapExpGroup(data)]);
  }, [uid]);

  const updateExpenseGroup = useCallback(async (id: string, name: string) => {
    const { error } = await supabase.from("expense_groups").update({ name }).eq("id", id);
    if (error) return showError(error.message);
    setExpenseGroups(prev => prev.map(g => g.id === id ? { ...g, name } : g));
  }, []);

  const deleteExpenseGroup = useCallback(async (id: string) => {
    // Also delete bills owned by this group
    await supabase.from("bills").delete().eq("owner", id);
    const { error } = await supabase.from("expense_groups").delete().eq("id", id);
    if (error) return showError(error.message);
    setBills(prev => prev.filter(b => b.owner !== id));
    setExpenseGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  // ---- PAYMENT ACCOUNTS ----
  const addPaymentAccount = useCallback(async (account: Omit<PaymentAccount, "id">) => {
    if (!uid) return;
    const { data, error } = await supabase.from("payment_accounts").insert({
      user_id: uid, name: account.name, nickname: account.nickname, type: account.type,
    }).select().single();
    if (error) return showError(error.message);
    if (data) setPaymentAccounts(prev => [...prev, mapPayAcct(data)]);
  }, [uid]);

  const updatePaymentAccount = useCallback(async (id: string, updates: Partial<PaymentAccount>) => {
    const { error } = await supabase.from("payment_accounts").update(updates).eq("id", id);
    if (error) return showError(error.message);
    setPaymentAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deletePaymentAccount = useCallback(async (id: string) => {
    const { error } = await supabase.from("payment_accounts").delete().eq("id", id);
    if (error) return showError(error.message);
    setPaymentAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  // ---- ASSETS ----
  const addAsset = useCallback(async (asset: Omit<Asset, "id">) => {
    if (!uid) return;
    const { data, error } = await supabase.from("assets").insert({
      user_id: uid, name: asset.name, value: asset.value, type: asset.type,
    }).select().single();
    if (error) return showError(error.message);
    if (data) setAssets(prev => [...prev, mapAsset(data)]);
  }, [uid]);

  const updateAsset = useCallback(async (id: string, updates: Partial<Asset>) => {
    const { error } = await supabase.from("assets").update(updates).eq("id", id);
    if (error) return showError(error.message);
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    const { error } = await supabase.from("assets").delete().eq("id", id);
    if (error) return showError(error.message);
    setAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  // ---- LIABILITIES ----
  const addLiability = useCallback(async (liability: Omit<Liability, "id">) => {
    if (!uid) return;
    const { data, error } = await supabase.from("liabilities").insert({
      user_id: uid, name: liability.name, balance: liability.balance, interest_rate: liability.interestRate, minimum_payment: liability.minimumPayment, type: liability.type,
    }).select().single();
    if (error) return showError(error.message);
    if (data) setLiabilities(prev => [...prev, mapLiability(data)]);
  }, [uid]);

  const updateLiability = useCallback(async (id: string, updates: Partial<Liability>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
    if (updates.interestRate !== undefined) dbUpdates.interest_rate = updates.interestRate;
    if (updates.minimumPayment !== undefined) dbUpdates.minimum_payment = updates.minimumPayment;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    const { error } = await supabase.from("liabilities").update(dbUpdates).eq("id", id);
    if (error) return showError(error.message);
    setLiabilities(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteLiability = useCallback(async (id: string) => {
    const { error } = await supabase.from("liabilities").delete().eq("id", id);
    if (error) return showError(error.message);
    setLiabilities(prev => prev.filter(l => l.id !== id));
  }, []);

  // Computed values
  const totalMonthlyBills = bills.reduce((sum, bill) => sum + getMonthlyAmount(bill.amount, bill.frequency), 0);
  const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const remaining = monthlyIncome - totalMonthlyBills;
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
  const netWorth = totalAssets - totalLiabilities;
  const totalMinimumPayments = liabilities.reduce((sum, l) => sum + l.minimumPayment, 0);

  return {
    monthlyIncome,
    incomeSources,
    bills,
    savingsGoals,
    categoryBudgets,
    transactions,
    expenseGroups,
    paymentAccounts,
    assets,
    liabilities,
    setMonthlyIncome,
    addBill, updateBill, deleteBill,
    addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    addCategoryBudget, updateCategoryBudget, deleteCategoryBudget,
    addTransaction, updateTransaction, deleteTransaction,
    addIncomeSource, updateIncomeSource, deleteIncomeSource,
    addExpenseGroup, updateExpenseGroup, deleteExpenseGroup,
    addPaymentAccount, updatePaymentAccount, deletePaymentAccount,
    addAsset, updateAsset, deleteAsset,
    addLiability, updateLiability, deleteLiability,
    totalMonthlyBills, totalSavingsTarget, totalSaved, remaining,
    totalAssets, totalLiabilities, netWorth, totalMinimumPayments,
  };
}
