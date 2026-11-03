import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export default function SearchBar() {
  const [abierto, setAbierto] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const enProductos = location.pathname.startsWith("/productos");

  useEffect(() => {
    const urlQ = new URLSearchParams(location.search).get("q") ?? "";
    setQ((actual) => (actual === urlQ ? actual : urlQ));
  }, [location.pathname, location.search]);

  useEffect(() => {
    const texto = q.trim();

    if (texto.length < 2) {
      if (enProductos && searchParams.has("q")) {
        searchParams.delete("q");
        navigate(
          searchParams.toString() ? `/productos?${searchParams}` : "/productos",
          { replace: true }
        );
      }
      return;
    }

    const timer = setTimeout(() => {

      if (enProductos && new URLSearchParams(location.search).get("q") === texto) {
        return;
      }
      const params = new URLSearchParams(enProductos ? location.search : "");
      params.set("q", texto);
      navigate(`/productos?${params}`, { replace: true });
    }, 250);

    return () => clearTimeout(timer);
  }, [q, enProductos, location.pathname, location.search, searchParams, navigate]);

  const onAbrir = () => {
    setAbierto((v) => !v);
    if (!abierto) setTimeout(() => inputRef.current?.focus(), 50);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setQ("");
      setAbierto(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onAbrir}

        onMouseDown={(e) => e.preventDefault()}
        aria-label={abierto ? "Cerrar búsqueda" : "Buscar"}
        className={`rounded-xl px-2.5 py-2 transition-colors ${
          abierto ? "text-accent" : "text-dim hover:text-soft"
        }`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>

      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => setAbierto(false)}
        placeholder="Buscar productos..."
        aria-label="Buscar productos"
        className={`overflow-hidden rounded-xl border text-sm text-soft transition-all duration-300 placeholder:text-dim focus:outline-none focus:border-accent ${
          abierto
            ? "w-40 border-line bg-surface px-3 py-2 opacity-100 sm:w-56"
            : "w-0 border-transparent bg-transparent px-0 py-2 opacity-0"
        }`}
      />
    </div>
  );
}
