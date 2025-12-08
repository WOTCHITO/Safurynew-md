/*
 * Plugin para Confirmar/Reclamar personajes del Gacha
 * Reescrito para usar sistema de caché en memoria
 * @David-Chian - https://github.com/David-Chian
 */

import { readFileSync } from 'fs';
import { obtenerDatos, guardarDatos } from '../lib/gachaCache.js';

const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutos

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

// Cooldowns
let cooldowns = {};

let handler = async (m, { conn }) => {
    // Solo funciona si es respuesta a un mensaje
    if (!m.quoted) return;

    if (!isMeguminBotMD()) {
        await conn.reply(m.chat, '𝑬𝒔𝒕𝒆 𝒄𝒐𝒎𝒂𝒏𝒅𝒐 𝒔𝒐𝒍𝒐 𝒆𝒔𝒕𝒂 𝒅𝒊𝒔𝒑𝒐𝒏𝒊𝒃𝒍𝒆 𝒑𝒂𝒓𝒂 `𝑴𝒆𝒈𝒖𝒎𝒊𝒏-𝑩𝒐𝒕-𝑴𝑫`.\n 🔥 https://github.com/David-Chian/Megumin-Bot-MD', m, rcanal);
        return;
    }

    const chatId = m.chat;
    const senderId = m.sender;
    const senderName = await conn.getName(senderId);

    // Extraer ID del personaje del mensaje citado
    const idMatch = m.quoted.text?.match(/<id:(.*)>/);
    const personajeId = idMatch?.[1];

    if (!personajeId) return;

    const datos = obtenerDatos();

    // Inicializar chat si no existe
    if (!datos.chats[chatId]) {
        datos.chats[chatId] = { usuarios: {}, personajesReservados: [] };
    }

    const chatData = datos.chats[chatId];

    // Buscar el personaje reservado
    const personaje = chatData.personajesReservados?.find(p => p.id === personajeId);

    // Verificar cooldown
    const ahora = Date.now();
    const ultimoUso = cooldowns[senderId] || 0;

    if (ahora - ultimoUso < COOLDOWN_MS) {
        const restante = COOLDOWN_MS - (ahora - ultimoUso);
        const minutos = Math.floor(restante / 60000);
        const segundos = Math.floor((restante % 60000) / 1000);

        await conn.reply(m.chat, `𝐷𝑒𝑏𝑒𝑠 𝑒𝑠𝑝𝑒𝑟𝑎𝑟 𝑎𝑛𝑡𝑒𝑠 𝑑𝑒 𝑖𝑛𝑡𝑒𝑛𝑡𝑎𝑟 𝑛𝑢𝑒𝑣𝑎𝑚𝑒𝑛𝑡𝑒.\n𝑻𝒊𝒆𝒎𝒑𝒐 𝒓𝒆𝒔𝒕𝒂𝒏𝒕𝒆: ${minutos} 𝒎𝒊𝒏𝒖𝒕𝒐𝒔 𝒚 ${segundos} 𝒔𝒆𝒈𝒖𝒏𝒅𝒐𝒔.`, m, rcanal);
        return;
    }

    if (!personaje) {
        conn.reply(m.chat, '¡𝑳𝒐 𝒔𝒊𝒆𝒏𝒕𝒐, 𝒆𝒔𝒕𝒆 𝒑𝒆𝒓𝒔𝒐𝒏𝒂𝒋𝒆 𝒏𝒐 𝒆𝒔𝒕𝒂 𝒅𝒊𝒔𝒑𝒐𝒏𝒊𝒃𝒍𝒆 𝒆𝒏 𝒆𝒔𝒕𝒆 𝒎𝒐𝒎𝒆𝒏𝒕𝒐!', m, rcanal, { mentions: [senderId] });
        return;
    }

    // Verificar si ya está en el inventario de alguien
    const yaReclamado = chatData.usuarios[personaje.userId]?.characters?.some(c => c.url === personaje.url);

    if (yaReclamado) {
        conn.reply(m.chat, `¡𝑬𝒍 𝒑𝒆𝒓𝒔𝒐𝒏𝒂𝒋𝒆 ${personaje.name} 𝒚𝒂 𝒆𝒔 𝒅𝒆 𝒐𝒕𝒓𝒐 𝒖𝒔𝒖𝒂𝒓𝒊𝒐 𝒚 𝒏𝒐 𝒑𝒖𝒆𝒅𝒆𝒔 𝒓𝒐𝒃𝒂𝒓𝒍𝒐!\n𝑷𝒓𝒖𝒆𝒃𝒂 𝒔𝒖𝒆𝒓𝒕𝒆 𝒄𝒐𝒏 𝒆𝒍 𝒄𝒐𝒎𝒂𝒏𝒅𝒐 !𝒓𝒐𝒃𝒂𝒓𝒑`, m, rcanal, { mentions: [senderId] });
        cooldowns[senderId] = ahora;
        return;
    }

    // Si el personaje fue reservado por otro usuario, intentar robarlo (50% probabilidad)
    if (personaje.userId !== senderId) {
        const exito = Math.random() < 0.5;

        if (exito) {
            // Inicializar usuario si no existe
            if (!chatData.usuarios[senderId]) {
                chatData.usuarios[senderId] = { characters: [], characterCount: 0, totalRwcoins: 0 };
            }

            // Agregar al inventario del ladrón
            chatData.usuarios[senderId].characters.push({
                name: personaje.name,
                url: personaje.url,
                value: personaje.value
            });

            // Remover de reservados del dueño original
            if (chatData.usuarios[personaje.userId]) {
                chatData.usuarios[personaje.userId].characters =
                    chatData.usuarios[personaje.userId].characters?.filter(c => c.url !== personaje.url) || [];
            }

            // Remover de personajes reservados
            chatData.personajesReservados = chatData.personajesReservados.filter(p => p.id !== personajeId);

            guardarDatos(datos);

            const victimName = await conn.getName(personaje.userId);
            await conn.reply(m.chat, `¡𝑭𝒆𝒍𝒊𝒄𝒊𝒅𝒂𝒅𝒆𝒔 @${senderId.split('@')[0]}, 𝒉𝒂𝒔 𝒓𝒐𝒃𝒂𝒅𝒐 𝒂 ${personaje.name} 𝒅𝒆 @${personaje.userId.split('@')[0]}!`, m, { mentions: [senderId, personaje.userId] });
        } else {
            const victimName = await conn.getName(personaje.userId);
            await conn.reply(m.chat, `¡𝑵𝒐 𝒉𝒂𝒔 𝒑𝒐𝒅𝒊𝒅𝒐 𝒓𝒐𝒃𝒂𝒓 𝒆𝒍 𝒑𝒆𝒓𝒔𝒐𝒏𝒂𝒋𝒆 ${personaje.name} 𝒅𝒆 @${personaje.userId.split('@')[0]}!`, m, { mentions: [senderId, personaje.userId] });
        }

        cooldowns[senderId] = ahora;
        return;
    }

    // El personaje es del mismo usuario - reclamarlo
    if (!chatData.usuarios[senderId]) {
        chatData.usuarios[senderId] = { characters: [], characterCount: 0, totalRwcoins: 0 };
    }

    const usuario = chatData.usuarios[senderId];

    // Verificar si ya lo tiene
    const yaLoTiene = usuario.characters?.some(c => c.url === personaje.url);

    if (yaLoTiene) {
        conn.reply(m.chat, `¡𝒀𝒂 𝒕𝒊𝒆𝒏𝒆𝒔 𝒆𝒍 𝒑𝒆𝒓𝒔𝒐𝒏𝒂𝒋𝒆 ${personaje.name}!`, m, rcanal, { mentions: [senderId] });
        return;
    }

    // Agregar personaje al inventario
    usuario.characters.push({
        name: personaje.name,
        url: personaje.url,
        value: personaje.value
    });
    usuario.characterCount++;
    usuario.totalRwcoins += personaje.value;

    // Actualizar datos
    chatData.usuarios[senderId] = usuario;

    // Remover de reservados
    chatData.personajesReservados = chatData.personajesReservados.filter(p => p.id !== personajeId);

    guardarDatos(datos);

    conn.reply(m.chat, `¡𝑭𝒆𝒍𝒊𝒄𝒊𝒅𝒂𝒅𝒆𝒔 @${senderId.split('@')[0]}, 𝒐𝒃𝒕𝒖𝒗𝒊𝒔𝒕𝒆 𝒂 ${personaje.name}!`, m, { mentions: [senderId] });
    cooldowns[senderId] = ahora;
};

handler.help = ['confirmar'];
handler.tags = ['rollwaifu'];
handler.command = ['c', 'confirmar'];
handler.register = true;

export default handler;
