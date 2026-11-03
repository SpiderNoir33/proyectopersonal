import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as productsApi from "../api/products.js";
import * as sellersApi from "../api/sellers.js";
import { useAuth } from "../context/AuthContext.jsx";
import { apiErrorMessage } from "../utils/errors.js";
import { formatPrice } from "../utils/formatters.js";
import Avatar from "../components/ui/Avatar.jsx";
import Button from "../components/ui/Button.jsx";
import ErrorMsg from "../components/ui/ErrorMsg.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import ImageGallery from "../components/products/ImageGallery.jsx";

export default function ProductDetail() {
  const { slug, id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setProduct(null);
    setSeller(null);

    productsApi
      .getBySlugId(slug, id)
      .then((res) => {
        if (!alive) return;
        setProduct(res.data.product);
        const ownerId = res.data.product.owner?._id ?? res.data.product.owner;
        if (ownerId) {
          sellersApi
            .getSeller(ownerId)
            .then((r) => alive && setSeller(r.data.seller))
            .catch(() => {
            });
        }
      })
      .catch((err) => alive && setError(apiErrorMessage(err)))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [slug, id]);

  if (loading) return <Spinner label="Cargando producto..." />;

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
  const ownerId = product.owner?._id ?? product.owner;
  const esMio = Boolean(user && ownerId && (user.id === ownerId || user.role === "admin"));
  const nombreVendedor = seller?.nombre ?? product.owner?.nombre;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ImageGallery imagenes={product.imagenes} nombre={product.nombre} />

      <div className="flex flex-col gap-4">
        <span className="w-fit rounded-lg bg-night px-2.5 py-1 text-xs text-dim">
          {product.categoria}
        </span>
        <h1 className="text-2xl font-medium text-soft">{product.nombre}</h1>
        <p className="text-3xl font-semibold text-accent">
          {formatPrice(product.precio)}
        </p>
        <span className={sinStock ? "text-danger" : "text-dim"}>
          {sinStock ? "Sin stock" : `${product.stock} en stock`}
        </span>

        {product.descripcion && (
          <p className="whitespace-pre-line text-dim">{product.descripcion}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-3">
          {sinStock ? (
            <Button disabled>Sin stock</Button>
          ) : (
            <Link to={`/comprar/${product.slug}/${product._id}`}>
              <Button>Comprar</Button>
            </Link>
          )}
          {esMio && (
            <Link to={`/perfil/productos/${product._id}/editar`}>
              <Button variant="ghost">Editar</Button>
            </Link>
          )}
        </div>

        {nombreVendedor && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface/60 px-4 py-3">
            <Avatar nombre={nombreVendedor} />
            <div className="min-w-0">
              <p className="text-sm text-dim">En venta por</p>
              {seller ? (
                <Link
                  to={`/vendedores/${seller.id}`}
                  className="font-medium text-soft hover:text-accent"
                >
                  {seller.nombre}
                </Link>
              ) : (
                <p className="font-medium text-soft">{nombreVendedor}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
