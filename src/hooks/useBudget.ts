import { useState, useEffect, useCallback } from "react";
import type { Bill, SavingsGoal, BudgetState } from "@/types/budget";
import { getMonthlyAmount } from "@/types/budget";

const STORAGE_KEY = "budget-app-data";

const defaultState: BudgetState = {
  monthlyIncome: 0,
  bills: [],
  savingsGoals: [],
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

  const setMonthlyIncome = useCallback((income: number) => {
    setState((s) => ({ ...s, monthlyIncome: income }));
  }, []);

  const addBill = useCallback((bill: Omit<Bill, "id">) => {
    setState((s) => ({
      ...s,
      bills: [...s.bills, { ...bill, id: crypto.randomUUID() }],
    }));
  }, []);

  const updateBill = useCallback((id: string, updates: Partial<Bill>) => {
    setState((s) => ({
      ...s,
      bills: s.bills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  }, []);

  const deleteBill = useCallback((id: string) => {
    setState((s) => ({ ...s, bills: s.bills.filter((b) => b.id !== id) }));
  }, []);

  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, "id">) => {
    setState((s) => ({
      ...s,
      savingsGoals: [...s.savingsGoals, { ...goal, id: crypto.randomUUID() }],
    }));
  }, []);

  const updateSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setState((s) => ({
      ...s,
      savingsGoals: s.savingsGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, savingsGoals: s.savingsGoals.filter((g) => g.id !== id) }));
  }, []);

  const totalMonthlyBills = state.bills.reduce(
    (sum, bill) => sum + getMonthlyAmount(bill.amount, bill.frequency),
    0
  );

  const totalSavingsTarget = state.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = state.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const remaining = state.monthlyIncome - totalMonthlyBills;

  return {
    ...state,
    setMonthlyIncome,
    addBill,
    updateBill,
    deleteBill,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    totalMonthlyBills,
    totalSavingsTarget,
    totalSaved,
    remaining,
  };
}
