import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Trash2, Check, X, Pencil, RefreshCw, CheckCircle2, ChevronDown, Search, AlertTriangle, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Bill, BillCategory, BillFrequency, BillOwner, PaymentAccount, ExpenseGroup } from "@/types/budget";
import { CATEGORY_LABELS, FREQUENCY_LABELS, getAssignedBillMonth, getMonthlyAmount, getYearMonthFromDateInput, suggestCategoryFromName } from "@/types/budget";

interface BillsListProps {
  bills: Bill[];
  allBills?: Bill[]; // all bills across all groups for autocomplete
  onAdd: (bill: Omit<Bill, "id">) => void;
  onUpdate: (id: string, updates: Partial<Bill>) => void;
  onDelete: (id: string) => void;
  title?: string;
  owner?: BillOwner;
  paymentAccounts?: PaymentAccount[];
  expenseGroups?: ExpenseGroup[];
  selectedMonth?: string;
  groupTotal?: number;
  onMarkAllPaid?: () => void;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const emptyBill = (owner: BillOwner = "household", month?: string) => ({
  name: "",
  amount: 0,
  category: "other" as BillCategory,
  frequency: "monthly" as BillFrequency,
  dueDate: 1,
  isPaid: false,
  autoPay: false,
  owner,
  paymentAccountId: "" as string,
  month: month || "",
  isRecurring: false,
  paidDate: undefined as string | undefined,
});

export default function BillsList({ bills, allBills, onAdd, onUpdate, onDelete, title = "Bills & Expenses", owner = "household", paymentAccounts = [], expenseGroups = [], selectedMonth, groupTotal, onMarkAllPaid }: BillsListProps) {
  const filteredBills = bills.filter((b) => {
    const ownerMatch = (b.owner ?? "household") === owner;
    const monthMatch = selectedMonth ? getAssignedBillMonth(b) === selectedMonth : true;
    return ownerMatch && monthMatch;
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyBill(owner, selectedMonth));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bill>>({});
  const [reviewEditId, setReviewEditId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<{ amount: number; dueDate: number }>({ amount: 0, dueDate: 1 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState<{ bill: Omit<Bill, "id">; match: Bill } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Build unique bill names from all bills for autocomplete
  const allBillNames = useMemo(() => {
    const source = allBills || bills;
    const names = new Set(source.map((b) => b.name).filter(Boolean));
    return Array.from(names).sort();
  }, [allBills, bills]);

  const filteredSuggestions = useMemo(() => {
    if (!form.name || form.name.length === 0) return [];
    const query = form.name.toLowerCase();
    return allBillNames.filter(
      (name) => name.toLowerCase().includes(query) && name.toLowerCase() !== query
    );
  }, [form.name, allBillNames]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        nameInputRef.current && !nameInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (name: string) => {
    // Find the most recent bill with this name to prefill details
    const source = allBills || bills;
    const match = source.filter((b) => b.name === name).pop();
    if (match) {
      setForm({
        ...form,
        name: match.name,
        amount: match.amount,
        category: match.category,
        frequency: match.frequency,
        dueDate: match.dueDate,
        autoPay: match.autoPay,
        paymentAccountId: match.paymentAccountId || "",
        isRecurring: match.isRecurring || false,
      });
    } else {
      const suggested = suggestCategoryFromName(name);
      setForm({ ...form, name, ...(suggested ? { category: suggested } : {}) });
    }
    setShowSuggestions(false);
  };

  const addBillWithRecurring = (newBill: Omit<Bill, "id">) => {
    onAdd(newBill);
    if (newBill.isRecurring && selectedMonth) {
      const nextMonth = shiftMonth(selectedMonth, 1);
      onAdd({ ...newBill, month: nextMonth, isPaid: false, isRecurring: true, pendingReview: true });
    }
    setForm(emptyBill(owner, selectedMonth));
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.amount <= 0) return;
    const newBill: Omit<Bill, "id"> = { ...form, month: selectedMonth || form.month };

    // Check for duplicate: same name, category, and month
    const targetMonth = selectedMonth || form.month;
    const duplicate = filteredBills.find(
      (b) =>
        b.name.toLowerCase() === form.name.toLowerCase() &&
        b.category === form.category &&
        getAssignedBillMonth(b) === targetMonth
    );

    if (duplicate) {
      setDuplicateWarning({ bill: newBill, match: duplicate });
      return;
    }

    addBillWithRecurring(newBill);
  };

  const confirmDuplicate = () => {
    if (duplicateWarning) {
      addBillWithRecurring(duplicateWarning.bill);
      setDuplicateWarning(null);
    }
  };

  const startEdit = (bill: Bill) => {
    setEditingId(bill.id);
    setEditForm({ name: bill.name, amount: bill.amount, category: bill.category, frequency: bill.frequency, dueDate: bill.dueDate, autoPay: bill.autoPay, paymentAccountId: bill.paymentAccountId, owner: bill.owner, paidDate: bill.paidDate, month: getAssignedBillMonth(bill) });
  };

  const saveEdit = (id: string) => {
    if (editForm.name && (editForm.amount ?? 0) > 0) {
      const updates = { ...editForm };
      if (updates.paidDate) {
        updates.month = getYearMonthFromDateInput(updates.paidDate);
      }
      onUpdate(id, updates);
    }
    setEditingId(null);
  };

  const acceptReview = (bill: Bill) => {
    onUpdate(bill.id, { pendingReview: false });
  };

  const startReviewEdit = (bill: Bill) => {
    setReviewEditId(bill.id);
    setReviewForm({ amount: bill.amount, dueDate: bill.dueDate });
  };

  const acceptReviewEdit = (bill: Bill) => {
    onUpdate(bill.id, { amount: reviewForm.amount, dueDate: reviewForm.dueDate, pendingReview: false });
    setReviewEditId(null);
  };

  // Toggle recurring: mark current bill as recurring, and create a copy in next month
  const toggleRecurring = (bill: Bill) => {
    if (bill.isRecurring) {
      // Turn off recurring
      onUpdate(bill.id, { isRecurring: false });
    } else {
      // Turn on recurring + create next month copy
      onUpdate(bill.id, { isRecurring: true });
      if (selectedMonth) {
        const nextMonth = shiftMonth(selectedMonth, 1);
        // Check if already exists in next month
        const existsInNext = bills.some(
          (b) => b.name === bill.name && (b.owner ?? "household") === owner && b.month === nextMonth
        );
        if (!existsInNext) {
          const { id, ...rest } = bill;
          onAdd({
            ...rest,
            month: nextMonth,
            isPaid: false,
            isRecurring: true,
            pendingReview: true,
          });
        }
      }
    }
  };

  const searchLower = searchQuery.toLowerCase();
  const matchesSearch = (bill: Bill) => {
    if (!searchQuery) return true;
    return (
      bill.name.toLowerCase().includes(searchLower) ||
      bill.amount.toString().includes(searchQuery) ||
      fmt(bill.amount).toLowerCase().includes(searchLower)
    );
  };

  const pendingBills = filteredBills.filter((b) => b.pendingReview && matchesSearch(b));
  const confirmedBills = filteredBills.filter((b) => !b.pendingReview && matchesSearch(b));
  const hasBills = filteredBills.length > 0;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          {groupTotal !== undefined && groupTotal > 0 && (
            <span className="text-destructive font-bold font-mono text-base">
              {fmt(groupTotal)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasBills && onMarkAllPaid && (
            <Button size="sm" variant="outline" onClick={onMarkAllPaid}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Mark All Paid
            </Button>
          )}
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "Add Bill"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 overflow-hidden"
          >
            <div className="relative col-span-2 md:col-span-1">
              <Input
                ref={nameInputRef}
                placeholder="Bill name"
                value={form.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  const suggested = suggestCategoryFromName(newName);
                  setForm({ ...form, name: newName, ...(suggested && form.category === "other" ? { category: suggested } : {}) });
                  setShowSuggestions(true);
                }}
                onFocus={() => form.name.length > 0 && setShowSuggestions(true)}
                autoComplete="off"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto"
                >
                  {filteredSuggestions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => selectSuggestion(name)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input
              type="number"
              placeholder="Amount"
              min={0}
              step={0.01}
              value={form.amount || ""}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            />
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as BillCategory })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as BillFrequency })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Due day (1-31)"
              min={1}
              max={31}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: parseInt(e.target.value) || 1 })}
            />
            <div className="flex items-center gap-2">
              <Switch checked={form.autoPay} onCheckedChange={(v) => setForm({ ...form, autoPay: v })} />
              <span className="text-sm text-muted-foreground">Auto-pay</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isRecurring} onCheckedChange={(v) => setForm({ ...form, isRecurring: v })} />
              <span className="text-sm text-muted-foreground">Recurring Bill</span>
            </div>
            {/* Date Paid picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !form.paidDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.paidDate ? format(new Date(form.paidDate + "T00:00:00"), "MMM d, yyyy") : "Date Paid"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.paidDate ? new Date(form.paidDate + "T00:00:00") : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                      setForm({ ...form, paidDate: iso });
                    } else {
                      setForm({ ...form, paidDate: undefined });
                    }
                  }}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {paymentAccounts.length > 0 && (
              <Select value={form.paymentAccountId || "none"} onValueChange={(v) => setForm({ ...form, paymentAccountId: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Account</SelectItem>
                  {paymentAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.nickname || acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button type="submit" className="col-span-2 md:col-span-1">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search bar */}
      {hasBills && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Pending Review Bills */}
      {pendingBills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-warning uppercase tracking-wider mb-2">
            ⏳ Recurring — Needs Review
          </p>
          <div className="space-y-2">
            {pendingBills.map((bill) => (
              <motion.div
                key={bill.id}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent/50 border border-accent"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmt(bill.amount)} · Due {bill.dueDate}th · {FREQUENCY_LABELS[bill.frequency]}
                  </p>
                </div>

                {reviewEditId === bill.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={reviewForm.amount || ""}
                      onChange={(e) => setReviewForm({ ...reviewForm, amount: parseFloat(e.target.value) || 0 })}
                      className="w-24 h-8 text-sm"
                      placeholder="Amount"
                    />
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={reviewForm.dueDate}
                      onChange={(e) => setReviewForm({ ...reviewForm, dueDate: parseInt(e.target.value) || 1 })}
                      className="w-20 h-8 text-sm"
                      placeholder="Day"
                    />
                    <Button size="sm" variant="default" onClick={() => acceptReviewEdit(bill)}>
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReviewEditId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => acceptReview(bill)} title="Same price — accept as-is">
                      <Check className="h-4 w-4 mr-1" /> Confirm
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => startReviewEdit(bill)} title="Edit amount or due date">
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteConfirmId(bill.id)} title="Remove">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {confirmedBills.length === 0 && pendingBills.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No expenses added yet. Click "Add Bill" to get started.</p>
      ) : confirmedBills.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr,auto,auto,auto,auto,auto,auto] gap-2 text-xs text-muted-foreground font-medium px-3 pb-1">
            <span>Name</span>
            <span className="w-16 text-right">Amount</span>
            <span className="w-10 text-center">Due</span>
            <span className="w-20 text-center">Paid On</span>
            <span className="w-10 text-center">Paid</span>
            <span className="w-6" />
            <span className="w-14" />
          </div>
          <AnimatePresence>
            {[...confirmedBills].reverse().map((bill) => {
              const isEditing = editingId === bill.id;

              if (isEditing) {
                return (
                  <motion.div
                    key={bill.id}
                    layout
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center px-3 py-3 rounded-lg bg-accent/50 border border-primary/20"
                  >
                    <Input
                      value={editForm.name ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="col-span-2 md:col-span-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={editForm.amount ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                    />
                    <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v as BillCategory })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={editForm.frequency} onValueChange={(v) => setEditForm({ ...editForm, frequency: v as BillFrequency })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Due day"
                      min={1}
                      max={31}
                      value={editForm.dueDate ?? 1}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: parseInt(e.target.value) || 1 })}
                    />
                    <div className="flex items-center gap-2">
                      <Switch checked={editForm.autoPay ?? false} onCheckedChange={(v) => setEditForm({ ...editForm, autoPay: v })} />
                      <span className="text-sm text-muted-foreground">Auto-pay</span>
                    </div>
                    {paymentAccounts.length > 0 && (
                      <Select value={editForm.paymentAccountId || "none"} onValueChange={(v) => setEditForm({ ...editForm, paymentAccountId: v === "none" ? "" : v })}>
                        <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Account</SelectItem>
                          {paymentAccounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.nickname || acc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {expenseGroups.length > 1 && (
                      <Select value={editForm.owner as string || owner} onValueChange={(v) => setEditForm({ ...editForm, owner: v })}>
                        <SelectTrigger><SelectValue placeholder="Move to group" /></SelectTrigger>
                        <SelectContent>
                          {expenseGroups.map((g) => (
                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Date Paid</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !editForm.paidDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editForm.paidDate ? format(new Date(editForm.paidDate + "T00:00:00"), "MMM d, yyyy") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={editForm.paidDate ? new Date(editForm.paidDate + "T00:00:00") : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                                setEditForm({ ...editForm, paidDate: iso, month: getYearMonthFromDateInput(iso) });
                              } else {
                                setEditForm({ ...editForm, paidDate: undefined });
                              }
                            }}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex gap-2 col-span-2 md:col-span-1">
                      <Button size="sm" onClick={() => saveEdit(bill.id)}>
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={bill.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="grid grid-cols-[1fr,auto,auto,auto,auto,auto,auto,auto,auto] gap-3 items-center px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-sm">{bill.name}</p>
                      {bill.isRecurring && (
                        <span title="Recurring bill"><RefreshCw className="h-3 w-3 text-primary" /></span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[bill.category]} · {FREQUENCY_LABELS[bill.frequency]}
                      {bill.autoPay && " · Auto"}
                      {bill.paymentAccountId && paymentAccounts.length > 0 && (() => {
                        const acc = paymentAccounts.find(a => a.id === bill.paymentAccountId);
                        return acc ? ` · ${acc.nickname || acc.name}` : "";
                      })()}
                    </p>
                  </div>
                  <span className="w-20 text-right font-mono text-sm">{fmt(bill.amount)}</span>
                  <span className="w-20 text-right font-mono text-sm text-muted-foreground">
                    {fmt(getMonthlyAmount(bill.amount, bill.frequency))}
                  </span>
                  <span className="w-16 text-center text-xs font-medium">{bill.dueDate}{bill.dueDate === 1 ? "st" : bill.dueDate === 2 ? "nd" : bill.dueDate === 3 ? "rd" : "th"}</span>
                  <div className="w-24 flex justify-center">
                    <input
                      type="date"
                      value={bill.paidDate ?? ""}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        const updates: Partial<Bill> = { paidDate: val };
                        if (val) {
                          updates.month = getYearMonthFromDateInput(val);
                        }
                        onUpdate(bill.id, updates);
                      }}
                      className="w-full text-xs bg-transparent border-none text-center text-muted-foreground focus:text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="w-16 flex justify-center">
                    <button
                      onClick={() => {
                        const nowPaid = !bill.isPaid;
                        const today = new Date().toISOString().split("T")[0];
                        const paidDate = nowPaid ? (bill.paidDate || today) : undefined;
                        onUpdate(bill.id, { isPaid: nowPaid, paidDate });
                      }}
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        bill.isPaid
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/30 hover:border-primary/50"
                      }`}
                    >
                      {bill.isPaid && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                    </button>
                  </div>
                  {/* Recurring dropdown */}
                  <div className="w-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`text-muted-foreground hover:text-primary transition-colors ${bill.isRecurring ? 'text-primary' : ''}`} title="Recurring options">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg z-50">
                        <DropdownMenuItem onClick={() => toggleRecurring(bill)}>
                          {bill.isRecurring ? (
                            <>
                              <X className="h-4 w-4 mr-2" /> Remove Recurring
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" /> Make Recurring Bill
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <button onClick={() => startEdit(bill)} className="w-8 text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteConfirmId(bill.id)} className="w-8 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : null}
      {/* Duplicate Warning Dialog */}
      <AlertDialog open={!!duplicateWarning} onOpenChange={(o) => !o && setDuplicateWarning(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Possible Duplicate Bill
            </AlertDialogTitle>
            <AlertDialogDescription>
              A bill named "<strong>{duplicateWarning?.match.name}</strong>" in the same category ({CATEGORY_LABELS[duplicateWarning?.match.category as keyof typeof CATEGORY_LABELS] || duplicateWarning?.match.category}) already exists this month for {fmt(duplicateWarning?.match.amount || 0)}. Do you still want to add this bill?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDuplicate}>Add Anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this bill. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteConfirmId) { onDelete(deleteConfirmId); setDeleteConfirmId(null); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
