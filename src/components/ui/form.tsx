import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-xl border border-border bg-white/[0.02] px-4 py-3 text-foreground outline-none transition-colors placeholder:text-faint focus:border-brand/60";

export function TextField({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-muted">
        {label}
        {required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

export function TextArea({
  name,
  label,
  rows = 5,
  required,
}: {
  name: string;
  label: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-muted">
        {label}
        {required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        className={cn(inputCls, "resize-none")}
      />
    </div>
  );
}

export function FileField({
  name,
  label,
  hint,
  accept,
}: {
  name: string;
  label: string;
  hint?: string;
  accept?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        className="w-full cursor-pointer rounded-xl border border-border bg-white/[0.02] px-4 py-3 text-sm text-muted outline-none transition-colors file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-1.5 file:text-sm file:text-foreground hover:border-border-strong"
      />
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </div>
  );
}

/** Hidden honeypot field — bots fill it, humans don't. */
export function Honeypot() {
  return (
    <div className="absolute left-[-9999px]" aria-hidden>
      <label htmlFor="company_website">Leave this empty</label>
      <input
        id="company_website"
        name="company_website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
