import { useProducts } from "../hooks/useProducts.js";
import ProductGrid from "../components/products/ProductGrid.jsx";

export default function Home() {
  const { items, loading, error, reload, meta } = useProducts({ limit: 8 });

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-xl border border-line bg-surface/60 px-8 py-12 text-center">
        <h1 className="text-3xl font-semibold">
          Mi Tienda <span className="text-accent">de Electrónica</span> <p> y posiblemente vulnerable</p>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-dim">
          Catálogo hecho con Express,Node , MongoDB y React.
        </p>

      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-soft">Últimos productos</h2>
          <span className="text-sm text-dim">{meta.total} en total</span>
        </div>

        <ProductGrid
          items={items}
          loading={loading}
          error={error}
          emptyTitle="Todavía no hay productos"
          emptyHint="Crea el primero desde el backend (POST /api/products)"
        />

        {error && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={reload}
              className="text-sm text-accent underline underline-offset-4"
            >
              Reintentar
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
