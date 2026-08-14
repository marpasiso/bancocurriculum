# Deploy de produção em VPS

Este procedimento prepara uma instalação real do Banco de Currículos com Next.js standalone, PM2 e MySQL/MariaDB. Não use banco, credenciais ou dados de teste.

## Variáveis obrigatórias

Crie o `.env` somente na VPS, a partir de `.env.production.example`:

```env
DATABASE_URL="mysql://<usuario>:<senha>@127.0.0.1:3306/<banco_producao>"
SESSION_SECRET="<chave-aleatoria-forte-com-pelo-menos-32-caracteres>"
APP_URL="https://<dominio-final>"
NODE_ENV="production"
PORT="3000"
```

`APP_URL` deve ser uma única URL HTTPS, sem Markdown, vírgulas ou espaços adicionais.

Não versione `.env`, credenciais, chaves privadas ou backups.

## Pré-requisitos

```bash
node --version
npm --version
pm2 --version
mysql --version
```

Confirme também que o domínio aponta para a VPS, o HTTPS está ativo e o proxy reverso encaminha para `127.0.0.1:3000` ou para a porta definida em `PORT`.

## Instalação e validação

```bash
npm ci
npx prisma validate
npm run lint
npm run test
npx tsc --noEmit --incremental false
```

## Backup e migrations

Faça backup antes de aplicar qualquer migration:

```bash
mkdir -p backups
mysqldump --single-transaction --routines --triggers \
  --databases <banco_producao> \
  > backups/<banco_producao>-$(date +%Y%m%d-%H%M%S).sql
```

Depois confirme que `DATABASE_URL` aponta para o banco correto e execute:

```bash
npx prisma migrate deploy
```

Não use `prisma migrate dev` em produção.

## Build e PM2

```bash
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

O PM2 inicia exatamente:

```bash
node .next/standalone/server.js
```

O nome padrão do processo é `banco-curriculos`. Para usar outro nome, defina `PM2_APP_NAME` antes de iniciar.

Verifique o processo:

```bash
pm2 status
pm2 logs banco-curriculos --lines 100
```

## Seed

Não execute `npx prisma db seed` em produção real. O seed atual contém dados de teste e serve somente para desenvolvimento ou ambientes de teste controlado.

Se houver uma decisão operacional específica para inicialização controlada, use uma credencial exclusiva em `SEED_ADMIN_PASSWORD`, faça backup antes e remova o segredo após o uso.

## Validação pós-deploy

```bash
curl -I https://<dominio-final>
```

Valide no navegador o acesso público, login, cadastro de empregador, bloqueio sem assinatura, geração de Pix pendente, confirmação administrativa e liberação da busca somente após ativação da assinatura.

## Pendências antes da publicação

- Definir o domínio final e preencher `APP_URL` com uma única URL HTTPS.
- Criar banco e usuário exclusivos de produção.
- Configurar segredos fora do repositório.
- Confirmar backup e restauração do banco.
- Configurar proxy reverso, HTTPS, PM2 e inicialização automática.
- Confirmar que nenhum dado fictício ou de teste será levado para produção.
