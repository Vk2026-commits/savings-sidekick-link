import { useState } from "react";
import { Plus, Trash2, X, TrendingUp, TrendingDown, Building2, Car, Landmark, Wallet, Package, Pencil, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Asset, Liability } from "@/types/budget";
import { ASSET_TYPE_LABELS, LIABILITY_TYPE_LABELS } from "@/types/budget";

interface NetWorthTrackerProps {
  assets: Asset[];
  liabilities: Liability[];
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
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

export default function NetWorthTracker({
  assets, liabilities, netWorth, totalAssets, totalLiabilities,
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

  return (
    <div className="space-y-6">
      {/* Net Worth Summary */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Net Worth</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Assets
            </h3>
            <Button size="sm" onClick={() => setShowAssetForm(!showAssetForm)}>
              {showAssetForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {showAssetForm ? "Cancel" : "Add"}
            </Button>
          </div>

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" /> Liabilities
            </h3>
            <Button size="sm" onClick={() => setShowLiabForm(!showLiabForm)}>
              {showLiabForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {showLiabForm ? "Cancel" : "Add"}
            </Button>
          </div>

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