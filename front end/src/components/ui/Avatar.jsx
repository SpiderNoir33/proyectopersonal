// Avatar de iniciales: sin fotos ni llamadas al backend. El color es
// determinístico del nombre (mismo nombre → mismo color siempre).
const COLORS = [
  "bg-rose-500/20 text-rose-300",
  "bg-sky-500/20 text-sky-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-amber-500/20 text-amber-300",
  "bg-violet-500/20 text-violet-300",
  "bg-cyan-500/20 text-cyan-300",
];

const hash = (text) =>
  [...text].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export default function Avatar({ nombre = "", size = "md" }) {
  const iniciales = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  const color = COLORS[hash(nombre) % COLORS.length];

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${color} ${SIZES[size] ?? SIZES.md}`}
    >
      {iniciales || "?"}
    </span>
  );
}
