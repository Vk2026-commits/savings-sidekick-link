import { useState } from "react";
import {
  LayoutDashboard, Users, UserCheck, Landmark, Shield, Home, Globe, FileText,
  FolderOpen, Heart, ShieldCheck, ScrollText
} from "lucide-react";
import EstateDashboardTab from "./EstateDashboardTab";
import EstatePeopleTab from "./EstatePeopleTab";
import EstateBeneficiariesTab from "./EstateBeneficiariesTab";
import EstateAccountsTab from "./EstateAccountsTab";
import EstateInsuranceTab from "./EstateInsuranceTab";
import EstatePropertyTab from "./EstatePropertyTab";
import EstateDigitalAccessTab from "./EstateDigitalAccessTab";
import EstateLegalDocumentsTab from "./EstateLegalDocumentsTab";
import EstateDocumentVaultTab from "./EstateDocumentVaultTab";
import EstateWishesTab from "./EstateWishesTab";
import EstateTrustedContactsTab from "./EstateTrustedContactsTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { FREE_LIMITS } from "@/hooks/useSubscription";
import {
  useEstatePeople, useEstateBeneficiaries, useEstateAccounts,
  useEstateInsurance, useEstateProperty, useEstateDigitalAccess,
  useEstateLegalDocuments, useEstateDocuments, useEstateWishes,
  useEstateTrustedContacts
} from "@/hooks/useEstate";
import UpgradePrompt from "@/components/budget/UpgradePrompt";

const estateTabs = [
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

type EstateTabId = typeof estateTabs[number]["id"];

function FreeLimitBanner({ count, max }: { count: number; max: number }) {
  if (count < max) return null;
  return (
    <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border text-center">
      <p className="text-sm text-muted-foreground">
        Free plan limit: <strong>{max} entry</strong> per section.{" "}
        <span className="text-primary font-medium">Upgrade to Pro ($9.99/mo)</span> for unlimited entries.
      </p>
    </div>
  );
}

interface EstateInlineContentProps {
  isFree?: boolean;
}

export default function EstateInlineContent({ isFree = false }: EstateInlineContentProps) {
  const [activeTab, setActiveTab] = useState<EstateTabId>("dashboard");
  const isMobile = useIsMobile();

  // Load counts for free-tier limits
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

  const tabCounts: Record<string, number> = {
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

  const limit = FREE_LIMITS.estateEntriesPerTab;
  const isAtLimit = (tab: string) => isFree && (tabCounts[tab] || 0) >= limit;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Estate & Legacy Planning</h2>
        {isFree && <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">Free: 1 entry per section</span>}
      </div>

      <nav className="flex gap-1 overflow-x-auto pb-0 -mb-px scrollbar-none border-b border-border/50">
        {estateTabs.map((tab) => (
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

      <div className="pt-2">
        {activeTab === "dashboard" && <EstateDashboardTab onNavigate={(tab) => setActiveTab(tab as EstateTabId)} />}
        {activeTab === "people" && (
          <>{isAtLimit("people") && <FreeLimitBanner count={tabCounts.people} max={limit} />}<EstatePeopleTab disableAdd={isAtLimit("people")} /></>
        )}
        {activeTab === "beneficiaries" && (
          <>{isAtLimit("beneficiaries") && <FreeLimitBanner count={tabCounts.beneficiaries} max={limit} />}<EstateBeneficiariesTab disableAdd={isAtLimit("beneficiaries")} /></>
        )}
        {activeTab === "accounts" && (
          <>{isAtLimit("accounts") && <FreeLimitBanner count={tabCounts.accounts} max={limit} />}<EstateAccountsTab disableAdd={isAtLimit("accounts")} /></>
        )}
        {activeTab === "insurance" && (
          <>{isAtLimit("insurance") && <FreeLimitBanner count={tabCounts.insurance} max={limit} />}<EstateInsuranceTab disableAdd={isAtLimit("insurance")} /></>
        )}
        {activeTab === "property" && (
          <>{isAtLimit("property") && <FreeLimitBanner count={tabCounts.property} max={limit} />}<EstatePropertyTab disableAdd={isAtLimit("property")} /></>
        )}
        {activeTab === "digital" && (
          <>{isAtLimit("digital") && <FreeLimitBanner count={tabCounts.digital} max={limit} />}<EstateDigitalAccessTab disableAdd={isAtLimit("digital")} /></>
        )}
        {activeTab === "legal" && (
          <>{isAtLimit("legal") && <FreeLimitBanner count={tabCounts.legal} max={limit} />}<EstateLegalDocumentsTab disableAdd={isAtLimit("legal")} /></>
        )}
        {activeTab === "documents" && (
          <>{isAtLimit("documents") && <FreeLimitBanner count={tabCounts.documents} max={limit} />}<EstateDocumentVaultTab disableAdd={isAtLimit("documents")} /></>
        )}
        {activeTab === "wishes" && (
          <>{isAtLimit("wishes") && <FreeLimitBanner count={tabCounts.wishes} max={limit} />}<EstateWishesTab disableAdd={isAtLimit("wishes")} /></>
        )}
        {activeTab === "trusted" && (
          <>{isAtLimit("trusted") && <FreeLimitBanner count={tabCounts.trusted} max={limit} />}<EstateTrustedContactsTab disableAdd={isAtLimit("trusted")} /></>
        )}
      </div>
    </div>
  );
}