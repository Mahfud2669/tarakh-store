const bcrypt = require("bcryptjs")

async function hashPassword(password) {
  try {
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)
    console.log(`Password: ${password}`)
    console.log(`Hashed: ${hash}`)

    // Verify the hash works
    const isValid = await bcrypt.compare(password, hash)
    console.log(`Verification: ${isValid ? "SUCCESS" : "FAILED"}`)

    return hash
  } catch (error) {
    console.error("Error hashing password:", error)
  }
}

// Hash the default admin password
hashPassword("admin123")

// You can also hash custom passwords:
// hashPassword('your-custom-password');
