# Guião de desenvolvimento: Agro App

Última atualização: 7 de novembro de 2026.

## 1. Onde ficámos

**Feito**
- Estrutura `Agro-app/` criada (index, manifest, sw, assets, pages).
- Projeto Firebase **`agro-app-cde1c`** criado, app web registada, Firestore criado (`(default)`, edição Standard, modo de produção).
- `assets/js/modules/firebase-config.js` ligado ao projeto novo (Firestore com cache offline + Auth).
- Lista das 11 plantas da avó em `plants-seed.json` (e `plantas-avo.xlsx/.csv`, enviados na conversa).
- `seed.html`: página que grava as plantas no Firestore (corre-se uma vez).
- `firestore.rules`: regras com dois papéis (`user` e `admin`) e catálogo partilhado.

**Ainda NÃO feito**
- Authentication (E-mail/senha) ativado na consola.
- Regras publicadas na consola.
- Nenhuma planta carregada; a app ainda **não lê** do Firebase (continua com `localStorage` na versão antiga).
- Login, registo, perfil, calendário e página de administração ligados ao Firebase.
- Ícones `icon-192x192.png` e `icon-512x512.png` copiados para `Agro-app/assets/images/icons/`.
- Migração do resto da versão antiga (ver o prompt do agente).

**Pontos de atenção**
- O ficheiro duplicado `assets/js/modules/firebase_configuration.js` foi removido; a app usa `assets/js/modules/firebase-config.js`.
- O OneDrive alterou alguns ficheiros de `Agro-app` depois de eu os criar (`index.html`, `styles.css`). Verificar quais as versões que queres manter.
- Nunca deixar as regras temporárias ligadas depois de carregar as plantas.

## 2. Decisões em aberto (responder primeiro)

1. **Plantas da avó:** (A) catálogo partilhado em `catalog/`, visível a todos, **recomendado**; ou (B) exemplos copiados para o jardim de cada utilizador novo.
2. **O que faz cada papel:**
   - Utilizador: o seu jardim, calendário de rega, perfil, consultar o catálogo.
   - Administrador: tudo isso, mais gerir utilizadores e editar o catálogo.
   - Confirmar ou ajustar.

## 3. Estrutura de dados

```
Authentication: contas (email + palavra-passe, geridas pelo Firebase)

Firestore
  users/{uid}              perfil: name, email, role ("user" | "admin"), createdAt
  users/{uid}/plants/{id}  plantas do utilizador
  users/{uid}/tasks/{id}   tarefas de rega e cuidados
  catalog/{id}             herbanário partilhado (só o admin escreve)
```

As palavras-passe **nunca** vão para o Firestore.

## 4. Passos por ordem

### Passo 1: Consola do Firebase
- [ ] **Authentication** (menu Segurança) > Começar > Método de login > ativar **E-mail/senha**.
- [ ] **Firestore > Regras**: colar as regras finais de `firestore.rules` (parte de cima do ficheiro) e publicar.

### Passo 2: Carregar as plantas da avó
- [ ] Confirmar com a avó as espécies marcadas "a confirmar" e preencher `notes` em `plants-seed.json`. Tirar uma foto por planta.
- [ ] Ajustar `seed.html` para gravar em `catalog/` em vez de `plants/` (pedir-me, ou trocar `"plants"` por `"catalog"` na linha do `setDoc`).
- [ ] Publicar as **regras temporárias** (estão em comentário no fim de `firestore.rules`, para `catalog`).
- [ ] Abrir `seed.html` com **Live Server** (extensão do VS Code). Não abrir com duplo clique (`file://` não funciona com módulos).
- [ ] Clicar em "Carregar plantas" e confirmar 11 linhas `OK`.
- [ ] Em **Firestore > Dados**, ver a coleção `catalog` com 11 documentos.
- [ ] **Voltar logo às regras finais** e publicar.

### Passo 3: Registo e login
- [ ] Módulo `assets/js/modules/auth.js`: `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`, `onAuthStateChanged`.
- [ ] No registo, criar `users/{uid}` com `role: "user"` (é o único valor que as regras aceitam).
- [ ] Ligar `pages/login.html` e `pages/register.html`.
- [ ] Criar uma conta tua e, na consola, em **Firestore > users > (o teu uid)**, mudar `role` para `admin`. É assim que surge o primeiro administrador.

### Passo 4: Mostrar o catálogo
- [ ] Ler `catalog/` e mostrar as plantas na página de plantas.
- [ ] Testar em modo offline (DevTools > Network > Offline): as plantas devem continuar a aparecer.

### Passo 5: Jardim do utilizador
- [ ] "Adicionar planta" grava em `users/{uid}/plants`.
- [ ] Gerar a tarefa de rega em `users/{uid}/tasks` (reaproveitar a lógica de `wateringDays` da versão antiga).
- [ ] Dashboard e lista de plantas a ler da base de dados.

### Passo 6: Calendário e perfil
- [ ] Calendário a ler `users/{uid}/tasks` e marcar tarefas como feitas.
- [ ] Perfil: mostrar e editar o nome (o utilizador não pode mudar o `role`).

### Passo 7: Área de administração
- [ ] Página de utilizadores: listar `users`, mudar papel, apagar.
- [ ] Editar o catálogo (acrescentar, corrigir, apagar plantas).
- [ ] Esconder estas páginas de quem não é admin (a proteção verdadeira são as regras, o esconder é só aspeto).

### Passo 8: PWA e publicação
- [ ] Copiar os ícones PNG para `assets/images/icons/` e acrescentá-los à lista do `sw.js`.
- [ ] Confirmar que o `sw.js` só lista ficheiros que existem.
- [ ] Publicar com **GitHub Pages** (ou Firebase Hosting, endereço `https://`). A PWA só se instala em `https://`.
- [ ] Em **Authentication > Definições > Domínios autorizados**, acrescentar o domínio onde a app fica publicada.
- [ ] Testar no telemóvel: instalar, registar, ver plantas, modo offline.

## 5. Para retomar a conversa

O Claude não guarda memória entre conversas. Se abrires um chat novo, cola este ficheiro e escreve, por exemplo:

> Estou a continuar a Agro App (PWA com Firebase). Segue o GUIAO.md em anexo, começa no Passo X. Decisões: catálogo = A/B; papéis = ...

Se continuares na mesma conversa, basta dizeres em que passo estás.

## 6. Dados do projeto

- Projeto Firebase: `agro-app-cde1c`
- Pasta: `...\App Herbanário\aplicação\app\Agro-app\`
- Versão antiga para consulta: `Agro-app\versão antiga (github)\`
