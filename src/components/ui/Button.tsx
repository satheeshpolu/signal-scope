import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/ui/cn";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 font-medium",
    "rounded-md transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary-600 text-text-primary",
          "hover:bg-primary-500 active:bg-primary-700",
        ],
        ghost: [
          "bg-transparent text-text-secondary",
          "hover:bg-surface-800 hover:text-text-primary active:bg-surface-700",
        ],
        danger: [
          "bg-danger-500 text-text-primary",
          "hover:brightness-110 active:brightness-90",
        ],
        outline: [
          "border border-border-default bg-transparent text-text-secondary",
          "hover:bg-surface-800 hover:text-text-primary",
        ],
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-8 px-3.5 text-sm",
        lg: "h-10 px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
