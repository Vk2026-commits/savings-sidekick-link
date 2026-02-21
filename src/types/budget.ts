export type BillFrequency = "weekly" | "biweekly" | "monthly" | "yearly";
export type BillCategory = "housing" | "utilities" | "insurance" | "subscriptions" | "transportation" | "food" | "debt" | "other";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: BillCategory;
  frequency: BillFrequency;
  dueDate: number; // day of month (1-31)
  isPaid: boolean;
  autoPay: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
}

export interface BudgetState {
  monthlyIncome: number;
  bills: Bill[];
  savingsGoals: SavingsGoal[];
}

export const CATEGORY_LABELS: Record<BillCategory, string> = {
  housing: "Housing",
  utilities: "Utilities",
  insurance: "Insurance",
  subscriptions: "Subscriptions",
  transportation: "Transportation",
  food: "Food & Groceries",
  debt: "Debt Payments",
  other: "Other",
};

export const FREQUENCY_LABELS: Record<BillFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function getMonthlyAmount(amount: number, frequency: BillFrequency): number {
  switch (frequency) {
    case "weekly": return amount * 4.33;
    case "biweekly": return amount * 2.17;
    case "monthly": return amount;
    case "yearly": return amount / 12;
  }
}

export function getWeeklyAmount(amount: number, frequency: BillFrequency): number {
  switch (frequency) {
    case "weekly": return amount;
    case "biweekly": return amount / 2;
    case "monthly": return amount / 4.33;
    case "yearly": return amount / 52;
  }
}
