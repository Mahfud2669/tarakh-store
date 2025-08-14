import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/database"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log("=== ADMIN LOGIN ATTEMPT ===")
    console.log("Email:", email)
    console.log("Password length:", password?.length)

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email dan password wajib diisi",
        },
        { status: 400 },
      )
    }

    try {
      // Find admin user by email
      const result = await sql`
        SELECT id, email, password_hash, name, role, is_active, last_login
        FROM admin_accounts 
        WHERE email = ${email} AND is_active = true
        LIMIT 1
      `

      console.log("Database query result:", result.length > 0 ? "User found" : "User not found")

      const adminUser = result[0]

      if (!adminUser) {
        console.log("❌ Admin user not found")
        return NextResponse.json(
          {
            success: false,
            error: "Email atau password salah",
          },
          { status: 401 },
        )
      }

      console.log("✅ Admin user found:")
      console.log("- ID:", adminUser.id)
      console.log("- Email:", adminUser.email)
      console.log("- Name:", adminUser.name)
      console.log("- Role:", adminUser.role)
      console.log("- Hash starts with:", adminUser.password_hash?.substring(0, 10))
      console.log("- Hash length:", adminUser.password_hash?.length)

      // Verify password using multiple methods
      let isPasswordValid = false
      let verificationMethod = ""

      // Method 1: Try bcrypt first
      try {
        console.log("🔍 Trying bcrypt verification...")
        isPasswordValid = await bcrypt.compare(password, adminUser.password_hash)
        if (isPasswordValid) {
          verificationMethod = "bcrypt"
          console.log("✅ Bcrypt verification successful")
        } else {
          console.log("❌ Bcrypt verification failed")
        }
      } catch (bcryptError) {
        console.error("Bcrypt error:", bcryptError.message)
      }

      // Method 2: Try different bcrypt versions if first failed
      if (!isPasswordValid) {
        try {
          console.log("🔍 Trying bcrypt with different options...")
          // Sometimes bcrypt hashes are created with different versions
          const bcryptResult = bcrypt.compareSync(password, adminUser.password_hash)
          if (bcryptResult) {
            isPasswordValid = true
            verificationMethod = "bcrypt-sync"
            console.log("✅ Bcrypt sync verification successful")
          }
        } catch (bcryptSyncError) {
          console.error("Bcrypt sync error:", bcryptSyncError.message)
        }
      }

      // Method 3: Try simple SHA256 hash as fallback
      if (!isPasswordValid) {
        console.log("🔍 Trying SHA256 verification...")
        const sha256Hash = crypto
          .createHash("sha256")
          .update(password + "tarakh-salt")
          .digest("hex")

        if (sha256Hash === adminUser.password_hash) {
          isPasswordValid = true
          verificationMethod = "sha256"
          console.log("✅ SHA256 verification successful")
        } else {
          console.log("❌ SHA256 verification failed")
          console.log("Expected:", sha256Hash)
          console.log("Got:", adminUser.password_hash)
        }
      }

      // Method 4: Try MD5 as another fallback
      if (!isPasswordValid) {
        console.log("🔍 Trying MD5 verification...")
        const md5Hash = crypto.createHash("md5").update(password).digest("hex")

        if (md5Hash === adminUser.password_hash) {
          isPasswordValid = true
          verificationMethod = "md5"
          console.log("✅ MD5 verification successful")
        }
      }

      // Method 5: Try plain text (not recommended but for debugging)
      if (!isPasswordValid) {
        console.log("🔍 Trying plain text verification...")
        if (password === adminUser.password_hash) {
          isPasswordValid = true
          verificationMethod = "plain"
          console.log("✅ Plain text verification successful")
        }
      }

      if (!isPasswordValid) {
        console.log("❌ All password verification methods failed")
        console.log("Input password:", password)
        console.log("Stored hash:", adminUser.password_hash)

        return NextResponse.json(
          {
            success: false,
            error: "Email atau password salah",
            debug: {
              email_found: true,
              hash_format: adminUser.password_hash?.substring(0, 10),
              hash_length: adminUser.password_hash?.length,
            },
          },
          { status: 401 },
        )
      }

      console.log(`✅ Password verified successfully using ${verificationMethod}`)

      // Generate session token dengan format yang lebih aman
      const sessionToken = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      console.log("🔑 Generated session token:", sessionToken.substring(0, 16) + "...")
      console.log("⏰ Session expires at:", expiresAt.toISOString())

      // Store session in database with better error handling
      try {
        // Check if admin_sessions table exists
        const sessionTableExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'admin_sessions'
          );
        `

        if (!sessionTableExists[0]?.exists) {
          console.log("📋 Creating admin_sessions table...")
          await sql`
            CREATE TABLE admin_sessions (
              id SERIAL PRIMARY KEY,
              session_token VARCHAR(255) UNIQUE NOT NULL,
              admin_id INTEGER NOT NULL,
              expires_at TIMESTAMP NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `
          console.log("✅ admin_sessions table created")
        }

        // Clean up expired sessions
        const cleanupResult = await sql`DELETE FROM admin_sessions WHERE expires_at < NOW()`
        console.log("🧹 Cleaned up expired sessions:", cleanupResult.length)

        // Delete existing sessions for this admin
        await sql`DELETE FROM admin_sessions WHERE admin_id = ${adminUser.id}`

        // Insert new session
        const sessionResult = await sql`
          INSERT INTO admin_sessions (session_token, admin_id, expires_at)
          VALUES (${sessionToken}, ${adminUser.id}, ${expiresAt})
          RETURNING id
        `

        console.log("✅ Session stored in database with ID:", sessionResult[0]?.id)

        // Update last login
        await sql`
          UPDATE admin_accounts 
          SET last_login = NOW()
          WHERE id = ${adminUser.id}
        `

        console.log("✅ Last login updated")
      } catch (sessionError) {
        console.error("❌ Session storage error:", sessionError)
        // Don't fail login if session storage fails
        console.log("⚠️ Continuing without database session storage")
      }

      // Set HTTP-only cookie with proper settings
      const cookieStore = await cookies()

      // Clear any existing session cookie first
      cookieStore.delete("admin-session")

      // Set new session cookie
      cookieStore.set("admin-session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
        maxAge: 24 * 60 * 60, // 24 hours in seconds
      })

      console.log("🍪 Session cookie set successfully")
      console.log("🍪 Cookie expires:", expiresAt.toISOString())

      return NextResponse.json({
        success: true,
        message: "Login berhasil",
        verification_method: verificationMethod,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          last_login: adminUser.last_login,
        },
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Terjadi kesalahan database",
          details: dbError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("=== LOGIN ERROR ===")
    console.error("Error details:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
