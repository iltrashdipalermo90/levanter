import axios from 'axios'

let handler = async (m, { text }) => {
  if (!text) return m.reply("❌ Scrivi una domanda dopo il comando.\nEsempio: .gpt Qual è la capitale d’Italia?")

  try {
    const openaiKey = process.env.OPENAI_API_KEY

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
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json"
        }
      }
    )

    const risposta = res.data.choices[0].message.content.trim()
    m.reply(risposta)

  } catch (err) {
    console.error(err?.response?.data || err)
    m.reply("⚠️ Errore durante la richiesta a GPT. Controlla la tua chiave.")
  }
}

handler.help = ['gpt']
handler.tags = ['ai']
handler.command = /^gpt$/i

export default handler
