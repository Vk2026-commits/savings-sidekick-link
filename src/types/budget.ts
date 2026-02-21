export type BillFrequency = "weekly" | "biweekly" | "monthly" | "yearly" | "one_time";
export type BillCategory = "housing" | "utilities" | "insurance" | "subscriptions" | "transportation" | "food" | "debt" | "entertainment" | "fast_food" | "restaurants" | "haircuts" | "beauty" | "kids" | "household" | "other";
export type BillOwner = string; // dynamic group id
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
  owner: BillOwner;
  paymentAccountId?: string;
  month?: string; // "YYYY-MM" format, e.g. "2026-01"
  isRecurring?: boolean; // auto-copy to next month
  pendingReview?: boolean; // needs confirmation in next month
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

export interface ExpenseGroup {
  id: string;
  name: string;
}

export interface PaymentAccount {
  id: string;
  name: string;
  nickname: string;
  type: "direct_deposit" | "cash" | "credit_card" | "bank_account" | "other";
}

export const PAYMENT_ACCOUNT_TYPE_LABELS: Record<PaymentAccount["type"], string> = {
  direct_deposit: "Direct Deposit",
  cash: "Cash",
  credit_card: "Credit Card",
  bank_account: "Bank Account",
  other: "Other",
};

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly" | "yearly";
  type: "salary" | "freelance" | "business" | "investment" | "gift" | "other";
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
  incomeSources: IncomeSource[];
  bills: Bill[];
  savingsGoals: SavingsGoal[];
  categoryBudgets: CategoryBudget[];
  transactions: Transaction[];
  expenseGroups: ExpenseGroup[];
  paymentAccounts: PaymentAccount[];
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
  entertainment: "Entertainment",
  fast_food: "Fast Food",
  restaurants: "Restaurants",
  haircuts: "Haircuts",
  beauty: "Beauty (Nails/Pedicures)",
  kids: "Kids' Expenses",
  household: "Household Items",
  other: "Other",
};

export const DEFAULT_EXPENSE_GROUPS: ExpenseGroup[] = [
  { id: "household", name: "Bills & Expenses" },
  { id: "kids", name: "Kids' Expenses" },
  { id: "steven", name: "Steven's Expenses" },
  { id: "kalila", name: "Kalila's Expenses" },
];

export const DEFAULT_PAYMENT_ACCOUNTS: PaymentAccount[] = [
  { id: "direct_deposit", name: "Direct Deposit", nickname: "Direct Deposit", type: "direct_deposit" },
  { id: "cash", name: "Cash", nickname: "Cash", type: "cash" },
  { id: "amex", name: "American Express", nickname: "Amex", type: "credit_card" },
  { id: "chase", name: "Chase Credit Card", nickname: "Chase CC", type: "credit_card" },
  { id: "bank", name: "Bank Account", nickname: "Bank Account", type: "bank_account" },
];

export const FREQUENCY_LABELS: Record<BillFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  one_time: "One Time",
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
    case "one_time": return amount;
  }
}

export function getWeeklyAmount(amount: number, frequency: BillFrequency): number {
  switch (frequency) {
    case "weekly": return amount;
    case "biweekly": return amount / 2;
    case "monthly": return amount / 4.33;
    case "yearly": return amount / 52;
    case "one_time": return amount / 4.33;
  }
}
