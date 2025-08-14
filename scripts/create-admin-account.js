const bcrypt = require("bcryptjs")
const { neon } = require("@neondatabase/serverless")

// Database connection
const sql = neon(process.env.DATABASE_URL)

async function createAdminAccount() {
  const adminData = {
    email: "mahfud@yopmail.com",
    password: "password123",
    name: "Mahfud Admin",
    role: "admin",
  }

  console.log("=== CREATING ADMIN ACCOUNT ===")
  console.log("Email:", adminData.email)
  console.log("Password:", adminData.password)
  console.log("Name:", adminData.name)
  console.log("Role:", adminData.role)

  try {
    // Generate bcrypt hash
    console.log("\n🔐 Generating password hash...")
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(adminData.password, saltRounds)

    console.log("✅ Hash generated:", passwordHash.substring(0, 20) + "...")

    // Verify hash works
    const isValid = await bcrypt.compare(adminData.password, passwordHash)
    console.log("✅ Hash verification:", isValid ? "SUCCESS" : "FAILED")

    if (!isValid) {
      throw new Error("Hash verification failed!")
    }

    // Check if admin_accounts table exists
    console.log("\n📋 Checking database table...")
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_accounts'
      );
    `

    if (!tableExists[0]?.exists) {
      console.log("❌ admin_accounts table does not exist!")
      console.log("Please create the table first or check your database connection.")
      return
    }

    console.log("✅ admin_accounts table exists")

    // Delete existing account if any
    console.log("\n🗑️ Removing existing account...")
    await sql`DELETE FROM admin_accounts WHERE email = ${adminData.email}`

    // Insert new admin account
    console.log("➕ Inserting new admin account...")
    const result = await sql`
      INSERT INTO admin_accounts (email, password_hash, name, role, is_active)
      VALUES (${adminData.email}, ${passwordHash}, ${adminData.name}, ${adminData.role}, true)
      RETURNING id, email, name, role, is_active
    `

    console.log("\n✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!")
    console.log("Account details:", result[0])

    // Test login credentials
    console.log("\n🔑 LOGIN CREDENTIALS:")
    console.log("Email:", adminData.email)
    console.log("Password:", adminData.password)

    console.log("\n🧪 Testing password verification...")
    const testVerification = await bcrypt.compare(adminData.password, passwordHash)
    console.log("Password test:", testVerification ? "✅ PASS" : "❌ FAIL")

    return result[0]
  } catch (error) {
    console.error("\n❌ ERROR CREATING ADMIN ACCOUNT:")
    console.error("Error details:", error.message)
    console.error("Full error:", error)
  }
}

// Run the function
createAdminAccount()
  .then((result) => {
    if (result) {
      console.log("\n🎉 Admin account creation completed!")
      console.log("You can now login with:")
      console.log("- Email: mahfud@yopmail.com")
      console.log("- Password: password123")
    }
    process.exit(0)
  })
  .catch((error) => {
    console.error("Script failed:", error)
    process.exit(1)
  })
