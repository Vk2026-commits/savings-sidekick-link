import { Wallet } from "lucide-react";
import { useBudget } from "@/hooks/useBudget";
import SummaryCards from "@/components/budget/SummaryCards";
import BillsList from "@/components/budget/BillsList";
import BudgetOverview from "@/components/budget/BudgetOverview";
import SavingsGoals from "@/components/budget/SavingsGoals";
import IncomeInput from "@/components/budget/IncomeInput";

const Index = () => {
  const budget = useBudget();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-10 bg-background/80">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">BudgetFlow</h1>
          </div>
          <IncomeInput income={budget.monthlyIncome} onUpdate={budget.setMonthlyIncome} />
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        <SummaryCards
          income={budget.monthlyIncome}
          totalBills={budget.totalMonthlyBills}
          remaining={budget.remaining}
          totalSaved={budget.totalSaved}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BillsList
            bills={budget.bills}
            onAdd={budget.addBill}
            onUpdate={budget.updateBill}
            onDelete={budget.deleteBill}
          />
          <BudgetOverview bills={budget.bills} income={budget.monthlyIncome} />
        </div>

        <SavingsGoals
          goals={budget.savingsGoals}
          onAdd={budget.addSavingsGoal}
          onUpdate={budget.updateSavingsGoal}
          onDelete={budget.deleteSavingsGoal}
        />
      </main>
    </div>
  );
};

export default Index;
