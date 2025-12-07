import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';
import { savetube } from '../lib/yt-savetube.js';
import { ogmp3 } from '../lib/youtubedl.js';

const LimitAud = 725 * 1024 * 1024; // 725MB
const LimitVid = 425 * 1024 * 1024; // 425MB
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;
const userCaptions = new Map();
const userRequests = {};

const axiosConfig = {
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://www.youtube.com/'
  }
};

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) return m.reply(`*🤔 ¿Qué está buscando? 🤔*\n*Ingrese el nombre de la canción*\n\n*Ejemplo:*\n${usedPrefix + command} emilia 420`);

  const tipoDescarga = command === 'play' || command === 'musica' ? 'audio' : 
                       command === 'play2' ? 'video' : 
                       command === 'play3' ? 'audio (documento)' : 
                       command === 'play4' ? 'video (documento)' : '';

  if (userRequests[m.sender]) {
    return await conn.reply(m.chat, `⏳ Hey @${m.sender.split('@')[0]} espera, ya estás descargando algo 🙄\nEspera a que termine tu solicitud actual antes de hacer otra...`, userCaptions.get(m.sender) || m);
  }

  userRequests[m.sender] = true;

  try {
    let videoIdToFind = text.match(youtubeRegexID) || null;
    const yt_play = await search(args.join(' '));
    let ytplay2 = await yts(videoIdToFind === null ? text : 'https://youtu.be/' + videoIdToFind[1]);

    if (videoIdToFind) {
      const videoId = videoIdToFind[1];
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId);
    }
    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2;

    const PlayText = await conn.sendMessage(m.chat, {
      text: `${yt_play[0].title}
*⇄ㅤ     ◁   ㅤ  ❚❚ㅤ     ▷ㅤ     ↻*

*⏰ Duración:* ${secondString(yt_play[0].duration.seconds)}
*👉🏻 Aguarde un momento en lo que envío su ${tipoDescarga}*`,
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363305025805187@newsletter',
          serverMessageId: '',
          newsletterName: 'LoliBot ✨️'
        },
        forwardingScore: 9999999,
        isForwarded: true,
        mentionedJid: null,
        externalAdReply: {
          showAdAttribution: false,
          renderLargerThumbnail: false,
          title: yt_play[0].title,
          body: "LoliBot",
          containsAutoReply: true,
          mediaType: 1,
          thumbnailUrl: yt_play[0].thumbnail,
          sourceUrl: "skyultraplus.com"
        }
      }
    }, { quoted: m });

    userCaptions.set(m.sender, PlayText);

    const [input, qualityInput = command === 'play' || command === 'musica' || command === 'play3' ? '320' : '720'] = text.split(' ');

    // Nuevas APIs actualizadas
    const audioApis = [
      {
        name: "Tobat",
        url: async () => {
          const res = await axios.get(`https://ytb.tobat.me/ytmp3?url=${encodeURIComponent(yt_play[0].url)}`, axiosConfig);
          return res.data?.result || res.data?.url;
        }
      },
      {
        name: "Xyro",
        url: async () => {
          const res = await axios.get(`https://api.xyro.site/download/youtubemp3?url=${encodeURIComponent(yt_play[0].url)}`, axiosConfig);
          return res.data?.result?.download;
        }
      },
      {
        name: "ZenzzXD",
        url: async () => {
          const res = await axios.get(`https://api.zenzxz.my.id/downloader/ytmp3?url=${encodeURIComponent(yt_play[0].url)}`, axiosConfig);
          return res.data?.data?.download_url || res.data?.data?.url;
        }
      },
      {
        name: "Yupra",
        url: async () => {
          const res = await axios.get(`https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(yt_play[0].url)}`, axiosConfig);
          return res.data?.result?.link;
        }
      },
      {
        name: "Delirius",
        url: async () => {
          const res = await axios.get(`https://api.delirius.store/downloader/youtube-mp3?url=${encodeURIComponent(yt_play[0].url)}`, axiosConfig);
          return res.data?.result?.url;
        }
      },
      { url: () => savetube.download(yt_play[0].url, 'mp3'), name: "SaveTube" },
      { url: () => ogmp3.download(yt_play[0].url, '320', 'audio'), name: "OgMP3" }
    ];

    const videoApis = [
      {
        name: "Tobat",
        url: async () => {
          const res = await axios.get(`https://ytb.tobat.me/ytmp4?url=${encodeURIComponent(yt_play[0].url)}`, axiosConfig);
          return res.data?.result || res.data?.url;
        }
      },
      {
        name: "Xyro",
        url: async () => {
          const res = await axios.get(`https://api.xyro.site/download/youtubemp4?url=${encodeURIComponent(yt_play[0].url)}&quality=360`, axiosConfig);
          return res.data?.result?.download;
        }
      },
      {
        name: "ZenzzXD",
        url: async () => {
          const res = await axios.get(`https://api.zenzxz.my.id/downloader/ytmp4?url=${encodeURIComponent(yt_play[0].url)}&resolution=360p`, axiosConfig);
          return res.data?.data?.download_url || res.data?.data?.url;
        }
      },
      {
        name: "Yupra",
        url: async () => {
          const res = await axios.get(`https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(yt_play[0].url)}`, axiosConfig);
          return res.data?.result?.formats?.[0]?.url;
        }
      },
      {
        name: "Delirius",
        url: async () => {
          const res = await axios.get(`https://api.delirius.store/downloader/youtube-mp4?url=${encodeURIComponent(yt_play[0].url)}&quality=360`, axiosConfig);
          return res.data?.result?.url;
        }
      },
      { url: () => savetube.download(yt_play[0].url, '720'), name: "SaveTube" },
      { url: () => ogmp3.download(yt_play[0].url, '720', 'video'), name: "OgMP3" }
    ];

    const download = async (apis) => {
      for (const api of apis) {
        try {
          console.log(`Intentando API: ${api.name}`);
          const mediaData = await api.url();
          
          if (mediaData && isValidUrl(mediaData)) {
            const size = await getFileSize(mediaData);
            if (size >= 1024) {
              console.log(`✅ Éxito con API: ${api.name}`);
              return { mediaData, isDirect: false, apiName: api.name };
            }
          }
        } catch (e) {
          console.log(`❌ Error con API ${api.name}: ${e.message}`);
          continue;
        }
      }
      return { mediaData: null, isDirect: false, apiName: null };
    };

    if (command === 'play' || command === 'musica') {
      const { mediaData, isDirect, apiName } = await download(audioApis);
      if (mediaData) {
        const fileSize = await getFileSize(mediaData);
        if (fileSize > LimitAud) {
          await conn.sendMessage(m.chat, {
            document: { url: mediaData },
            mimetype: 'audio/mpeg',
            fileName: `${yt_play[0].title}.mp3`,
            contextInfo: {}
          }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, {
            audio: { url: mediaData },
            mimetype: 'audio/mpeg',
            contextInfo: {}
          }, { quoted: m });
        }
        await m.reply(`✅ Descargado con: ${apiName}`);
      } else {
        await m.reply('❌ Todas las APIs fallaron. Intenta más tarde.');
      }
    }

    if (command === 'play2' || command === 'video') {
      const { mediaData, isDirect, apiName } = await download(videoApis);
      if (mediaData) {
        const fileSize = await getFileSize(mediaData);
        const messageOptions = {
          fileName: `${yt_play[0].title}.mp4`,
          caption: `🔰 Aquí está tu video \n🔥 Título: ${yt_play[0].title}\n✅ API: ${apiName}`,
          mimetype: 'video/mp4'
        };
        if (fileSize > LimitVid) {
          await conn.sendMessage(m.chat, {
            document: { url: mediaData },
            ...messageOptions
          }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, {
            video: { url: mediaData },
            thumbnail: yt_play[0].thumbnail,
            ...messageOptions
          }, { quoted: m });
        }
      } else {
        await m.reply('❌ Todas las APIs fallaron. Intenta más tarde.');
      }
    }

    if (command === 'play3' || command === 'playdoc') {
      const { mediaData, isDirect, apiName } = await download(audioApis);
      if (mediaData) {
        await conn.sendMessage(m.chat, {
          document: { url: mediaData },
          mimetype: 'audio/mpeg',
          fileName: `${yt_play[0].title}.mp3`,
          contextInfo: {}
        }, { quoted: m });
        await m.reply(`✅ Descargado con: ${apiName}`);
      } else {
        await m.react('❌');
      }
    }

    if (command === 'play4' || command === 'playdoc2') {
      const { mediaData, isDirect, apiName } = await download(videoApis);
      if (mediaData) {
        await conn.sendMessage(m.chat, {
          document: { url: mediaData },
          fileName: `${yt_play[0].title}.mp4`,
          caption: `🔰 Título: ${yt_play[0].title}\n✅ API: ${apiName}`,
          thumbnail: yt_play[0].thumbnail,
          mimetype: 'video/mp4'
        }, { quoted: m });
      } else {
        await m.react('❌');
      }
    }
  } catch (error) {
    console.error(error);
    m.react("❌️");
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['play', 'play2', 'play3', 'play4', 'playdoc'];
handler.tags = ['downloader'];
handler.command = ['play', 'play2', 'play3', 'play4', 'audio', 'video', 'playdoc', 'playdoc2', 'musica'];
handler.register = true;
export default handler;

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
  return search.videos;
}

function secondString(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

async function getFileSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return parseInt(response.headers.get('content-length') || 0);
  } catch {
    return 0;
  }
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
