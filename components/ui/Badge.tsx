// src/components/ui/Badge.tsx
import { cn } from "@/lib/utils";

type BadgeColor =
  | "teal"
  | "indigo"
  | "rose"
  | "amber"
  | "sky"
  | "stone"
  | "salmon";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  teal: "bg-teal-50 text-teal-700 border-teal-100",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  sky: "bg-sky-50 text-sky-700 border-sky-100",
  stone: "bg-stone-100 text-stone-600 border-stone-200",
  salmon: "bg-salmon-50 text-salmon-700 border-salmon-200",
};

export function Badge({ children, color = "stone", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md border",
        colorMap[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
