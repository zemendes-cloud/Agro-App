# Contas locais da Agro App

Neste protótipo, as contas e a sessão são guardadas no `localStorage` do navegador. Não é necessária uma base de dados nem uma configuração Firebase. Os dados existem apenas neste navegador e não são sincronizados entre dispositivos.

## Registo e primeiro acesso

O administrador local é criado automaticamente no primeiro acesso. O registo público cria apenas contas de trabalhador. As contas e sessões ficam guardadas apenas no navegador atual.

Cria uma conta na página **Registar**. A aplicação confirma **“Conta criada com sucesso!”** e encaminha-te para o início de sessão; usa o mesmo e-mail e palavra-passe para entrar. As contas ficam associadas ao armazenamento local deste navegador e endereço da aplicação.

As palavras-passe são guardadas como hashes PBKDF2 no navegador. Mesmo assim, o `localStorage` e o código da aplicação não fornecem autenticação segura: alguém com acesso ao navegador pode inspecionar ou alterar os dados. Usa este modo apenas para desenvolvimento/demonstração; para utilização real, migra a autenticação e as permissões para um servidor com base de dados.

As páginas de autenticação carregam scripts clássicos em vez de módulos ES, para não dependerem da política CORS que alguns navegadores aplicam a ficheiros abertos diretamente com `file://`. Para a API Web Crypto e a instalação PWA, abre a aplicação através de HTTPS ou de `http://localhost` (por exemplo, com a extensão Live Server do VS Code). Limpar os dados do site apaga as contas e cria novamente a conta inicial de administrador.
