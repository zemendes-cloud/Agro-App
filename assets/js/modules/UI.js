// Manipulação do DOM

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/** Gere o botão "Instalar App" e o diálogo de confirmação da PWA. */
export function initInstallPrompt() {
  const installButton = $('#installAppButton');
  const dialog = $('#installDialog');
  const cancelButton = $('#cancelInstallButton');
  const confirmButton = $('#confirmInstallButton');
  if (!installButton || !dialog) return;

  let deferredPrompt = null;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  if (isStandalone) {
    installButton.classList.add('hidden');
    return;
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installButton.classList.add('hidden');
  });

  installButton.addEventListener('click', () => {
    const message = $('#installDialogMessage');
    if (!deferredPrompt && message) {
      message.textContent =
        'No seu navegador, use o menu e escolha "Adicionar ao ecrã inicial" ou "Instalar aplicação".';
    }
    dialog.showModal();
  });

  cancelButton?.addEventListener('click', () => dialog.close());

  confirmButton?.addEventListener('click', async () => {
    dialog.close();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
}
