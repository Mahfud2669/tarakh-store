import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined")
}

const sql = neon(process.env.DATABASE_URL)

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
    // First check if games table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'games'
      );
    `

    if (!tableExists[0]?.exists) {
      console.log("Games table doesn't exist, returning fallback data")
      return getFallbackGames()
    }

    const games = await sql`
      SELECT * FROM games 
      WHERE is_active = true 
      ORDER BY name ASC
    `

    if (games.length === 0) {
      console.log("No games found in database, returning fallback data")
      return getFallbackGames()
    }

    return games as Game[]
  } catch (error) {
    console.error("Error fetching games:", error)
    console.log("Returning fallback games data")
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
    // Check if game_packages table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'game_packages'
      );
    `

    if (!tableExists[0]?.exists) {
      console.log("Game packages table doesn't exist, returning fallback data")
      return getFallbackPackages(gameId)
    }

    const packages = await sql`
      SELECT DISTINCT ON (diamonds, price) * FROM game_packages 
      WHERE game_id = ${gameId} AND is_active = true 
      ORDER BY diamonds, price, id ASC
    `

    if (packages.length === 0) {
      console.log("No packages found for game, returning fallback data")
      return getFallbackPackages(gameId)
    }

    return packages as GamePackage[]
  } catch (error) {
    console.error("Error fetching game packages:", error)
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
    // Check if game_transactions table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'game_transactions'
      );
    `

    if (!tableExists[0]?.exists) {
      console.log("Game transactions table doesn't exist, skipping database insert")
      return null
    }

    const [transaction] = await sql`
      INSERT INTO game_transactions (
        order_id, game_id, game_name, user_id, server_id, 
        package_diamonds, amount, customer_email, customer_phone, status
      ) VALUES (
        ${data.order_id}, ${data.game_id}, ${data.game_name}, ${data.user_id}, 
        ${data.server_id || null}, ${data.package_diamonds}, ${data.amount}, 
        ${data.customer_email || null}, ${data.customer_phone || null}, 'pending'
      )
      RETURNING *
    `
    return transaction as GameTransaction
  } catch (error) {
    console.error("Error creating game transaction:", error)
    return null
  }
}

export async function updateGameTransactionStatus(
  orderId: string,
  status: string,
  midtransData?: {
    transaction_id?: string
    status?: string
    payment_method?: string
  },
): Promise<GameTransaction | null> {
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'game_transactions'
      );
    `

    if (!tableExists[0]?.exists) {
      console.log("Game transactions table doesn't exist, skipping update")
      return null
    }

    const [transaction] = await sql`
      UPDATE game_transactions 
      SET 
        status = ${status},
        midtrans_transaction_id = ${midtransData?.transaction_id || null},
        midtrans_status = ${midtransData?.status || null},
        payment_method = ${midtransData?.payment_method || null},
        updated_at = CURRENT_TIMESTAMP,
        completed_at = ${status === "success" ? "CURRENT_TIMESTAMP" : null}
      WHERE order_id = ${orderId}
      RETURNING *
    `
    return transaction as GameTransaction
  } catch (error) {
    console.error("Error updating game transaction status:", error)
    return null
  }
}

// Additional functions needed for webhook
export async function getTransactionByOrderId(orderId: string): Promise<GameTransaction | null> {
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'game_transactions'
      );
    `

    if (!tableExists[0]?.exists) {
      console.log("Game transactions table doesn't exist")
      return null
    }

    const [transaction] = await sql`
      SELECT * FROM game_transactions 
      WHERE order_id = ${orderId}
      LIMIT 1
    `

    return (transaction as GameTransaction) || null
  } catch (error) {
    console.error("Error getting transaction by order ID:", error)
    return null
  }
}

export async function updateTransactionStatus(
  orderId: string,
  status: string,
  midtransData?: {
    transaction_id?: string
    status?: string
    payment_method?: string
  },
): Promise<GameTransaction | null> {
  return updateGameTransactionStatus(orderId, status, midtransData)
}

export async function logTransactionStatus(
  transactionId: number,
  statusFrom: string,
  statusTo: string,
  notes?: string,
): Promise<void> {
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'game_transaction_logs'
      );
    `

    if (!tableExists[0]?.exists) {
      console.log("Game transaction logs table doesn't exist, skipping log")
      return
    }

    await sql`
      INSERT INTO game_transaction_logs (
        transaction_id, status_from, status_to, notes
      ) VALUES (
        ${transactionId}, ${statusFrom}, ${statusTo}, ${notes || null}
      )
    `
  } catch (error) {
    console.error("Error logging transaction status:", error)
  }
}
