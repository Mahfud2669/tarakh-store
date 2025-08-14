const bcrypt = require("bcryptjs")

async function createAdminHash() {
  const email = "mahfud@yopmail.com"
  const password = "password123"
  const name = "Mahfud Admin"
  const role = "admin"

  console.log("=== CREATING ADMIN ACCOUNT ===")
  console.log("Email:", email)
  console.log("Password:", password)
  console.log("Name:", name)
  console.log("Role:", role)

  try {
    // Generate bcrypt hash
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    console.log("\n=== GENERATED HASH ===")
    console.log("Password Hash:", passwordHash)
    console.log("Hash Length:", passwordHash.length)

    // Verify the hash works
    const isValid = await bcrypt.compare(password, passwordHash)
    console.log("Hash Verification:", isValid ? "✅ SUCCESS" : "❌ FAILED")

    // Generate SQL INSERT statement
    const sqlInsert = `
INSERT INTO admin_accounts (email, password_hash, name, role, is_active) 
VALUES ('${email}', '${passwordHash}', '${name}', '${role}', true);`

    console.log("\n=== SQL INSERT STATEMENT ===")
    console.log(sqlInsert)

    console.log("\n=== COPY THIS HASH TO USE IN SQL ===")
    console.log(passwordHash)

    return {
      email,
      password,
      passwordHash,
      name,
      role,
      sqlInsert,
    }
  } catch (error) {
    console.error("Error creating hash:", error)
  }
}

// Run the function
createAdminHash()
