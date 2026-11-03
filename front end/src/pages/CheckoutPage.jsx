import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as productsApi from "../api/products.js";
import { useAuth } from "../context/AuthContext.jsx";
import { apiErrorMessage } from "../utils/errors.js";
import { formatPrice } from "../utils/formatters.js";
import Button from "../components/ui/Button.jsx";
import ErrorMsg from "../components/ui/ErrorMsg.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import CardForm from "../components/checkout/CardForm.jsx";
import OrderSummary from "../components/checkout/OrderSummary.jsx";

const DEMO_BANNER =
  "DEMO — esta compra es una simulación: no se cobra nada, no se envía nada a un servidor de pagos y los datos de la tarjeta no salen de tu navegador.";

export default function CheckoutPage() {
  const { slug, id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [metodo, setMetodo] = useState("tarjeta");
  const [procesando, setProcesando] = useState(false);
  const [pagado, setPagado] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    setLoading(true);
    setError("");
    productsApi
      .getBySlugId(slug, id)
      .then((res) => alive.current && setProduct(res.data.product))
      .catch((err) => alive.current && setError(apiErrorMessage(err)))
      .finally(() => alive.current && setLoading(false));
    return () => {
      alive.current = false;
    };
  }, [slug, id]);

  const simularPago = () => {
    // Checkout real: orden creada en el servidor + SDK de Stripe/PayPal +
    // verificación del resultado por webhook. Aquí solo simulamos el retardo.
    setProcesando(true);
    window.setTimeout(() => {
      if (!alive.current) return;
      setProcesando(false);
      setPagado(true);
    }, 1200);
  };

  if (loading) return <Spinner label="Cargando pedido..." />;

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorMsg>{error}</ErrorMsg>
        <Link to="/productos" className="text-sm text-accent underline underline-offset-4">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const sinStock = (product.stock ?? 0) <= 0;

  if (pagado) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <p className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
          {DEMO_BANNER}
        </p>
        <section className="rounded-xl border border-accent/40 bg-accent/10 p-6 text-center">
          <h1 className="text-xl font-semibold text-accent">
            Compra simulada correctamente
          </h1>
          <p className="mt-2 text-sm text-dim">
            No se ha realizado ningún cobro ni se ha guardado ningún dato.
          </p>
        </section>
        <OrderSummary product={product} comprador={user} />
        <div className="flex justify-center gap-3">
          <Link to="/productos">
            <Button variant="ghost">Seguir comprando</Button>
          </Link>
          <Link to={`/productos/${product.slug}/${product._id}`}>
            <Button variant="ghost">Volver al producto</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-medium text-soft">Comprar</h1>

      <p className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
        {DEMO_BANNER}
      </p>

      <OrderSummary product={product} comprador={user} />

      {sinStock ? (
        <section className="rounded-xl border border-danger/40 bg-surface/60 p-5">
          <p className="text-danger">Este producto está agotado.</p>
          <Link
            to={`/productos/${product.slug}/${product._id}`}
            className="mt-2 inline-block text-sm text-accent underline underline-offset-4"
          >
            Volver al producto
          </Link>
        </section>
      ) : (
        <section className="rounded-xl border border-line bg-surface/60 p-5">
          <h2 className="text-lg font-medium text-soft">Método de pago</h2>

          <div className="mt-4 flex gap-3">
            {["tarjeta", "paypal"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodo(m)}
                className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                  metodo === m
                    ? "border-accent text-accent"
                    : "border-line text-dim hover:border-dim"
                }`}
              >
                {m === "tarjeta" ? "Tarjeta" : "PayPal"}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {metodo === "tarjeta" ? (
              <CardForm onSubmit={simularPago} busy={procesando} />
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-dim">
                  Te redirigiríamos a PayPal para pagar {formatPrice(product.precio)}.
                </p>
                <button
                  type="button"
                  onClick={simularPago}
                  disabled={procesando}
                  className="rounded-xl bg-[#ffc439] px-5 py-2.5 text-sm font-semibold text-[#003087] transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {procesando ? "Procesando..." : "Pagar con PayPal (demo)"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
