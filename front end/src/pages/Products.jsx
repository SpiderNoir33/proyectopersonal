import { useSearchParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts.js";
import ProductGrid from "../components/products/ProductGrid.jsx";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";

  // nombre viene del buscador del header (?q=...). El hook refetchea solo
  // cuando cambian los params.
  const { items, loading, error, loadMore, hasMore, meta } = useProducts({
    limit: 12,
    ...(q && { nombre: q }),
  });

  const limpiar = () => setSearchParams({}, { replace: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-medium text-soft">
          {q ? (
            <>
              Resultados para <span className="text-accent">«{q}»</span>
            </>
          ) : (
            "Productos"
          )}
        </h1>
        <div className="flex items-center gap-3">
          {q && (
            <button
              type="button"
              onClick={limpiar}
              className="text-sm text-accent underline underline-offset-4"
            >
              Limpiar búsqueda
            </button>
          )}
          <span className="text-sm text-dim">
            {items.length} de {meta.total}
          </span>
        </div>
      </div>

      <ProductGrid
        items={items}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        emptyTitle={
          q ? "No encontramos productos con ese nombre" : "No hay productos en el catálogo"
        }
        emptyHint={q ? "Prueba con otra palabra" : undefined}
      />
    </div>
  );
}
