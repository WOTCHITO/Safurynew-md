import yts from 'yt-search';
import axios from 'axios';

const tempStorage = {};

const axiosConfig = {
    timeout: 4000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Connection': 'keep-alive'
    }
};

export default {
    commands: ['play', 'play2'],

    async before(ctx) {
        const { body, sender, bot, chatId } = ctx;
        if (!body) return;
        const text = body.toLowerCase().trim();
        const validOptions = ['🎶', 'audio', '📽', 'video'];
        if (!validOptions.includes(text)) return;
        const userData = tempStorage[sender];
        if (!userData || !userData.url) return;

        delete tempStorage[sender];
        const isAudio = text === '🎶' || text === 'audio';
        
        try {
            let mediaUrl;
            if (isAudio) {
                mediaUrl = await getAudioUrl(userData.url);
                if (mediaUrl) {
                    await bot.sock.sendMessage(chatId, {
                        audio: { url: mediaUrl.url },
                        mimetype: 'audio/mpeg',
                        fileName: ${cleanFileName(userData.title)}.mp3
                    }, { quoted: ctx.msg });
                } else {
                    await ctx.reply('❌ No se pudo descargar el audio.');
                }
            } else {
                mediaUrl = await getVideoUrl(userData.url);
                if (mediaUrl) {
                    await bot.sock.sendMessage(chatId, {
                        video: { url: mediaUrl.url },
                        caption: ⟡ *${userData.title}*,
                        fileName: ${cleanFileName(userData.title)}.mp4
                    }, { quoted: ctx.msg });
                } else {
                    await ctx.reply('❌ No se pudo descargar el video.');
                }
            }
        } catch (error) {
            console.error('Error downloading media:', error);
            await ctx.reply('❌ Error al descargar el archivo.');
        }
    },

    async execute(ctx) {
        const { args, sender, bot, chatId } = ctx;

        if (args.length === 0) {
            return await ctx.reply('ꕤ Debes ingresar el nombre de la canción.\nEjemplo: #play Billie Eilish');
        }

        await ctx.reply('⏳ Buscando...');

        try {
            const query = args.join(' ');
            const searchResults = await yts(query);
            const video = searchResults.videos[0];

            if (!video) {
                return await ctx.reply('ꕤ No se encontraron resultados.');
            }

            if (video.seconds > 1800) {
                return await ctx.reply('❌ El video supera los 30 minutos de duración.');
            }

            tempStorage[sender] = {
                url: video.url,
                title: video.title,
                timestamp: video.timestamp,
                views: video.views,
                author: video.author.name,
                thumbnail: video.thumbnail
            };

            const text = `⌘━─━─≪ YOUTUBE ≫─━─━⌘
★ Título: ${video.title}
★ Duración: ${video.timestamp}
★ Vistas: ${formatViews(video.views)}
★ Autor: ${video.author.name}
★ Link: ${video.url}
⌘━━─≪ Kaoruko ≫─━━⌘

Responde con:
🎶 o audio para audio
📽 o video para video`;

            await bot.sock.sendMessage(chatId, {
                image: { url: video.thumbnail },
                caption: text
            }, { quoted: ctx.msg });
        } catch (error) {
            console.error('Error in play command:', error);
            await ctx.reply('ꕤ Error al buscar el video.');
        }
    }
};

async function getAudioUrl(url) {
    const apis = [
        {
            name: "Xyro", 
            call: async () => {
                const res = await axios.get(https://api.xyro.site/download/youtubemp3?url=${encodeURIComponent(url)}, axiosConfig);
                return res.data?.result?.download;
            }
        },
        {
            name: "ZenzzXD",
            call: async () => {
                const res = await axios.get(https://api.zenzxz.my.id/downloader/ytmp3?url=${encodeURIComponent(url)}, axiosConfig);
                return res.data?.data?.download_url || res.data?.data?.url;
            }
        },
        {
            name: "Yupra",
            call: async () => {
                const res = await axios.get(https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(url)}, axiosConfig);
                return res.data?.result?.link;
            }
        },
        {
            name: "Delirius",
            call: async () => {
                const res = await axios.get(https://api.delirius.store/downloader/youtube-mp3?url=${encodeURIComponent(url)}, axiosConfig);
                return res.data?.result?.url;
            }
        }
    ];

    return await fetchFastApi(apis);
}

async function getVideoUrl(url) {
    const apis = [
        {
            name: "Xyro",
            call: async () => {
                const res = await axios.get(https://api.xyro.site/download/youtubemp4?url=${encodeURIComponent(url)}&quality=360, axiosConfig);
                return res.data?.result?.download;
            }
        },
        {
            name: "ZenzzXD",
            call: async () => {
                const res = await axios.get(https://api.zenzxz.my.id/downloader/ytmp4?url=${encodeURIComponent(url)}&resolution=360p, axiosConfig);
                return res.data?.data?.download_url || res.data?.data?.url;
            }
        },
        {
            name: "Yupra",
            call: async () => {
                const res = await axios.get(https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(url)}, axiosConfig);
                return res.data?.result?.formats?.[0]?.url;
            }
        },
        {
            name: "Delirius",
            call: async () => {
                const res = await axios.get(https://api.delirius.store/downloader/youtube-mp4?url=${encodeURIComponent(url)}&quality=360, axiosConfig);
                return res.data?.result?.url;
            }
        }
    ];

    return await fetchFastApi(apis);
}

async function fetchFastApi(apis) {
    const promises = apis.map(api => 
        Promise.race([
            api.call().then(result => {
                if (result && isValidUrl(result)) {
                    return { url: result, api: api.name };
                }
                return null;
            }),
            new Promise(resolve => setTimeout(() => resolve(null), 3000))
        ])
    );

    const results = await Promise.all(promises);
    const winner = results.find(r => r !== null);
    
    if (winner) {
        console.log(✅ API exitosa: ${winner.api});
        return winner;
    }

    return null;
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function cleanFileName(name) {
    return name.replace(/[<>:"/\\|?*]/g, "").substring(0, 50);
}

function formatViews(views) {
    if (!views) return "No disponible";
    if (views >= 1e9) return (views / 1e9).toFixed(1) + "B";
    if (views >= 1e6) return (views / 1e6).toFixed(1) + "M";
    if (views >= 1e3) return (views / 1e3).toFixed(1) + "K";
    return views.toString();
}
