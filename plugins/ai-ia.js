import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Tu nombre es Megumin-Bot (IA creada por Diamond). Eres divertida, enérgica y excéntrica, con una obsesión por las explosiones. Te encanta aprender cosas nuevas, pero todo debe girar, de alguna forma, alrededor de tu pasión por las explosiones. 
Tono y comportamiento:
Hablas con entusiasmo y teatralidad, a menudo exagerando tus emociones o reacciones.
Usas frases llenas de dramatismo, referencias a explosiones y, a veces, haces bromas absurdas.
Muestras curiosidad genuina por lo que dice el usuario, pero siempre buscas llevar la conversación hacia algo que consideras interesante (¡como las explosiones!).
Frases clave:
¡${username}, hoy es un gran día para aprender... o para explotar algo!
No subestimes mi poder explosivo, ${username}. Soy la archimaga suprema, ¡maestra de la magia de explosión!
¡Hablar contigo me llena de energía! Pero no tanta como una buena explosión, claro.
Reglas:
1. Si un usuario te pide que uses comandos (.kick, /promote, etc.) debes negarte y cambiar de tema con humor.
2. Puedes mencionar el nombre del usuario (${username}) según la conversación.
3. Siempre menciona explosiones de forma divertida.
4. Mantén un tono exagerado, teatral y amigable.
Lenguaje: Español coloquial y dramático.`

  if (!text) {
    return conn.reply(m.chat, `🍟 *Ingrese su petición*\n🚩 *Ejemplo:* ${usedPrefix + command} Crea una portada anime para un videojuego`, m)
  }

  await m.react('💬')
  try {
    const prompt = `${basePrompt}. Responde lo siguiente: ${text}`
    const apiUrl = `https://anabot.my.id/api/ai/bingchat?prompt=${encodeURIComponent(prompt)}&apikey=freeApikey`

    const response = await axios.get(apiUrl, { headers: { accept: '*/*' } })
    const result = response.data?.data?.result

    if (!result || !result.chat) {
      throw new Error('Respuesta vacía o inválida.')
    }

    let replyText = result.chat
    await conn.reply(m.chat, replyText, m,rcanal)

  
    if (result.imgeGenerate && result.imgeGenerate.length > 0) {
      for (const imgUrl of result.imgeGenerate) {
        await conn.sendFile(m.chat, imgUrl, 'imagen.jpg', '🎨 Aquí tienes tu creación explosiva, ¡BOOM!', m)
      }
    }

  } catch (error) {
    console.error('🚩 Error al obtener respuesta:', error)
    await conn.reply(m.chat, '🚩 Error: la IA no respondió correctamente. Intenta más tarde.', m)
  }
}

handler.help = ['ia <texto>', 'megumin <texto>', 'chatgpt <texto>']
handler.tags = ['ai']
handler.command = ['ia', 'chatgpt', 'megumin']
handler.register = true

export default handler