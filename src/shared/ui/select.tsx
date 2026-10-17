import type { ChangeEvent, ReactNode } from "react";

type SelectProps = {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  describedBy?: string;
  className?: string;
  selectClassName?: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
};

export function Select({
  id,
  label,
  value,
  disabled = false,
  describedBy,
  className,
  selectClassName,
  onChange,
  children,
}: SelectProps) {
  const labelClassName = ["block text-sm font-medium text-slate-900", className]
    .filter(Boolean)
    .join(" ");
  const controlClassName = [
    "mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70",
    selectClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={labelClassName} htmlFor={id}>
      {label}
      <select
        id={id}
        className={controlClassName}
        value={value}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={onChange}
      >
        {children}
      </select>
    </label>
  );
}
