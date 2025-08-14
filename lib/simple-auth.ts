import crypto from "crypto"

// Simple password hashing using Node.js built-in crypto
export function hashPassword(password: string): string {
  const salt = "tarakh-store-salt-2024"
  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex")
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// Generate secure session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Default admin credentials
export const DEFAULT_ADMIN = {
  username: "admin",
  password: "admin123",
  email: "admin@tarakhstore.com",
  // Pre-computed hash for "admin123"
  passwordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
}
