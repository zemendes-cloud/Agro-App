// Configuração do IndexedDB
const DB_NAME = 'agro-app-db';
const DB_VERSION = 1;

export const STORES = {
  plants: 'plants',
  tasks: 'tasks',
};

let dbPromise = null;

export function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.plants)) {
        db.createObjectStore(STORES.plants, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORES.tasks)) {
        const tasks = db.createObjectStore(STORES.tasks, { keyPath: 'id', autoIncrement: true });
        tasks.createIndex('date', 'date', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function run(storeName, mode, action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const request = action(tx.objectStore(storeName));
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
  });
}

export const add = (store, item) => run(store, 'readwrite', (s) => s.add(item));
export const put = (store, item) => run(store, 'readwrite', (s) => s.put(item));
export const remove = (store, id) => run(store, 'readwrite', (s) => s.delete(id));
export const get = (store, id) => run(store, 'readonly', (s) => s.get(id));
export const getAll = (store) => run(store, 'readonly', (s) => s.getAll());
