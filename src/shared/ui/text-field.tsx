type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: "text" | "number";
  inputMode?: "text" | "numeric";
  min?: number;
  max?: number;
  step?: number;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  inputMode,
  min,
  max,
  step,
}: TextFieldProps) {
  return (
    <label className="block text-slate-900" htmlFor={id}>
      {label}
      <input
        id={id}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
        type={type}
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
    </label>
  );
}
