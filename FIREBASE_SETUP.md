# Configurar autenticação da Agro App

O login com Google, Apple e e-mail usa Firebase Authentication. Os botões não autenticam contas enquanto a configuração abaixo não estiver concluída.

## 1. Criar o projeto e a app Web

1. Abre [Firebase Console](https://console.firebase.google.com/) e cria um projeto para a Agro App.
2. Em **Authentication**, escolhe **Get started**.
3. Em **Project settings > General**, adiciona uma app Web e copia os valores do objeto de configuração Firebase.
4. Substitui os valores de exemplo em `assets/js/firebase-config.js` pelos valores da tua app Web.
   - A configuração web, incluindo `apiKey`, é usada no cliente e não é uma palavra-passe privada.
   - Não coloques chaves privadas, tokens ou credenciais de Apple neste ficheiro nem no GitHub.

## 2. Ativar os métodos de autenticação

Em **Authentication > Sign-in method**:

1. Ativa **Email/Password** para o formulário normal.
2. Ativa **Google**.
3. Ativa **Apple** depois de preencher os dados Apple indicados no próprio formulário do Firebase.

Para Apple, precisas de uma conta no Apple Developer Program e de configurar um **Services ID**, **Team ID**, **Key ID** e uma chave privada de Sign in with Apple. A chave privada deve ser introduzida apenas na consola segura do Firebase; nunca a guardes no projeto.

## 3. Autorizar os domínios

Em **Authentication > Settings > Authorized domains**, adiciona o domínio que serve o site:

- Para desenvolvimento, abre o projeto através de um servidor local em `http://localhost` (não abras os HTML diretamente como `file://`).
- Para GitHub Pages, adiciona o hostname apresentado no URL publicado, por exemplo `zemendes-cloud.github.io`.

Para Apple, usa como Return URL o endereço apresentado pela configuração do fornecedor no Firebase. Normalmente tem o formato `https://<project-id>.firebaseapp.com/__/auth/handler`; copia o valor exato mostrado na consola para a configuração do Services ID da Apple.

## 4. Publicar e testar

Guarda `firebase-config.js`, publica as alterações no GitHub Pages ou serve a pasta com um servidor local e testa os botões em `pages/register.html` e `pages/login.html`.

O primeiro login com Google ou Apple cria automaticamente uma conta Firebase; logins seguintes entram nessa conta. Os utilizadores e sessões são geridos pelo Firebase Authentication, não pela lista de utilizadores de demonstração guardada no navegador.
