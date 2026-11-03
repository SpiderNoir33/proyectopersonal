export default function ErrorMsg({ children, className = "" }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={`rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger ${className}`}
    >
      {children}
    </p>
  );
}
