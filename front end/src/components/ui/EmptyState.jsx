export default function EmptyState({ title, hint }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface/50 px-6 py-12 text-center">
      <p className="text-soft">{title}</p>
      {hint && <p className="mt-1 text-sm text-dim">{hint}</p>}
    </div>
  );
}
