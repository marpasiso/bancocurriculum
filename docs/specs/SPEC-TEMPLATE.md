# SPEC-000 — Título da funcionalidade

- **Status:** Draft | Ready | In Progress | Validating | Done | Superseded
- **Responsável:**
- **Criada em:** AAAA-MM-DD
- **Atualizada em:** AAAA-MM-DD
- **Risco:** Médio | Alto | Crítico
- **ADRs relacionados:** Nenhum

## 1. Contexto

Estado atual, evidências e motivo da mudança.

## 2. Problema

Problema concreto, impacto e quem é afetado.

## 3. Objetivo verificável

Resultado esperado, sem prescrever detalhes internos desnecessários.

## 4. Escopo

- Incluído.

## 5. Fora de escopo

- Não incluído.
- Deploy, merge, commit e push, salvo autorização explícita.

## 6. Premissas e restrições

| ID | Tipo | Descrição | Evidência/Origem |
|---|---|---|---|
| A-01 | Premissa/Restrição |  |  |

## 7. Regras de negócio

| ID | Regra | Prioridade |
|---|---|---|
| BR-01 |  | Must/Should/Could |

## 8. Fluxos

### 8.1 Fluxo principal

1. 

### 8.2 Fluxos alternativos e erros

| ID | Condição | Comportamento esperado |
|---|---|---|
| AF-01 |  |  |

## 9. Estados e transições

| Estado atual | Evento | Condição | Próximo estado | Efeito |
|---|---|---|---|---|
|  |  |  |  |  |

## 10. Contratos e interfaces

### API/Eventos/UI

- Entradas:
- Saídas:
- Erros:
- Compatibilidade:

## 11. Dados e migração

- Campos/tabelas afetados:
- Restrições e índices:
- Backfill:
- Compatibilidade:
- Rollback:

## 12. Concorrência, consistência e idempotência

- Unidade de concorrência:
- Estratégia de lock ou controle:
- Operações idempotentes:
- Comportamento em repetição/falha parcial:

## 13. Segurança e privacidade

- Autenticação:
- Autorização:
- Isolamento de tenant:
- Dados sensíveis:
- Vetores de abuso:
- Auditoria:

## 14. Observabilidade e operação

- Logs:
- Métricas:
- Alertas:
- Diagnóstico:
- Feature flag/rollout, se aplicável:

## 15. Critérios de aceite

| ID | Critério verificável | Evidência esperada |
|---|---|---|
| AC-01 |  | Teste/comando/inspeção |

## 16. Testes obrigatórios

- [ ] Caminho principal.
- [ ] Dados inválidos.
- [ ] Autorização/permissão.
- [ ] Estados inválidos.
- [ ] Concorrência/idempotência, quando aplicável.
- [ ] Compatibilidade e regressão.
- [ ] Migração/rollback, quando aplicável.

## 17. DAG de execução e handoffs

| Etapa | Agente | Depende de | Artefato de entrada | Saída obrigatória |
|---|---|---|---|---|
| T1 |  | Nenhuma |  |  |

### Regras de paralelismo

- Tarefas só podem rodar em paralelo quando não alterarem o mesmo domínio, contrato ou arquivo crítico.
- Agentes dependentes só iniciam após conclusão e validação da entrada necessária.

## 18. Riscos e mitigação

| ID | Risco | Probabilidade | Impacto | Mitigação | Responsável |
|---|---|---|---|---|---|
| R-01 |  |  |  |  |  |

## 19. Plano de implementação

1. 

## 20. Definição de concluído

- [ ] Critérios de aceite comprovados.
- [ ] Testes, lint, typecheck e build aplicáveis aprovados.
- [ ] Migrações validadas.
- [ ] Documentação e ADRs atualizados.
- [ ] Riscos residuais registrados.
- [ ] Nenhuma alteração fora do escopo.
- [ ] Nenhum deploy ou ação Git sem autorização explícita.

## 21. Registro de validação

- **Estado:** Pending | Pass | Pass with limitations | Fail | Blocked
- **Evidências:**
- **Limitações:**
- **Validado por:**
- **Data:**
