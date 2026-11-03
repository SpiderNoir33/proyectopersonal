import { Link } from "react-router-dom";
import { buttonClasses } from "../components/ui/Button.jsx";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-surface/60 px-8 py-12 text-center">
      <p className="text-3xl font-semibold text-accent">404</p>
      <p className="mt-2 text-soft">Esta página no existe</p>
      <Link to="/" className={`${buttonClasses("ghost")} mt-6`}>
        Volver al inicio
      </Link>
    </div>
  );
}
