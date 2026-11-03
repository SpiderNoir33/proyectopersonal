import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema } from "@shared/schemas/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { apiErrorMessage, fieldErrors, zodIssuesToErrors } from "../utils/errors.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import ErrorMsg from "../components/ui/ErrorMsg.jsx";

const initial = {
  nombre: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodIssuesToErrors(parsed.error.issues));
      return;
    }

    setBusy(true);
    try {
      await register(parsed.data);
      navigate("/", { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setServerError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-line bg-surface/60 px-8 py-10">
      <h1 className="text-2xl font-medium">Crear cuenta</h1>
      <p className="mt-1 text-sm text-dim">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-accent underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <ErrorMsg>{serverError}</ErrorMsg>

        <Input
          id="nombre"
          name="nombre"
          label="Nombre"
          placeholder="Tu nombre"
          autoComplete="name"
          value={form.nombre}
          onChange={onChange}
          error={errors.nombre}
        />

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
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          value={form.password}
          onChange={onChange}
          error={errors.password}
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Repite la contraseña"
          placeholder="••••••••"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={onChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" disabled={busy}>
          {busy ? "Creando..." : "Register"}
        </Button>
      </form>
    </div>
  );
}
