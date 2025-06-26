const fs = require('fs-extra');
const path = './attivita.json';
const moment = require('moment');

module.exports = ({ bot }) => {
  if (!fs.existsSync(path)) fs.writeJsonSync(path, {});

  bot({ on: 'message' }, async (msg) => {
    if (!msg.isGroup) return;

    const data = await fs.readJson(path);
    const gid = msg.chat;
    const uid = msg.sender;
    const oggi = moment().format('YYYY-MM-DD');

    if (!data[gid]) data[gid] = {};
    if (!data[gid][oggi]) data[gid][oggi] = {};
    if (!data[gid][oggi][uid]) data[gid][oggi][uid] = 0;

    data[gid][oggi][uid] += 1;

    await fs.writeJson(path, data);
  });

  async function mostraClassifica(msg, giorni, titolo) {
    const data = await fs.readJson(path);
    const groupData = data[msg.chat] || {};

    const daData = moment().subtract(giorni - 1, 'days');
    const oggi = moment();
    const rangeDate = [];

    for (let m = moment(daData); m <= oggi; m.add(1, 'days')) {
      rangeDate.push(m.format('YYYY-MM-DD'));
    }

    const conteggi = {};
    for (const dataKey of rangeDate) {
      const giornaliero = groupData[dataKey] || {};
      for (const [uid, count] of Object.entries(giornaliero)) {
        if (!conteggi[uid]) conteggi[uid] = 0;
        conteggi[uid] += count;
      }
    }

    if (Object.keys(conteggi).length === 0)
      return msg.reply('Nessuna attività registrata nel periodo selezionato.');

    const classifica = Object.entries(conteggi)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    let testo = `*🏆 ${titolo}:*\n\n`;
    for (let i = 0; i < classifica.length; i++) {
      const [jid, count] = classifica[i];
      testo += `${i + 1}. @${jid.split('@')[0]} — *${count}* messaggi\n`;
    }

    await msg.reply(testo, { mentions: classifica.map(([jid]) => jid) });
  }

  bot({
    pattern: 'topoggi',
    desc: 'Mostra i 5 utenti più attivi di oggi',
    type: 'group',
  }, async (msg) => {
    if (!msg.isGroup) return;
    await mostraClassifica(msg, 1, 'Top 5 di oggi');
  });

  bot({
    pattern: 'topsettimanale',
    desc: 'Mostra i 5 utenti più attivi degli ultimi 7 giorni',
    type: 'group',
  }, async (msg) => {
    if (!msg.isGroup) return;
    await mostraClassifica(msg, 7, 'Top 5 settimanale');
  });
};
