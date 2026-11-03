import { MongoMemoryServer } from "mongodb-memory-server";

// Arranca un MongoDB real en memoria para toda la suite y expone las env
// que config/env.js exige ANTES de que cualquier test importe la app.
export default async function globalSetup() {
  process.env.NODE_ENV = "test";
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.JWT_SECRET = "test-secret-de-32-caracteres-minimo!!";
  process.env.JWT_EXPIRES_IN = "7d";
  process.env.COOKIE_EXPIRES_IN = "7d";
  // Artix no está en la lista de distros de mongodb-memory-server: usamos el
  // binario ya descargado (verificado con --version) en lugar de detección
  // de distro o descargas nuevas. Si se pierde el cache:
  //   MONGOMS_DOWNLOAD_URL=https://fastdl.mongodb.org/linux/mongodb-linux-ubuntu2204-x86_64-8.2.6.tgz
  process.env.MONGOMS_SYSTEM_BINARY ??=
    `${process.env.HOME}/.cache/mongodb-binaries/mongod-x86_64-ubuntu-8.2.6`;
  process.env.MONGOMS_DISTRO ??= "ubuntu-22.04";
  process.env.MONGOMS_INSTANCE_STARTUP_TIMEOUT ??= "30";

  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri("mi-tienda-test");

  return async () => {
    await mongod.stop();
  };
}
