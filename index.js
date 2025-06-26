const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys'); const fs = require('fs'); const path = require('path'); const pino = require('pino');

async function startBot() { const SESSION_ID = process.env.SESSION_ID || 'session'; console.log(\u{1F4C1} Sessione in uso: ./${SESSION_ID});

const { state, saveCreds } = await useMultiFileAuthState(./${SESSION_ID}); const { version } = await fetchLatestBaileysVersion();

const sock = makeWASocket({ version, auth: state, logger: pino({ level: 'silent' }), printQRInTerminal: false });

sock.ev.on('creds.update', saveCreds);

sock.ev.on('connection.update', (update) => { const { connection, lastDisconnect } = update;

if (connection) {
  console.log(`\u{1F50C} Stato connessione: ${connection}`);
}

if (connection === 'open') {
  console.log('✅ Bot connesso a WhatsApp!');
}

if (connection === 'close') {
  console.log('❌ Connessione chiusa. Riprova...');
}

});

const pluginFolder = path.join(__dirname, 'plugins'); fs.readdirSync(pluginFolder).forEach(file => { if (file.endsWith('.js')) { try { require(path.join(pluginFolder, file))(sock); console.log(✅ Plugin ${file} caricato); } catch (err) { console.error(❌ Errore nel plugin ${file}:, err); } } });

sock.ev.on('messages.upsert', async ({ messages }) => { const msg = messages[0]; if (!msg || msg.key.fromMe) return;

const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
if (text?.startsWith('.ping')) {
  await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' }, { quoted: msg });
}

}); }

console.log('🚀 Avvio Levanter...'); startBot().catch(err => { console.error('❌ Errore durante l'avvio:', err); });

// Keep-alive log ogni 15 secondi setInterval(() => { console.log('🧪 Il bot è vivo ma in attesa di connessione...'); }, 15000);

