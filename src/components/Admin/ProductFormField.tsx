"use client";

type ProductFormFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  error?: string;
  helper?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  required?: boolean;
  min?: string;
  step?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export default function ProductFormField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  helper,
  inputMode,
  required = false,
  min,
  step,
  maxLength,
  multiline = false,
  rows = 3,
}: ProductFormFieldProps) {
  const describedBy =
    [error ? `${id}-error` : null, helper ? `${id}-help` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const fieldClassName = `w-full rounded-xl border bg-white px-3 text-sm text-black outline-none transition placeholder:text-muted ${focusRing} ${
    error ? "border-red-500" : "border-line"
  }`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-black">
        {label}
      </label>

      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          required={required}
          maxLength={maxLength}
          rows={rows}
          className={`${fieldClassName} min-h-[88px] resize-y py-2`}
        />
      ) : (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          required={required}
          min={min}
          step={step}
          maxLength={maxLength}
          className={`${fieldClassName} h-11`}
        />
      )}

      {helper && (
        <p id={`${id}-help`} className="text-xs text-muted">
          {helper}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
