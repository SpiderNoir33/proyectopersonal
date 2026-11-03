// Backfill: crea slug para los productos creados antes de que existiera el
// campo. Shell script (node scripts/backfillSlugs.js desde backend/), no un
// endpoint web: solo corre quien tiene el .env con MONGO_URI.
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Product } from "../src/models/Product.js";
import { slugify, randomSlugSuffix } from "../src/utils/slugify.js";

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("Falta MONGO_URI en backend/.env");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

// $in con null cubre tanto "campo ausente" como "campo null".
const productos = await Product.find({ slug: { $in: [null, ""] } });

let ok = 0;
let reintentos = 0;

for (const producto of productos) {
  let candidato;
  // El índice único garantiza la unicidad: si chocamos, reintentamos.
  for (let intento = 0; intento < 5; intento++) {
    candidato = `${slugify(producto.nombre)}-${randomSlugSuffix()}`;
    const choque = await Product.exists({ slug: candidato });
    if (!choque) break;
    candidato = null;
    reintentos++;
  }

  if (!candidato) {
    console.error(`✗ ${producto.nombre}: 5 colisiones seguidas, saltado`);
    continue;
  }

  producto.slug = candidato;
  await producto.save();
  ok++;
  console.log(`✓ ${producto.nombre} → ${candidato}`);
}

console.log(`Listo: ${ok} slugs creados, ${reintentos} reintentos por colisión.`);

await mongoose.disconnect();
