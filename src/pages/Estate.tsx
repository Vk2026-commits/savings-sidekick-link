import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCheck, Landmark, Shield, Home, Globe, FileText,
  FolderOpen, Heart, ShieldCheck, ArrowLeft, ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/UserMenu";
import EstateDashboardTab from "@/components/estate/EstateDashboardTab";
import EstatePeopleTab from "@/components/estate/EstatePeopleTab";
import EstateBeneficiariesTab from "@/components/estate/EstateBeneficiariesTab";
import EstateAccountsTab from "@/components/estate/EstateAccountsTab";
import EstateInsuranceTab from "@/components/estate/EstateInsuranceTab";
import EstatePropertyTab from "@/components/estate/EstatePropertyTab";
import EstateDigitalAccessTab from "@/components/estate/EstateDigitalAccessTab";
import EstateLegalDocumentsTab from "@/components/estate/EstateLegalDocumentsTab";
import EstateDocumentVaultTab from "@/components/estate/EstateDocumentVaultTab";
import EstateWishesTab from "@/components/estate/EstateWishesTab";
import EstateTrustedContactsTab from "@/components/estate/EstateTrustedContactsTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription, FREE_LIMITS } from "@/hooks/useSubscription";
import {
  useEstatePeople, useEstateBeneficiaries, useEstateAccounts,
  useEstateInsurance, useEstateProperty, useEstateDigitalAccess,
  useEstateLegalDocuments, useEstateDocuments, useEstateWishes,
  useEstateTrustedContacts,
} from "@/hooks/useEstate";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "people", label: "People", icon: Users },
  { id: "beneficiaries", label: "Beneficiaries", icon: UserCheck },
  { id: "accounts", label: "Accounts", icon: Landmark },
  { id: "insurance", label: "Insurance", icon: Shield },
  { id: "property", label: "Property", icon: Home },
  { id: "digital", label: "Digital Access", icon: Globe },
  { id: "legal", label: "Legal Docs", icon: FileText },
  { id: "documents", label: "Doc Vault", icon: FolderOpen },
  { id: "wishes", label: "Wishes", icon: Heart },
  { id: "trusted", label: "Trusted Access", icon: ShieldCheck },
] as const;

type TabId = typeof tabs[number]["id"];

export default function Estate() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isFree, isTrial, trialExpiresAt } = useSubscription();

  // Load counts for free-tier limit enforcement
  const people = useEstatePeople();
  const beneficiaries = useEstateBeneficiaries();
  const accounts = useEstateAccounts();
  const insurance = useEstateInsurance();
  const property = useEstateProperty();
  const digital = useEstateDigitalAccess();
  const legal = useEstateLegalDocuments();
  const documents = useEstateDocuments();
  const wishes = useEstateWishes();
  const trusted = useEstateTrustedContacts();

  const limit = FREE_LIMITS.estateEntriesPerTab;

  const isAtLimit = (tab: string): boolean => {
    if (!isFree) return false;
    const counts: Record<string, number> = {
      people: people.data.length,
      beneficiaries: beneficiaries.data.length,
      accounts: accounts.data.length,
      insurance: insurance.data.length,
      property: property.data.length,
      digital: digital.data.length,
      legal: legal.data.length,
      documents: documents.data.length,
      wishes: wishes.data.length,
      trusted: trusted.data.length,
    };
    return (counts[tab] || 0) >= limit;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-10 bg-background/80">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ScrollText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Estate & Legacy</h1>
            {isFree && (
              <Badge variant="outline" className="text-xs">Free: 1 entry per section</Badge>
            )}
          </div>
          <UserMenu />
        </div>

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
                {!isMobile && <span>{tab.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {activeTab === "dashboard" && <EstateDashboardTab onNavigate={(tab) => setActiveTab(tab as TabId)} />}
        {activeTab === "people" && <EstatePeopleTab disableAdd={isAtLimit("people")} />}
        {activeTab === "beneficiaries" && <EstateBeneficiariesTab disableAdd={isAtLimit("beneficiaries")} />}
        {activeTab === "accounts" && <EstateAccountsTab disableAdd={isAtLimit("accounts")} />}
        {activeTab === "insurance" && <EstateInsuranceTab disableAdd={isAtLimit("insurance")} />}
        {activeTab === "property" && <EstatePropertyTab disableAdd={isAtLimit("property")} />}
        {activeTab === "digital" && <EstateDigitalAccessTab disableAdd={isAtLimit("digital")} />}
        {activeTab === "legal" && <EstateLegalDocumentsTab disableAdd={isAtLimit("legal")} />}
        {activeTab === "documents" && <EstateDocumentVaultTab disableAdd={isAtLimit("documents")} />}
        {activeTab === "wishes" && <EstateWishesTab disableAdd={isAtLimit("wishes")} />}
        {activeTab === "trusted" && <EstateTrustedContactsTab disableAdd={isAtLimit("trusted")} />}
      </main>
    </div>
  );
}
