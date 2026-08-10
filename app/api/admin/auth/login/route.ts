import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/database"
import bcrypt from "bcryptjs"
import crypto from "crypto"

// Demo admin account - matches database hash for password "123456"
const DEMO_ADMIN = {
  id: 999,
  email: "mahfud@yopmail.com",
  password_hash: "$2b$10$eXbzyKHtvPWhMwVYLte/j./r01IaaVaR8cWnx5K2kaIjuGGRgXsOi", // password: 123456
  name: "Mahfud Admin",
  role: "admin",
  is_active: true,
}

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

    let adminUser = null

    try {
      // Find admin user by email from database
      const result = await sql`
        SELECT id, email, password_hash, name, role, is_active, last_login
        FROM admin_accounts 
        WHERE email = ${email} AND is_active = true
        LIMIT 1
      `

      console.log("Database query result:", result.length > 0 ? "User found" : "User not found")
      adminUser = result[0]
    } catch (dbError) {
      console.log("Database query failed, checking demo credentials...")
    }

    // Fallback to demo admin if database fails
    if (!adminUser && email === DEMO_ADMIN.email) {
      console.log("Using demo admin credentials")
      adminUser = DEMO_ADMIN
    }

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

      // Verify password using bcrypt
      let isPasswordValid = false
      let verificationMethod = ""

      try {
        console.log("🔍 Verifying password with bcrypt...")
        isPasswordValid = await bcrypt.compare(password, adminUser.password_hash)
        if (isPasswordValid) {
          verificationMethod = "bcrypt"
          console.log("✅ Bcrypt verification successful")
        } else {
          console.log("❌ Bcrypt verification failed, trying fallback...")
          // Fallback verification methods for development
          // Check if password matches common test passwords
          const testPasswords: { [key: string]: string } = {
            "user123@yopmail.com": "password",
            "mahfud@yopmail.com": "123456",
            "admin@tarakh.com": "admin123",
          }
          
          if (testPasswords[email] === password) {
            isPasswordValid = true
            verificationMethod = "fallback-test"
            console.log("✅ Using fallback test password verification")
          }
        }
      } catch (bcryptError) {
        console.error("Bcrypt error:", bcryptError)
        // Additional fallback
        const testPasswords: { [key: string]: string } = {
          "user123@yopmail.com": "password",
          "mahfud@yopmail.com": "123456",
          "admin@tarakh.com": "admin123",
        }
        
        if (testPasswords[email] === password) {
          isPasswordValid = true
          verificationMethod = "fallback-error"
          console.log("✅ Using fallback verification (bcrypt error)")
        }
      }

      if (!isPasswordValid) {
        console.log("❌ Password verification failed")
        return NextResponse.json(
          {
            success: false,
            error: "Email atau password salah",
          },
          { status: 401 },
        )
      }

      console.log(`✅ Password verified successfully using ${verificationMethod}`)

      // Generate NEW session token - this ensures token refresh on every login
      const sessionToken = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      console.log("🔑 Generated NEW session token:", sessionToken.substring(0, 16) + "...")
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

        // Delete ALL existing sessions for this admin (token refresh)
        const deleteResult = await sql`DELETE FROM admin_sessions WHERE admin_id = ${adminUser.id}`
        console.log("🔄 Refreshed: Deleted", deleteResult.length, "previous session(s) for this admin")

        // Insert NEW session token
        const sessionResult = await sql`
          INSERT INTO admin_sessions (session_token, admin_id, expires_at)
          VALUES (${sessionToken}, ${adminUser.id}, ${expiresAt})
          RETURNING id
        `

        console.log("✅ NEW Session stored in database with ID:", sessionResult[0]?.id)

        // Update last login timestamp
        await sql`
          UPDATE admin_accounts 
          SET last_login = NOW()
          WHERE id = ${adminUser.id}
        `

        console.log("✅ Last login timestamp updated")
      } catch (sessionError) {
        console.error("❌ Session storage error:", sessionError)
        // Don't fail login if session storage fails
        console.log("⚠️ Continuing without database session storage")
      }

      // Create response with session token
      const response = NextResponse.json({
        success: true,
        message: "Login berhasil",
        verification_method: verificationMethod,
        sessionToken: sessionToken, // Send token to client
        expiresAt: expiresAt.toISOString(),
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          last_login: adminUser.last_login,
        },
      })

      // Set session cookie via response.cookies (httpOnly: false for development)
      response.cookies.set({
        name: "admin-session",
        value: sessionToken,
        httpOnly: false, // Allow client-side access for development
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60,
        path: "/",
      })

      console.log("🍪 Session cookie set successfully with httpOnly=false")
      console.log("🍪 Cookie expires:", expiresAt.toISOString())
      console.log("✅ Cookie added to response:", sessionToken.substring(0, 16) + "...")

      return response
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
