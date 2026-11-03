import { useState } from "react";

export default function ImageGallery({ imagenes = [], nombre }) {
  const [activa, setActiva] = useState(0);

  if (imagenes.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-line bg-night text-4xl text-muted sm:h-80">
        🎮
      </div>
    );
  }

  const actual = imagenes[activa] ?? imagenes[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-line bg-night">
        <img
          src={actual}
          alt={nombre}
          className="h-64 w-full object-cover sm:h-80"
        />
      </div>

      {imagenes.length > 1 && (
        <ul className="flex flex-wrap gap-2">
          {imagenes.map((url, index) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setActiva(index)}
                aria-label={`Ver imagen ${index + 1}`}
                className={`overflow-hidden rounded-lg border transition-colors ${
                  index === activa
                    ? "border-accent"
                    : "border-line hover:border-dim"
                }`}
              >
                <img
                  src={url}
                  alt={`${nombre} ${index + 1}`}
                  className="h-14 w-14 object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
