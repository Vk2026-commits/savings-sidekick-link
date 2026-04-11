export type BillFrequency = "weekly" | "biweekly" | "monthly" | "yearly" | "one_time";
export type BillCategory = "housing" | "utilities" | "insurance" | "subscriptions" | "transportation" | "food" | "debt" | "entertainment" | "fast_food" | "restaurants" | "haircuts" | "beauty" | "kids" | "household" | "internet" | "energy" | "water" | "education" | "mortgage" | "auto_payment" | "bank_fees" | "other";
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
  paidDate?: string; // date bill was paid, e.g. "2026-04-05"
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
  type: "cash" | "investment" | "property" | "vehicle" | "whole_life_insurance" | "business_equity" | "jewelry_collectibles" | "rental_property" | "cryptocurrency" | "retirement" | "other";
}

export interface Liability {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  type: "credit_card" | "student_loan" | "mortgage" | "auto_loan" | "personal_loan" | "medical_debt" | "heloc" | "tax_debt" | "collections" | "business_loan" | "other";
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
  internet: "Internet",
  energy: "Energy (Electric/Gas)",
  water: "Water/MUD",
  education: "Education/Private School",
  mortgage: "Mortgage",
  auto_payment: "Auto Payment",
  bank_fees: "Bank Fees/Overdraft",
  other: "Other",
};

// Auto-suggest category based on bill name keywords
export const BILL_NAME_CATEGORY_MAP: Array<{ keywords: string[]; category: BillCategory }> = [
  { keywords: ["centerpoint", "centerpoint energy", "intech"], category: "energy" },
  { keywords: ["direct energy"], category: "energy" },
  { keywords: ["harris county mud", "mud 153", "mud"], category: "water" },
  { keywords: ["pennymac", "mortgage"], category: "mortgage" },
  { keywords: ["ally", "ally payment"], category: "auto_payment" },
  { keywords: ["smmcs", "williams private", "private school", "school tuition"], category: "education" },
  { keywords: ["overdraft", "nsf fee", "bank fee"], category: "bank_fees" },
  { keywords: ["internet", "wifi", "broadband", "comcast", "xfinity", "att fiber", "spectrum"], category: "internet" },
  { keywords: ["electric", "power"], category: "energy" },
  { keywords: ["water", "sewer"], category: "water" },
  { keywords: ["netflix", "hulu", "spotify", "disney", "apple tv", "youtube"], category: "subscriptions" },
  { keywords: ["state farm", "geico", "allstate", "progressive"], category: "insurance" },
  { keywords: ["rent"], category: "housing" },
];

export function suggestCategoryFromName(name: string): BillCategory | null {
  const lower = name.toLowerCase().trim();
  if (!lower) return null;
  for (const mapping of BILL_NAME_CATEGORY_MAP) {
    for (const kw of mapping.keywords) {
      if (lower.includes(kw)) return mapping.category;
    }
  }
  return null;
}

function isValidBudgetDate(year: number, month: number, day: number) {
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function getYearMonthFromDateInput(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined;

  const value = dateStr.trim();
  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (!isValidBudgetDate(year, month, day)) return undefined;
    return `${year}-${String(month).padStart(2, "0")}`;
  }

  const numericMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!numericMatch) return undefined;

  let first = Number(numericMatch[1]);
  let second = Number(numericMatch[2]);
  let year = Number(numericMatch[3]);
  if (year < 100) year += 2000;

  let month = first;
  let day = second;

  if (month > 12 && day <= 12) {
    month = second;
    day = first;
  }

  if (!isValidBudgetDate(year, month, day)) return undefined;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getAssignedBillMonth(bill: Pick<Bill, "month" | "paidDate">): string | undefined {
  return getYearMonthFromDateInput(bill.paidDate) ?? bill.month;
}

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
