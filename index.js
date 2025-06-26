const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");
const pino = require("pino");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false // NON usare più il QR
  });

  sock.ev.on("creds.update", saveCreds);

  // 👉 PAIRING CODE: stampa nei log
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, pairingCode } = update;

    if (pairingCode) {
      console.log("🔗 Pairing code generato:");
      console.log(pairingCode);
      console.log("➡️ Vai su https://wa.me/pair e inserisci il codice");
    }

    if (connection === "open") {
      console.log("✅ Bot connesso a WhatsApp!");
    }

    if (connection === "close") {
      console.log("❌ Connessione chiusa. Riavvio...");
    }
  });

  // Caricamento plugin
  const pluginFolder = path.join(__dirname, "plugins");
  fs.readdirSync(pluginFolder).forEach(file => {
    if (file.endsWith(".js")) {
      try {
        require(path.join(pluginFolder, file))(sock);
        console.log(`✅ Plugin ${file} caricato`);
      } catch (err) {
        console.error(`❌ Errore nel plugin ${file}:`, err);
      }
    }
  });

  // Comando base .ping
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    const text = msg?.message?.conversation || msg?.message?.extendedTextMessage?.text;
    if (!text || msg.key.fromMe) return;

    if (text.startsWith(".ping")) {
      await sock.sendMessage(msg.key.remoteJid, { text: "🏓 Pong!" }, { quoted: msg });
    }
  });
}

console.log("✅ Avvio bot...");
(async () => {
  try {
    await startBot();
  } catch (err) {
    console.error("❌ Errore critico:", err);
  }
})();
