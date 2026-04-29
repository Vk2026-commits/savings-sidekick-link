import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";

interface SortableSectionProps {
  id: string;
  children: ReactNode;
  /** When false, the drag handle is hidden and the section is not sortable. */
  enabled?: boolean;
}

/**
 * Wraps a dashboard section so it can be reordered via a drag handle.
 * The handle is the only drag activator — content inside remains fully interactive.
 */
export default function SortableSection({ id, children, enabled = true }: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !enabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

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
      {children}
    </div>
  );
}
