(() => {
  let deferredInstallPrompt;
  const installButton = document.getElementById("installAppButton");
  const installDialog = document.getElementById("installDialog");
  const installMessage = document.getElementById("installDialogMessage");
  const confirmInstallButton = document.getElementById("confirmInstallButton");
  const cancelInstallButton = document.getElementById("cancelInstallButton");

  if (installButton && installDialog && installMessage && confirmInstallButton && cancelInstallButton) {
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true;

    if (isInstalled) {
      installButton.disabled = true;
      installButton.textContent = "APP instalada";
      installButton.setAttribute("aria-label", "A app já está instalada neste dispositivo");
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      installButton.disabled = true;
      installButton.textContent = "APP instalada";
      installButton.setAttribute("aria-label", "A app já está instalada neste dispositivo");
      installDialog.close();
    });

    installButton.addEventListener("click", () => {
      if (isInstalled) return;

      installMessage.textContent = "Queres instalar a Agro App e adicioná-la ao ecrã inicial do teu telemóvel?";
      confirmInstallButton.hidden = false;
      cancelInstallButton.textContent = "Agora não";
      installDialog.showModal();
    });

    cancelInstallButton.addEventListener("click", () => {
      installDialog.close();
    });

    confirmInstallButton.addEventListener("click", async () => {
      if (/samsungbrowser/i.test(window.navigator.userAgent)) {
        installMessage.textContent = "Para instalar a Agro App como aplicação e abri-la fora do navegador, abre este site no Google Chrome atualizado e escolhe «Instalar app» no menu ⋮.";
        confirmInstallButton.hidden = true;
        cancelInstallButton.textContent = "Fechar";
        return;
      }

      if (!deferredInstallPrompt) {
        const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
        installMessage.textContent = isIOS
          ? "No iPhone ou iPad, abre esta página no Safari, toca em Partilhar e escolhe «Adicionar ao ecrã principal». Depois confirma em «Adicionar»."
          : "Se a instalação não abrir automaticamente, abre o menu do navegador e escolhe «Instalar app» ou «Adicionar ao ecrã inicial».";
        confirmInstallButton.hidden = true;
        cancelInstallButton.textContent = "Fechar";
        return;
      }

      const installPrompt = deferredInstallPrompt;
      deferredInstallPrompt = null;
      installDialog.close();
      try {
        await installPrompt.prompt();
        await installPrompt.userChoice;
      } catch (error) {
        console.error("Unable to show the app installation prompt:", error);
        installMessage.textContent = "Não foi possível abrir a instalação. Tenta novamente ou usa o menu do navegador para adicionar a app ao ecrã inicial.";
        confirmInstallButton.hidden = true;
        cancelInstallButton.textContent = "Fechar";
        installDialog.showModal();
      }
    });
  }

  if (!("serviceWorker" in navigator)) return;

  const scriptUrl = document.currentScript.src;
  const serviceWorkerUrl = new URL("../../sw.js", scriptUrl);
  const scope = new URL("../../", scriptUrl).pathname;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(serviceWorkerUrl, { scope }).catch((error) => {
      console.error("Unable to register the service worker:", error);
    });
  });
})();
