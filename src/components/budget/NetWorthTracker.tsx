import { useState, useMemo } from "react";
import { Plus, Trash2, X, TrendingUp, TrendingDown, Building2, Car, Wallet, Package, Pencil, Check, Lightbulb, ArrowRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Asset, Liability, Bill } from "@/types/budget";
import { ASSET_TYPE_LABELS, LIABILITY_TYPE_LABELS } from "@/types/budget";

interface NetWorthTrackerProps {
  assets: Asset[];
  liabilities: Liability[];
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  bills: Bill[];
  onAddAsset: (a: Omit<Asset, "id">) => void;
  onUpdateAsset: (id: string, u: Partial<Asset>) => void;
  onDeleteAsset: (id: string) => void;
  onAddLiability: (l: Omit<Liability, "id">) => void;
  onUpdateLiability: (id: string, u: Partial<Liability>) => void;
  onDeleteLiability: (id: string) => void;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const assetIcons: Record<Asset["type"], typeof Building2> = {
  cash: Wallet, investment: TrendingUp, property: Building2, vehicle: Car, other: Package,
};

// Categories from bills that map to potential assets
const ASSET_BILL_CATEGORIES = new Set(["housing", "mortgage", "transportation"]);
const ASSET_BILL_KEYWORDS = ["home", "house", "mortgage", "car", "auto", "vehicle", "truck", "401k", "ira", "retir", "invest", "savings", "property"];

// Categories from bills that map to potential liabilities
const LIABILITY_BILL_CATEGORIES = new Set(["debt", "auto_payment"]);
const LIABILITY_BILL_KEYWORDS = ["loan", "credit", "debt", "finance", "mortgage", "auto pay", "car pay"];

function inferAssetType(bill: Bill): Asset["type"] {
  const name = bill.name.toLowerCase();
  if (name.includes("home") || name.includes("house") || name.includes("property") || bill.category === "mortgage" || bill.category === "housing") return "property";
  if (name.includes("car") || name.includes("auto") || name.includes("vehicle") || name.includes("truck") || bill.category === "transportation") return "vehicle";
  if (name.includes("401k") || name.includes("ira") || name.includes("retir") || name.includes("invest")) return "investment";
  if (name.includes("savings")) return "cash";
  return "other";
}

function inferLiabilityType(bill: Bill): Liability["type"] {
  const name = bill.name.toLowerCase();
  if (name.includes("mortgage") || bill.category === "mortgage") return "mortgage";
  if (name.includes("auto") || name.includes("car") || bill.category === "auto_payment") return "auto_loan";
  if (name.includes("student")) return "student_loan";
  if (name.includes("credit")) return "credit_card";
  if (name.includes("personal")) return "personal_loan";
  return "other";
}

interface Suggestion {
  billId: string;
  billName: string;
  amount: number;
  target: "asset" | "liability";
  type: Asset["type"] | Liability["type"];
  reason: string;
}

export default function NetWorthTracker({
  assets, liabilities, netWorth, totalAssets, totalLiabilities, bills,
  onAddAsset, onUpdateAsset, onDeleteAsset, onAddLiability, onUpdateLiability, onDeleteLiability,
}: NetWorthTrackerProps) {
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabForm, setShowLiabForm] = useState(false);
  const [assetForm, setAssetForm] = useState({ name: "", value: 0, type: "cash" as Asset["type"] });
  const [liabForm, setLiabForm] = useState({ name: "", balance: 0, interestRate: 0, minimumPayment: 0, type: "credit_card" as Liability["type"] });
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editAssetForm, setEditAssetForm] = useState({ name: "", value: 0, type: "cash" as Asset["type"] });
  const [editingLiabId, setEditingLiabId] = useState<string | null>(null);
  const [editLiabForm, setEditLiabForm] = useState({ name: "", balance: 0, interestRate: 0, minimumPayment: 0, type: "credit_card" as Liability["type"] });
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [showAssetInfo, setShowAssetInfo] = useState(false);
  const [showLiabInfo, setShowLiabInfo] = useState(false);

  // Generate suggestions from bills
  const suggestions = useMemo(() => {
    const existingAssetNames = new Set(assets.map(a => a.name.toLowerCase()));
    const existingLiabNames = new Set(liabilities.map(l => l.name.toLowerCase()));
    const results: Suggestion[] = [];
    const seen = new Set<string>(); // dedupe by "name|target"

    for (const bill of bills) {
      const name = bill.name.toLowerCase();
      if (dismissedSuggestions.has(name)) continue;

      // Check for potential assets
      const assetKey = `${name}|asset`;
      const isAssetCandidate = ASSET_BILL_CATEGORIES.has(bill.category) || ASSET_BILL_KEYWORDS.some(k => name.includes(k));
      if (isAssetCandidate && !existingAssetNames.has(name) && !seen.has(assetKey)) {
        seen.add(assetKey);
        const type = inferAssetType(bill);
        let reason = "";
        if (type === "property") reason = "You're making payments on this — the property itself is an asset worth tracking.";
        else if (type === "vehicle") reason = "Your vehicle has value even while you're paying it off.";
        else if (type === "investment") reason = "This appears to be an investment or retirement contribution.";
        else reason = "This bill may relate to something of value you own.";

        results.push({ billId: name, billName: bill.name, amount: bill.amount * 100, target: "asset", type, reason });
      }

      // Check for potential liabilities
      const liabKey = `${name}|liability`;
      const isLiabCandidate = LIABILITY_BILL_CATEGORIES.has(bill.category) || LIABILITY_BILL_KEYWORDS.some(k => name.includes(k));
      if (isLiabCandidate && !existingLiabNames.has(name) && !seen.has(liabKey)) {
        seen.add(liabKey);
        const type = inferLiabilityType(bill);
        let reason = "";
        if (type === "mortgage") reason = "Your mortgage is a liability — track the remaining balance here.";
        else if (type === "auto_loan") reason = "Your auto loan balance is a liability that decreases as you pay.";
        else if (type === "credit_card") reason = "Credit card balances are liabilities with interest charges.";
        else reason = "This bill may represent a debt or loan balance.";

        results.push({ billId: name, billName: bill.name, amount: bill.amount, target: "liability", type, reason });
      }
    }
    return results;
  }, [bills, assets, liabilities, dismissedSuggestions]);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name || assetForm.value <= 0) return;
    onAddAsset(assetForm);
    setAssetForm({ name: "", value: 0, type: "cash" });
    setShowAssetForm(false);
  };

  const handleAddLiab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabForm.name || liabForm.balance <= 0) return;
    onAddLiability(liabForm);
    setLiabForm({ name: "", balance: 0, interestRate: 0, minimumPayment: 0, type: "credit_card" });
    setShowLiabForm(false);
  };

  const startEditAsset = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setEditAssetForm({ name: asset.name, value: asset.value, type: asset.type });
  };

  const saveEditAsset = () => {
    if (!editingAssetId || !editAssetForm.name) return;
    onUpdateAsset(editingAssetId, editAssetForm);
    setEditingAssetId(null);
  };

  const startEditLiab = (liab: Liability) => {
    setEditingLiabId(liab.id);
    setEditLiabForm({ name: liab.name, balance: liab.balance, interestRate: liab.interestRate, minimumPayment: liab.minimumPayment, type: liab.type });
  };

  const saveEditLiab = () => {
    if (!editingLiabId || !editLiabForm.name) return;
    onUpdateLiability(editingLiabId, editLiabForm);
    setEditingLiabId(null);
  };

  const addSuggestion = (s: Suggestion) => {
    if (s.target === "asset") {
      onAddAsset({ name: s.billName, value: s.amount, type: s.type as Asset["type"] });
    } else {
      onAddLiability({ name: s.billName, balance: s.amount, interestRate: 0, minimumPayment: 0, type: s.type as Liability["type"] });
    }
    setDismissedSuggestions(prev => new Set([...prev, s.billId]));
  };

  const dismissSuggestion = (billId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, billId]));
  };

  return (
    <div className="space-y-6">
      {/* Net Worth Summary */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Net Worth</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Your net worth is the difference between what you <span className="text-primary font-medium">own</span> (assets) and what you <span className="text-destructive font-medium">owe</span> (liabilities). Tracking it over time shows your true financial progress.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Assets</p>
            <p className="font-mono text-xl font-bold text-primary">{fmt(totalAssets)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Liabilities</p>
            <p className="font-mono text-xl font-bold text-destructive">{fmt(totalLiabilities)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Net Worth</p>
            <p className={`font-mono text-xl font-bold ${netWorth >= 0 ? "text-primary" : "text-destructive"}`}>
              {fmt(netWorth)}
            </p>
          </div>
        </div>
      </div>

      {/* Smart Suggestions from Bills */}
      {suggestions.length > 0 && (
        <div className="glass-card p-5 border border-accent/30">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-accent-foreground" />
            Suggestions from Your Bills
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Based on your bills, these items may belong in your net worth tracker. Click to add them directly.
          </p>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <motion.div key={`${s.billId}-${s.target}`} layout initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${s.target === "asset" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
                      {s.target === "asset" ? "Asset" : "Liability"}
                    </span>
                    <p className="font-medium text-sm truncate">{s.billName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.reason}</p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => addSuggestion(s)} className="gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                  <button onClick={() => dismissSuggestion(s.billId)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Assets
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowAssetInfo(!showAssetInfo)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                <Info className="h-4 w-4" />
              </button>
              <Button size="sm" onClick={() => setShowAssetForm(!showAssetForm)}>
                {showAssetForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                {showAssetForm ? "Cancel" : "Add"}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showAssetInfo && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4 text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">What is an asset?</p>
                  <p>An asset is anything of value that you <strong>own</strong>. It contributes positively to your net worth.</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><strong>Cash & Savings</strong> — Checking, savings, emergency fund</li>
                    <li><strong>Investments</strong> — 401(k), IRA, stocks, bonds, crypto</li>
                    <li><strong>Property</strong> — Home, rental property, land</li>
                    <li><strong>Vehicles</strong> — Cars, trucks (current market value)</li>
                    <li><strong>Other</strong> — Jewelry, collectibles, business equity</li>
                  </ul>
                  <p className="text-xs italic">Tip: Enter the current market value, not what you paid.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAssetForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddAsset}
                className="grid grid-cols-1 gap-3 mb-4 overflow-hidden"
              >
                <Input placeholder="Asset name" value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} />
                <Input type="number" placeholder="Value" min={0} step={0.01} value={assetForm.value || ""} onChange={(e) => setAssetForm({ ...assetForm, value: parseFloat(e.target.value) || 0 })} />
                <Select value={assetForm.type} onValueChange={(v) => setAssetForm({ ...assetForm, type: v as Asset["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASSET_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit"><Plus className="h-4 w-4 mr-1" /> Add Asset</Button>
              </motion.form>
            )}
          </AnimatePresence>

          {assets.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No assets tracked yet.</p>
          ) : (
            <div className="space-y-2">
              {assets.map((asset) => {
                const Icon = assetIcons[asset.type] || Package;
                const isEditing = editingAssetId === asset.id;
                return (
                  <motion.div key={asset.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="px-3 py-2.5 rounded-lg bg-secondary/50"
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input value={editAssetForm.name} onChange={(e) => setEditAssetForm({ ...editAssetForm, name: e.target.value })} />
                        <Input type="number" min={0} step={0.01} value={editAssetForm.value || ""} onChange={(e) => setEditAssetForm({ ...editAssetForm, value: parseFloat(e.target.value) || 0 })} />
                        <Select value={editAssetForm.type} onValueChange={(v) => setEditAssetForm({ ...editAssetForm, type: v as Asset["type"] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(ASSET_TYPE_LABELS).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEditAsset}><Check className="h-4 w-4 mr-1" /> Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingAssetId(null)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{ASSET_TYPE_LABELS[asset.type]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-primary">{fmt(asset.value)}</span>
                          <button onClick={() => startEditAsset(asset)} className="text-muted-foreground hover:text-primary transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => onDeleteAsset(asset.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Liabilities */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" /> Liabilities
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowLiabInfo(!showLiabInfo)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                <Info className="h-4 w-4" />
              </button>
              <Button size="sm" onClick={() => setShowLiabForm(!showLiabForm)}>
                {showLiabForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                {showLiabForm ? "Cancel" : "Add"}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showLiabInfo && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4 text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">What is a liability?</p>
                  <p>A liability is any money you <strong>owe</strong>. It reduces your net worth and usually comes with interest charges.</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><strong>Credit Cards</strong> — Outstanding balances with high interest</li>
                    <li><strong>Mortgage</strong> — Remaining balance on your home loan</li>
                    <li><strong>Auto Loans</strong> — What you still owe on a vehicle</li>
                    <li><strong>Student Loans</strong> — Education debt (federal or private)</li>
                    <li><strong>Personal Loans</strong> — Any other borrowed money</li>
                  </ul>
                  <p className="text-xs italic">Tip: Enter the total remaining balance, not the monthly payment.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showLiabForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddLiab}
                className="grid grid-cols-1 gap-3 mb-4 overflow-hidden"
              >
                <Input placeholder="Debt name" value={liabForm.name} onChange={(e) => setLiabForm({ ...liabForm, name: e.target.value })} />
                <Input type="number" placeholder="Balance" min={0} step={0.01} value={liabForm.balance || ""} onChange={(e) => setLiabForm({ ...liabForm, balance: parseFloat(e.target.value) || 0 })} />
                <Input type="number" placeholder="Interest rate %" min={0} step={0.01} value={liabForm.interestRate || ""} onChange={(e) => setLiabForm({ ...liabForm, interestRate: parseFloat(e.target.value) || 0 })} />
                <Input type="number" placeholder="Min. payment" min={0} step={0.01} value={liabForm.minimumPayment || ""} onChange={(e) => setLiabForm({ ...liabForm, minimumPayment: parseFloat(e.target.value) || 0 })} />
                <Select value={liabForm.type} onValueChange={(v) => setLiabForm({ ...liabForm, type: v as Liability["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LIABILITY_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit"><Plus className="h-4 w-4 mr-1" /> Add Debt</Button>
              </motion.form>
            )}
          </AnimatePresence>

          {liabilities.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No debts tracked. Great job!</p>
          ) : (
            <div className="space-y-2">
              {liabilities.map((liab) => {
                const isEditing = editingLiabId === liab.id;
                return (
                  <motion.div key={liab.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="px-3 py-2.5 rounded-lg bg-secondary/50"
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input value={editLiabForm.name} onChange={(e) => setEditLiabForm({ ...editLiabForm, name: e.target.value })} />
                        <Input type="number" min={0} step={0.01} placeholder="Balance" value={editLiabForm.balance || ""} onChange={(e) => setEditLiabForm({ ...editLiabForm, balance: parseFloat(e.target.value) || 0 })} />
                        <Input type="number" min={0} step={0.01} placeholder="Interest rate %" value={editLiabForm.interestRate || ""} onChange={(e) => setEditLiabForm({ ...editLiabForm, interestRate: parseFloat(e.target.value) || 0 })} />
                        <Input type="number" min={0} step={0.01} placeholder="Min. payment" value={editLiabForm.minimumPayment || ""} onChange={(e) => setEditLiabForm({ ...editLiabForm, minimumPayment: parseFloat(e.target.value) || 0 })} />
                        <Select value={editLiabForm.type} onValueChange={(v) => setEditLiabForm({ ...editLiabForm, type: v as Liability["type"] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(LIABILITY_TYPE_LABELS).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEditLiab}><Check className="h-4 w-4 mr-1" /> Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingLiabId(null)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{liab.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {LIABILITY_TYPE_LABELS[liab.type]} · {liab.interestRate}% APR · Min {fmt(liab.minimumPayment)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-destructive">{fmt(liab.balance)}</span>
                          <button onClick={() => startEditLiab(liab)} className="text-muted-foreground hover:text-primary transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => onDeleteLiability(liab.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}