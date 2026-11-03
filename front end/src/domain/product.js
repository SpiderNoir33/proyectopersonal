export const PRODUCT_FIELDS = [
  {
    name: "nombre",
    label: "Nombre",
    type: "text",
    placeholder: "Teclado mecánico",
    required: true,
  },
  {
    name: "categoria",
    label: "Categoría",
    type: "text",
    placeholder: "perifericos",
    required: true,
  },
  {
    name: "precio",
    label: "Precio",
    type: "number",
    step: "0.01",
    placeholder: "45.99",
    required: true,
  },
  {
    name: "stock",
    label: "Stock",
    type: "number",
    step: "1",
    placeholder: "10",
  },
  {
    name: "descripcion",
    label: "Descripción",
    type: "textarea",
    placeholder: "Texto largo del producto (máx. 1000)",
  },
];

export const emptyProduct = {
  nombre: "",
  categoria: "",
  precio: "",
  stock: "",
  descripcion: "",
};

// URL pública del producto: slug legible + id. El backend exige que ambos
// coincidan (404 si se cambia una parte).
export const productPath = (product) =>
  `/productos/${product.slug}/${product._id}`;
