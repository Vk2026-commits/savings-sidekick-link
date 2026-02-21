import { useState, useEffect, useCallback } from "react";
import type { Bill, SavingsGoal, CategoryBudget, Transaction, Asset, Liability, BudgetState } from "@/types/budget";
import { getMonthlyAmount } from "@/types/budget";

const STORAGE_KEY = "budget-app-data";

const defaultState: BudgetState = {
  monthlyIncome: 0,
  bills: [],
  savingsGoals: [],
  categoryBudgets: [],
  transactions: [],
  assets: [],
  liabilities: [],
};

function loadState(): BudgetState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  } catch {
    return defaultState;
  }
}

export function useBudget() {
  const [state, setState] = useState<BudgetState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Income
  const setMonthlyIncome = useCallback((income: number) => {
    setState((s) => ({ ...s, monthlyIncome: income }));
  }, []);

  // Bills CRUD
  const addBill = useCallback((bill: Omit<Bill, "id">) => {
    setState((s) => ({ ...s, bills: [...s.bills, { ...bill, id: crypto.randomUUID() }] }));
  }, []);
  const updateBill = useCallback((id: string, updates: Partial<Bill>) => {
    setState((s) => ({ ...s, bills: s.bills.map((b) => (b.id === id ? { ...b, ...updates } : b)) }));
  }, []);
  const deleteBill = useCallback((id: string) => {
    setState((s) => ({ ...s, bills: s.bills.filter((b) => b.id !== id) }));
  }, []);

  // Savings Goals CRUD
  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, "id">) => {
    setState((s) => ({ ...s, savingsGoals: [...s.savingsGoals, { ...goal, id: crypto.randomUUID() }] }));
  }, []);
  const updateSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setState((s) => ({ ...s, savingsGoals: s.savingsGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)) }));
  }, []);
  const deleteSavingsGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, savingsGoals: s.savingsGoals.filter((g) => g.id !== id) }));
  }, []);

  // Category Budgets CRUD
  const addCategoryBudget = useCallback((budget: Omit<CategoryBudget, "id">) => {
    setState((s) => ({ ...s, categoryBudgets: [...s.categoryBudgets, { ...budget, id: crypto.randomUUID() }] }));
  }, []);
  const updateCategoryBudget = useCallback((id: string, updates: Partial<CategoryBudget>) => {
    setState((s) => ({ ...s, categoryBudgets: s.categoryBudgets.map((b) => (b.id === id ? { ...b, ...updates } : b)) }));
  }, []);
  const deleteCategoryBudget = useCallback((id: string) => {
    setState((s) => ({ ...s, categoryBudgets: s.categoryBudgets.filter((b) => b.id !== id) }));
  }, []);

  // Transactions CRUD
  const addTransaction = useCallback((txn: Omit<Transaction, "id">) => {
    setState((s) => ({ ...s, transactions: [...s.transactions, { ...txn, id: crypto.randomUUID() }] }));
  }, []);
  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState((s) => ({ ...s, transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
  }, []);
  const deleteTransaction = useCallback((id: string) => {
    setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
  }, []);

  // Assets CRUD
  const addAsset = useCallback((asset: Omit<Asset, "id">) => {
    setState((s) => ({ ...s, assets: [...s.assets, { ...asset, id: crypto.randomUUID() }] }));
  }, []);
  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
    setState((s) => ({ ...s, assets: s.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)) }));
  }, []);
  const deleteAsset = useCallback((id: string) => {
    setState((s) => ({ ...s, assets: s.assets.filter((a) => a.id !== id) }));
  }, []);

  // Liabilities CRUD
  const addLiability = useCallback((liability: Omit<Liability, "id">) => {
    setState((s) => ({ ...s, liabilities: [...s.liabilities, { ...liability, id: crypto.randomUUID() }] }));
  }, []);
  const updateLiability = useCallback((id: string, updates: Partial<Liability>) => {
    setState((s) => ({ ...s, liabilities: s.liabilities.map((l) => (l.id === id ? { ...l, ...updates } : l)) }));
  }, []);
  const deleteLiability = useCallback((id: string) => {
    setState((s) => ({ ...s, liabilities: s.liabilities.filter((l) => l.id !== id) }));
  }, []);

  // Computed values
  const totalMonthlyBills = state.bills.reduce((sum, bill) => sum + getMonthlyAmount(bill.amount, bill.frequency), 0);
  const totalSavingsTarget = state.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = state.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const remaining = state.monthlyIncome - totalMonthlyBills;
  const totalAssets = state.assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = state.liabilities.reduce((sum, l) => sum + l.balance, 0);
  const netWorth = totalAssets - totalLiabilities;
  const totalMinimumPayments = state.liabilities.reduce((sum, l) => sum + l.minimumPayment, 0);

  return {
    ...state,
    setMonthlyIncome,
    addBill, updateBill, deleteBill,
    addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    addCategoryBudget, updateCategoryBudget, deleteCategoryBudget,
    addTransaction, updateTransaction, deleteTransaction,
    addAsset, updateAsset, deleteAsset,
    addLiability, updateLiability, deleteLiability,
    totalMonthlyBills, totalSavingsTarget, totalSaved, remaining,
    totalAssets, totalLiabilities, netWorth, totalMinimumPayments,
  };
}
