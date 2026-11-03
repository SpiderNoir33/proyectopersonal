import readline from "node:readline/promises";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";

const [, , email] = process.argv;

if (!email) {
  console.error("Uso: node scripts/createAdmin.js <email>");
  console.error("     (la contraseña se pide a mano o por ADMIN_PASSWORD)");
  process.exit(1);
}

await connectDB();

try {
  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log(`[OK] "${existing.nombre}" (<${existing.email}>) ahora es admin`);
  } else {
    let password = process.env.ADMIN_PASSWORD;

    if (!password && process.stdin.isTTY) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      password = await rl.question("Contraseña para el nuevo admin (mín. 8): ");
      rl.close();
    }

    if (!password || password.length < 8) {
      console.error("Ese email no existe: necesita una contraseña de mínimo 8 caracteres");
      process.exit(1);
    }

    const user = await User.create({
      nombre: email.split("@")[0],
      email,
      password,
      role: "admin",
    });
    console.log(`[OK] Admin creado: "${user.nombre}" (<${user.email}>)`);
  }
} catch (err) {
  console.error("[ERROR]", err.message);
  process.exitCode = 1;
} finally {
  process.exit();
}
