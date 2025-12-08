/*
 * Plugin de Rollwaifu/Gacha
 * Reescrito para usar sistema de caché en memoria
 * @David-Chian - https://github.com/David-Chian
 */

import { v4 as uuidv4 } from 'uuid';
import { readFileSync, existsSync } from 'fs';
import { obtenerDatos, guardarDatos } from '../lib/gachaCache.js';

const CHARACTERS_FILE = './lib/characters.json';
const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutos
const completadoImage = 'https://qu.ax/Qyawv.jpg';

// Cache de personajes en memoria
let charactersCache = null;

/**
 * Obtiene los personajes desde el archivo (con caché)
 */
const obtenerPersonajes = () => {
    if (charactersCache) return charactersCache;

    try {
        if (existsSync(CHARACTERS_FILE)) {
            charactersCache = JSON.parse(readFileSync(CHARACTERS_FILE, 'utf-8'));
            return charactersCache;
        }
    } catch (e) {
        console.error('Error al leer characters.json:', e);
    }
    return [];
};

/**
 * Verifica que sea MeguminBot
 */
const isMeguminBotMD = () => {
    try {
        const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
        if (pkg.name !== 'Megumin-Bot-MD') return false;
        if (pkg.repository?.url !== 'git+https://github.com/David-Chian/Megumin-Bot-MD.git') return false;
        return true;
    } catch (e) {
        console.error('Error al leer package.json:', e);
        return false;
    }
};

// Cooldowns por usuario (en memoria)
let cooldowns = {};

let handler = async (m, { conn }) => {
    try {
        // Verificar si es MeguminBot
        if (!isMeguminBotMD()) {
            await conn.reply(m.chat, '𝑬𝒔𝒕𝒆 𝒄𝒐𝒎𝒂𝒏𝒅𝒐 𝒔𝒐𝒍𝒐 𝒆𝒔𝒕𝒂 𝒅𝒊𝒔𝒑𝒐𝒏𝒊𝒃𝒍𝒆 𝒑𝒂𝒓𝒂 𝑴𝒆𝒈𝒖𝒎𝒊𝒏-𝑩𝒐𝒕-𝑴𝑫.\n 🔥 https://github.com/David-Chian/Megumin-Bot-MD', m, rcanal);
            return;
        }

        const datos = obtenerDatos();
        const chatId = m.chat;
        const senderId = m.sender;
        const ahora = Date.now();

        // Verificar cooldown
        const ultimoUso = cooldowns[senderId] || 0;
        const tiempoRestante = ahora - ultimoUso;

        if (tiempoRestante < COOLDOWN_MS) {
            const restante = COOLDOWN_MS - tiempoRestante;
            const minutos = Math.floor(restante / (1000 * 60));
            const segundos = Math.floor((restante % (1000 * 60)) / 1000);

            await conn.sendMessage(m.chat, {
                text: `¡𝐸𝑠𝑝𝑒𝑟𝑎 𝑢𝑛 𝑝𝑜𝑐𝑜 𝑚𝑎𝑠 𝑝𝑎𝑟𝑎 𝑝𝑜𝑑𝑒𝑟 𝑢𝑠𝑎𝑟 𝑒𝑠𝑡𝑒 𝑐𝑜𝑚𝑎𝑛𝑑𝑜!\n\n*𝑻𝒊𝒆𝒎𝒑𝒐 𝒓𝒆𝒔𝒕𝒂𝒏𝒕𝒆 ${minutos} 𝑴𝒊𝒏𝒖𝒕𝒐𝒔 𝒚 ${segundos} 𝑺𝒆𝒈𝒖𝒏𝒅𝒐𝒔.*`
            });
            return;
        }

        // Inicializar chat si no existe
        if (!datos.chats[chatId]) {
            datos.chats[chatId] = {
                usuarios: {},
                personajesReservados: []
            };
        }

        // Función para reservar personaje
        const reservarPersonaje = (chatId, userId, personaje) => {
            const data = obtenerDatos();
            if (!data.chats[chatId]) {
                data.chats[chatId] = { usuarios: {}, personajesReservados: [] };
            }
            data.chats[chatId].personajesReservados.push({
                userId: userId,
                ...personaje
            });
            guardarDatos(data);
        };

        // Obtener personajes disponibles (no reclamados ni reservados)
        const obtenerDisponibles = (chatId) => {
            const personajes = obtenerPersonajes();
            const chatData = datos.chats[chatId];

            return personajes.filter(p => {
                // Verificar si ya está reservado
                const estaReservado = chatData?.personajesReservados?.some(r => r.url === p.url);

                // Verificar si ya está en inventario de alguien
                const estaEnInventario = Object.values(chatData?.usuarios || {}).some(
                    u => u.characters?.some(c => c.url === p.url)
                );

                return !estaReservado && !estaEnInventario;
            });
        };

        // Obtener personajes disponibles
        const disponibles = obtenerDisponibles(chatId);

        if (disponibles.length === 0) {
            await conn.sendMessage(m.chat, {
                image: { url: completadoImage },
                caption: '𝑭𝒆𝒍𝒊𝒄𝒊𝒅𝒂𝒅𝒆𝒔, 𝒕𝒐𝒅𝒐𝒔 𝒍𝒐𝒔 𝒑𝒆𝒓𝒔𝒐𝒏𝒂𝒋𝒆𝒔 𝒉𝒂𝒏 𝒔𝒊𝒅𝒐 𝒐𝒃𝒕𝒆𝒏𝒊𝒅𝒐𝒔. ¡𝑷𝒓𝒐𝒏𝒕𝒐 𝒉𝒂𝒃𝒓𝒂 𝒎𝒂𝒔 𝒘𝒂𝒊𝒇𝒖𝒔 𝒑𝒂𝒓𝒂 𝒓𝒆𝒄𝒐𝒍𝒆𝒄𝒕𝒂𝒓!'
            });
            return;
        }

        // Seleccionar personaje aleatorio
        const personajeRandom = disponibles[Math.floor(Math.random() * disponibles.length)];
        const idPersonaje = uuidv4();

        // Verificar estado del personaje
        const chatData = datos.chats[chatId];
        const reservadoPor = chatData?.personajesReservados?.find(r => r.url === personajeRandom.url);
        const ocupadoPor = Object.entries(chatData?.usuarios || {}).find(
            ([_, u]) => u.characters?.some(c => c.url === personajeRandom.url)
        );

        let estado;
        if (ocupadoPor) {
            estado = 'Ocupado por ' + ocupadoPor[1].name;
        } else if (reservadoPor) {
            estado = 'Reservado por ' + reservadoPor.userId;
        } else {
            estado = 'Libre';
        }

        // Crear mensaje
        const caption = `
●  _*ᑎOᗰᗷᖇE:*_
⋗ *${personajeRandom.name}!*
✦ _*ᐯᗩᒪOᖇ:*_
⋗ *${personajeRandom.value}* _*ᗯᖴcoins*_!
★ _*ESTᗩᗪO*_
⋗ *Estado: ${estado}*

> ✷    𝙄𝙙𝙚𝙣𝙩𝙞𝙛𝙞𝙘𝙖𝙙𝙤𝙧
<id:${idPersonaje}>`;

        // Enviar imagen del personaje
        await conn.sendMessage(m.chat, {
            image: { url: personajeRandom.url },
            caption: caption,
            mimetype: 'image/jpeg',
            mentionedJid: ocupadoPor ? [ocupadoPor[1]] : []
        }, { quoted: m });

        // Reservar personaje si no está ocupado
        if (!ocupadoPor) {
            reservarPersonaje(chatId, senderId, {
                ...personajeRandom,
                id: idPersonaje
            });
        }

        // Actualizar cooldown
        cooldowns[senderId] = ahora;

    } catch (e) {
        console.error('Error en el handler de rollwaifu:', e);
        await conn.sendMessage(m.chat, {
            text: '𝑶𝒄𝒖𝒓𝒓𝒊𝒐 𝒖𝒏 𝒆𝒓𝒓𝒐𝒓 𝒂𝒍 𝒑𝒓𝒐𝒄𝒆𝒔𝒂𝒓 𝒕𝒖 𝒔𝒐𝒍𝒊𝒄𝒊𝒕𝒖𝒅. 𝑰𝒏𝒕𝒆𝒏𝒕𝒂 𝒅𝒆 𝒏𝒖𝒆𝒗𝒐 𝒎𝒂𝒔 𝒕𝒂𝒓𝒅𝒆. ' + e
        });
    }
};

handler.help = ['roll'];
handler.tags = ['rollwaifu'];
handler.command = ['roll', 'rw'];
handler.register = true;

export default handler;
