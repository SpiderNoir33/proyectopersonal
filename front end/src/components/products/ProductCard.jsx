import { Link } from "react-router-dom";
import { productPath } from "../../domain/product.js";
import { formatPrice } from "../../utils/formatters.js";

export default function ProductCard({ product }) {
  const imagen = product?.imagenes?.[0];
  const sinStock = (product?.stock ?? 0) <= 0;

  return (
    <Link to={productPath(product)} className="block h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors duration-200 hover:border-accent">
      <div className="flex h-36 items-center justify-center overflow-hidden bg-night">
        {imagen ? (
          <img
            src={imagen}
            alt={product.nombre}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-4xl text-muted">🎮</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-soft">{product.nombre}</h3>
          <span className="rounded-lg bg-night px-2 py-0.5 text-xs text-dim">
            {product.categoria}
          </span>
        </div>

        {product.descripcion && (
          <p className="line-clamp-2 text-sm text-dim">{product.descripcion}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-semibold text-accent">
            {formatPrice(product.precio)}
          </span>
          <span
            className={`text-xs ${sinStock ? "text-danger" : "text-dim"}`}
          >
            {sinStock ? "Sin stock" : `${product.stock} en stock`}
          </span>
        </div>
      </div>
      </article>
    </Link>
  );
}
