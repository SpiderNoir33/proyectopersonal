import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { existsSync } from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import app from "../src/app.js";
import { User } from "../src/models/User.js";
import { Product } from "../src/models/Product.js";
import { UPLOADS_DIR } from "../src/utils/imageStore.js";

// 1x1 PNG válido (file-type detecta los magic bytes, no el nombre)
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>');
const EXE = Buffer.from("MZ\x90\x00\x03\x00\x00\x00fake");

let agent; // conserva la cookie de sesión entre peticiones
let agent2; // segundo usuario (otro vendedor)
let userId;
let productId;
let productSlug;
let productImagen;
let productImagenId;
let productImagenSlug;

const registrar = (agentRef, email, nombre = "Tester") =>
  agentRef.post("/api/auth/register").send({
    nombre,
    email,
    password: "12345678",
    confirmPassword: "12345678",
  });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Product.deleteMany({});

  agent = request.agent(app);
  agent2 = request.agent(app);

  const res = await registrar(agent, "tester@gmail.com");
  expect(res.status).toBe(201);
  userId = res.body.user.id;

  const res2 = await registrar(agent2, "otro@gmail.com", "Otro");
  expect(res2.status).toBe(201);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("base", () => {
  it("GET /api/health responde ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("register rechaza emails con doble @", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        nombre: "X",
        email: "foo@evil@gmail.com",
        password: "12345678",
        confirmPassword: "12345678",
      });
    expect(res.status).toBe(400);
  });

  it("login con contraseña incorrecta → 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "tester@gmail.com", password: "mala-mala-1" });
    expect(res.status).toBe(401);
  });

  it("logout con cookie basura → 200 y no rompe", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", "token=basura-ilegible");
    expect(res.status).toBe(200);
  });
});

describe("regresiones de perfil (N1/N3)", () => {
  it("N1: guardar perfil con contraseñas vacías → 200 (antes 400)", async () => {
    const res = await agent.patch("/api/users/me").send({
      nombre: "Tester",
      email: "tester@gmail.com",
      password: "",
      confirmPassword: "",
      currentPassword: "",
    });
    expect(res.status).toBe(200);
  });

  it("N3: contraseña actual incorrecta → 400 y la sesión sigue viva", async () => {
    const res = await agent.patch("/api/users/me").send({
      password: "nuevanueva1",
      confirmPassword: "nuevanueva1",
      currentPassword: "esta-no-es-1",
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.currentPassword).toBeTruthy();

    // Antes esto era 401 y el interceptor del front cerraba la sesión
    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
  });
});

describe("productos: validación y stock (N2)", () => {
  it("precio vacío → 400 con error estructurado", async () => {
    const res = await agent
      .post("/api/products")
      .field("nombre", "Teclado")
      .field("categoria", "teclados")
      .field("precio", "")
      .field("stock", "5");
    expect(res.status).toBe(400);
    expect(res.body.errors.precio).toBeTruthy();
  });

  it("N2: stock vacío → 201 con stock 0 (antes 400)", async () => {
    const res = await agent
      .post("/api/products")
      .field("nombre", "Ratón barato")
      .field("categoria", "ratones")
      .field("precio", "10")
      .field("stock", "");
    expect(res.status).toBe(201);
    expect(res.body.product.stock).toBe(0);
  });
});

describe("slug", () => {
  it("crea slug legible, sin acentos, único e inmutable", async () => {
    const res = await agent
      .post("/api/products")
      .field("nombre", "Ñoño Café")
      .field("categoria", "cafe")
      .field("precio", "25.5")
      .field("stock", "3");
    expect(res.status).toBe(201);

    productSlug = res.body.product.slug;
    productId = res.body.product.id ?? res.body.product._id;

    // NFD: ñ→n, é→e — nada de %C3%B1 en la URL
    expect(productSlug).toMatch(/^nono-cafe-[A-Za-z0-9_-]{8}$/);

    const otro = await agent
      .post("/api/products")
      .field("nombre", "Ñoño Café")
      .field("categoria", "cafe")
      .field("precio", "30")
      .field("stock", "1");
    expect(otro.status).toBe(201);
    // Mismo nombre, sufijo aleatorio distinto → no chocan
    expect(otro.body.product.slug).not.toBe(productSlug);

    await Product.deleteOne({ _id: otro.body.product._id });
  });

  it("GET /products/:slug/:id con ambos correctos → 200", async () => {
    const res = await request(app).get(`/api/products/${productSlug}/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.product.slug).toBe(productSlug);
    expect(res.body.product.owner.nombre).toBe("Tester");
  });

  it("slug inventado + id válido → 404", async () => {
    const res = await request(app).get(`/api/products/slug-inventado-Aa1Bb2Cc/${productId}`);
    expect(res.status).toBe(404);
  });

  it("slug válido + id inventado → 404", async () => {
    const res = await request(app).get(`/api/products/${productSlug}/6543f2a1b8c9d0e1f2a3b4c5`);
    expect(res.status).toBe(404);
  });

  it("el endpoint /name/:nombre se conserva y funciona", async () => {
    const res = await request(app).get(`/api/products/name/${encodeURIComponent("Ñoño Café")}`);
    expect(res.status).toBe(200);
    expect(res.body.product.slug).toBe(productSlug);
  });
});

describe("filtro por vendedor (?owner=)", () => {
  it("devuelve solo los productos de ese owner", async () => {
    const res = await agent2
      .post("/api/products")
      .field("nombre", "Producto del otro")
      .field("categoria", "varios")
      .field("precio", "9")
      .field("stock", "2");
    expect(res.status).toBe(201);

    const list = await request(app).get(`/api/products?owner=${userId}`);
    expect(list.status).toBe(200);
    expect(list.body.products.length).toBeGreaterThan(0);
    for (const p of list.body.products) {
      expect(p.owner._id.toString()).toBe(userId.toString());
      expect(p.nombre).not.toBe("Producto del otro");
    }
  });

  it("owner con id inválido → 400", async () => {
    const res = await request(app).get("/api/products?owner=no-es-id");
    expect(res.status).toBe(400);
  });
});

describe("búsqueda por nombre (?nombre=, buscador del header)", () => {
  it("coincidencia parcial e insensible a mayúsculas", async () => {
    const c = await agent.post("/api/products").send({
      nombre: "Cargador USB",
      categoria: "cables",
      precio: 10,
      stock: 5,
    });
    expect(c.status).toBe(201);

    await agent.post("/api/products").send({
      nombre: "Teclado Gamer",
      categoria: "teclados",
      precio: 50,
      stock: 2,
    });

    const res = await request(app).get("/api/products?nombre=carg");
    expect(res.status).toBe(200);
    expect(res.body.products.map((p) => p.nombre)).toEqual(["Cargador USB"]);
  });

  it("caracteres especiales de regex no rompen la búsqueda", async () => {
    const res = await request(app).get(
      `/api/products?nombre=${encodeURIComponent("c.a+r(")}`
    );
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });

  it("sin coincidencias → lista vacía, no error", async () => {
    const res = await request(app).get("/api/products?nombre=zzzznoexiste");
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });
});

describe("vendedores públicos", () => {
  it("GET /api/sellers/:id → solo {id, nombre}, sin email ni rol", async () => {
    const res = await request(app).get(`/api/sellers/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.seller.id).toBe(userId.toString());
    expect(res.body.seller.nombre).toBe("Tester");
    expect(res.body.seller).not.toHaveProperty("email");
    expect(res.body.seller).not.toHaveProperty("role");
  });

  it("cuenta desactivada → 404", async () => {
    const ag = request.agent(app);
    const reg = await registrar(ag, "fuera@gmail.com", "Fuera");
    expect(reg.status).toBe(201);
    const id = reg.body.user.id;

    await User.updateOne({ _id: id }, { active: false });

    const res = await request(app).get(`/api/sellers/${id}`);
    expect(res.status).toBe(404);
  });

  it("id inexistente → 404", async () => {
    const res = await request(app).get("/api/sellers/6543f2a1b8c9d0e1f2a3b4c5");
    expect(res.status).toBe(404);
  });
});

describe("imágenes", () => {
  it("sube PNG → 201, archivo en disco y slug asignado", async () => {
    const res = await agent
      .post("/api/products")
      .field("nombre", "Producto con foto")
      .field("categoria", "fotos")
      .field("precio", "15")
      .field("stock", "4")
      .attach("imagenes", PNG_1PX, { filename: "foto.png" });

    expect(res.status).toBe(201);
    productImagen = res.body.product.imagenes[0];
    expect(productImagen).toMatch(/^\/uploads\/.+\.png$/);
    // id y slug del producto con imagen (para keep / delete)
    productImagenId = res.body.product._id;
    productImagenSlug = res.body.product.slug;
    const file = path.join(UPLOADS_DIR, path.basename(productImagen));
    expect(existsSync(file)).toBe(true);
  });

  it("GET /uploads/<archivo> → 200 image/png", async () => {
    const res = await request(app).get(productImagen);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("image/png");
  });

  it("SVG → 400 (magic bytes, no la extensión)", async () => {
    const res = await agent
      .post("/api/products")
      .field("nombre", "Producto SVG")
      .field("categoria", "varios")
      .field("precio", "1")
      .field("stock", "1")
      .attach("imagenes", SVG, { filename: "vector.svg" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("JPG o PNG");
  });

  it(".exe disfrazado → 400", async () => {
    const res = await agent
      .post("/api/products")
      .field("nombre", "Producto EXE")
      .field("categoria", "varios")
      .field("precio", "1")
      .field("stock", "1")
      .attach("imagenes", EXE, { filename: "virus.png" });
    expect(res.status).toBe(400);
  });

  it("PATCH sin keep → las imágenes no se tocan", async () => {
    const res = await agent
      .patch(`/api/products/${productImagenId}`)
      .field("precio", "99");
    expect(res.status).toBe(200);
    expect(res.body.product.imagenes).toEqual([productImagen]);
    expect(existsSync(path.join(UPLOADS_DIR, path.basename(productImagen)))).toBe(true);
  });

  it('PATCH keep="" (quitar todas) → borra el archivo del disco', async () => {
    const res = await agent
      .patch(`/api/products/${productImagenId}`)
      .field("keep", "");
    expect(res.status).toBe(200);
    expect(res.body.product.imagenes).toEqual([]);
    expect(existsSync(path.join(UPLOADS_DIR, path.basename(productImagen)))).toBe(false);
  });

  it("DELETE producto → 204 y el slug deja de responder", async () => {
    const res = await agent.delete(`/api/products/${productImagenId}`);
    expect(res.status).toBe(204);
    const gone = await request(app).get(
      `/api/products/${productImagenSlug}/${productImagenId}`
    );
    expect(gone.status).toBe(404);
  });
});
