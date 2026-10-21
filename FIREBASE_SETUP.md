# Preparar a autenticação Firebase da Agro App

Este ficheiro fica no projeto para a futura ligação ao Firebase. **Atualmente, a autenticação da aplicação usa `localStorage`** e não depende de Firebase. Quando a base de dados e a configuração Firebase estiverem prontas, será necessário integrar o Firebase Authentication e migrar as contas locais; preencher a configuração, por si só, não ativa o Firebase na versão atual.

## Criar o projeto e a app Web

1. Abre a [Firebase Console](https://console.firebase.google.com/) e cria o projeto da Agro App.
2. Em **Project settings > General**, adiciona uma app Web.
3. Copia os valores de configuração para `assets/js/firebase-config.js`.
   - A configuração Web, incluindo `apiKey`, é usada no cliente e não é uma palavra-passe privada.
   - Não coloques chaves privadas, tokens ou credenciais Apple neste ficheiro nem no GitHub.

## Preparar autenticação e base de dados

1. Em **Authentication > Sign-in method**, ativa **Email/Password** e configura os fornecedores sociais apenas se forem necessários.
2. Cria e configura a base de dados escolhida para o projeto.
3. Define regras de segurança no servidor/base de dados: os papéis de administrador e trabalhador não podem ser confiados a valores guardados no navegador.
4. Integra o Firebase na aplicação e substitui a autenticação local antes de utilizar contas reais.

Para Apple, configura o **Services ID**, **Team ID**, **Key ID** e a chave privada apenas nas definições seguras do Firebase. Nunca guardes a chave privada no projeto.

## Domínios e desenvolvimento

Em **Authentication > Settings > Authorized domains**, adiciona o domínio que serve o site. Usa um servidor local em `http://localhost` durante o desenvolvimento; não abras os HTML diretamente com `file://`.

Para Apple, configura o Return URL apresentado pelo Firebase, normalmente no formato `https://<project-id>.firebaseapp.com/__/auth/handler`.

## Nota sobre as contas locais

As contas criadas no modo atual existem apenas no `localStorage` do navegador onde foram criadas. Não são migradas automaticamente para o Firebase, não são partilhadas entre dispositivos e podem ser apagadas ao limpar os dados do site. Não reutilizes estas contas locais como mecanismo de segurança da versão publicada.
