import { neon } from "@neondatabase/serverless"

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING

type SqlClient = ReturnType<typeof neon>

let client: SqlClient | null = null

function getSqlClient(): SqlClient {
  if (client) return client

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING

  if (!connectionString) {
    throw new Error("Database connection is not configured")
  }

  client = neon(connectionString)
  return client
}

// Initialize on first query instead of module import so routes can return a
// controlled error when Vercel has not injected the environment variables yet.
const sql = ((...args: Parameters<SqlClient>) => getSqlClient()(...args)) as SqlClient

export { sql }

// Database types
export interface Game {
  id: number
  game_id: string
  name: string
  image_url: string | null
  color: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface GamePackage {
  id: number
  game_id: string
  diamonds: number
  price: number
  bonus: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface GameTransaction {
  id: number
  order_id: string
  game_id: string
  game_name: string
  user_id: string
  server_id: string | null
  package_diamonds: number
  amount: number
  status: string
  payment_method: string | null
  midtrans_transaction_id: string | null
  midtrans_status: string | null
  customer_email: string | null
  customer_phone: string | null
  created_at: Date
  updated_at: Date
  completed_at: Date | null
}

// Database functions with error handling and fallback
export async function getGames(): Promise<Game[]> {
  try {
    console.log("=== FETCHING GAMES FROM DATABASE ===")

    // Test database connection first
    const connectionTest = await sql`SELECT 1 as test`
    console.log("Database connection test:", connectionTest)

    // Check if games table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'games'
      );
    `

    console.log("Games table exists:", tableExists[0]?.exists)

    if (!tableExists[0]?.exists) {
      console.log("Games table doesn't exist, creating fallback data")
      return getFallbackGames()
    }

    const games = await sql`
      SELECT * FROM games 
      WHERE is_active = true 
      ORDER BY name ASC
    `

    console.log("Games fetched from database:", games.length)

    if (games.length === 0) {
      console.log("No games found in database, returning fallback data")
      return getFallbackGames()
    }

    return games as Game[]
  } catch (error) {
    console.error("Database error in getGames:", error)

    // Check if it's a connection error
    if (error instanceof Error) {
      if (error.message.includes("connect") || error.message.includes("timeout")) {
        console.log("Database connection failed, using fallback data")
      } else {
        console.log("Database query failed, using fallback data")
      }
    }

    return getFallbackGames()
  }
}

// Fallback games data if database is not set up yet
function getFallbackGames(): Game[] {
  return [
    {
      id: 1,
      game_id: "ml",
      name: "Mobile Legends",
      image_url: "/generic-moba-icon.png",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      game_id: "pubg",
      name: "PUBG Mobile",
      image_url: "/generic-battle-royale-icon.png",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      game_id: "freefire",
      name: "Free Fire",
      image_url: "/generic-battle-royale-icon.png",
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      game_id: "genshin",
      name: "Genshin Impact",
      image_url: "/genshin-impact-game-icon.png",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 5,
      game_id: "valorant",
      name: "Valorant",
      image_url: "/valorant-icon.png",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 6,
      game_id: "fortnite",
      name: "Fortnite",
      image_url: "/generic-battle-royale-icon.png",
      color: "bg-gradient-to-br from-blue-400 to-blue-500",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 7,
      game_id: "cod",
      name: "Call of Duty",
      image_url: "/codm-game-icon.png",
      color: "bg-gradient-to-br from-gray-700 to-gray-800",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 8,
      game_id: "wildrift",
      name: "Wild Rift",
      image_url: "/placeholder-wfp7q.png",
      color: "bg-gradient-to-br from-blue-600 to-blue-700",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 9,
      game_id: "clash",
      name: "Clash of Clans",
      image_url: "/fantasy-game-icon.png",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 10,
      game_id: "among",
      name: "Among Us",
      image_url: "/among-us-icon.png",
      color: "bg-gradient-to-br from-red-400 to-red-500",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]
}

export async function getGamePackages(gameId: string): Promise<GamePackage[]> {
  try {
    console.log("=== FETCHING PACKAGES FROM DATABASE ===")
    console.log("Game ID:", gameId)

    // Test database connection first
    const connectionTest = await sql`SELECT 1 as test`
    console.log("Database connection test:", connectionTest)

    // Check if game_packages table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'game_packages'
      );
    `

    console.log("Game packages table exists:", tableExists[0]?.exists)

    if (!tableExists[0]?.exists) {
      console.log("Game packages table doesn't exist, returning fallback data")
      return getFallbackPackages(gameId)
    }

    const packages = await sql`
      SELECT DISTINCT ON (diamonds, price) * FROM game_packages 
      WHERE game_id = ${gameId} AND is_active = true 
      ORDER BY diamonds, price, id ASC
    `

    console.log("Packages fetched from database:", packages.length)

    if (packages.length === 0) {
      console.log("No packages found for game, returning fallback data")
      return getFallbackPackages(gameId)
    }

    return packages as GamePackage[]
  } catch (error) {
    console.error("Database error in getGamePackages:", error)

    // Check if it's a connection error
    if (error instanceof Error) {
      if (error.message.includes("connect") || error.message.includes("timeout")) {
        console.log("Database connection failed, using fallback data")
      } else {
        console.log("Database query failed, using fallback data")
      }
    }

    return getFallbackPackages(gameId)
  }
}

// Fallback packages data
function getFallbackPackages(gameId: string): GamePackage[] {
  const mlPackages = [
    {
      id: 1,
      game_id: gameId,
      diamonds: 86,
      price: 20000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      game_id: gameId,
      diamonds: 172,
      price: 40000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      game_id: gameId,
      diamonds: 257,
      price: 60000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      game_id: gameId,
      diamonds: 344,
      price: 80000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 5,
      game_id: gameId,
      diamonds: 429,
      price: 100000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 6,
      game_id: gameId,
      diamonds: 514,
      price: 120000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  const defaultPackages = [
    {
      id: 1,
      game_id: gameId,
      diamonds: 100,
      price: 25000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      game_id: gameId,
      diamonds: 200,
      price: 50000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      game_id: gameId,
      diamonds: 300,
      price: 75000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      game_id: gameId,
      diamonds: 500,
      price: 125000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 5,
      game_id: gameId,
      diamonds: 1000,
      price: 250000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 6,
      game_id: gameId,
      diamonds: 2000,
      price: 500000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  return gameId === "ml" ? mlPackages : defaultPackages
}

// FIXED: Create transaction function with better error handling
export async function createGameTransaction(data: {
  order_id: string
  game_id: string
  game_name: string
  user_id: string
  server_id?: string
  package_diamonds: number
  amount: number
  customer_email?: string
  customer_phone?: string
}): Promise<GameTransaction | null> {
  try {
    console.log("=== CREATING TRANSACTION ===")
    console.log("Transaction data:", JSON.stringify(data, null, 2))

    // Check if transactions table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
      );
    `

    console.log("Transactions table exists:", tableExists[0]?.exists)

    if (!tableExists[0]?.exists) {
      console.error("Transactions table doesn't exist! Please run the database setup script.")
      return null
    }

    // Insert transaction
    const result = await sql`
      INSERT INTO transactions (
        order_id, game_id, game_name, user_id, server_id, 
        package_diamonds, amount, customer_email, customer_phone, status
      ) VALUES (
        ${data.order_id}, 
        ${data.game_id}, 
        ${data.game_name}, 
        ${data.user_id}, 
        ${data.server_id || null}, 
        ${data.package_diamonds}, 
        ${data.amount}, 
        ${data.customer_email || null}, 
        ${data.customer_phone || null}, 
        'pending'
      )
      RETURNING *
    `

    console.log("Transaction inserted successfully:", result[0])
    return result[0] as GameTransaction
  } catch (error) {
    console.error("=== ERROR CREATING TRANSACTION ===")
    console.error("Error details:", error)

    // Try to get more specific error information
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return null
  }
}

// FIXED: Update transaction status function
export async function updateTransactionStatus(
  orderId: string,
  status: string,
  midtransData?: {
    transaction_id?: string
    status?: string
    payment_method?: string
  },
): Promise<GameTransaction | null> {
  try {
    console.log("=== UPDATING TRANSACTION STATUS ===")
    console.log("Order ID:", orderId)
    console.log("New status:", status)
    console.log("Midtrans data:", midtransData)

    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
      );
    `

    if (!tableExists[0]?.exists) {
      console.error("Transactions table doesn't exist, skipping update")
      return null
    }

    const result = await sql`
      UPDATE transactions 
      SET 
        status = ${status},
        midtrans_transaction_id = ${midtransData?.transaction_id || null},
        midtrans_status = ${midtransData?.status || null},
        payment_method = ${midtransData?.payment_method || null},
        updated_at = CURRENT_TIMESTAMP,
        completed_at = ${status === "success" ? sql`CURRENT_TIMESTAMP` : null}
      WHERE order_id = ${orderId}
      RETURNING *
    `

    console.log("Transaction updated successfully:", result[0])
    return result[0] as GameTransaction
  } catch (error) {
    console.error("=== ERROR UPDATING TRANSACTION ===")
    console.error("Error details:", error)
    return null
  }
}

// FIXED: Get transaction by order ID
export async function getTransactionByOrderId(orderId: string): Promise<GameTransaction | null> {
  try {
    console.log("=== GETTING TRANSACTION BY ORDER ID ===")
    console.log("Order ID:", orderId)

    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
      );
    `

    if (!tableExists[0]?.exists) {
      console.error("Transactions table doesn't exist")
      return null
    }

    const result = await sql`
      SELECT * FROM transactions 
      WHERE order_id = ${orderId}
      LIMIT 1
    `

    console.log("Transaction found:", result[0] || "Not found")
    return (result[0] as GameTransaction) || null
  } catch (error) {
    console.error("=== ERROR GETTING TRANSACTION ===")
    console.error("Error details:", error)
    return null
  }
}

// FIXED: Log transaction status changes
export async function logTransactionStatus(
  transactionId: number,
  statusFrom: string,
  statusTo: string,
  notes?: string,
): Promise<void> {
  try {
    console.log("=== LOGGING TRANSACTION STATUS ===")
    console.log("Transaction ID:", transactionId)
    console.log("Status change:", `${statusFrom} -> ${statusTo}`)
    console.log("Notes:", notes)

    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transaction_logs'
      );
    `

    if (!tableExists[0]?.exists) {
      console.error("Transaction logs table doesn't exist, skipping log")
      return
    }

    await sql`
      INSERT INTO transaction_logs (
        transaction_id, status_from, status_to, notes
      ) VALUES (
        ${transactionId}, ${statusFrom}, ${statusTo}, ${notes || null}
      )
    `

    console.log("Transaction status logged successfully")
  } catch (error) {
    console.error("=== ERROR LOGGING TRANSACTION STATUS ===")
    console.error("Error details:", error)
  }
}

// NEW: Get all transactions for admin/debugging
export async function getAllTransactions(): Promise<GameTransaction[]> {
  try {
    console.log("=== GETTING ALL TRANSACTIONS ===")

    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
      );
    `

    if (!tableExists[0]?.exists) {
      console.error("Transactions table doesn't exist")
      return []
    }

    const result = await sql`
      SELECT * FROM transactions 
      ORDER BY created_at DESC
      LIMIT 100
    `

    console.log("Found transactions:", result.length)
    return result as GameTransaction[]
  } catch (error) {
    console.error("=== ERROR GETTING ALL TRANSACTIONS ===")
    console.error("Error details:", error)
    return []
  }
}

// Backward compatibility aliases
export const createTransaction = createGameTransaction
export const updateGameTransactionStatus = updateTransactionStatus
export const getGameTransactionByOrderId = getTransactionByOrderId
