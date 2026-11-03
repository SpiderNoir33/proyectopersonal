import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { removeIfUnused } from "../utils/imageStore.js";

const canModify = (product, user) =>
  product.owner.toString() === user._id.toString() || user.role === "admin";

export const getProducts = catchAsync(async (req, res) => {
  const { categoria, nombre, owner, page, limit } = req.parsedQuery;

  const filter = {};
  if (categoria) filter.categoria = categoria.toLowerCase();
  if (nombre) filter.nombre = { $regex: escapeRegex(nombre), $options: "i" };
  if (owner) filter.owner = owner;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("owner", "nombre")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    status: "success",
    results: products.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    products,
  });
});

export const getMyProducts = catchAsync(async (req, res) => {
  const products = await Product.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: "success",
    results: products.length,
    products,
  });
});

export const getProductByName = catchAsync(async (req, res, next) => {
  const { nombre } = req.params;

  if (!nombre || nombre.length > 120) {
    return next(new AppError("Producto no encontrado", 404));
  }

  const product = await Product.findOne({
    nombre: { $regex: `^${escapeRegex(nombre)}$`, $options: "i" },
  }).populate("owner", "nombre");

  if (!product) {
    return next(new AppError("Producto no encontrado", 404));
  }

  res.status(200).json({
    status: "success",
    product,
  });
});

// Ambos deben coincidir (slug + id): cambiar una parte da 404, asi una URL
// solo es válida completa. El id no es enumerable y el sufijo aleatorio del
// slug añade 48 bits más.
export const getProductBySlugId = catchAsync(async (req, res, next) => {
  const { slug, id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("Producto no encontrado", 404));
  }

  const product = await Product.findOne({ _id: id, slug }).populate(
    "owner",
    "nombre"
  );

  if (!product) {
    return next(new AppError("Producto no encontrado", 404));
  }

  res.status(200).json({
    status: "success",
    product,
  });
});

export const getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("owner", "nombre");

  if (!product) {
    return next(new AppError("Producto no encontrado", 404));
  }

  res.status(200).json({
    status: "success",
    product,
  });
});

export const createProduct = catchAsync(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    imagenes: req.imagePaths ?? [],
    owner: req.user._id,
  });

  res.status(201).json({
    status: "success",
    product,
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    
    await removeIfUnused(req.imagePaths ?? []);
    return next(new AppError("Producto no encontrado", 404));
  }

  if (!canModify(product, req.user)) {
    await removeIfUnused(req.imagePaths ?? []);
    return next(new AppError("Solo el dueño o un admin pueden modificar este producto", 403));
  }

  const newImages = req.imagePaths ?? [];
  const keep =
    req.body.keep === undefined ? undefined : [].concat(req.body.keep ?? []);

  let imagenes;
  let removed = [];
  if (keep === undefined) {
    imagenes = newImages.length > 0 ? [...product.imagenes, ...newImages] : undefined;
  } else {
    imagenes = [...keep, ...newImages];
    removed = product.imagenes.filter((img) => !keep.includes(img));
  }

  const update = { ...req.body };
  if (imagenes !== undefined) update.imagenes = imagenes;

  const updated = await Product.findByIdAndUpdate(req.params.id, update, {
    returnDocument: "after",
    runValidators: true,
  });

  await removeIfUnused(removed);

  res.status(200).json({
    status: "success",
    product: updated,
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Producto no encontrado", 404));
  }

  if (!canModify(product, req.user)) {
    return next(new AppError("Solo el dueño o un admin pueden eliminar este producto", 403));
  }

  await Product.findByIdAndDelete(req.params.id);
  await removeIfUnused(product.imagenes);

  res.status(204).send();
});
