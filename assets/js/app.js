// Inicialização da app e registo do Service Worker
import { initInstallPrompt } from './modules/UI.js';
import { openDB } from './db.js';

// O sw.js está na raiz da app, por isso o caminho é relativo a este módulo.
const SW_URL = new URL('../../sw.js', import.meta.url);

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register(SW_URL, { scope: './' });
    console.log('[Agro App] Service Worker registado:', registration.scope);
  } catch (error) {
    console.error('[Agro App] Falha ao registar o Service Worker:', error);
  }
}

async function init() {
  await registerServiceWorker();
  initInstallPrompt();
  try {
    await openDB();
  } catch (error) {
    console.warn('[Agro App] IndexedDB indisponível:', error);
  }
}

init();
