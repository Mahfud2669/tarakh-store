const bcrypt = require("bcryptjs")
const crypto = require("crypto")

// Test password yang akan dicoba
const testPassword = "your-actual-password" // Ganti dengan password asli Anda
const storedHash = "$2b$10$K7L8Y.f9QUQ5x5x5x5QeKKK" // Hash dari database Anda

console.log("=== PASSWORD TESTING ===")
console.log("Test password:", testPassword)
console.log("Stored hash:", storedHash)
console.log("Hash length:", storedHash.length)

// Test 1: Bcrypt
console.log("\n1. Testing bcrypt...")
try {
  const bcryptResult = bcrypt.compareSync(testPassword, storedHash)
  console.log("Bcrypt result:", bcryptResult)
} catch (error) {
  console.log("Bcrypt error:", error.message)
}

// Test 2: SHA256 with salt
console.log("\n2. Testing SHA256 with salt...")
const sha256Hash = crypto
  .createHash("sha256")
  .update(testPassword + "tarakh-salt")
  .digest("hex")
console.log("SHA256 result:", sha256Hash === storedHash)
console.log("Generated SHA256:", sha256Hash)

// Test 3: MD5
console.log("\n3. Testing MD5...")
const md5Hash = crypto.createHash("md5").update(testPassword).digest("hex")
console.log("MD5 result:", md5Hash === storedHash)
console.log("Generated MD5:", md5Hash)

// Test 4: Plain text
console.log("\n4. Testing plain text...")
console.log("Plain text result:", testPassword === storedHash)

// Generate new bcrypt hash for comparison
console.log("\n5. Generating new bcrypt hash...")
const newHash = bcrypt.hashSync(testPassword, 10)
console.log("New bcrypt hash:", newHash)
console.log("New hash verification:", bcrypt.compareSync(testPassword, newHash))
