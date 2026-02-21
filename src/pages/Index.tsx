import { useState } from "react";
import {
  Wallet, LayoutDashboard, Receipt, Target, PiggyBank, TrendingUp, Calendar, BarChart3, ArrowRightLeft
} from "lucide-react";
import { useBudget } from "@/hooks/useBudget";
import SummaryCards from "@/components/budget/SummaryCards";
import BillsList from "@/components/budget/BillsList";
import BudgetOverview from "@/components/budget/BudgetOverview";
import SavingsGoals from "@/components/budget/SavingsGoals";
import IncomeInput from "@/components/budget/IncomeInput";
import CategoryBudgets from "@/components/budget/CategoryBudgets";
import TransactionLog from "@/components/budget/TransactionLog";
import NetWorthTracker from "@/components/budget/NetWorthTracker";
import DebtPayoffPlanner from "@/components/budget/DebtPayoffPlanner";
import BillCalendar from "@/components/budget/BillCalendar";
import FinancialDashboard from "@/components/budget/FinancialDashboard";
import CashFlowForecast from "@/components/budget/CashFlowForecast";
import IncomeManager from "@/components/budget/IncomeManager";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "income", label: "Income", icon: Wallet },
  { id: "bills", label: "Bills", icon: Receipt },
  { id: "budget", label: "Budget", icon: Target },
  { id: "transactions", label: "Transactions", icon: ArrowRightLeft },
  { id: "savings", label: "Savings", icon: PiggyBank },
  { id: "networth", label: "Net Worth", icon: TrendingUp },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "reports", label: "Reports", icon: BarChart3 },
] as const;

type TabId = typeof tabs[number]["id"];

const Index = () => {
  const budget = useBudget();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-10 bg-background/80">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">BudgetFlow</h1>
          </div>
          <IncomeInput income={budget.monthlyIncome} onUpdate={budget.setMonthlyIncome} />
        </div>

        {/* Tab Navigation */}
        <div className="container max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto pb-0 -mb-px scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {activeTab === "dashboard" && (
          <>
            <SummaryCards
              income={budget.monthlyIncome}
              totalBills={budget.totalMonthlyBills}
              remaining={budget.remaining}
              totalSaved={budget.totalSaved}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetOverview bills={budget.bills} income={budget.monthlyIncome} />
              <CashFlowForecast income={budget.monthlyIncome} bills={budget.bills} />
            </div>
          </>
        )}

        {activeTab === "income" && (
          <IncomeManager
            sources={budget.incomeSources}
            onAdd={budget.addIncomeSource}
            onUpdate={budget.updateIncomeSource}
            onDelete={budget.deleteIncomeSource}
            totalMonthlyIncome={budget.monthlyIncome}
          />
        )}

        {activeTab === "bills" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BillsList
              bills={budget.bills}
              onAdd={budget.addBill}
              onUpdate={budget.updateBill}
              onDelete={budget.deleteBill}
            />
            <BudgetOverview bills={budget.bills} income={budget.monthlyIncome} />
          </div>
        )}

        {activeTab === "budget" && (
          <CategoryBudgets
            budgets={budget.categoryBudgets}
            transactions={budget.transactions}
            onAdd={budget.addCategoryBudget}
            onUpdate={budget.updateCategoryBudget}
            onDelete={budget.deleteCategoryBudget}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionLog
            transactions={budget.transactions}
            onAdd={budget.addTransaction}
            onDelete={budget.deleteTransaction}
          />
        )}

        {activeTab === "savings" && (
          <SavingsGoals
            goals={budget.savingsGoals}
            onAdd={budget.addSavingsGoal}
            onUpdate={budget.updateSavingsGoal}
            onDelete={budget.deleteSavingsGoal}
          />
        )}

        {activeTab === "networth" && (
          <>
            <NetWorthTracker
              assets={budget.assets}
              liabilities={budget.liabilities}
              netWorth={budget.netWorth}
              totalAssets={budget.totalAssets}
              totalLiabilities={budget.totalLiabilities}
              onAddAsset={budget.addAsset}
              onUpdateAsset={budget.updateAsset}
              onDeleteAsset={budget.deleteAsset}
              onAddLiability={budget.addLiability}
              onUpdateLiability={budget.updateLiability}
              onDeleteLiability={budget.deleteLiability}
            />
            <DebtPayoffPlanner
              liabilities={budget.liabilities}
              monthlyIncome={budget.monthlyIncome}
              totalMonthlyBills={budget.totalMonthlyBills}
            />
          </>
        )}

        {activeTab === "calendar" && (
          <BillCalendar bills={budget.bills} />
        )}

        {activeTab === "reports" && (
          <FinancialDashboard
            transactions={budget.transactions}
            bills={budget.bills}
            income={budget.monthlyIncome}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
