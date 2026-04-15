import { useState, useMemo, useEffect } from "react";
import {
  Wallet, LayoutDashboard, Receipt, Target, PiggyBank, TrendingUp, Calendar, BarChart3, ArrowRightLeft,
  Plus, Pencil, Trash2, Check, X, ChevronLeft, ChevronRight, Copy, Landmark, LineChart, Users, ChevronDown, ScrollText, Lock, Globe
} from "lucide-react";
import { useBudget } from "@/hooks/useBudget";
import { useSubscription, FREE_LIMITS } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/budget/UpgradePrompt";
import ReactivationBanner from "@/components/budget/ReactivationBanner";
import EstateCompletionBanner from "@/components/budget/EstateCompletionBanner";
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
import DailySpendingChart from "@/components/budget/DailySpendingChart";
import IncomeManager from "@/components/budget/IncomeManager";
import PaymentAccountsManager from "@/components/budget/PaymentAccountsManager";
import PlaidLink from "@/components/budget/PlaidLink";
import EstateInlineContent from "@/components/estate/EstateInlineContent";
import ReconcileTransactions from "@/components/budget/ReconcileTransactions";
import SpendingAnalytics from "@/components/budget/SpendingAnalytics";
import PinGate, { PinUnlockProvider } from "@/components/budget/PinGate";
import MobileBottomNav from "@/components/budget/MobileBottomNav";
import OnboardingWizard from "@/components/OnboardingWizard";
import { getAssignedBillMonth, getMonthlyAmount } from "@/types/budget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import UserMenu from "@/components/UserMenu";
import { useIsMobile } from "@/hooks/use-mobile";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function DashboardView({ budget }: { budget: ReturnType<typeof useBudget> }) {
  const now = new Date();
  const [dashMonth, setDashMonth] = useState(getCurrentMonth());

  const [y, m] = dashMonth.split("-").map(Number);
  const monthsElapsed = now.getFullYear() === y ? Math.min(m, now.getMonth() + 1) : m;
  const ytdIncome = budget.monthlyIncome * monthsElapsed;
  const ytdBills = budget.bills
    .filter((b) => {
      if (!b.month) return false;
      const [by] = b.month.split("-").map(Number);
      return by === y;
    })
    .reduce((sum, b) => sum + getMonthlyAmount(b.amount, b.frequency), 0);
  const ytdRemaining = ytdIncome - ytdBills;
  const viewBills = budget.bills.filter((b) => getAssignedBillMonth(b) === dashMonth);

  return (
    <>
      <SummaryCards
        ytdIncome={ytdIncome}
        ytdBills={ytdBills}
        ytdRemaining={ytdRemaining}
        totalSaved={budget.totalSaved}
      />
      <div className="flex items-center justify-center gap-3 my-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDashMonth(shiftMonth(dashMonth, -1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium text-sm min-w-[140px] text-center">{formatMonthLabel(dashMonth)}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDashMonth(shiftMonth(dashMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetOverview bills={viewBills} income={budget.monthlyIncome} />
        <CashFlowForecast income={budget.monthlyIncome} bills={viewBills} viewMonth={dashMonth} />
      </div>
    </>
  );
}
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
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "estate", label: "Estate & Legacy", icon: ScrollText },
  { id: "bank", label: "Bank", icon: Landmark },
  { id: "network", label: "Faithnancial Network", icon: Globe },
] as const;

type TabId = typeof tabs[number]["id"];

const RESTRICTED_TABS: TabId[] = ["reports", "analytics"];

const Index = () => {
  const budget = useBudget();
  const isMobile = useIsMobile();
  const { isFree, isPro, expiredFromPro, trialExpiresAt, tier } = useSubscription();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const billMatchesMonth = (bill: (typeof budget.bills)[number], month: string) => getAssignedBillMonth(bill) === month;

  const monthlyBillsTotal = useMemo(() => {
    return budget.bills
      .filter((b) => billMatchesMonth(b, selectedMonth))
      .reduce((sum, b) => sum + getMonthlyAmount(b.amount, b.frequency), 0);
  }, [budget.bills, selectedMonth]);
  return (
    <PinUnlockProvider>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-10 bg-background/80">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">BudgetFlow</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <IncomeInput income={budget.monthlyIncome} onUpdate={budget.setMonthlyIncome} />
            <UserMenu />
          </div>
        </div>

        {/* Tab Navigation - hidden on mobile, shown on md+ */}
        <div className="container max-w-7xl mx-auto px-4 hidden md:block">
          <nav className="flex gap-1 overflow-x-auto pb-0 -mb-px scrollbar-none">
            {tabs.map((tab) => {
              const isRestricted = isFree && RESTRICTED_TABS.includes(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => !isRestricted && setActiveTab(tab.id)}
                  disabled={isRestricted}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isRestricted
                      ? "border-transparent text-muted-foreground/40 cursor-not-allowed"
                      : activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {isRestricted ? <Lock className="h-3.5 w-3.5" /> : <tab.icon className="h-4 w-4" />}
                  <span>{tab.label}</span>
                  {isRestricted && <span className="text-[10px] ml-1 bg-muted px-1.5 py-0.5 rounded-full">Pro</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 md:pb-6">
        {expiredFromPro && <ReactivationBanner expiredFromPro={expiredFromPro} />}
        {activeTab === "dashboard" && (
          <DashboardView budget={budget} />
        )}

        {activeTab === "income" && (
          <PinGate label="Income">
            <IncomeManager
              sources={budget.incomeSources}
              onAdd={budget.addIncomeSource}
              onUpdate={budget.updateIncomeSource}
              onDelete={budget.deleteIncomeSource}
              totalMonthlyIncome={budget.monthlyIncome}
            />
          </PinGate>
        )}

        {activeTab === "bills" && (
          <div className="space-y-6">
            {/* Month Selector */}
            <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
                  className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h2 className="text-lg font-bold min-w-[180px] text-center">{formatMonthLabel(selectedMonth)}</h2>
                <button
                  onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
                  className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const prevMonth = shiftMonth(selectedMonth, -1);
                    const prevBills = budget.bills.filter(b => billMatchesMonth(b, prevMonth));
                    const currentBills = budget.bills.filter(b => billMatchesMonth(b, selectedMonth));
                    if (prevBills.length === 0) return;
                    // Only copy bills that don't already exist (by name + owner)
                    const existingKeys = new Set(currentBills.map(b => `${b.name}::${b.owner}`));
                    let copied = 0;
                    prevBills.forEach(bill => {
                      if (!existingKeys.has(`${bill.name}::${bill.owner}`)) {
                        const { id, ...billWithoutId } = bill;
                        budget.addBill({ ...billWithoutId, month: selectedMonth, isPaid: false });
                        copied++;
                      }
                    });
                    if (copied === 0) {
                      // All bills already exist
                    }
                  }}
                  disabled={budget.bills.filter(b => billMatchesMonth(b, shiftMonth(selectedMonth, -1))).length === 0}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy from {formatMonthLabel(shiftMonth(selectedMonth, -1))}
                </Button>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total for {formatMonthLabel(selectedMonth)}</p>
                  <p className="text-xl font-bold font-mono">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(monthlyBillsTotal)}
                  </p>
                </div>
              </div>
            </div>

            {/* Budget Overview for selected month */}
            <BudgetOverview bills={budget.bills.filter(b => billMatchesMonth(b, selectedMonth))} income={budget.monthlyIncome} />

            {/* Payment Accounts Manager */}
            <PaymentAccountsManager
              accounts={budget.paymentAccounts}
              bills={budget.bills}
              onAdd={budget.addPaymentAccount}
              onUpdate={budget.updatePaymentAccount}
              onDelete={budget.deletePaymentAccount}
            />

            {/* Add Expense Group - separate collapsible */}
            <Collapsible className="glass-card">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-3 hover:bg-secondary/30 transition-colors rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Expense Groups</span>
                  <span className="text-xs text-muted-foreground">({budget.expenseGroups.length})</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-5 pb-4">
                <div className="space-y-2 mb-3">
                  {budget.expenseGroups.map((g) => (
                    <div key={g.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 text-sm">
                      <span>{g.name}</span>
                    </div>
                  ))}
                </div>
                {showAddGroup ? (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="New group name..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newGroupName.trim()) {
                          budget.addExpenseGroup(newGroupName.trim());
                          setNewGroupName("");
                          setShowAddGroup(false);
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => {
                      if (newGroupName.trim()) {
                        budget.addExpenseGroup(newGroupName.trim());
                        setNewGroupName("");
                        setShowAddGroup(false);
                      }
                    }}>
                      <Check className="h-4 w-4 mr-1" /> Add
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowAddGroup(false); setNewGroupName(""); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setShowAddGroup(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add Expense Group
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Dynamic expense group boxes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {budget.expenseGroups.map((group) => (
                <div key={group.id} className="relative">
                  {/* Group name edit controls */}
                  <div className="flex items-center gap-2 mb-1">
                    {editingGroupId === group.id ? (
                      <>
                        <Input
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          className="h-7 text-sm w-48"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editingGroupName.trim()) {
                              budget.updateExpenseGroup(group.id, editingGroupName.trim());
                              setEditingGroupId(null);
                            }
                          }}
                        />
                        <button onClick={() => {
                          if (editingGroupName.trim()) {
                            budget.updateExpenseGroup(group.id, editingGroupName.trim());
                            setEditingGroupId(null);
                          }
                        }} className="text-primary hover:text-primary/80">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEditingGroupId(null)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingGroupId(group.id); setEditingGroupName(group.name); }}
                          className="text-muted-foreground hover:text-primary transition-colors" title="Edit name">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => budget.deleteExpenseGroup(group.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors" title="Delete group">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                  <BillsList
                    bills={budget.bills}
                    allBills={budget.bills}
                    onAdd={budget.addBill}
                    onUpdate={budget.updateBill}
                    onDelete={budget.deleteBill}
                    title={group.name}
                    owner={group.id}
                    paymentAccounts={budget.paymentAccounts}
                    expenseGroups={budget.expenseGroups}
                    selectedMonth={selectedMonth}
                    groupTotal={budget.bills
                      .filter(b => (b.owner ?? "household") === group.id && billMatchesMonth(b, selectedMonth))
                      .reduce((sum, b) => sum + getMonthlyAmount(b.amount, b.frequency), 0)}
                    onMarkAllPaid={() => {
                      budget.bills
                        .filter(b => (b.owner ?? "household") === group.id && billMatchesMonth(b, selectedMonth) && !b.isPaid)
                        .forEach(b => budget.updateBill(b.id, { isPaid: true }));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "budget" && (
          isFree && budget.categoryBudgets.length >= FREE_LIMITS.budgetItems ? (
            <div>
              <CategoryBudgets
                budgets={budget.categoryBudgets}
                transactions={budget.transactions}
                onAdd={budget.addCategoryBudget}
                onUpdate={budget.updateCategoryBudget}
                onDelete={budget.deleteCategoryBudget}
                maxItems={FREE_LIMITS.budgetItems}
              />
            </div>
          ) : (
            <CategoryBudgets
              budgets={budget.categoryBudgets}
              transactions={budget.transactions}
              onAdd={budget.addCategoryBudget}
              onUpdate={budget.updateCategoryBudget}
              onDelete={budget.deleteCategoryBudget}
              maxItems={isFree ? FREE_LIMITS.budgetItems : undefined}
            />
          )
        )}

        {activeTab === "transactions" && (
          <PinGate label="Transactions">
            <TransactionLog
              transactions={budget.transactions}
              onAdd={budget.addTransaction}
              onDelete={budget.deleteTransaction}
            />
          </PinGate>
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
          <PinGate label="Net Worth">
            <NetWorthTracker
              bills={budget.bills}
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
          </PinGate>
        )}

        {activeTab === "calendar" && (
          <BillCalendar bills={budget.bills} />
        )}

        {activeTab === "reports" && (
          isFree ? (
            <UpgradePrompt message="Unlock detailed financial reports and charts with a Pro subscription." />
          ) : (
            <FinancialDashboard
              transactions={budget.transactions}
              bills={budget.bills}
              income={budget.monthlyIncome}
            />
          )
        )}

        {activeTab === "analytics" && (
          isFree ? (
            <UpgradePrompt message="Unlock advanced spending analytics and insights with a Pro subscription." />
          ) : (
            <SpendingAnalytics
              bills={budget.bills}
              transactions={budget.transactions}
              monthlyIncome={budget.monthlyIncome}
            />
          )
        )}

        {activeTab === "estate" && <EstateInlineContent isFree={isFree} />}

        {activeTab === "bank" && (
          <div className="space-y-6">
            <PlaidLink />
            <ReconcileTransactions />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
    </PinUnlockProvider>
  );
};

export default Index;
