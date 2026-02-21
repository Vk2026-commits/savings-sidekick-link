export type BillFrequency = "weekly" | "biweekly" | "monthly" | "yearly";
export type BillCategory = "housing" | "utilities" | "insurance" | "subscriptions" | "transportation" | "food" | "debt" | "other";
export type TransactionType = "income" | "expense";

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

export interface CategoryBudget {
  id: string;
  category: BillCategory;
  limit: number; // monthly limit
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  description: string;
  amount: number;
  type: TransactionType;
  category: BillCategory;
  notes?: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  type: "cash" | "investment" | "property" | "vehicle" | "other";
}

export interface Liability {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  type: "credit_card" | "student_loan" | "mortgage" | "auto_loan" | "personal_loan" | "other";
}

export interface BudgetState {
  monthlyIncome: number;
  bills: Bill[];
  savingsGoals: SavingsGoal[];
  categoryBudgets: CategoryBudget[];
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
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

export const ASSET_TYPE_LABELS: Record<Asset["type"], string> = {
  cash: "Cash & Savings",
  investment: "Investments",
  property: "Real Estate",
  vehicle: "Vehicles",
  other: "Other Assets",
};

export const LIABILITY_TYPE_LABELS: Record<Liability["type"], string> = {
  credit_card: "Credit Card",
  student_loan: "Student Loan",
  mortgage: "Mortgage",
  auto_loan: "Auto Loan",
  personal_loan: "Personal Loan",
  other: "Other",
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
