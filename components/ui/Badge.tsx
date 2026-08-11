import type { HTMLAttributes } from "react";

type Variant = "default" | "pr" | "muted";

const variantClasses: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  pr: "bg-pr/15 text-pr",
  muted: "bg-muted text-muted-foreground",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
