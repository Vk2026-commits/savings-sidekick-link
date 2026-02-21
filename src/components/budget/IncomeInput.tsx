import { useState } from "react";
import { DollarSign, Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

interface IncomeInputProps {
  income: number;
  onUpdate: (income: number) => void;
}

export default function IncomeInput({ income, onUpdate }: IncomeInputProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(income.toString());

  const save = () => {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) onUpdate(parsed);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => { setValue(income.toString()); setEditing(true); }}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <DollarSign className="h-4 w-4" />
        <span className="text-sm">
          Monthly Income: <span className="font-mono font-semibold text-foreground">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(income)}
          </span>
        </span>
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <DollarSign className="h-4 w-4 text-muted-foreground" />
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        autoFocus
        className="h-8 w-40 text-sm"
        min={0}
        step={0.01}
      />
      <button onClick={save} className="text-primary hover:text-primary/80">
        <Check className="h-4 w-4" />
      </button>
    </div>
  );
}
