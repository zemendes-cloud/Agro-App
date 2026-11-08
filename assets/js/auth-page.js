const authForms = document.querySelectorAll('[data-auth-form]');
const localAuth = window.LocalAuth;
const initialization = localAuth
  ? localAuth.initializeLocalAccounts()
  : Promise.reject(new Error('O módulo de autenticação local não foi carregado.'));
let initializationError = null;

initialization.catch((error) => {
  initializationError = error;
  console.error('[Agro App] Não foi possível inicializar as contas locais:', error);
});

for (const toggle of document.querySelectorAll('[data-toggle-password]')) {
  toggle.addEventListener('click', () => {
    const input = document.getElementById(toggle.dataset.togglePassword);
    if (!(input instanceof HTMLInputElement)) return;

    const showPassword = input.type === 'password';
    input.type = showPassword ? 'text' : 'password';
    toggle.textContent = showPassword ? 'Ocultar' : 'Mostrar';
    toggle.setAttribute('aria-label', `${showPassword ? 'Ocultar' : 'Mostrar'} palavra-passe`);
  });
}

for (const form of authForms) {
  const password = form.querySelector('input[name="password"]');
  const confirmation = form.querySelector('input[name="confirmPassword"]');
  const message = form.querySelector('[data-form-message]');
  const submitButton = form.querySelector('button[type="submit"]');

  if (password && confirmation) {
    const validatePasswordMatch = () => {
      confirmation.setCustomValidity(
        confirmation.value && confirmation.value !== password.value
          ? 'As palavras-passe não coincidem.'
          : '',
      );
    };

    password.addEventListener('input', validatePasswordMatch);
    confirmation.addEventListener('input', validatePasswordMatch);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!message) return;

    message.textContent = '';
    message.hidden = true;
    message.classList.remove('auth-message-error', 'auth-message-success');

    try {
      await initialization;
      if (initializationError) throw initializationError;

      if (!localAuth) {
        throw new Error('O módulo de autenticação local não foi carregado.');
      }

      if (submitButton) submitButton.disabled = true;

      if (form.dataset.authForm === 'register') {
        await localAuth.createUserAccount({
          name: form.elements.namedItem('name').value,
          email: form.elements.namedItem('email').value,
          password: password.value,
        });

        message.textContent = 'Conta criada com sucesso. A encaminhar para o login...';
        message.classList.add('auth-message-success');
        message.hidden = false;
        form.reset();
        window.setTimeout(() => {
          window.location.href = 'login.html';
        }, 1200);
        return;
      }

      await localAuth.signIn(
        form.elements.namedItem('email').value,
        password.value,
      );
      window.location.href = 'dashboard.html';
    } catch (error) {
      console.error('[Agro App] Falha na autenticação:', error);
      message.textContent = error instanceof Error
        ? error.message
        : 'Não foi possível concluir a autenticação neste dispositivo.';
      message.classList.add('auth-message-error');
      message.hidden = false;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
