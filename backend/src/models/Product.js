import mongoose from "mongoose";
import { slugify, randomSlugSuffix } from "../utils/slugify.js";

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [120, "Máximo 120 caracteres"],
    },
    // URL legible del producto: /productos/<slug>/<id>. Se genera una sola
    // vez (inmutable al editar) para que los enlaces compartidos no se rompan.
    slug: {
      type: String,
    },
    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      lowercase: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [1000, "Máximo 1000 caracteres"],
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "El stock no puede ser negativo"],
    },
    imagenes: {
      type: [String],
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El producto necesita un owner"],
    },
  },
  { timestamps: true }
);

// Estilo promesa (Mongoose 9 ya no pasa next a los hooks).
// if (!this.slug): solo al crear. Regenerarlo en cada edit() romperia
// los enlaces que ya se compartieron.
productSchema.pre("validate", function () {
  if (this.slug || !this.nombre) return;
  this.slug = `${slugify(this.nombre)}-${randomSlugSuffix()}`;
});

productSchema.index({ categoria: 1 });
// getMyProducts filtra por owner: sin este índice escanea toda la colección
productSchema.index({ owner: 1 });
// La unicidad del slug no depende solo de la suerte de los 48 bits.
productSchema.index({ slug: 1 }, { unique: true });

export const Product = mongoose.model("Product", productSchema);