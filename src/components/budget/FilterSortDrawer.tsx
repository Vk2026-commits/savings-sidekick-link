import { ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface FilterSortDrawerProps {
  /** Number of active (non-default) filters — shows a badge on the trigger. */
  activeCount?: number;
  /** Optional handler to reset filters/sort to defaults. */
  onReset?: () => void;
  /** Sections rendered inside the drawer (filter groups, sort options, etc.). */
  children: ReactNode;
  /** Trigger label (defaults to "Filter & Sort"). */
  triggerLabel?: string;
}

export default function FilterSortDrawer({
  activeCount = 0,
  onReset,
  children,
  triggerLabel = "Filter & Sort",
}: FilterSortDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline" className="relative">
          <SlidersHorizontal className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">{triggerLabel}</span>
          {activeCount > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center rounded-full"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="sm:max-w-md sm:mx-auto rounded-t-2xl max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center justify-between">
            <span>{triggerLabel}</span>
            {onReset && activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">{children}</div>

        <SheetFooter className="sticky bottom-0 bg-background pt-3 pb-2 border-t">
          <SheetClose asChild>
            <Button className="w-full">Apply</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** Labelled section inside the drawer (e.g. "Status", "Category", "Sort by"). */
export function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

/** Pill-style toggle group — taps stay inside the drawer for one-handed use. */
export function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              "px-3 py-1.5 rounded-full text-sm border transition-colors " +
              (active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/40")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
