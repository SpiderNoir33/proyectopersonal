# Tienda Electrónica Stack MERN

Proyecto Personal enfocado en la seguridad del Backend, siendo un proyecto personal para profundizar sobre NODE, JS, y MongoDB.

Se realizó para estudiar sobre Backend y ciberseguridad, motivado por entender a fondo
los sistemas por encima de la capa visual.

![Node](https://img.shields.io/badge/Node-22-green)
![Express](https://img.shields.io/badge/Express-4.22-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Zod](https://img.shields.io/badge/validated%20with-Zod-3088C6)

## ¿Qué trata el proyecto?

Una tienda virtual de productos electrónicos, ofreciendo una variedad de productos para computadoras, consolas, repuestos, etc.

Se realizó con el propósito de aprendizaje y conseguir empleo formal como Dev Junior en Backend y aprender a fondo sobre Ciberseguridad a futuro.

| Capa | Tecnología | Por qué lo usé |

|------|------------|----------------|
| Runtime | NodeJS (ESM) | Fácil aplicación y usado para el aprendizaje al haber estudiado las bases de JS |
| API | Express 4 | Usado para aprender la tecnología y observar cómo interactúa con los servidores |
| DB | MongoDB y Mongoose 9 | Al usar objetos en JS, se usó para mayor versatilidad antes de aprender SQL |
| Validación | Zod (schemas compartidos) | Utilizado para validar y proteger el Backend de accesos con credenciales falsas |
| Auth | JWT + cookie httpOnly | Autenticación para proteger al usuario y la web en general |
| Frontend | React 18 + Vite + Tailwind 4 | Para aprendizaje de componentes y desarrollar habilidades básicas pero sólidas en el framework |
| Tests | Vitest + Supertest + mongodb-memory-server | Para demostrar la seguridad del Backend |
| Cifrado | Bcrypt para las contraseñas | Me preocupaba que las contraseñas se filtraran |

## Arquitectura

Monorepo con npm workspaces: `backend` (Express), `front end` (React) y `shared` (schemas Zod). La validación vive en un solo lugar y la consumen ambos lados, así el frontend y el backend no pueden divergir en las reglas.

```text
proyecto personal/
├── backend/              # API Express
│   ├── src/
│   │   ├── config/       # env validado con Zod, conexión a MongoDB
│   │   ├── models/       # esquemas Mongoose (User, Product)
│   │   ├── controllers/  # lógica de cada endpoint
│   │   ├── services/     # authService: tokens, cookies, denylist
│   │   ├── middlewares/  # auth, validate, rate limit, upload, errores
│   │   ├── routes/       # definición de rutas
│   │   └── utils/        # AppError, catchAsync, escapeRegex, slugify...
│   ├── test/             # suite con Vitest
│   └── server.js         # arranque
├── front end/            # React + Vite + Tailwind
└── shared/               # schemas Zod compartidos
```

### Flujo de una petición

1. `server.js` arranca el servidor y conecta a MongoDB
2. `app.js` aplica helmet, CORS, límite de body y cookies
3. El router de la ruta aplica sus middlewares en orden:
   rate limit → sesión (`protect`) → validación (Zod) → controller
4. El controller habla con Mongoose y responde
5. Cualquier error cae en `errorHandler` y se traduce a un JSON limpio

El orden de los middlewares no es arbitrario: por ejemplo, `validate` va después de `upload` porque multer primero separa archivos de texto; y `notFound`/`errorHandler` van al final porque necesitan ver todas las rutas y todos los errores.

## Endpoints

16 endpoints bajo `/api`, definidos en `backend/src/routes/`:

- **auth** — `POST /register`, `POST /login`, `POST /logout`, `GET /me`
- **users** — `GET /` (admin), `PATCH /me`, `DELETE /me`
- **products** — `GET /`, `GET /mine`, `GET /:slug/:id`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`
- **sellers** — `GET /:id`
- **health** — `GET /api/health`

## Puesta en marcha

```bash
npm install
cp backend/.env.example backend/.env   # rellenar MONGO_URI y JWT_SECRET
npm run dev        # backend en :3000
npm run test       # suite de tests
```

## Seguridad del Backend

Enfocado en hacer un producto de prueba que fuera seguro de usar en la práctica, me enfoqué en el uso de IA (sin hacer vibecoding a ciegas, he estado observando el codigo yo mismo para encontrar inconscistencias), conocimiento e investigación de las librerías que podrían ayudar con la seguridad del proyecto.

### Autenticación (JWT + Cookies)

- El token solo vive en cookie httpOnly + sameSite + secure en producción
- Logout registra el `jti` del token en una denylist: aunque el token no haya expirado, ya no se acepta
- Cambiar la contraseña invalida los tokens ya emitidos (`passwordChangedAt` vs `iat`)

### Autorización

- Restringe rutas por rol con `restrictTo`: un usuario normal nunca puede acceder a rutas de admin
- Se usa `protect` en cada ruta privada
- El admin solamente accede a `GET /users`
- Solo el dueño o un admin puede modificar productos

### Validación

- Usa Zod para validar
- Los schemas están en `/shared`, por lo cual el Backend y el Frontend validan con el mismo código
- `req.body = result.data` elimina campos no declarados, por lo cual nadie puede mandar `role: "admin"` en el registro (mass assignment)

### Rate limiting

- Login/registro: 10 intentos / 15 min
- Resto de la API: 300 peticiones / 15 min

### Inyección y ReDoS

- `escapeRegex` en las búsquedas, evitando ataques ReDoS
- Los filtros se construyen campo a campo; pasar `req.query` entero a Mongo dejaría operadores como `$gt` entrar en la query, evitando ataques de inyección NoSQL

### Contraseñas

- Usa bcrypt con 10 rondas; `select: false` sirve para que el hash no salga de la BD en las queries
- DUMMY_HASH: el login tarda lo mismo si el email existe o no → evita enumerar usuarios

### Imágenes

- Calcula por magic bytes y no permite archivos que no sean imágenes, limitándose a 3MB × 10 archivos
- Nombres UUID generados por el servidor, por ende evita ataques path traversal
- URLs de imagen solo http(s) en el esquema

## Limitantes actuales del proyecto

Las limitantes actuales de mi proyecto, a pesar de la supervisión, el frontend utiliza un diseño simple y en parte está generado por IA (utilizando bases del frontend) y observando a detalle qué hace cada sintaxis de React para acelerar el proceso de la capa visual, además de las siguientes limitaciones técnicas que no he resuelto:

- denylist in-memory (no escala a multi-instancia)
- sin carrito real
- checkout es una demo, no lleva un refresh token
- no está configurado para desplegar en servidores debido a limitaciones económicas y limitaciones de servicios como Railway, Render, etc., por lo cual funciona solo en local
- el sistema de pago es demostración y es estético
- no está incluido un SMTP
- las imágenes se guardan en local

### Algunas cosas honestas sobre mi

- El backend es donde mas entiendo un poco mas (ya que hice un curso de javascript, busque mucho sobre node, y express), pero solo se lo basico en el frontend
- Honestamente, no me gusta el frontend
- Hay cosas que siento que no se, pero sigo motivado por saber lo necesario para tener experiencia en tecnologias importantes
- Aveces si no entiendo, recurro al uso de la IA para avanzar y arreglar bugs
- Este proyecto lo he acelerado con IA bajo supervision y utilizando las practicas que aprendi
