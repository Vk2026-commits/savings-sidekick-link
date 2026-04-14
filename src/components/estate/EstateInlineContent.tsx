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

interface EstateInlineContentProps {
  isFree?: boolean;
}

export default function EstateInlineContent({ isFree = false }: EstateInlineContentProps) {
  const [activeTab, setActiveTab] = useState<EstateTabId>("dashboard");
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Estate & Legacy Planning</h2>
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
        {activeTab === "people" && <EstatePeopleTab />}
        {activeTab === "beneficiaries" && <EstateBeneficiariesTab />}
        {activeTab === "accounts" && <EstateAccountsTab />}
        {activeTab === "insurance" && <EstateInsuranceTab />}
        {activeTab === "property" && <EstatePropertyTab />}
        {activeTab === "digital" && <EstateDigitalAccessTab />}
        {activeTab === "legal" && <EstateLegalDocumentsTab />}
        {activeTab === "documents" && <EstateDocumentVaultTab />}
        {activeTab === "wishes" && <EstateWishesTab />}
        {activeTab === "trusted" && <EstateTrustedContactsTab />}
      </div>
    </div>
  );
}
