import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as productsApi from "../api/products.js";
import { apiErrorMessage } from "../utils/errors.js";
import ProductForm from "../components/products/ProductForm.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import ErrorMsg from "../components/ui/ErrorMsg.jsx";
import { buttonClasses } from "../components/ui/Button.jsx";

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    productsApi
      .getById(id)
      .then((res) => alive && setProduct(res.data.product))
      .catch((err) => alive && setError(apiErrorMessage(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const onSubmit = async (values) => {
    if (id) {
      await productsApi.update(id, values);
    } else {
      await productsApi.create(values);
    }
    navigate("/perfil", { replace: true });
  };

  if (loading) return <Spinner label="Cargando producto..." />;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link to="/perfil" className={`${buttonClasses("ghost")} mb-6`}>
        ← Volver
      </Link>

      <div className="rounded-xl border border-line bg-surface/60 p-6">
        <h1 className="text-2xl font-medium text-soft">
          {id ? "Editar producto" : "Nuevo producto"}
        </h1>
        <p className="mt-1 mb-6 text-sm text-dim">
          Validado con el mismo schema Zod que usa el backend.
        </p>

        {error && <ErrorMsg className="mb-4">{error}</ErrorMsg>}

        {!error && (id ? product : true) && (
          <ProductForm product={product} onSubmit={onSubmit} />
        )}
      </div>
    </div>
  );
}
