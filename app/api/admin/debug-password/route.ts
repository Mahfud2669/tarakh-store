import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log("=== DEBUG PASSWORD ===")
    console.log("Email:", email)
    console.log("Password:", password)

    // Get user from database
    const result = await sql`
      SELECT id, email, password_hash, name
      FROM admin_accounts 
      WHERE email = ${email}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" })
    }

    const user = result[0]
    const storedHash = user.password_hash

    console.log("Stored hash:", storedHash)
    console.log("Hash length:", storedHash.length)
    console.log("Hash starts with:", storedHash.substring(0, 10))

    // Test different verification methods
    const tests = {
      bcrypt_async: false,
      bcrypt_sync: false,
      sha256_with_salt: false,
      md5: false,
      plain: false,
    }

    // Test bcrypt async
    try {
      tests.bcrypt_async = await bcrypt.compare(password, storedHash)
    } catch (e) {
      console.log("Bcrypt async error:", e.message)
    }

    // Test bcrypt sync
    try {
      tests.bcrypt_sync = bcrypt.compareSync(password, storedHash)
    } catch (e) {
      console.log("Bcrypt sync error:", e.message)
    }

    // Test SHA256 with salt
    const sha256Hash = crypto
      .createHash("sha256")
      .update(password + "tarakh-salt")
      .digest("hex")
    tests.sha256_with_salt = sha256Hash === storedHash

    // Test MD5
    const md5Hash = crypto.createHash("md5").update(password).digest("hex")
    tests.md5 = md5Hash === storedHash

    // Test plain text
    tests.plain = password === storedHash

    // Generate new hash for reference
    const newBcryptHash = bcrypt.hashSync(password, 10)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      stored_hash: storedHash,
      test_results: tests,
      generated_hashes: {
        bcrypt: newBcryptHash,
        sha256: sha256Hash,
        md5: md5Hash,
      },
      recommendations: {
        working_method: Object.keys(tests).find((key) => tests[key]) || "none",
        should_update_hash: !tests.bcrypt_async && !tests.bcrypt_sync,
      },
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
