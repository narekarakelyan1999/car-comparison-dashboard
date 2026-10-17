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
  const controlClassName =
    "box-border h-12 w-full appearance-none rounded-md border border-slate-300 bg-white py-0 pl-3 pr-10 text-base leading-normal text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70";
  const fieldClassName = ["relative mt-1 block w-full", selectClassName].filter(Boolean).join(" ");

  return (
    <label className={labelClassName} htmlFor={id}>
      {label}
      <span className={fieldClassName}>
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
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute top-1/2 right-4 size-2 -translate-y-1/2 rotate-45 border-r-2 border-b-2 border-slate-700",
            disabled ? "opacity-70" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </span>
    </label>
  );
}
