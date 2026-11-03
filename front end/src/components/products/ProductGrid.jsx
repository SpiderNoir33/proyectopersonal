import ProductCard from "./ProductCard.jsx";
import Spinner from "../ui/Spinner.jsx";
import ErrorMsg from "../ui/ErrorMsg.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import Button from "../ui/Button.jsx";

export default function ProductGrid({
  items,
  loading,
  error,
  hasMore,
  onLoadMore,
  emptyTitle = "No hay productos todavía",
  emptyHint,
}) {
  if (loading && items.length === 0) return <Spinner />;

  if (error && items.length === 0) return <ErrorMsg>{error}</ErrorMsg>;

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} hint={emptyHint} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {loading && <Spinner label="Cargando más..." />}

      {hasMore && !loading && onLoadMore && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={onLoadMore}>
            Cargar más
          </Button>
        </div>
      )}

      {error && items.length > 0 && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  );
}
