# Diretrizes do projeto

Este arquivo complementa as diretrizes globais em `~/.codex/AGENTS.md`. Regras locais mais específicas prevalecem quando houver conflito.

## Contexto do projeto

- Produto/sistema:
- Stack principal:
- Arquitetura atual:
- Banco de dados:
- Ambientes:
- Restrições relevantes:

## Comandos oficiais

- Instalação:
- Desenvolvimento:
- Testes focados:
- Testes completos:
- Lint:
- Typecheck:
- Build:
- Validação de banco/migrations:

## Convenções locais

- Estrutura de módulos:
- Padrão de APIs:
- Padrão de erros:
- Padrão de testes:
- Convenções de UI:
- Regras de segurança e multi-tenancy:

## Governança documental

- Specs: `docs/specs/`
- ADRs: `docs/adr/`
- Planos de execução: `docs/plans/`
- Use `SPEC-LITE-TEMPLATE.md` para mudanças médias.
- Use `SPEC-TEMPLATE.md` para mudanças críticas ou transversais.
- Nomeie arquivos como `SPEC-001-nome-curto.md`, `SPEC-LITE-002-nome-curto.md` e `ADR-001-nome-curto.md`.
- Atualize o status e as evidências da spec durante a execução.

## Restrições do repositório

- Não fazer deploy, release, commit, push, merge ou alteração remota sem autorização explícita.
- Não alterar arquivos fora do escopo sem justificativa verificável.
- Preservar compatibilidade e dados existentes, salvo decisão documentada.
