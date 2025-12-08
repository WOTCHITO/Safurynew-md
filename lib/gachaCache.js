// codigo creado por DeltaByte: https://tiktok.com/@drexell1_ 🗿

import fs from 'fs';
import { existsSync, readFileSync } from 'fs';

const DATA_FILE = 'data.json';
const SAVE_DELAY = 5000;
class GachaCache {
    constructor() {
        this._data = null;
        this._saveTimeout = null;
        this._dirty = false;
        this._loaded = false;
    }

    getData() {
        if (!this._loaded) {
            this._load();
        }
        return this._data;
    }

    setData(data) {
        this._data = data;
        this._dirty = true;
        this._scheduleSave();
    }

    _load() {
        try {
            if (existsSync(DATA_FILE)) {
                this._data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
            } else {
                this._data = { chats: {} };
            }
        } catch (e) {
            console.error('Error al leer data.json:', e);
            this._data = { chats: {} };
        }
        this._loaded = true;
    }

    _scheduleSave() {
        if (this._saveTimeout) return
        this._saveTimeout = setTimeout(() => {
            this._saveNow();
            this._saveTimeout = null;
        }, SAVE_DELAY);
    }

    async _saveNow() {
        if (!this._dirty) return;
        try {
            await fs.promises.writeFile(DATA_FILE, JSON.stringify(this._data, null, 2));
            this._dirty = false;
        } catch (e) { console.error('Error al guardar data.json:', e) }
    }

    saveSync() {
        if (!this._dirty) return
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(this._data, null, 2));
            this._dirty = false;
        } catch (e) { console.error('Error al guardar data.json:', e) }
    }

    async save() {
        if (this._saveTimeout) {
            clearTimeout(this._saveTimeout);
            this._saveTimeout = null
        }
        await this._saveNow();
    }
}

const gachaCache = new GachaCache();
export const obtenerDatos = () => gachaCache.getData();
export const guardarDatos = (data) => gachaCache.setData(data);
export const forzarGuardado = () => gachaCache.save();
export const forzarGuardadoSync = () => gachaCache.saveSync();
export default gachaCache;
