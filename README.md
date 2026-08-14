# Banco de Currículos MVP

MVP local em Next.js com backend no próprio Next.js, Prisma e MySQL/MariaDB. Ele permite testar cadastro de candidato, consentimento LGPD, solicitação LGPD, empregador com bloqueio por assinatura, admin, Pix manual e ativação de assinatura por 7 dias.

## Arquitetura de skills em `src/modules`

As regras de negócio do MVP ficam organizadas em skills internas:

- `candidate-registration-skill`: cadastro do candidato, consentimento obrigatório e bloqueio de upload.
- `lgpd-consent-skill`: snapshot/versionamento do consentimento.
- `data-request-skill`: solicitações de alteração, exclusão e revogação.
- `employer-auth-skill`: cadastro/login de empregador.
- `subscription-gate-skill`: bloqueio por empregador inativo ou assinatura vencida.
- `manual-payment-skill`: pagamento Pix manual de assinatura com valor configurável.
- `candidate-search-skill`: busca sem referências na listagem.
- `candidate-detail-skill`: detalhes com referências e `CandidateView`.
- `admin-console-skill`: dados e ações do painel admin.
- `audit-log-skill`: auditoria de ações sensíveis.
- `security-skill`: sessão, senha e permissões.
- `legal-pages-skill`: textos/regras de páginas legais.

## Requisitos

- Node.js 20 ou superior.
- npm.
- MySQL ou MariaDB local.
- Banco criado localmente, por exemplo `banco_curriculos`.

## Instalar dependências

```bash
npm install
```

## Configurar `.env`

Copie `.env.example` para `.env` e ajuste usuário, senha, host e banco:

```env
DATABASE_URL="mysql://root:senha@localhost:3306/banco_curriculos"
SESSION_SECRET="troque-esta-chave-local-com-pelo-menos-32-caracteres"
APP_URL="http://localhost:3000"
```

Para preparar uma instalação de produção em VPS, consulte [`docs/deploy-production-vps.md`](docs/deploy-production-vps.md).

Crie o banco no MySQL/MariaDB:

```sql
CREATE DATABASE banco_curriculos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Rodar migrations

```bash
npm run prisma:migrate
```

## Rodar seed

```bash
npm run prisma:seed
```

O seed cria o admin local:

- E-mail: `admin@local.test`
- Senha: `Admin123!`

O seed também cria o administrador principal local:

- E-mail: `superadmin@local.test`
- Senha: `Admin123!`

Não execute o seed em produção real. Ele é destinado somente a ambientes locais ou de teste controlado.

## Iniciar o projeto

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Roteiro de teste manual

1. Cadastro de candidato: acesse `/candidato`, preencha o currículo e envie.
2. Consentimento LGPD: tente enviar sem marcar o checkbox LGPD e confirme que o navegador/servidor bloqueia; depois marque e envie.
3. Snapshot de consentimento: após enviar, confira no banco a tabela `ConsentSnapshot`.
4. Solicitação LGPD: acesse `/lgpd`, envie uma solicitação e confirme que nada é apagado automaticamente.
5. Cadastro de empregador: acesse `/empregador/cadastro`, crie uma empresa e você será autenticado.
6. Bloqueio sem assinatura: acesse `/empregador/buscar-candidatos`; a busca deve mostrar bloqueio por assinatura ativa obrigatória.
7. Login admin: saia, acesse `/login` e entre com `admin@local.test` / `Admin123!`.
8. Pagamento manual Pix: em `/admin/pagamentos-pix`, configure o valor e o Pix da assinatura, selecione o empregador e gere o QR Code.
9. Pix copia e cola: copie o código Pix ou escaneie o QR Code exibido na tela.
10. Confirmação de pagamento: clique em `Confirmar pagamento`; o sistema cria `Payment` manual Pix pago e ativa assinatura por 7 dias.
11. Busca com assinatura ativa: entre como empregador e acesse `/empregador/buscar-candidatos`; os candidatos devem aparecer sem referências.
12. Detalhes do candidato: clique em um candidato; o sistema registra `CandidateView` antes de exibir detalhes e registra `AuditLog`.
13. Bloqueio após assinatura vencida: no banco, atualize `Subscription.endsAt` para uma data passada e tente buscar/ver detalhes novamente.

Exemplo SQL para vencer uma assinatura local:

```sql
UPDATE Subscription SET endsAt = '2020-01-01 00:00:00' ORDER BY createdAt DESC LIMIT 1;
```

## Scripts

- `npm run dev`: inicia o Next.js local.
- `npm run build`: gera Prisma Client e compila o app.
- `npm run lint`: roda lint do Next.js.
- `npm run prisma:migrate`: aplica migrations locais.
- `npm run prisma:seed`: cria usuários administrativos, empregador e funções globais fictícios.
- `npm run test`: roda testes de regras de negócio.

## Regras obrigatórias implementadas

- Skills/módulos independentes em `src/modules`.
- Regra de negócio fora de `page.tsx`.
- Validação no servidor com Zod.
- Sessão segura em cookie `httpOnly` com sessão persistida no banco.
- Hash de senha com bcrypt.
- Consentimento LGPD obrigatório e snapshot salvo.
- Bloqueio de busca/detalhes sem assinatura ativa.
- Bloqueio de busca/detalhes para empregador inativo.
- Assinatura manual com valor configurável libera acesso por 7 dias.
- Admin gera QR Code Pix BR Code e código copia e cola sem integrar API externa.
- Gerar QR Code não ativa assinatura; somente confirmar pagamento recebido ativa o acesso.
- `CandidateView` registrado em detalhes.
- `AuditLog` em ações sensíveis.
- Referências nunca aparecem na listagem.
- Solicitações de alteração, exclusão e revogação aparecem no admin.
- Seed com admin inicial.
- `.env.example` incluído.
- `.env.production.example` incluído para configuração sem credenciais reais.
- Sem upload, login de candidato, pagamento automático, WhatsApp ou IA.
