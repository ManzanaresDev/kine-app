// src/components/ui/Button.tsx
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ElementType } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  as?: ElementType;
  href?: string;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-salmon-500 text-white hover:bg-salmon-600 shadow-sm shadow-salmon-500/20",
  secondary:
    "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300",
  ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
  danger: "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
};

export function Button({
  variant = "secondary",
  size = "md",
  as: Tag = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <Tag
      className={cn(
        "inline-flex items-center gap-1.5 font-medium transition-all duration-150 cursor-pointer",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
