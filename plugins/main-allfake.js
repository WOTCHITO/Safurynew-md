import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) {

global.getBuffer = async function getBuffer(url, options) {
try {
options ? options : {}
var res = await axios({
method: "get",
url,
headers: {
'DNT': 1,
'User-Agent': 'GoogleBot',
'Upgrade-Insecure-Request': 1
},
...options,
responseType: 'arraybuffer'
})
return res.data
} catch (e) {
console.log(`Error : ${e}`)
}}

let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
global.fotoperfil = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://files.catbox.moe/6ditf1.jpg')
let user = global.db.data.users[who]
let bot = global.db.data.settings[this.user.jid]
let pushname = m.pushName || 'Sin nombre'
global.opts['gconly'] = true

//creador y otros
global.botcommandcount = bot.botcommandCount
global.creador = 'Wa.me/5351524614'
global.ofcbot = `${conn.user.jid.split('@')[0]}`
global.asistencia = 'Wa.me/5351524614'

// 🔥 Cambiado: nombre del canal SafuryBot MD
global.namechannel = '⏤͟͞ SafuryBot MD ✰'
global.namegrupo = '🌸 Safury - Grupo Oficial'
global.namecomu = 'Comunidad Safury'

// Colaboradores
global.colab1 = 'Miguelon'
global.colab2 = 'Steven'
global.colab3 = 'Dino'

// 🔥 🔥 Cambiado: todos los canales por el nuevo ID
global.idchannel = '120363404923920766@newsletter'

global.canalIdM = [
"120363404923920766@newsletter",
"120363404923920766@newsletter",
"120363404923920766@newsletter",
"120363404923920766@newsletter",
"120363404923920766@newsletter",
"120363404923920766@newsletter"
]

// Nombres de canales modificados a versión Safury
global.canalNombreM = [
"SafuryBot MD - Canal Oficial",
"Safury Updates",
"Safury MultiBot Channel",
"Safury API - Reset",
"Safury WaBot - Oficial",
"Safury Team ⚡"
]

global.channelRD = await getRandomChannel()

//Reacciones De Comandos.!
global.rwait = '🕒'
global.done = '✅'
global.error = '✖️'

//Emojis
global.emoji = '🔥'
global.emoji2 = '💥'
global.emoji3 = '❤️‍🔥'
global.emoji4 = '🍭'
global.emojis = [emoji, emoji2, emoji3, emoji4].getRandom()

//mensaje en espera
global.wait = '🕒 *Espera un momento, soy lenta...*'
global.waitt = global.wait
global.waittt = global.wait
global.waitttt = global.wait

//Enlaces
var canal = 'https://whatsapp.com/channel/0029Vb7Ji66KbYMTYLU9km3p'  
let canal2 = 'https://whatsapp.com/channel/0029Vaxr2YgLCoWy2NS1Ab0a'
var git = 'https://github.com/David-Chian' 
var youtube = 'https://youtube.com/@davidchian4957' 
var github = 'https://github.com/David-Chian/Megumin-Bot-MD' 
let correo = 'noisebot40@gmail.com'

global.redes = [canal, canal2, git, youtube, github, correo].getRandom()

//Imagen
let category = "imagen"
const db = './src/database/db.json'
const db_ = JSON.parse(fs.readFileSync(db))
const random = Math.floor(Math.random() * db_.links[category].length)
const randomlink = db_.links[category][random]
const response = await fetch(randomlink)
const rimg = await response.buffer()
global.icons = rimg

// Mensaje RPG
var ase = new Date()
var hour = ase.getHours()
switch(hour){
case 0: case 1: case 2: hour = 'Linda Noche 🌃'; break;
case 3: case 4: case 5: case 6: hour = 'Linda Mañana 🌄'; break;
case 7: case 8: case 9: hour = 'Linda Mañana 🌅'; break;
case 10: case 11: case 12: case 13: hour = 'Lindo Día 🌤'; break;
case 14: case 15: case 16: case 17: hour = 'Linda Tarde 🌆'; break;
default: hour = 'Linda Noche 🌃'; break;
}
global.saludo = hour;

//tags
global.nombre = conn.getName(m.sender)
global.taguser = '@' + m.sender.split("@s.whatsapp.net")
var more = String.fromCharCode(8206)
global.readMore = more.repeat(850)

//Fakes
global.fkontak = { key: { participants:"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }

global.fake = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, newsletterName: channelRD.name, serverMessageId: -1 }}, quoted: m }

global.icono = [ 
'https://files.catbox.moe/f5yora.jpg',
'https://files.catbox.moe/ny0hrb.jpg',
'https://files.catbox.moe/cxrcml.jpg',
'https://files.catbox.moe/jai8du.jpg',
'https://files.catbox.moe/61i55j.jpg',
'https://files.catbox.moe/1dqm9i.jpg',
'https://files.catbox.moe/0hnyny.jpg',
'https://qu.ax/CbzQU.jpg'
].getRandom()

global.rcanal = {contextInfo: {forwardingScore: 2025, isForwarded: true, externalAdReply: {title: textbot, body: '💥 El bot más explosivo!', sourceUrl: redes, thumbnailUrl: icono}}}

}

export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * canalIdM.length)
let id = canalIdM[randomIndex]
let name = canalNombreM[randomIndex]
return { id, name }
}
