import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { updateMeSchema } from "@shared/schemas/user.js";
import { useAuth } from "../context/AuthContext.jsx";
import * as productsApi from "../api/products.js";
import * as usersApi from "../api/users.js";
import { apiErrorMessage, fieldErrors, zodIssuesToErrors } from "../utils/errors.js";
import { formatDate, formatPrice } from "../utils/formatters.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import ErrorMsg from "../components/ui/ErrorMsg.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState(null);
  const [productsError, setProductsError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  const [form, setForm] = useState({
    nombre: user?.nombre ?? "",
    email: user?.email ?? "",
    password: "",
    confirmPassword: "",
    currentPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Evita setState tras unmount
  const alive = useRef(true);

  const loadProducts = useCallback(() => {
    setProductsError("");
    productsApi
      .mine()
      .then((res) => {
        if (alive.current) setProducts(res.data.products);
      })
      .catch((err) => {
        if (!alive.current) return;
        setProducts([]);
        setProductsError(apiErrorMessage(err));
      });
  }, []);

  useEffect(() => {
    alive.current = true;
    loadProducts();
    return () => {
      alive.current = false;
    };
  }, [loadProducts]);

  const onDeleteProduct = async () => {
    setDeletingProduct(true);
    setProductsError("");
    try {
      await productsApi.remove(toDelete);
      setProducts((prev) => (prev ?? []).filter((p) => p._id !== toDelete));
    } catch (err) {
      setProductsError(apiErrorMessage(err));
    } finally {
      setDeletingProduct(false);
      setToDelete(null);
    }
  };

  const onChange = (e) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSaved(false);
    setErrors({});

    const parsed = updateMeSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodIssuesToErrors(parsed.error.issues));
      return;
    }

    const payload = { nombre: parsed.data.nombre, email: parsed.data.email };
    if (parsed.data.password) {
      payload.password = parsed.data.password;
      payload.confirmPassword = parsed.data.confirmPassword;
      payload.currentPassword = parsed.data.currentPassword;
    }

    setBusy(true);
    try {
      const res = await usersApi.updateMe(payload);
      updateUser(res.data.user);
      setSaved(true);
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
        currentPassword: "",
      }));
    } catch (err) {
      setErrors(fieldErrors(err));
      setServerError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onDeleteAccount = async () => {
    setDeleting(true);
    setServerError("");
    try {
      await usersApi.deleteMe();
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(apiErrorMessage(err));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-medium text-soft">Mi perfil</h1>

      {/* Datos de la base de datos */}
      <section className="rounded-xl border border-line bg-surface/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-dim">Nombre de usuario</p>
            <p className="text-xl font-semibold text-text">{user.nombre}</p>
            <p className="mt-3 text-sm text-dim">Email</p>
            <p className="text-soft">{user.email}</p>
          </div>

          <div className="flex gap-3 text-sm">
            <span className="rounded-lg bg-night px-3 py-1.5 text-dim">
              Rol: <span className="text-accent">{user.role}</span>
            </span>
            <span className="rounded-lg bg-night px-3 py-1.5 text-dim">
              Miembro desde {formatDate(user.createdAt)}
            </span>
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <div className="inline-block rounded-xl bg-night px-5 py-3">
            <p className="text-2xl font-semibold text-accent">
              {productsError ? "—" : products ? products.length : "..."}
            </p>
            <p className="text-xs text-dim">productos en la base de datos</p>
          </div>
        </div>
      </section>

      {/* Mis productos */}
      <section id="mis-productos" className="rounded-xl border border-line bg-surface/60 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium text-soft">Mis productos</h2>
            <p className="text-sm text-dim">
              {products ? `${products.length} en la base de datos` : "Cargando..."}
            </p>
          </div>
          <Link to="/perfil/productos/nuevo">
            <Button>+ Nuevo producto</Button>
          </Link>
        </div>

        <ErrorMsg>{productsError}</ErrorMsg>

        {products === null ? (
          <Spinner label="Cargando tus productos..." />
        ) : products.length === 0 ? (
          <EmptyState
            title="Todavía no has creado productos"
            hint="Usa el botón “+ Nuevo producto” para dar de alta el primero"
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {products.map((product) => (
              <li
                key={product._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-night/40 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-soft">{product.nombre}</p>
                  <p className="text-sm text-dim">
                    {product.categoria} · {formatPrice(product.precio)} · stock{" "}
                    {product.stock}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/perfil/productos/${product._id}/editar`}>
                    <Button variant="ghost">Editar</Button>
                  </Link>
                  <Button variant="danger" onClick={() => setToDelete(product._id)}>
                    Borrar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Editar datos */}
      <section className="rounded-xl border border-line bg-surface/60 p-6">
        <h2 className="text-lg font-medium text-soft">Editar datos</h2>

        <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-4">
          <ErrorMsg>{serverError}</ErrorMsg>
          {saved && (
            <p className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm text-accent">
              Cambios guardados
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="nombre"
              name="nombre"
              label="Nombre"
              value={form.nombre}
              onChange={onChange}
              error={errors.nombre}
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={onChange}
              error={errors.email}
            />
          </div>

          <div className="border-t border-line pt-4">
            <p className="mb-3 text-sm text-dim">
              Cambiar contraseña (deja en blanco para no tocarla)
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                label="Contraseña actual"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={onChange}
                error={errors.currentPassword}
              />
              <Input
                id="password"
                name="password"
                type="password"
                label="Nueva contraseña"
                autoComplete="new-password"
                value={form.password}
                onChange={onChange}
                error={errors.password}
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Repite la nueva"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={onChange}
                error={errors.confirmPassword}
              />
            </div>
          </div>

          <Button type="submit" disabled={busy} className="sm:w-fit">
            {busy ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </section>

      {/* Zona peligrosa */}
      <section className="rounded-xl border border-danger/40 bg-surface/60 p-6">
        <h2 className="text-lg font-medium text-danger">Zona peligrosa</h2>
        <p className="mt-1 text-sm text-dim">
          Desactiva tu cuenta (soft delete). Dejarás de poder iniciar sesión.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {confirmDelete ? (
            <>
              <span className="text-sm text-soft">¿Seguro? Esta acción no se puede deshacer.</span>
              <Button variant="danger" onClick={onDeleteAccount} disabled={deleting}>
                {deleting ? "Desactivando..." : "Sí, desactivar mi cuenta"}
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
            </>
          ) : (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Desactivar mi cuenta
            </Button>
          )}
        </div>
      </section>

      {/* Modal borrar producto */}
      {toDelete && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-night/80 px-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-6">
            <h2 className="text-lg font-medium text-soft">Borrar producto</h2>
            <p className="mt-2 text-sm text-dim">
              Se eliminará de la base de datos. No se puede deshacer.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setToDelete(null)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={onDeleteProduct} disabled={deletingProduct}>
                {deletingProduct ? "Borrando..." : "Sí, borrar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
