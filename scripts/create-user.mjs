import { scrypt as scryptCallback, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const scrypt = promisify(scryptCallback);
const email = process.env.KOSTKU_USER_EMAIL?.trim().toLowerCase();
const name = process.env.KOSTKU_USER_NAME?.trim();
const password = process.env.KOSTKU_USER_PASSWORD;
const role = process.env.KOSTKU_USER_ROLE;

if (!email || !name || !password || !["OWNER", "ADMIN", "TENANT"].includes(role ?? "")) {
  console.error("Set KOSTKU_USER_EMAIL, KOSTKU_USER_NAME, KOSTKU_USER_PASSWORD, and KOSTKU_USER_ROLE (OWNER, ADMIN, or TENANT).");
  process.exit(1);
}
if (password.length < 12 || password.length > 1024) {
  console.error("KOSTKU_USER_PASSWORD must contain 12 to 1024 characters.");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);
  const passwordHash = `scrypt$${salt}$${key.toString("hex")}`;
  await prisma.user.upsert({
    where: { email },
    create: { email, name, role, passwordHash },
    update: { name, role, passwordHash },
  });
  console.log(`User ${email} provisioned with role ${role}.`);
} finally {
  await prisma.$disconnect();
}
