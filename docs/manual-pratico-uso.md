# Manual prático de uso

## 1. Visão geral do sistema

O Banco de Currículos é um sistema para cadastrar candidatos, organizar vagas de empregadores e permitir a busca de candidatos compatíveis com cada oportunidade.

O sistema atende três perfis principais:

- Candidato: cadastra seus dados profissionais em página pública, sem login.
- Empregador: cria conta, mantém assinatura ativa, cadastra vagas e busca candidatos.
- Admin: administra funções globais, candidatos, empregadores, pagamentos Pix manuais e solicitações de dados pessoais.

O sistema não recebe upload de currículo, imagem, PDF ou documento. O cadastro do candidato é feito por formulário.

## 2. Ordem correta de uso

Para o fluxo funcionar de forma completa, siga esta ordem:

1. O admin acessa o painel e cadastra funções globais em **Funções globais**.
2. O candidato acessa a página pública de cadastro e preenche o perfil profissional.
3. O candidato escolhe uma ou mais funções de interesse.
4. O candidato aceita a autorização de uso dos dados e envia o cadastro.
5. O empregador cria sua conta.
6. O empregador acessa **Assinatura** e solicita a cobrança Pix.
7. O admin confirma manualmente o pagamento em **Pagamentos Pix**.
8. Após a confirmação, a assinatura do empregador fica ativa por 7 dias.
9. O empregador cadastra uma vaga em **Minhas vagas**.
10. O empregador busca candidatos para a vaga aberta.
11. O empregador visualiza os detalhes de um candidato compatível e reserva o candidato.
12. O admin confirma a contratação ou devolve o candidato para disponível.

## 3. Manual do candidato

### Como acessar

O candidato acessa a página pública **Cadastro de candidato**.

O candidato não precisa criar conta e não faz login.

### Como preencher o cadastro

O candidato deve informar:

- nome completo;
- e-mail;
- telefone;
- funções de interesse;
- cidade;
- UF;
- resumo profissional;
- experiência, quando houver;
- formação;
- referências, quando desejar.

As funções de interesse são importantes porque o sistema usa essas informações para aproximar candidatos das vagas cadastradas pelos empregadores.

### Autorização de uso dos dados

O candidato precisa marcar a autorização de uso dos dados antes de enviar o cadastro.

Sem essa autorização, o cadastro não deve ser enviado.

Após o envio, o sistema registra a autorização e mantém o histórico necessário para conferência administrativa.

### Após o envio

Depois do cadastro:

- o candidato entra no banco de pessoas disponíveis;
- o candidato pode aparecer nas buscas dos empregadores com assinatura ativa;
- referências não aparecem na listagem de busca;
- referências aparecem apenas na tela de detalhes, quando o empregador autorizado abre o cadastro.

### Solicitar alteração, exclusão ou revogação

O candidato ou titular dos dados pode acessar a página pública de solicitações de dados pessoais.

Na página, deve escolher o tipo de solicitação:

- alteração de dados;
- análise de exclusão de dados;
- revogação da autorização de uso dos dados.

Nenhuma alteração é feita automaticamente. O pedido fica disponível para análise administrativa.

## 4. Manual do empregador

### Criar conta

O empregador acessa a página de cadastro de empregador e informa:

- nome da empresa;
- responsável;
- CPF ou CNPJ;
- e-mail;
- senha.

Após criar a conta, o empregador usa o login para acessar a área do empregador.

### Verificar assinatura

No painel do empregador, o card **Status da assinatura** mostra se o acesso está liberado, pendente ou bloqueado.

A busca de candidatos e a visualização de detalhes exigem assinatura ativa.

### Solicitar Pix da assinatura

O empregador acessa **Assinatura** e solicita o pagamento Pix.

Ao gerar Pix:

- o sistema mostra QR Code e Pix copia e cola;
- a cobrança fica pendente;
- o acesso ainda não é liberado.

O acesso só é liberado após confirmação administrativa do pagamento.

### Cadastrar vaga

O empregador acessa **Minhas vagas** e depois **Nova vaga**.

Na vaga, deve informar:

- título da vaga;
- função/cargo principal;
- quantidade;
- cidade;
- UF;
- descrição;
- requisitos.

O **Título da vaga** é um texto livre para identificar a oportunidade.

A **Função/cargo principal** é o campo padronizado usado pelo sistema para encontrar candidatos compatíveis. Esse campo depende das funções globais cadastradas pelo admin.

Se não houver funções ou cargos ativos, o cadastro da vaga fica indisponível e o empregador deve procurar o administrador.

### Gerenciar vagas

Em **Minhas vagas**, o empregador pode acompanhar:

- status da vaga;
- função/cargo principal;
- cidade e UF;
- quantidade de vagas;
- reservas ativas.

Para vagas abertas, o empregador pode buscar candidatos para aquela vaga.

Também pode pausar, encerrar ou cancelar vagas conforme as ações disponíveis na tela.

### Buscar candidatos

O empregador deve buscar candidatos preferencialmente a partir de uma vaga aberta.

Quando a busca é feita por vaga, o sistema cruza a função/cargo principal da vaga com as funções de interesse dos candidatos.

A listagem mostra apenas informações resumidas, como:

- nome;
- cargo ou função;
- cidade e UF;
- resumo profissional;
- funções de interesse.

As referências não aparecem na listagem.

### Ver detalhes e reservar candidato

Ao abrir os detalhes, o empregador pode ver informações completas, incluindo referências quando preenchidas.

Para reservar o candidato, deve escolher uma vaga compatível. O botão **Reservar candidato** fica indisponível até que uma vaga compatível seja selecionada.

Depois da reserva:

- o candidato fica reservado;
- o candidato deixa de aparecer na busca comum;
- o admin deve confirmar contratação ou devolver o candidato para disponível.

## 5. Manual do admin

### Acessar o painel

O admin acessa o sistema pela tela de login e entra no painel administrativo.

O painel mostra indicadores de:

- candidatos cadastrados;
- empregadores cadastrados;
- pagamentos confirmados;
- assinaturas ativas;
- solicitações de dados pendentes.

### Cadastrar funções globais

O admin deve acessar **Funções globais** antes de candidatos e empregadores usarem completamente o sistema.

Cada função global pode ter:

- nome;
- categoria;
- descrição opcional;
- status ativo ou inativo.

As funções globais são usadas em dois pontos:

- candidatos escolhem funções de interesse;
- empregadores vinculam vagas a uma função/cargo principal.

### Gerenciar candidatos

Em **Candidatos**, o admin pode:

- buscar candidatos por nome, cidade ou cargo/função;
- visualizar detalhes administrativos;
- editar dados do candidato;
- inativar candidato;
- reativar candidato quando permitido;
- confirmar contratação;
- devolver candidato reservado para disponível;
- anonimizar dados quando houver permissão administrativa adequada.

Quando o candidato está reservado, o admin pode confirmar a contratação ou devolvê-lo para disponível.

Ao confirmar contratação:

- o candidato fica contratado;
- o cadastro deixa de ficar ativo para busca;
- o candidato não volta automaticamente para disponível.

### Gerenciar empregadores

Em **Empregadores**, o admin pode:

- visualizar contas cadastradas;
- editar dados do empregador;
- bloquear ou ativar conta;
- acessar a gestão de assinatura via Pix manual.

Conta bloqueada ou sem assinatura ativa não deve liberar busca de candidatos.

### Confirmar Pix manual

Em **Pagamentos Pix**, o admin configura os dados usados na cobrança da assinatura:

- valor da assinatura;
- chave Pix;
- nome do recebedor;
- cidade do recebedor.

O admin pode gerar cobrança Pix para um empregador e confirmar o pagamento recebido.

Gerar cobrança Pix não ativa assinatura.

Somente a confirmação do pagamento recebido ativa a assinatura por 7 dias.

### Tratar solicitações de dados

Em **Solicitações de dados**, o admin acompanha pedidos públicos sobre dados pessoais.

Os pedidos podem ser de:

- alteração;
- análise de exclusão;
- revogação de autorização.

O admin deve analisar cada pedido antes de alterar qualquer dado. O sistema não executa exclusão automática.

## 6. Fluxo de vaga e reserva

O fluxo correto é:

1. Admin cadastra uma função global ativa.
2. Candidato escolhe essa função como interesse no cadastro.
3. Empregador cria uma vaga e seleciona essa função/cargo principal.
4. Empregador busca candidatos para a vaga.
5. O sistema retorna candidatos ativos, disponíveis e compatíveis com a função/cargo da vaga.
6. Empregador abre os detalhes do candidato.
7. Empregador reserva o candidato para uma vaga compatível.
8. O candidato reservado sai da busca comum.
9. Admin confirma contratação ou devolve o candidato para disponível.

Regras importantes desse fluxo:

- candidato não se inscreve em vaga;
- vaga pertence ao empregador;
- reserva deve estar vinculada a candidato, empregador e vaga;
- candidato contratado ou desativado não volta automaticamente para a busca.

## 7. Fluxo de pagamento Pix manual

O fluxo correto é:

1. Empregador cria conta.
2. Empregador acessa **Assinatura**.
3. Empregador solicita a cobrança Pix.
4. O sistema mostra QR Code e Pix copia e cola.
5. Empregador realiza o pagamento fora do sistema.
6. Admin acessa **Pagamentos Pix**.
7. Admin confirma o pagamento recebido.
8. A assinatura é ativada por 7 dias.
9. Empregador passa a poder buscar candidatos e abrir detalhes.

Cuidados importantes:

- gerar Pix não libera acesso;
- pagamento pendente não é assinatura ativa;
- confirmação manual do admin é obrigatória;
- o valor da assinatura deve estar configurado antes de gerar cobranças.

## 8. Fluxo LGPD: solicitações de dados

O sistema mantém proteção mínima para dados pessoais.

No cadastro, o candidato deve aceitar a autorização de uso dos dados.

Para solicitar alteração, análise de exclusão ou revogação, o titular acessa a página pública de dados pessoais, escolhe o tipo de pedido, informa nome, e-mail e descreve a solicitação.

Depois do envio:

- o pedido aparece em **Solicitações de dados**;
- o admin analisa o pedido;
- nenhuma alteração é feita automaticamente;
- o admin deve ter cuidado antes de alterar, inativar, anonimizar ou remover qualquer informação.

O texto jurídico e a política de privacidade devem ser revisados por profissional jurídico antes de uso comercial.

## 9. Regras importantes

- Candidato não faz login.
- Candidato não envia arquivo.
- Candidato precisa aceitar a autorização de uso dos dados.
- Empregador precisa de assinatura ativa para buscar candidatos.
- Empregador precisa de assinatura ativa para ver detalhes.
- Empregador cadastra vagas próprias.
- Cada vaga usa uma função/cargo principal do sistema.
- Referências não aparecem em listagens.
- Referências só aparecem nos detalhes do candidato.
- Candidato reservado deixa de aparecer na busca comum.
- Candidato contratado fica fora da busca.
- Pix é manual.
- Admin confirma pagamento manualmente.
- Gerar Pix não ativa assinatura.
- Solicitações de dados não executam exclusão automática.
- Dados reais e credenciais reais não devem ser usados em ambientes de teste.

## 10. Erros comuns e como resolver

### Não consigo cadastrar candidato

Verifique se existem funções globais ativas. Se não houver, o admin deve cadastrar ou ativar funções em **Funções globais**.

Também confirme se a autorização de uso dos dados foi marcada.

### Não consigo cadastrar vaga

Verifique se há funções ou cargos ativos. Sem funções globais ativas, o cadastro de vaga fica indisponível.

### A busca de candidatos está bloqueada

Verifique o status da assinatura do empregador.

Se houver Pix pendente, aguarde a confirmação administrativa.

Se a assinatura estiver vencida ou ausente, solicite nova cobrança Pix em **Assinatura**.

### O Pix foi gerado, mas a busca continua bloqueada

Isso é esperado. Gerar Pix não ativa a assinatura.

O admin precisa confirmar o pagamento recebido em **Pagamentos Pix**.

### Não encontro candidatos para uma vaga

Verifique se:

- a vaga está aberta;
- a função/cargo principal da vaga está correta;
- existem candidatos disponíveis com interesse nessa função;
- os filtros de busca não estão restritivos demais.

### Não consigo reservar um candidato

Verifique se:

- a assinatura do empregador está ativa;
- a vaga está aberta;
- a vaga é do próprio empregador;
- o candidato está disponível;
- o candidato tem interesse compatível com a função/cargo da vaga.
- uma vaga compatível foi selecionada na tela de detalhes do candidato.

### O candidato reservado sumiu da busca

Isso é correto. Candidato reservado deixa de aparecer na busca comum até que o admin devolva o candidato para disponível ou confirme a contratação.

### O candidato contratado não voltou para a busca

Isso é correto. Candidato contratado fica fora da busca e não é reativado automaticamente.

### Uma solicitação LGPD não alterou dados automaticamente

Isso é correto. Solicitações de dados ficam em análise administrativa e não executam alteração, exclusão ou revogação automática.

## Pendências conhecidas

Não foram identificadas telas ausentes entre os fluxos descritos neste manual.
