# Banco de Curriculos MVP

MVP local em Next.js com backend no proprio Next.js, Prisma e MySQL/MariaDB. Ele permite testar cadastro de candidato, consentimento LGPD, solicitacao LGPD, empregador com bloqueio por assinatura, admin, Pix manual e ativacao de assinatura por 7 dias.

## Arquitetura de skills em `src/modules`

As regras de negocio do MVP ficam organizadas em skills internas:

- `candidate-registration-skill`: cadastro do candidato, consentimento obrigatorio e bloqueio de upload.
- `lgpd-consent-skill`: snapshot/versionamento do consentimento.
- `data-request-skill`: solicitacoes de alteracao, exclusao e revogacao.
- `employer-auth-skill`: cadastro/login de empregador.
- `subscription-gate-skill`: bloqueio por empregador inativo ou assinatura vencida.
- `manual-payment-skill`: pagamento Pix manual de assinatura com valor configurável.
- `owner-commission-skill`: custo operacional, percentual de repasse e Pix próprio de repasse.
- `candidate-search-skill`: busca sem referencias na listagem.
- `candidate-detail-skill`: detalhes com referencias e `CandidateView`.
- `admin-console-skill`: dados e acoes do painel admin.
- `audit-log-skill`: auditoria de acoes sensiveis.
- `security-skill`: sessao, senha e permissoes.
- `legal-pages-skill`: textos/regras de paginas legais.

## Requisitos

- Node.js 20 ou superior.
- npm.
- MySQL ou MariaDB local.
- Banco criado localmente, por exemplo `banco_curriculos`.

## Instalar dependencias

```bash
npm install
```

## Configurar `.env`

Copie `.env.example` para `.env` e ajuste usuario, senha, host e banco:

```env
DATABASE_URL="mysql://root:senha@localhost:3306/banco_curriculos"
SESSION_SECRET="troque-esta-chave-local-com-pelo-menos-32-caracteres"
APP_URL="http://localhost:3000"
```

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

O seed tambem cria o owner financeiro local:

- E-mail: `owner@local.test`
- Senha: `Admin123!`

## Iniciar o projeto

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Roteiro de teste manual

1. Cadastro de candidato: acesse `/candidato`, preencha o curriculo e envie.
2. Consentimento LGPD: tente enviar sem marcar o checkbox LGPD e confirme que o navegador/servidor bloqueia; depois marque e envie.
3. Snapshot de consentimento: apos enviar, confira no banco a tabela `ConsentSnapshot`.
4. Solicitacao LGPD: acesse `/lgpd`, envie uma solicitacao e confirme que nada e apagado automaticamente.
5. Cadastro de empregador: acesse `/empregador/cadastro`, crie uma empresa e voce sera autenticado.
6. Bloqueio sem assinatura: acesse `/empregador/buscar-candidatos`; a busca deve mostrar bloqueio por assinatura ativa obrigatoria.
7. Login admin: saia, acesse `/login` e entre com `admin@local.test` / `Admin123!`.
8. Pagamento manual Pix: em `/admin/pagamentos-pix`, configure o valor e o Pix da assinatura, selecione o empregador e gere o QR Code.
9. Pix copia e cola: copie o codigo Pix ou escaneie o QR Code exibido na tela.
10. Confirmacao de pagamento: clique em `Confirmar pagamento`; o sistema cria `Payment` manual Pix pago, ativa assinatura por 7 dias e gera o custo operacional pendente.
11. Plano de manutenção: acesse `/admin/plano-do-sistema`, configure nome, tipo, valor, vencimento, status e Pix próprios, gere o Pix do plano e confirme o pagamento sem ativar assinatura.
12. Busca com assinatura ativa: entre como empregador e acesse `/empregador/buscar-candidatos`; os candidatos devem aparecer sem referencias.
13. Detalhes do candidato: clique em um candidato; o sistema registra `CandidateView` antes de exibir detalhes e registra `AuditLog`.
14. Bloqueio apos assinatura vencida: no banco, atualize `Subscription.endsAt` para uma data passada e tente buscar/ver detalhes novamente.

Exemplo SQL para vencer uma assinatura local:

```sql
UPDATE Subscription SET endsAt = '2020-01-01 00:00:00' ORDER BY createdAt DESC LIMIT 1;
```

## Scripts

- `npm run dev`: inicia o Next.js local.
- `npm run build`: gera Prisma Client e compila o app.
- `npm run lint`: roda lint do Next.js.
- `npm run prisma:migrate`: aplica migrations locais.
- `npm run prisma:seed`: cria admin inicial e candidato exemplo.
- `npm run test`: roda testes de regras de negocio.

## Regras obrigatorias implementadas

- Skills/modulos independentes em `src/modules`.
- Regra de negocio fora de `page.tsx`.
- Validacao no servidor com Zod.
- Sessao segura em cookie `httpOnly` com sessao persistida no banco.
- Hash de senha com bcrypt.
- Consentimento LGPD obrigatorio e snapshot salvo.
- Bloqueio de busca/detalhes sem assinatura ativa.
- Bloqueio de busca/detalhes para empregador inativo.
- Assinatura manual com valor configurável libera acesso por 7 dias.
- Admin gera QR Code Pix BR Code e codigo copia e cola sem integrar API externa.
- Gerar QR Code nao ativa assinatura; somente confirmar pagamento recebido ativa o acesso.
- Pix de repasse operacional e Pix de assinatura sao independentes.
- `CandidateView` registrado em detalhes.
- `AuditLog` em acoes sensiveis.
- Referencias nunca aparecem na listagem.
- Solicitações de alteração, exclusão e revogação aparecem no admin.
- Seed com admin inicial.
- `.env.example` incluido.
- Sem upload, login de candidato, pagamento automatico, WhatsApp ou IA.
