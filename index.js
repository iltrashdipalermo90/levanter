const fs = require("fs");
const path = require("path");
const { default: makeWASocket } = require("@whiskeysockets/baileys");
const pino = require("pino");

// 📦 Caricamento automatico dei plugin locali
const pluginFolder = path.join(__dirname, "plugins");

fs.readdirSync(pluginFolder).forEach((file) => {
  if (file.endsWith(".js")) {
    try {
      require(path.join(pluginFolder, file));
      console.log(`✅ Plugin ${file} caricato`);
    } catch (err) {
      console.log(`❌ Errore nel plugin ${file}:`, err);
    }
  }
});

// 🔧 Configurazione base del bot
const startBot = async () => {
  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: pino({ level: "silent" }),
    auth: undefined, // oppure usa il tuo sistema di auth se esiste
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key?.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text) return;

    // ✅ Riconosce comandi con il prefisso '.'
    if (text.startsWith(".")) {
      const command = text.split(" ")[0].slice(1);

      if (command === "ping") {
        await sock.sendMessage(msg.key.remoteJid, { text: "🏓 Pong!" }, { quoted: msg });
      }

      if (command === "prova") {
        await sock.sendMessage(msg.key.remoteJid, { text: "✅ Plugin attivo e funzionante!" }, { quoted: msg });
      }

      // puoi aggiungere altri comandi qui direttamente oppure da plugin
    }
  });
};

startBot();
