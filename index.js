const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

// Avvio bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false
  });

  // Salva le credenziali su aggiornamento
  sock.ev.on('creds.update', saveCreds);

  // Stato connessione
  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') console.log('✅ Bot connesso a WhatsApp!');
    else if (connection === 'close') console.log('❌ Connessione chiusa.');
  });

  // Carica tutti i plugin nella cartella ./plugins
  const pluginFolder = path.join(__dirname, 'plugins');
  fs.readdirSync(pluginFolder).forEach(file => {
    if (file.endsWith('.js')) {
      try {
        require(path.join(pluginFolder, file))(sock);
        console.log(`✅ Plugin ${file} caricato`);
      } catch (err) {
        console.error(`❌ Errore nel plugin ${file}:`, err);
      }
    }
  });
}

// Avvia il bot
console.log('🚀 Avvio Levanter...');
startBot().catch(err => {
  console.error('❌ Errore durante l\'avvio:', err);
});
