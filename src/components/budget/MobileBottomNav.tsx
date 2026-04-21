import {
  Wallet, LayoutDashboard, Receipt, Target, PiggyBank, TrendingUp, Calendar, BarChart3, ArrowRightLeft,
  Landmark, LineChart, MoreHorizontal, ScrollText, Lock, Globe
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "income", label: "Income", icon: Wallet },
  { id: "bills", label: "Bills", icon: Receipt },
  { id: "budget", label: "Budget", icon: Target },
  { id: "savings", label: "Savings", icon: PiggyBank },
  { id: "networth", label: "Net Worth", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "estate", label: "Estate & Legacy", icon: ScrollText },
] as const;

type TabId = typeof tabs[number]["id"];

// Show first 4 tabs + "More" button on mobile bottom bar
const PRIMARY_TABS = tabs.slice(0, 4);
const OVERFLOW_TABS = tabs.slice(4);

interface MobileBottomNavProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export default function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { isFree } = useSubscription();
  const { toast } = useToast();
  const RESTRICTED_TABS = ["reports", "analytics"];
  const COMING_SOON_TABS = ["bank"];
  const isOverflowActive = OVERFLOW_TABS.some(t => t.id === activeTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden safe-area-bottom">
      <div className="flex items-stretch justify-around">
        {PRIMARY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </button>
        ))}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors ${
                isOverflowActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8">
            <SheetHeader>
              <SheetTitle>More Tabs</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-4 gap-3 pt-4">
              {OVERFLOW_TABS.map((tab) => {
                const isRestricted = isFree && RESTRICTED_TABS.includes(tab.id);
                const isComingSoon = COMING_SOON_TABS.includes(tab.id);
                const isDisabled = isRestricted || isComingSoon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isComingSoon) {
                        toast({ title: "Coming Soon", description: "Bank integration coming soon." });
                        setMoreOpen(false);
                        return;
                      }
                      if (isRestricted) return;
                      onTabChange(tab.id);
                      setMoreOpen(false);
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors ${
                      isDisabled
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : activeTab === tab.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {isRestricted ? <Lock className="h-5 w-5" /> : <tab.icon className="h-6 w-6" />}
                    <span className="text-xs font-medium">{tab.label}</span>
                    {isRestricted && <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full">Pro</span>}
                    {isComingSoon && <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full">Soon</span>}
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
