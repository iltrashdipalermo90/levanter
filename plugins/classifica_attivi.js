const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { cmd } = require('../lib');

// Percorso del file JSON
const filePath = path.join(__dirname, 'classifica.json');

// Se il file non esiste, crealo
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '{}');
}

// Leggi i dati
function loadData() {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Salva i dati
function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 📊 Conteggio dei messaggi in arrivo
cmd(
  {
    on: 'text', // intercetta tutti i messaggi testuali
    fromMe: false
  },
  async (m) => {
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

// 🏆 Comando: .topoggi
cmd(
  {
    pattern: 'topoggi',
    fromMe: false
  },
  async (m, text, client) => {
    const data = loadData();
    const chatId = m.jid;
    const today = moment().format('YYYY-MM-DD');

    if (!data[chatId]) {
      return await client.sendMessage(m.jid, { text: 'Nessun dato per oggi.' });
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
      return await client.sendMessage(m.jid, { text: 'Nessuno ha scritto oggi 😴' });
    }

    let testo = '🏆 *Top 5 attivi oggi:*\n';
    utenti.forEach((u, i) => {
      testo += `${i + 1}. @${u.id.split('@')[0]} – ${u.messaggi} messaggi\n`;
    });

    await client.sendMessage(m.jid, {
      text: testo,
      mentions: utenti.map((u) => u.id)
    });
  }
);

// 📅 Comando: .topweek
cmd(
  {
    pattern: 'topweek',
    fromMe: false
  },
  async (m, text, client) => {
    const data = loadData();
    const chatId = m.jid;

    if (!data[chatId]) {
      return await client.sendMessage(m.jid, { text: 'Nessun dato per la settimana.' });
    }

    const giorniSettimana = [...Array(7).keys()].map((i) =>
      moment().subtract(i, 'days').format('YYYY-MM-DD')
    );

    const counter = {};

    for (const [id, giorni] of Object.entries(data[chatId])) {
      counter[id] = giorniSettimana.reduce(
        (totale, giorno) => totale + (giorni[giorno] || 0),
        0
      );
    }

    const utenti = Object.entries(counter)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (utenti.length === 0) {
      return await client.sendMessage(m.jid, { text: 'Nessuno ha scritto questa settimana 😴' });
    }

    let testo = '📅 *Top 5 della settimana:*\n';
    utenti.forEach(([id, count], i) => {
      testo += `${i + 1}. @${id.split('@')[0]} – ${count} messaggi\n`;
    });

    await client.sendMessage(m.jid, {
      text: testo,
      mentions: utenti.map(([id]) => id)
    });
  }
);
