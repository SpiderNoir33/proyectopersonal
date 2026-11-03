import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginSchema } from "@shared/schemas/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { apiErrorMessage, fieldErrors, zodIssuesToErrors } from "../utils/errors.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import ErrorMsg from "../components/ui/ErrorMsg.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // si venías de una ruta protegida, vuelve a ella
  const from = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodIssuesToErrors(parsed.error.issues));
      return;
    }

    setBusy(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setServerError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-line bg-surface/60 px-8 py-10">
      <h1 className="text-2xl font-medium">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-dim">
        ¿Todavía no tienes cuenta?{" "}
        <Link to="/registro" className="text-accent underline underline-offset-4">
          Regístrate
        </Link>
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <ErrorMsg>{serverError}</ErrorMsg>

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="tucorreo@gmail.com"
          autoComplete="email"
          value={form.email}
          onChange={onChange}
          error={errors.email}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
          value={form.password}
          onChange={onChange}
          error={errors.password}
        />

        <Button type="submit" disabled={busy}>
          {busy ? "Entrando..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
