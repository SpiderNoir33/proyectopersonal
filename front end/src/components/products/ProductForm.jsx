import { useEffect, useMemo, useState } from "react";
import { createProductSchema } from "@shared/schemas/product.js";
import { PRODUCT_FIELDS, emptyProduct } from "../../domain/product.js";
import { apiErrorMessage, fieldErrors, zodIssuesToErrors } from "../../utils/errors.js";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import ErrorMsg from "../ui/ErrorMsg.jsx";

const MAX_FILES = 10;
const MAX_SIZE = 3 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

function toFormValues(product) {
  if (!product) return { ...emptyProduct };
  return {
    nombre: product.nombre ?? "",
    categoria: product.categoria ?? "",
    precio: product.precio ?? "",
    stock: product.stock ?? "",
    descripcion: product.descripcion ?? "",
  };
}

export default function ProductForm({ product, onSubmit }) {
  const [form, setForm] = useState(() => toFormValues(product));

  const [keep, setKeep] = useState(() => product?.imagenes ?? []);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );
  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p.url)),
    [previews]
  );

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; 

    const next = [...files];
    const problems = [];

    for (const f of picked) {
      if (keep.length + next.length >= MAX_FILES) {
        problems.push(`Máximo ${MAX_FILES} imágenes por producto`);
        break;
      }
      if (!ACCEPTED_TYPES.includes(f.type)) {
        problems.push(`"${f.name}": solo se aceptan imágenes JPG o PNG`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        problems.push(`"${f.name}": supera los 3MB`);
        continue;
      }
      next.push(f);
    }

    setFiles(next);
    setErrors((prev) => {
      const { files: _omit, ...rest } = prev;
      return problems.length ? { ...rest, files: problems.join(" · ") } : rest;
    });
  };

  const removeFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const removeKeep = (url) =>
    setKeep((prev) => prev.filter((u) => u !== url));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const parsed = createProductSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodIssuesToErrors(parsed.error.issues));
      return;
    }

    const fd = new FormData();
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined && value !== null && value !== "") {
        fd.append(key, String(value));
      }
    }
    keep.forEach((url) => fd.append("keep", url));
    // Al editar, si se quitaron TODAS las imágenes keep queda vacío y sin
    // esta marca el backend las dejaría intactas. "" = "ninguna".
    if (product && keep.length === 0) fd.append("keep", "");
    files.forEach((file) => fd.append("imagenes", file));

    setBusy(true);
    try {
      await onSubmit(fd);
    } catch (err) {
      setErrors(fieldErrors(err));
      setServerError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <ErrorMsg>{serverError}</ErrorMsg>

      {PRODUCT_FIELDS.map((field) => (
        <div key={field.name}>
          {field.type === "textarea" ? (
            <label htmlFor={field.name} className="block">
              <span className="mb-1.5 block text-sm text-dim">{field.label}</span>
              <textarea
                id={field.name}
                name={field.name}
                rows={3}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={onChange}
                className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-soft placeholder:text-dim transition-colors focus:outline-none focus:border-accent ${
                  errors[field.name] ? "border-danger" : "border-line"
                }`}
              />
              {errors[field.name] && (
                <span className="mt-1 block text-xs text-danger">
                  {errors[field.name]}
                </span>
              )}
            </label>
          ) : (
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              step={field.step}
              label={field.label}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={onChange}
              error={errors[field.name]}
            />
          )}
        </div>
      ))}

      <div>
        <span className="mb-1.5 block text-sm text-dim">
          Imágenes (JPG o PNG, máx. 3MB cada una, {keep.length + files.length}/{MAX_FILES})
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png"
          multiple
          onChange={onPickFiles}
          className="block w-full text-sm text-dim file:mr-4 file:rounded-xl file:border-0 file:bg-night file:px-4 file:py-2 file:text-sm file:text-soft hover:file:border-line"
        />
        {errors.files && (
          <span className="mt-1 block text-xs text-danger">{errors.files}</span>
        )}

        {keep.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1.5">
            {keep.map((url) => (
              <li
                key={url}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-sm"
              >
                <img
                  src={url}
                  alt="Imagen existente"
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-dim">{url}</span>
                <button
                  type="button"
                  onClick={() => removeKeep(url)}
                  className="shrink-0 text-danger hover:underline"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}

        {previews.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1.5">
            {previews.map(({ file, url }, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-accent/50 bg-surface px-3 py-2 text-sm"
              >
                <img
                  src={url}
                  alt={file.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-dim">
                  {file.name} · {(file.size / 1024).toFixed(0)} KB · nueva
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="shrink-0 text-danger hover:underline"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
      </Button>
    </form>
  );
}
