const { default: makeWASocket } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const pino = require("pino");

async function startBot() {
  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: pino({ level: "silent" }),
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

  // Comando base di test
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
startBot();
