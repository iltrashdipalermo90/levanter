const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { cmd } = require('../lib');

console.log("✅ Plugin classifica_attivi.js caricato");

// Percorso del file JSON
const filePath = path.join(__dirname, 'classifica.json');

// Se non esiste, crea un JSON vuoto
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '{}');
}

// Funzioni di lettura/scrittura dati
function loadData() {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 🔍 Logger di ogni messaggio ricevuto
cmd(
  {
    on: 'text',
    fromMe: false,
  },
  async (m) => {
    console.log(`📥 Messaggio da ${m.sender}: "${m.body}"`);

    const data = loadData();
    const chatId = m.jid;
    const senderId = m.sender;
    const today = moment().format('YYYY-MM-DD');

    if (!data[chatId]) data[chatId] = {};
    if (!data[chatId][senderId]) data[chatId][senderId] = {};
    if (!data[chatId][senderId][today]) data[chatId][senderId][today] = 0;

    data[chatId][senderId][today] += 1;
    saveData(data);
  }
);

// 📊 Comando: .topoggi
cmd(
  {
    pattern: 'topoggi',
    fromMe: false,
  },
  async (m, text, client) => {
    console.log("📊 Comando .topoggi ricevuto");

    const data = loadData();
    const chatId = m.jid;
    const today = moment().format('YYYY-MM-DD');

    if (!data[chatId]) {
      return await client.sendMessage(m.jid, { text: 'Nessun dato disponibile.' });
    }

    const utenti = Object.entries(data[chatId])
      .map(([id, giorni]) => ({
        id,
        messaggi: giorni[today] || 0
      }))
      .filter((u) => u.messaggi > 0)
      .sort((a, b) => b.messaggi - a.messaggi)
      .slice(0, 5);

    if (utenti.length === 0) {
      return await client.sendMessage(m.jid, { text: 'Nessuno ha scritto oggi.' });
    }

    let testo = '🏆 *Top utenti di oggi:*\n';
    utenti.forEach((u, i) => {
      testo += `${i + 1}. @${u.id.split('@')[0]} – ${u.messaggi} messaggi\n`;
    });

    await client.sendMessage(m.jid, {
      text: testo,
      mentions: utenti.map((u) => u.id)
    });
  }
);
