import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { storage } from "./server/storage";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    const username = "admin";
    const password = "admin";
    
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername(username);
    
    if (existingAdmin) {
      console.log("Admin user already exists with ID:", existingAdmin.id);
      return;
    }
    
    // Create admin user
    const hashedPassword = await hashPassword(password);
    
    const adminUser = await storage.createUser({
      username,
      password: hashedPassword,
      fullName: "Administrator",
      email: "admin@example.com",
      phone: "1234567890",
      balance: 10000,
      agentId: "ADMIN-00001",
      promoCode: "ADMIN00001",
      role: "admin"
    });
    
    console.log("Admin user created successfully with ID:", adminUser.id);
    console.log("Login with username:", username);
    console.log("Password:", password);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

createAdminUser();