import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as productsApi from "../api/products.js";
import * as usersApi from "../api/users.js";
import { apiErrorMessage } from "../utils/errors.js";
import { formatPrice, formatDate } from "../utils/formatters.js";
import Spinner from "../components/ui/Spinner.jsx";
import ErrorMsg from "../components/ui/ErrorMsg.jsx";
import Button from "../components/ui/Button.jsx";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Evita setState tras unmount
  const alive = useRef(true);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      productsApi.list({ limit: 100 }),
      usersApi.list(),
    ])
      .then(([pRes, uRes]) => {
        if (!alive.current) return;
        setProducts(pRes.data.products);
        setUsers(uRes.data.users);
      })
      .catch((err) => {
        if (!alive.current) return;
        setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (alive.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load]);

  const onDeleteProduct = async (id) => {
    setError("");
    try {
      await productsApi.remove(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      // 403 = "solo el dueño o un admin" → el backend manda, no el front
      setError(apiErrorMessage(err));
    }
  };

  if (loading) return <Spinner label="Cargando panel..." />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium text-soft">Panel de administración</h1>
        <p className="text-sm text-dim">
          {products.length} productos · {users.length} usuarios
        </p>
      </div>

      <ErrorMsg>{error}</ErrorMsg>

      <section>
        <h2 className="mb-3 text-lg font-medium text-soft">Productos (todos)</h2>
        <ul className="flex flex-col gap-3">
          {products.map((product) => (
            <li
              key={product._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface/60 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-soft">{product.nombre}</p>
                <p className="text-sm text-dim">
                  {product.categoria} · {formatPrice(product.precio)} ·{" "}
                  {product.owner?.nombre ?? "sin dueño"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/perfil/productos/${product._id}/editar`}>
                  <Button variant="ghost">Editar</Button>
                </Link>
                <Button variant="danger" onClick={() => onDeleteProduct(product._id)}>
                  Borrar
                </Button>
              </div>
            </li>
          ))}
          {products.length === 0 && (
            <li className="text-sm text-dim">No hay productos en la base de datos.</li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-soft">Usuarios</h2>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-dim">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-line bg-night/40">
                  <td className="px-4 py-3 text-soft">{u.nombre}</td>
                  <td className="px-4 py-3 text-dim">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-lg px-2 py-1 text-xs ${
                        u.role === "admin"
                          ? "bg-accent/20 text-accent"
                          : "bg-surface text-dim"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-dim">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
