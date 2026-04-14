import { useEstateTabStatus, useEstatePeople, useEstateBeneficiaries, useEstateAccounts, useEstateInsurance, useEstateProperty, useEstateDigitalAccess, useEstateLegalDocuments, useEstateDocuments, useEstateWishes } from "@/hooks/useEstate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Shield, Clock } from "lucide-react";

const TABS = [
  { key: "people", label: "People" },
  { key: "beneficiaries", label: "Beneficiaries" },
  { key: "accounts", label: "Accounts" },
  { key: "insurance", label: "Insurance" },
  { key: "property", label: "Property & Assets" },
  { key: "digital", label: "Digital Access" },
  { key: "legal", label: "Legal Documents" },
  { key: "documents", label: "Document Vault" },
  { key: "wishes", label: "Wishes" },
];

export default function EstateDashboardTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const tabStatus = useEstateTabStatus();
  const people = useEstatePeople();
  const beneficiaries = useEstateBeneficiaries();
  const accounts = useEstateAccounts();
  const insurance = useEstateInsurance();
  const property = useEstateProperty();
  const digital = useEstateDigitalAccess();
  const legal = useEstateLegalDocuments();
  const documents = useEstateDocuments();
  const wishes = useEstateWishes();

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
  };

  const getStatus = (tabKey: string) => tabStatus.data.find((s: any) => s.tab_name === tabKey);
  const completedCount = TABS.filter(t => getStatus(t.key)?.is_complete).length;
  const progress = TABS.length > 0 ? Math.round((completedCount / TABS.length) * 100) : 0;

  const toggleComplete = async (tabKey: string) => {
    const existing = getStatus(tabKey);
    if (existing) {
      await tabStatus.update(existing.id, { is_complete: !existing.is_complete, last_reviewed_at: new Date().toISOString() });
    } else {
      await tabStatus.add({ tab_name: tabKey, is_complete: true, last_reviewed_at: new Date().toISOString() });
    }
  };

  const markReviewed = async (tabKey: string) => {
    const existing = getStatus(tabKey);
    if (existing) {
      await tabStatus.update(existing.id, { last_reviewed_at: new Date().toISOString() });
    } else {
      await tabStatus.add({ tab_name: tabKey, last_reviewed_at: new Date().toISOString() });
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Shield className="h-5 w-5" /> Estate Planning Progress</h3>
          <span className="text-2xl font-bold font-mono">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">{completedCount} of {TABS.length} sections complete</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TABS.map(tab => {
          const status = getStatus(tab.key);
          const count = counts[tab.key] || 0;
          return (
            <Card key={tab.key} className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate(tab.key)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">{tab.label}</CardTitle>
                  <button onClick={(e) => { e.stopPropagation(); toggleComplete(tab.key); }} className="text-muted-foreground hover:text-primary">
                    {status?.is_complete ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-2xl font-bold font-mono">{count}</p>
                <p className="text-xs text-muted-foreground">items recorded</p>
                {status?.last_reviewed_at && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Reviewed: {new Date(status.last_reviewed_at).toLocaleDateString()}
                  </p>
                )}
                <Button variant="ghost" size="sm" className="text-xs mt-1 p-0 h-auto" onClick={(e) => { e.stopPropagation(); markReviewed(tab.key); }}>
                  Mark reviewed
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
