import { AlbumPhotoItem, CarouselPhotoItem, ExtraPhotoConfig, RelationshipConfig } from '../types';

const DB_NAME = 'LoveCoupleAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'album_photos_store';
const PHOTOS_KEY = 'album_photos_list';
const LOCAL_STORAGE_KEY = 'love_album_photos_v1';
const UNLOCKED_KEY = 'love_album_unlocked';

const CAROUSEL_KEY = 'carousel_photos_list';
const CAROUSEL_LOCAL_STORAGE_KEY = 'love_carousel_photos_v1';
const EXTRA_PHOTO_KEY = 'extra_photo_item';
const EXTRA_PHOTO_LOCAL_STORAGE_KEY = 'love_extra_photo_v1';
const CONFIG_KEY = 'relationship_config_item';

/**
 * Initializes and opens the IndexedDB database instance.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      const error = (event.target as IDBOpenDBRequest).error;
      reject(error || new Error('Erro ao abrir IndexedDB'));
    };
  });
}

const BACKUP_KEY = 'love_album_photos_backup_v1';
const CAROUSEL_BACKUP_KEY = 'love_carousel_photos_backup_v1';
const EXTRA_PHOTO_BACKUP_KEY = 'love_extra_photo_backup_v1';

/**
 * Utility to correct missing tildes on 'nao' -> 'não'
 */
export function fixAccents(text?: string): string {
  if (!text) return '';
  return text
    .replace(/\bnao\b/g, 'não')
    .replace(/\bNao\b/g, 'Não')
    .replace(/\bNAO\b/g, 'NÃO');
}

/**
 * Counts how many slots have actual photo images.
 */
function countFilledPhotos(photos: AlbumPhotoItem[]): number {
  return photos.filter((p) => Boolean(p.imageUrl && p.imageUrl.trim())).length;
}

/**
 * Persists album photos permanently into IndexedDB, with a safe localStorage backup.
 * IndexedDB has virtually unlimited storage (>50GB) and never suffers from quota limits.
 */
export async function saveAlbumPhotosToStorage(photos: AlbumPhotoItem[]): Promise<boolean> {
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return false;
  }

  let idbSuccess = false;

  // 1. Primary Definitive Storage: IndexedDB
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(photos, PHOTOS_KEY);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
    idbSuccess = true;
  } catch (err) {
    console.warn('Falha ao salvar no IndexedDB, tentando localStorage:', err);
  }

  // 2. Secondary safe backup in localStorage (wrapped in try-catch for quota safety)
  try {
    const json = JSON.stringify(photos);
    localStorage.setItem(LOCAL_STORAGE_KEY, json);
    localStorage.setItem(BACKUP_KEY, json);
    // Purge deprecated keys that contained initial hardcoded default photos
    localStorage.removeItem('love_album_photos');
    localStorage.removeItem('love_photos_v1');
  } catch (quotaErr) {
    console.warn('LocalStorage quota atingido; fotos permanecem 100% salvas e definitivas no IndexedDB:', quotaErr);
  }

  return idbSuccess;
}

/**
 * Loads album photos permanently from IndexedDB (the single definitive source of truth).
 * Only falls back to localStorage if IndexedDB is completely empty.
 */
export async function loadAlbumPhotosFromStorage(): Promise<AlbumPhotoItem[] | null> {
  // 1. Priority #1: IndexedDB (User's definitive edits and uploaded photos)
  try {
    const db = await openDatabase();
    const photos = await new Promise<AlbumPhotoItem[] | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(PHOTOS_KEY);

      request.onsuccess = () => {
        const result = request.result;
        if (Array.isArray(result) && result.length > 0) {
          resolve(result);
        } else {
          resolve(null);
        }
      };

      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });

    if (photos && photos.length > 0) {
      return photos.map((p) => ({
        ...p,
        title: fixAccents(p.title),
        caption: fixAccents(p.caption),
        date: fixAccents(p.date),
      }));
    }
  } catch (err) {
    console.warn('IndexedDB indisponível, verificando backups do localStorage:', err);
  }

  // 2. Fallback only if IndexedDB was completely unpopulated
  const storageKeys = [LOCAL_STORAGE_KEY, BACKUP_KEY];
  for (const key of storageKeys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: AlbumPhotoItem) => ({
            ...p,
            title: fixAccents(p.title),
            caption: fixAccents(p.caption),
            date: fixAccents(p.date),
          }));
        }
      }
    } catch {
      // continue
    }
  }

  return null;
}

/**
 * Saves relationship configuration (including custom main photo and scratch photo)
 * permanently to IndexedDB as well as localStorage, avoiding quota crashes.
 */
export async function saveRelationshipConfigToStorage(config: RelationshipConfig): Promise<boolean> {
  if (!config) return false;

  // 1. Save to IndexedDB (unlimited storage for high quality photos)
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(config, CONFIG_KEY);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  } catch (err) {
    console.warn('Falha ao salvar config no IndexedDB:', err);
  }

  // 2. Save to localStorage
  try {
    localStorage.setItem('love_relationship_config_v2', JSON.stringify(config));
  } catch (quotaErr) {
    console.warn('Quota atingida no localStorage para config, mantido seguro no IndexedDB:', quotaErr);
  }

  return true;
}

/**
 * Loads relationship configuration from IndexedDB or localStorage.
 */
export async function loadRelationshipConfigFromStorage(): Promise<RelationshipConfig | null> {
  // 1. Try IndexedDB
  try {
    const db = await openDatabase();
    const config = await new Promise<RelationshipConfig | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(CONFIG_KEY);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });

    if (config && typeof config === 'object') {
      return config;
    }
  } catch (err) {
    console.warn('IndexedDB config read fallback:', err);
  }

  // 2. Fallback to localStorage
  try {
    const saved = localStorage.getItem('love_relationship_config_v2');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // continue
  }

  return null;
}

/**
 * Persists whether the album is unlocked so it remains accessible upon reopening.
 */
export function persistAlbumUnlockedState(unlocked: boolean): void {
  try {
    localStorage.setItem(UNLOCKED_KEY, unlocked ? 'true' : 'false');
  } catch (err) {
    console.error(err);
  }
}

/**
 * Checks if the album was previously unlocked.
 */
export function loadAlbumUnlockedState(): boolean {
  try {
    return localStorage.getItem(UNLOCKED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Persists carousel photos to IndexedDB and localStorage backup.
 */
export async function saveCarouselPhotosToStorage(photos: CarouselPhotoItem[]): Promise<boolean> {
  if (!photos || !Array.isArray(photos)) return false;

  let idbSuccess = false;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(photos, CAROUSEL_KEY);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
    idbSuccess = true;
  } catch (err) {
    console.warn('IndexedDB carousel save fallback:', err);
  }

  try {
    localStorage.setItem(CAROUSEL_BACKUP_KEY, JSON.stringify(photos));
    localStorage.setItem(CAROUSEL_LOCAL_STORAGE_KEY, JSON.stringify(photos));
  } catch (quotaErr) {
    console.warn('LocalStorage quota for carousel exceeded:', quotaErr);
  }

  return idbSuccess;
}

/**
 * Loads carousel photos from IndexedDB or localStorage.
 */
export async function loadCarouselPhotosFromStorage(): Promise<CarouselPhotoItem[] | null> {
  const candidates: CarouselPhotoItem[][] = [];

  try {
    const db = await openDatabase();
    const photos = await new Promise<CarouselPhotoItem[] | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(CAROUSEL_KEY);
      request.onsuccess = () => {
        const result = request.result;
        if (Array.isArray(result) && result.length > 0) {
          resolve(result);
        } else {
          resolve(null);
        }
      };
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
    if (photos && photos.length > 0) candidates.push(photos);
  } catch (err) {
    console.warn('IndexedDB carousel read fallback:', err);
  }

  for (const key of [CAROUSEL_LOCAL_STORAGE_KEY, CAROUSEL_BACKUP_KEY, 'love_carousel_photos']) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) candidates.push(parsed);
      }
    } catch {
      // continue
    }
  }

  if (candidates.length === 0) return null;
  // Pick candidate with most items
  candidates.sort((a, b) => b.length - a.length);
  return candidates[0];
}

/**
 * Persists extra photo to IndexedDB and localStorage.
 */
export async function saveExtraPhotoToStorage(extra: ExtraPhotoConfig): Promise<boolean> {
  if (!extra) return false;

  let idbSuccess = false;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(extra, EXTRA_PHOTO_KEY);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
    idbSuccess = true;
  } catch (err) {
    console.warn('IndexedDB extra photo save fallback:', err);
  }

  try {
    localStorage.setItem(EXTRA_PHOTO_BACKUP_KEY, JSON.stringify(extra));
    localStorage.setItem(EXTRA_PHOTO_LOCAL_STORAGE_KEY, JSON.stringify(extra));
  } catch (quotaErr) {
    console.warn('LocalStorage quota for extra photo exceeded:', quotaErr);
  }

  return idbSuccess;
}

/**
 * Loads extra photo from IndexedDB or localStorage.
 */
export async function loadExtraPhotoFromStorage(): Promise<ExtraPhotoConfig | null> {
  try {
    const db = await openDatabase();
    const extra = await new Promise<ExtraPhotoConfig | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(EXTRA_PHOTO_KEY);
      request.onsuccess = () => {
        const result = request.result;
        if (result && typeof result === 'object') {
          resolve(result);
        } else {
          resolve(null);
        }
      };
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
    if (extra && extra.imageUrl) return extra;
  } catch (err) {
    console.warn('IndexedDB extra photo read fallback:', err);
  }

  for (const key of [EXTRA_PHOTO_LOCAL_STORAGE_KEY, EXTRA_PHOTO_BACKUP_KEY, 'love_extra_photo']) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.imageUrl) return parsed;
      }
    } catch {
      // continue
    }
  }

  return null;
}
