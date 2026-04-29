import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical } from "lucide-react";
import { ReactNode } from "react";

interface SortableSectionProps {
  id: string;
  children: ReactNode;
  /** When false, the drag handle is hidden and the section is not sortable. */
  enabled?: boolean;
  /** Optional title shown in the collapsed header bar. */
  title?: string;
  /** Whether the section is currently collapsed. */
  collapsed?: boolean;
  /** Called with the next collapsed state when the user toggles. */
  onToggleCollapsed?: (next: boolean) => void;
}

/**
 * Wraps a dashboard section so it can be reordered via a drag handle and
 * (optionally) collapsed/expanded without changing its position in the layout.
 */
export default function SortableSection({
  id,
  children,
  enabled = true,
  title,
  collapsed = false,
  onToggleCollapsed,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !enabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const collapsible = !!onToggleCollapsed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? "opacity-80 ring-2 ring-primary/40 rounded-xl" : ""}`}
    >
      {enabled && (
        <button
          type="button"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
          className="absolute -left-1 sm:-left-2 top-3 z-10 h-7 w-5 sm:w-6 flex items-center justify-center rounded-md bg-card/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-opacity touch-none"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      {collapsible && (
        <button
          type="button"
          aria-label={collapsed ? `Expand ${title ?? "section"}` : `Collapse ${title ?? "section"}`}
          aria-expanded={!collapsed}
          onClick={() => onToggleCollapsed!(!collapsed)}
          className="absolute right-2 top-3 z-10 h-7 w-7 flex items-center justify-center rounded-md bg-card/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card opacity-70 hover:opacity-100 transition-opacity"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
        </button>
      )}

      {collapsed ? (
        <button
          type="button"
          onClick={() => onToggleCollapsed?.(false)}
          className="w-full glass-card px-4 py-3 flex items-center justify-between text-left hover:bg-card/60 transition-colors"
        >
          <span className="text-sm font-semibold pl-4">{title ?? "Section"}</span>
          <span className="text-xs text-muted-foreground pr-9">Collapsed — click to expand</span>
        </button>
      ) : (
        children
      )}
    </div>
  );
}
