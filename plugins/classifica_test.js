const { cmd } = require("../lib/plugins");

console.log("✅ classifica_test.js caricato");

cmd({
  pattern: "prova",
  desc: "Test plugin",
  type: "utility",
  fromMe: false
}, async (message) => {
  console.log("📥 Ricevuto comando .prova");
  await message.reply("✅ Plugin attivo e funzionante!");
});
