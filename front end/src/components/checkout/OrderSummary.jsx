import { formatPrice } from "../../utils/formatters.js";

export default function OrderSummary({ product, comprador }) {
  const imagen = product?.imagenes?.[0];

  return (
    <section className="rounded-xl border border-line bg-surface/60 p-5">
      <h2 className="text-lg font-medium text-soft">Tu pedido</h2>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-night text-2xl">
          {imagen ? (
            <img src={imagen} alt={product.nombre} className="h-full w-full object-cover" />
          ) : (
            <span className="text-muted">🎮</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-soft">{product.nombre}</p>
          <p className="text-sm text-dim">{product.categoria}</p>
        </div>
      </div>

      <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-dim">Precio</dt>
          <dd className="text-soft">{formatPrice(product.precio)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-dim">Envío</dt>
          <dd className="text-soft">Gratis (demo)</dd>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <dt className="text-soft">Total</dt>
          <dd className="text-accent">{formatPrice(product.precio)}</dd>
        </div>
      </dl>

      {comprador && (
        <p className="mt-4 border-t border-line pt-4 text-sm text-dim">
          Compras como <span className="text-soft">{comprador.nombre}</span>
        </p>
      )}
    </section>
  );
}
