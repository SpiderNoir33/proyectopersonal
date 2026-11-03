export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm text-dim">{label}</span>
      <input
        id={id}
        className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-soft placeholder:text-dim transition-colors duration-200 focus:outline-none focus:border-accent ${
          error ? "border-danger" : "border-line"
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}
