import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as sellersApi from "../api/sellers.js";
import { useProducts } from "../hooks/useProducts.js";
import { apiErrorMessage } from "../utils/errors.js";
import ProductGrid from "../components/products/ProductGrid.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import ErrorMsg from "../components/ui/ErrorMsg.jsx";
import Spinner from "../components/ui/Spinner.jsx";

export default function SellerPage() {
  const { id } = useParams();

  const [seller, setSeller] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const {
    items,
    loading: loadingProducts,
    error: productsError,
    loadMore,
    hasMore,
    meta,
  } = useProducts({ owner: id, limit: 12 });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    sellersApi
      .getSeller(id)
      .then((res) => alive && setSeller(res.data.seller))
      .catch((err) => alive && setError(apiErrorMessage(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <Spinner label="Cargando vendedor..." />;

  // Cuenta desactivada o id inexistente: el backend responde 404
  if (error) return <ErrorMsg>{error}</ErrorMsg>;
  if (!seller) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-xl border border-line bg-surface/60 px-6 py-5">
        <Avatar nombre={seller.nombre} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-medium text-soft">
            {seller.nombre}
          </h1>
          <p className="text-sm text-dim">
            {meta.total} {meta.total === 1 ? "producto" : "productos"} a la venta
          </p>
        </div>
      </div>

      <ProductGrid
        items={items}
        loading={loadingProducts}
        error={productsError}
        hasMore={hasMore}
        onLoadMore={loadMore}
        emptyTitle="Este vendedor todavía no tiene productos"
      />
    </div>
  );
}
