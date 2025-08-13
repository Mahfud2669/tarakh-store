import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log("=== ADMIN LOGIN ATTEMPT ===")
    console.log("Username:", username)

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Username dan password wajib diisi",
        },
        { status: 400 },
      )
    }

    // Check if admin_users table exists, if not create it with default admin
    try {
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'admin_users'
        );
      `

      if (!tableExists[0]?.exists) {
        console.log("Creating admin_users table...")

        // Create admin_users table
        await sql`
          CREATE TABLE admin_users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `

        // Hash the default password 'admin123'
        const defaultPasswordHash = await bcrypt.hash("admin123", 10)

        // Insert default admin user
        await sql`
          INSERT INTO admin_users (username, email, password_hash)
          VALUES ('admin', 'admin@tarakhstore.com', ${defaultPasswordHash})
        `

        console.log("✅ Default admin user created")
      }
    } catch (tableError) {
      console.error("Error setting up admin table:", tableError)
    }

    // Find admin user
    let adminUser
    try {
      const result = await sql`
        SELECT id, username, email, password_hash, is_active, last_login
        FROM admin_users 
        WHERE username = ${username} AND is_active = true
        LIMIT 1
      `
      adminUser = result[0]
    } catch (dbError) {
      console.error("Database error:", dbError)

      // Fallback: check against hardcoded admin for demo
      if (username === "admin" && password === "admin123") {
        console.log("✅ Using fallback admin authentication")

        // Create session token
        const sessionToken = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set("admin-session", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: expiresAt,
          path: "/",
        })

        return NextResponse.json({
          success: true,
          message: "Login berhasil",
          user: {
            id: 1,
            username: "admin",
            email: "admin@tarakhstore.com",
          },
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: "Username atau password salah",
        },
        { status: 401 },
      )
    }

    if (!adminUser) {
      console.log("❌ Admin user not found")
      return NextResponse.json(
        {
          success: false,
          error: "Username atau password salah",
        },
        { status: 401 },
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash)

    if (!isPasswordValid) {
      console.log("❌ Invalid password")
      return NextResponse.json(
        {
          success: false,
          error: "Username atau password salah",
        },
        { status: 401 },
      )
    }

    console.log("✅ Password verified successfully")

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store session in database (if table exists)
    try {
      const sessionTableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'admin_sessions'
        );
      `

      if (!sessionTableExists[0]?.exists) {
        await sql`
          CREATE TABLE admin_sessions (
            id SERIAL PRIMARY KEY,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            admin_id INTEGER NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      }

      // Clean up expired sessions
      await sql`DELETE FROM admin_sessions WHERE expires_at < NOW()`

      // Insert new session
      await sql`
        INSERT INTO admin_sessions (session_token, admin_id, expires_at)
        VALUES (${sessionToken}, ${adminUser.id}, ${expiresAt})
      `

      // Update last login
      await sql`
        UPDATE admin_users 
        SET last_login = NOW(), updated_at = NOW()
        WHERE id = ${adminUser.id}
      `
    } catch (sessionError) {
      console.error("Session storage error:", sessionError)
      // Continue without session storage
    }

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set("admin-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    console.log("✅ Admin login successful")

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        last_login: adminUser.last_login,
      },
    })
  } catch (error) {
    console.error("=== LOGIN ERROR ===")
    console.error("Error details:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server",
      },
      { status: 500 },
    )
  }
}
