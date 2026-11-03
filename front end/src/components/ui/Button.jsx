const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-accent text-night hover:bg-accent-2",
  ghost:
    "border border-line bg-surface text-soft hover:border-accent hover:text-accent",
  danger: "border border-danger/60 text-danger hover:bg-danger hover:text-night",
};

export const buttonClasses = (variant = "primary") =>
  `${base} ${variants[variant] ?? variants.primary}`;

export default function Button({
  variant = "primary",
  type = "button",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`${buttonClasses(variant)} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
