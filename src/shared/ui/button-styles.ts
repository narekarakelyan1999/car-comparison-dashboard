export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "default" | "compact";

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-blue-700 bg-blue-700 text-white hover:border-blue-800 hover:bg-blue-800 active:border-blue-900 active:bg-blue-900",
  secondary:
    "border border-slate-300 text-slate-900 hover:border-slate-400 hover:bg-slate-100 active:bg-slate-200",
};

const buttonInteractiveClassName =
  "cursor-pointer transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100";

const buttonSizeClasses: Record<ButtonSize, string> = {
  default: "min-h-11 px-4 text-sm",
  compact: "min-h-11 min-w-11 px-3 text-sm",
};

const buttonDisabledClassName = "cursor-not-allowed border border-slate-200 text-slate-400";

type ButtonClassNameOptions = {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled?: boolean;
  interactive?: boolean;
  className?: string;
};

export function buttonClassName({
  variant,
  size,
  disabled = false,
  interactive = true,
  className,
}: ButtonClassNameOptions): string {
  return [
    "inline-flex items-center justify-center rounded-md font-medium",
    buttonSizeClasses[size],
    disabled ? buttonDisabledClassName : buttonVariantClasses[variant],
    !disabled && interactive ? buttonInteractiveClassName : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
