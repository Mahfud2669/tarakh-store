import "server-only"

import makeWASocket, { DisconnectReason, useMultiFileAuthState, type WASocket } from "@whiskeysockets/baileys"
import P from "pino"
import QRCode from "qrcode"
import { rm } from "node:fs/promises"

const authDir = process.env.BAILEYS_AUTH_DIR || ".data/baileys-auth"
const logger = P({ level: process.env.LOG_LEVEL || "silent" })

type ServiceState = { socket: WASocket | null; qrDataUrl: string | null; status: "stopped" | "connecting" | "qr" | "connected" | "error"; error?: string; manuallyStopped?: boolean }
const globalState = globalThis as typeof globalThis & { __baileysState?: ServiceState; __baileysStarting?: Promise<void> }
const state = globalState.__baileysState ?? (globalState.__baileysState = { socket: null, qrDataUrl: null, status: "stopped" })

export async function startBaileys() {
  if (state.socket || globalState.__baileysStarting) return globalState.__baileysStarting
  globalState.__baileysStarting = (async () => {
    state.status = "connecting"
    state.error = undefined
    state.manuallyStopped = false
    const { state: authState, saveCreds } = await useMultiFileAuthState(authDir)
    const socket = makeWASocket({ auth: authState, printQRInTerminal: false, logger })
    state.socket = socket
    socket.ev.on("creds.update", saveCreds)
    socket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
      if (qr) { state.qrDataUrl = await QRCode.toDataURL(qr); state.status = "qr" }
      if (connection === "open") { state.status = "connected"; state.qrDataUrl = null }
      if (connection === "close") {
        state.socket = null
        const wasManuallyStopped = state.manuallyStopped === true
        const shouldReconnect = !wasManuallyStopped && (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output?.statusCode !== DisconnectReason.loggedOut
        state.status = shouldReconnect ? "stopped" : wasManuallyStopped ? "stopped" : "error"
        if (shouldReconnect) setTimeout(() => void startBaileys(), 1500)
      }
    })
  })().finally(() => { globalState.__baileysStarting = undefined })
  return globalState.__baileysStarting
}

export function getBaileysStatus() { return { status: state.status, qrDataUrl: state.qrDataUrl, error: state.error } }

export async function refreshBaileysQr() {
  await disconnectBaileys()
  await rm(authDir, { recursive: true, force: true })
  await startBaileys()
}

export async function disconnectBaileys() {
  state.manuallyStopped = true
  const socket = state.socket
  state.socket = null
  state.qrDataUrl = null
  state.status = "stopped"
  if (socket) {
    try { await socket.logout() } catch { socket.end(undefined) }
  }
}

export async function sendBaileysMessage(to: string, message: string) {
  const digits = to.replace(/\D/g, "").replace(/^0/, "62")
  if (digits.length < 10) throw new Error("Nomor WhatsApp tidak valid.")

  await startBaileys()
  // A webhook can arrive just after the socket reports open. Give the connection
  // a short window to become usable instead of failing immediately.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (state.socket && state.status === "connected") break
    await new Promise((resolve) => setTimeout(resolve, 750))
  }
  if (!state.socket || state.status !== "connected") {
    throw new Error("Baileys belum terhubung pada instance server ini. Jalankan satu worker Baileys persistent.")
  }

  const jid = `${digits}@s.whatsapp.net`
  // Do not call onWhatsApp first: that lookup is unreliable for some numbers
  // and can prevent a valid direct message from being sent.
  await state.socket.sendMessage(jid, { text: message })
}
