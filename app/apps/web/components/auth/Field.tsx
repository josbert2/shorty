import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Field = forwardRef<HTMLInputElement, Props>(function Field(
  { label, error, className, ...rest },
  ref
) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px]">
      <span className="text-muted">{label}</span>
      <input
        ref={ref}
        {...rest}
        className={cn(
          "h-10 rounded-lg border bg-surface-dim px-3 text-[14px] text-foreground outline-none transition-colors placeholder:text-faint",
          "focus:bg-surface/40 focus:ring-2 focus:ring-accent/30",
          error
            ? "border-danger/60 focus:border-danger focus:ring-danger/20"
            : "border-border-faint focus:border-border",
          className
        )}
      />
      {error && <span className="text-[12px] text-danger">{error}</span>}
    </label>
  );
});
