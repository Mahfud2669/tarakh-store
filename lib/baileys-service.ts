import "server-only"

import makeWASocket, { DisconnectReason, useMultiFileAuthState, type WASocket } from "@whiskeysockets/baileys"
import P from "pino"
import QRCode from "qrcode"

const authDir = process.env.BAILEYS_AUTH_DIR || ".data/baileys-auth"
const logger = P({ level: process.env.LOG_LEVEL || "silent" })

type ServiceState = { socket: WASocket | null; qrDataUrl: string | null; status: "stopped" | "connecting" | "qr" | "connected" | "error"; error?: string }
const globalState = globalThis as typeof globalThis & { __baileysState?: ServiceState; __baileysStarting?: Promise<void> }
const state = globalState.__baileysState ?? (globalState.__baileysState = { socket: null, qrDataUrl: null, status: "stopped" })

export async function startBaileys() {
  if (state.socket || globalState.__baileysStarting) return globalState.__baileysStarting
  globalState.__baileysStarting = (async () => {
    state.status = "connecting"
    state.error = undefined
    const { state: authState, saveCreds } = await useMultiFileAuthState(authDir)
    const socket = makeWASocket({ auth: authState, printQRInTerminal: false, logger })
    state.socket = socket
    socket.ev.on("creds.update", saveCreds)
    socket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
      if (qr) { state.qrDataUrl = await QRCode.toDataURL(qr); state.status = "qr" }
      if (connection === "open") { state.status = "connected"; state.qrDataUrl = null }
      if (connection === "close") {
        state.socket = null
        const shouldReconnect = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output?.statusCode !== DisconnectReason.loggedOut
        state.status = shouldReconnect ? "stopped" : "error"
        if (shouldReconnect) setTimeout(() => void startBaileys(), 1500)
      }
    })
  })().finally(() => { globalState.__baileysStarting = undefined })
  return globalState.__baileysStarting
}

export function getBaileysStatus() { return { status: state.status, qrDataUrl: state.qrDataUrl, error: state.error } }

export async function disconnectBaileys() {
  const socket = state.socket
  state.socket = null
  state.qrDataUrl = null
  state.status = "stopped"
  if (socket) {
    try { await socket.logout() } catch { socket.end(undefined) }
  }
}

export async function sendBaileysMessage(to: string, message: string) {
  await startBaileys()
  if (!state.socket || state.status !== "connected") throw new Error("Baileys belum terhubung. Scan QR terlebih dahulu.")
  const digits = to.replace(/\D/g, "").replace(/^0/, "62")
  if (digits.length < 10) throw new Error("Nomor WhatsApp tidak valid.")
  const jid = `${digits}@s.whatsapp.net`
  const [contact] = await state.socket.onWhatsApp(digits)
  if (!contact?.exists) throw new Error("Nomor WhatsApp tidak terdaftar atau koneksi Baileys belum siap.")
  await state.socket.sendMessage(jid, { text: message })
}
