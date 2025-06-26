import axios from 'axios';

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply("❌ Scrivi una domanda dopo il comando.\nEsempio: .gpt Chi ha scritto Harry Potter?");
  
  try {
    const openaiKey = "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"; // METTI QUI LA TUA API KEY

    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: text }],
        temperature: 0.7,
        max_tokens: 400
      },
      {
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const risposta = res.data.choices[0].message.content.trim();
    m.reply(risposta);

  } catch (e) {
    console.error(e);
    m.reply("⚠️ Errore durante la richiesta a GPT.");
  }
};

handler.help = ["gpt"].map(v => "." + v);
handler.tags = ["ai"];
handler.command = /^gpt$/i;

export default handler;
