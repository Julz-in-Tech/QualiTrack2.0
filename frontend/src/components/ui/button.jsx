import * as React from "react";
import { cn } from "../../lib/utils";

const variantClasses = {
  default: "bg-primary text-primary-foreground shadow-sm hover:opacity-95",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:opacity-95",
  outline: "border border-input bg-background text-foreground hover:bg-muted",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "text-foreground hover:bg-muted",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-xs",
  lg: "h-11 px-8",
  icon: "h-10 w-10",
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? "span" : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant] || variantClasses.default,
          sizeClasses[size] || sizeClasses.default,
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
