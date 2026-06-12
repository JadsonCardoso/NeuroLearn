# RF Catalog

Projeto: NeuroLearn

Versão: 2.0

Última atualização: 2026-06-11

Responsável: Product Governance

Baseline:
RF-001 → RF-190

Total de RFs:
190

Domínios:
11

Status:
Baseline Oficial Congelada

---

# Domínios

- DOM-001 — Identity & Access
- DOM-002 — Learning Content
- DOM-003 — Learning Trails
- DOM-004 — Study Sessions
- DOM-005 — Review Engine
- DOM-006 — Cognitive Engine
- DOM-007 — Learning Motivation
- DOM-008 — AI Learning Companion
- DOM-009 — Analytics
- DOM-010 — Security
- DOM-011 — Skill Acquisition

---

# Convenções

## Status possíveis

- Proposto
- Em Desenvolvimento
- Implementado
- Obsoleto

# Governança

Este documento representa a baseline oficial de requisitos funcionais do NeuroLearn.

Qualquer novo requisito funcional deverá:

- possuir justificativa;
- possuir domínio associado;
- possuir rastreabilidade;
- possuir análise de impacto;
- possuir atualização da RTM.

Nenhum RF poderá ser removido sem ADR formal.

## Prioridades

- P0 (Crítico)
- P1 (Importante)
- P2 (Desejável)

## Relacionamentos

- RN = Regra de Negócio
- RNF = Requisito Não Funcional
- CA = Critério de Aceite
- TC = Caso de Teste

---

# DOM-001 — Identity & Access

## RF-001 — Usuário pode criar conta

Status:
Implementado

Descrição:
O sistema deve permitir que um usuário realize cadastro utilizando os dados obrigatórios definidos pela plataforma.

Objetivo:
Permitir acesso ao NeuroLearn.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Fluxo principal de entrada na plataforma.

---

## RF-002 — Sistema deve validar dados obrigatórios do cadastro

Status:
Implementado

Descrição:
O sistema deve impedir criação de conta quando existirem campos obrigatórios não preenchidos.

Objetivo:
Garantir integridade dos dados cadastrados.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Todos os campos obrigatórios devem possuir feedback visual.

---

## RF-003 — Sistema deve validar formato dos campos

Status:
Implementado

Descrição:
O sistema deve validar formato de e-mail, senha e demais campos obrigatórios.

Objetivo:
Garantir qualidade dos dados informados.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Mensagens de erro devem ser claras e orientativas.

---

## RF-004 — Usuário pode autenticar-se

Status:
Implementado

Descrição:
O sistema deve permitir login utilizando credenciais válidas.

Objetivo:
Permitir acesso seguro ao sistema.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Fluxo crítico de acesso.

---

## RF-005 — Sistema deve bloquear autenticação com credenciais inválidas

Status:
Implementado

Descrição:
O sistema deve impedir autenticação quando as credenciais fornecidas forem inválidas.

Objetivo:
Garantir segurança do acesso.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Deve exibir mensagem amigável sem expor detalhes internos.

---

## RF-006 — Usuário autenticado pode encerrar sessão

Status:
Implementado

Descrição:
O sistema deve permitir que usuários autenticados encerrem suas sessões.

Objetivo:
Garantir controle de acesso.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Deve invalidar sessão local e remota quando aplicável.

---

## RF-007 — Usuário pode solicitar recuperação de senha

Status:
Implementado

Descrição:
O sistema deve permitir solicitação de recuperação de senha através do e-mail cadastrado.

Objetivo:
Permitir recuperação de acesso.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Fluxo protegido contra abuso.

---

## RF-008 — Usuário pode redefinir senha através de token válido

Status:
Implementado

Descrição:
O sistema deve permitir redefinição de senha utilizando token válido.

Objetivo:
Restabelecer acesso do usuário.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Token deve possuir validade controlada.

---

## RF-009 — Sistema deve invalidar token após uso

Status:
Implementado

Descrição:
O sistema deve invalidar o token imediatamente após redefinição bem-sucedida da senha.

Objetivo:
Evitar reutilização indevida.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Requisito crítico de segurança.

---

## RF-010 — Sistema deve impedir acesso a áreas protegidas sem autenticação

Status:
Implementado

Descrição:
O sistema deve restringir acesso a áreas autenticadas para usuários não autenticados.

Objetivo:
Garantir proteção dos dados.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Deve redirecionar para login.

---

## RF-011 — Sistema deve manter sessão autenticada

Status:
Implementado

Descrição:
O sistema deve manter sessão válida enquanto não houver logout ou expiração.

Objetivo:
Garantir continuidade da experiência.

Prioridade:
P1

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Importante para continuidade cognitiva.

---

## RF-012 — Sistema deve registrar eventos de autenticação

Status:
Implementado

Descrição:
O sistema deve registrar eventos de login e logout.

Objetivo:
Garantir rastreabilidade.

Prioridade:
P1

Origem:

- Segurança
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Utilizado para auditoria e observabilidade.

---

## RF-013 — Sistema deve registrar eventos de recuperação de senha

Status:
Implementado

Descrição:
O sistema deve registrar solicitações e redefinições de senha.

Objetivo:
Garantir rastreabilidade de segurança.

Prioridade:
P1

Origem:

- Segurança
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Necessário para auditoria.

---

## RF-014 — Sistema deve encerrar sessões inválidas

Status:
Implementado

Descrição:
O sistema deve invalidar sessões expiradas ou comprometidas.

Objetivo:
Garantir segurança contínua.

Prioridade:
P1

Origem:

- Segurança
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Recomendado para múltiplos dispositivos.

---

## RF-015 — Sistema deve associar conta ao usuário proprietário

Status:
Implementado

Descrição:
Toda conta deve possuir vínculo único com seu proprietário.

Objetivo:
Garantir ownership dos dados.

Prioridade:
P0

Origem:

- Segurança
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para isolamento multi-tenant.

---

# DOM-002 — Learning Content

## RF-016 — Usuário pode criar conteúdo

Status:
Implementado

Descrição:
O sistema deve permitir que o usuário crie conteúdos de estudo, como livros, cursos, PDFs, links, artigos ou notas.

Objetivo:
Permitir entrada de materiais na Biblioteca de Conhecimento.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Conteúdo é a base da jornada de aprendizagem.

---

## RF-017 — Usuário pode visualizar conteúdo

Status:
Implementado

Descrição:
O sistema deve permitir que o usuário visualize os conteúdos cadastrados.

Objetivo:
Permitir acesso aos materiais de estudo.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
A visualização deve respeitar ownership.

---

## RF-018 — Usuário pode editar conteúdo

Status:
Implementado

Descrição:
O sistema deve permitir edição dos dados de conteúdos existentes.

Objetivo:
Permitir correção e manutenção dos materiais cadastrados.

Prioridade:
P0

Origem:

- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Parte obrigatória do CRUD completo.

---

## RF-019 — Usuário pode remover conteúdo

Status:
Implementado

Descrição:
O sistema deve permitir remoção de conteúdos cadastrados pelo usuário.

Objetivo:
Permitir gerenciamento da Biblioteca.

Prioridade:
P0

Origem:

- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
A remoção deve ser segura e confirmada.

---

## RF-020 — Sistema deve solicitar confirmação de exclusão

Status:
Implementado

Descrição:
O sistema deve solicitar confirmação antes de remover conteúdo.

Objetivo:
Evitar perda acidental de dados.

Prioridade:
P0

Origem:

- Sprint 01
- UX Foundation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Ação destrutiva exige confirmação.

---

## RF-021 — Sistema deve exibir feedback de criação

Status:
Implementado

Descrição:
O sistema deve exibir feedback visual após criação bem-sucedida de conteúdo.

Objetivo:
Informar ao usuário que a ação foi concluída.

Prioridade:
P0

Origem:

- Sprint 01
- UX Foundation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Preferencialmente via toast descritivo.

---

## RF-022 — Sistema deve exibir feedback de edição

Status:
Implementado

Descrição:
O sistema deve exibir feedback visual após edição bem-sucedida de conteúdo.

Objetivo:
Informar ao usuário que a alteração foi salva.

Prioridade:
P0

Origem:

- Sprint 01
- UX Foundation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Feedback deve ser claro e não técnico.

---

## RF-023 — Sistema deve exibir feedback de remoção

Status:
Implementado

Descrição:
O sistema deve exibir feedback visual após remoção de conteúdo.

Objetivo:
Confirmar conclusão da ação destrutiva.

Prioridade:
P0

Origem:

- Sprint 01
- UX Foundation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Deve informar o impacto da remoção.

---

## RF-024 — Usuário pode pesquisar conteúdos

Status:
Implementado

Descrição:
O sistema deve permitir busca de conteúdos por termo textual.

Objetivo:
Facilitar localização de materiais na Biblioteca.

Prioridade:
P1

Origem:

- Learning Content

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Importante para escalabilidade da Biblioteca.

---

## RF-025 — Usuário pode filtrar conteúdos

Status:
Implementado

Descrição:
O sistema deve permitir filtragem de conteúdos por tipo, trilha ou outros critérios disponíveis.

Objetivo:
Reduzir carga cognitiva na navegação.

Prioridade:
P1

Origem:

- Learning Content

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Filtros apoiam organização cognitiva.

---

## RF-026 — Usuário pode categorizar conteúdos

Status:
Implementado

Descrição:
O sistema deve permitir categorização de conteúdos por tipo ou classificação definida.

Objetivo:
Organizar materiais de forma estruturada.

Prioridade:
P1

Origem:

- Learning Content

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Pode evoluir para taxonomia de aprendizado.

---

## RF-027 — Usuário pode associar conteúdos a trilhas

Status:
Implementado

Descrição:
O sistema deve permitir associar conteúdos existentes a trilhas de aprendizagem.

Objetivo:
Conectar materiais a jornadas de estudo.

Prioridade:
P0

Origem:

- Learning Content
- Learning Trails

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
A associação não transfere ownership do conteúdo para a trilha.

---

## RF-028 — Sistema deve preservar ownership do conteúdo

Status:
Implementado

Descrição:
O sistema deve garantir que conteúdos sejam acessíveis apenas ao usuário proprietário.

Objetivo:
Proteger dados e privacidade.

Prioridade:
P0

Origem:

- Segurança
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para segurança multi-tenant.

---

## RF-029 — Sistema deve atualizar listagens automaticamente

Status:
Implementado

Descrição:
O sistema deve atualizar listagens de conteúdos após criação, edição ou remoção sem exigir reload manual.

Objetivo:
Garantir sincronização e fluidez da experiência.

Prioridade:
P0

Origem:

- Sprint 01
- UX Foundation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Nenhuma ação deve depender de F5.

---

## RF-030 — Sistema deve persistir alterações de conteúdo

Status:
Implementado

Descrição:
O sistema deve salvar alterações realizadas em conteúdos de forma confiável.

Objetivo:
Evitar perda de dados.

Prioridade:
P0

Origem:

- Sprint 01
- Persistência Cognitiva

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Alterações devem permanecer após reload e novo acesso.

---

# DOM-003 — Learning Trails

## RF-031 — Usuário pode criar trilhas

Status:
Implementado

Descrição:
O sistema deve permitir criação de trilhas de aprendizagem.

Objetivo:
Organizar conteúdos em jornadas cognitivas.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Trilhas ajudam a estruturar o aprendizado.

---

## RF-032 — Usuário pode visualizar trilhas

Status:
Implementado

Descrição:
O sistema deve permitir visualização das trilhas criadas pelo usuário.

Objetivo:
Permitir navegação pelas jornadas de aprendizagem.

Prioridade:
P0

Origem:

- Learning Trails

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
A visualização deve respeitar ownership.

---

## RF-033 — Usuário pode editar trilhas

Status:
Implementado

Descrição:
O sistema deve permitir edição dos dados de uma trilha existente.

Objetivo:
Permitir manutenção da organização do aprendizado.

Prioridade:
P0

Origem:

- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Parte do CRUD completo.

---

## RF-034 — Usuário pode remover trilhas

Status:
Implementado

Descrição:
O sistema deve permitir remoção de trilhas criadas pelo usuário.

Objetivo:
Permitir gerenciamento da organização do conhecimento.

Prioridade:
P0

Origem:

- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Excluir trilha não deve excluir conteúdos associados.

---

## RF-035 — Sistema deve solicitar confirmação antes da exclusão

Status:
Implementado

Descrição:
O sistema deve solicitar confirmação antes de remover uma trilha.

Objetivo:
Evitar perda ou desorganização acidental.

Prioridade:
P0

Origem:

- Sprint 01
- UX Foundation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
A mensagem deve informar que os conteúdos serão preservados.

---

## RF-036 — Usuário pode associar conteúdos a trilhas

Status:
Implementado

Descrição:
O sistema deve permitir associação de conteúdos a trilhas.

Objetivo:
Conectar materiais de estudo a jornadas organizadas.

Prioridade:
P0

Origem:

- Learning Trails

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Conteúdo pode existir com ou sem trilha.

---

## RF-037 — Usuário pode remover conteúdos da trilha

Status:
Implementado

Descrição:
O sistema deve permitir remover a associação de um conteúdo com uma trilha.

Objetivo:
Permitir reorganização do aprendizado sem excluir o conteúdo.

Prioridade:
P0

Origem:

- Learning Trails

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
A remoção da trilha não remove o conteúdo da Biblioteca.

---

## RF-038 — Usuário pode mover conteúdos entre trilhas

Status:
Implementado

Descrição:
O sistema deve permitir mover conteúdos de uma trilha para outra.

Objetivo:
Facilitar reorganização das jornadas de aprendizagem.

Prioridade:
P1

Origem:

- Learning Trails

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Movimentação deve preservar histórico do conteúdo.

---

## RF-039 — Usuário pode utilizar drag and drop

Status:
Implementado

Descrição:
O sistema deve permitir reorganização de conteúdos por arrastar e soltar quando disponível.

Objetivo:
Melhorar a experiência de organização visual.

Prioridade:
P1

Origem:

- Learning Trails
- UX Foundation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Deve possuir feedback visual durante a interação.

---

## RF-040 — Usuário pode expandir trilhas

Status:
Implementado

Descrição:
O sistema deve permitir expandir trilhas para visualizar conteúdos associados.

Objetivo:
Melhorar escaneabilidade e controle visual.

Prioridade:
P1

Origem:

- Learning Trails
- UX Foundation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Recurso importante para bibliotecas com muitos itens.

---

## RF-041 — Usuário pode recolher trilhas

Status:
Implementado

Descrição:
O sistema deve permitir recolher trilhas para ocultar conteúdos associados.

Objetivo:
Reduzir sobrecarga cognitiva.

Prioridade:
P1

Origem:

- Learning Trails
- UX Foundation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Ajuda no foco visual.

---

## RF-042 — Sistema deve preservar conteúdos ao excluir trilha

Status:
Implementado

Descrição:
O sistema deve preservar conteúdos associados quando uma trilha for excluída.

Objetivo:
Evitar perda de conhecimento.

Prioridade:
P0

Origem:

- ADR-CATALOG
- Learning Trails

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Conteúdos devem permanecer disponíveis na Biblioteca ou em área sem trilha.

---

## RF-043 — Sistema deve atualizar trilhas automaticamente

Status:
Implementado

Descrição:
O sistema deve atualizar a visualização das trilhas após criação, edição, remoção ou movimentação de conteúdos sem exigir reload.

Objetivo:
Garantir consistência visual e operacional.

Prioridade:
P0

Origem:

- Sprint 01
- UX Foundation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Nenhuma atualização deve depender de F5.

---

## RF-044 — Sistema deve persistir estrutura da trilha

Status:
Implementado

Descrição:
O sistema deve persistir estrutura, organização e associações da trilha.

Objetivo:
Manter organização do aprendizado entre sessões de uso.

Prioridade:
P0

Origem:

- Learning Trails
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Inclui conteúdos associados e estado estrutural quando aplicável.

---

## RF-045 — Sistema deve preservar ownership da trilha

Status:
Implementado

Descrição:
O sistema deve garantir que trilhas sejam acessíveis apenas ao usuário proprietário.

Objetivo:
Proteger organização e dados do usuário.

Prioridade:
P0

Origem:

- Segurança
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

---

## RF-191 — Usuário pode criar Projetos de Aprendizagem

Status:
Proposto

Descrição:
O sistema deve permitir criação de Projetos de Aprendizagem para agrupar trilhas relacionadas.

Objetivo:
Melhorar organização do conhecimento.

Prioridade:
P0

---

## RF-192 — Usuário pode visualizar Projetos de Aprendizagem

Status:
Proposto

Descrição:
O sistema deve permitir visualização dos Projetos de Aprendizagem cadastrados.

Objetivo:
Facilitar navegação.

Prioridade:
P0

---

## RF-193 — Usuário pode editar Projetos de Aprendizagem

Status:
Proposto

Descrição:
O sistema deve permitir atualização dos dados de um Projeto de Aprendizagem.

Objetivo:
Manter organização do conhecimento.

Prioridade:
P0

---

## RF-194 — Usuário pode remover Projetos de Aprendizagem

Status:
Proposto

Descrição:
O sistema deve permitir exclusão de Projetos de Aprendizagem.

Objetivo:
Permitir gestão da estrutura organizacional.

Prioridade:
P0

---

## RF-195 — Usuário pode associar Trilhas a Projetos

Status:
Proposto

Descrição:
O sistema deve permitir vincular Trilhas de Aprendizagem a Projetos.

Objetivo:
Estruturar jornadas de aprendizagem.

Prioridade:
P0

---

## RF-196 — Sistema deve calcular progresso agregado do Projeto

Status:
Proposto

Descrição:
O sistema deve calcular progresso considerando todas as trilhas associadas ao projeto.

Objetivo:
Permitir acompanhamento consolidado.

Prioridade:
P1

---

## RF-197 — Sistema deve exibir progresso do Projeto

Status:
Proposto

Descrição:
O sistema deve apresentar indicadores visuais de evolução do Projeto de Aprendizagem.

Objetivo:
Tornar progresso perceptível.

Prioridade:
P1

---

## RF-198 — Sistema deve preservar ownership do Projeto

Status:
Proposto

Descrição:
O sistema deve garantir que Projetos de Aprendizagem sejam acessíveis apenas ao usuário proprietário.

Objetivo:
Garantir segurança e privacidade.

Prioridade:
P0

Observações:
Base para isolamento multi-tenant.

# DOM-004 — Study Sessions

## RF-046 — Usuário pode iniciar uma sessão de estudo

Status:
Implementado

Descrição:
O sistema deve permitir que o usuário inicie uma sessão de estudo a partir de um conteúdo disponível.

Objetivo:
Iniciar o fluxo de aprendizagem ativa.

Prioridade:
P0

Origem:

- MPD
- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Ponto de entrada da jornada cognitiva.

---

## RF-047 — Sistema deve registrar início da sessão

Status:
Implementado

Descrição:
O sistema deve registrar data, hora e contexto de início da sessão.

Objetivo:
Permitir rastreabilidade e métricas de estudo.

Prioridade:
P0

Origem:

- Study Sessions

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para Analytics e Cognitive Engine.

---

## RF-048 — Usuário pode registrar highlights durante o estudo

Status:
Implementado

Descrição:
O sistema deve permitir destacar trechos relevantes do conteúdo estudado.

Objetivo:
Capturar conhecimento importante para revisão futura.

Prioridade:
P0

Origem:

- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Highlights devem ser persistidos.

---

## RF-049 — Usuário pode criar anotações durante o estudo

Status:
Implementado

Descrição:
O sistema deve permitir criação de anotações associadas à sessão.

Objetivo:
Estimular construção ativa do conhecimento.

Prioridade:
P0

Origem:

- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
As anotações devem ser editáveis posteriormente.

---

## RF-050 — Usuário pode registrar reflexões ativas

Status:
Implementado

Descrição:
O sistema deve permitir registrar reflexões pessoais sobre o conteúdo estudado.

Objetivo:
Aumentar retenção e processamento cognitivo.

Prioridade:
P0

Origem:

- Cognitive Learning

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Reflexões devem ser reutilizadas na Revisão.

---

## RF-051 — Usuário pode criar flashcards durante a sessão

Status:
Implementado

Descrição:
O sistema deve permitir criação de flashcards associados ao conteúdo estudado.

Objetivo:
Apoiar recuperação ativa.

Prioridade:
P0

Origem:

- Sprint 01

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Flashcards devem aparecer em Meu Material.

---

## RF-052 — Usuário pode registrar explicações próprias

Status:
Implementado

Descrição:
O sistema deve permitir que o usuário explique conceitos com suas próprias palavras.

Objetivo:
Aplicar técnica de Feynman.

Prioridade:
P0

Origem:

- Learning Science

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Explicações devem ser armazenadas permanentemente.

---

## RF-053 — Usuário pode realizar exercícios durante a sessão

Status:
Implementado

Descrição:
O sistema deve permitir resolução de exercícios relacionados ao conteúdo estudado.

Objetivo:
Promover aplicação prática.

Prioridade:
P0

Origem:

- Active Learning

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Exercícios devem ser vinculados à sessão.

---

## RF-054 — Sistema deve realizar autosave automático

Status:
Implementado

Descrição:
O sistema deve salvar automaticamente toda evidência cognitiva produzida.

Objetivo:
Evitar perda de conhecimento.

Prioridade:
P0

Origem:

- Sprint 01
- Cognitive Persistence

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Não depender de ação manual do usuário.

---

## RF-055 — Sistema deve persistir evidências cognitivas

Status:
Implementado

Descrição:
O sistema deve armazenar permanentemente highlights, anotações, reflexões, flashcards, explicações e exercícios.

Objetivo:
Garantir continuidade cognitiva.

Prioridade:
P0

Origem:

- Cognitive Persistence

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base do módulo Meu Material.

---

## RF-056 — Sistema deve associar evidências cognitivas ao conteúdo estudado

Status:
Implementado

Descrição:
Toda evidência cognitiva deve ser vinculada ao conteúdo que originou sua criação.

Objetivo:
Garantir rastreabilidade.

Prioridade:
P0

Origem:

- Study Sessions

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Fundamental para Revisão.

---

## RF-057 — Sistema deve associar evidências cognitivas à trilha correspondente

Status:
Implementado

Descrição:
As evidências cognitivas devem manter vínculo com a trilha de aprendizagem quando existir.

Objetivo:
Preservar contexto de estudo.

Prioridade:
P0

Origem:

- Learning Trails

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Conteúdos sem trilha devem continuar suportados.

---

## RF-058 — Sistema deve registrar tempo efetivo de estudo

Status:
Implementado

Descrição:
O sistema deve registrar duração da sessão de estudo.

Objetivo:
Alimentar métricas e analytics.

Prioridade:
P1

Origem:

- Analytics

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Tempo ocioso deve ser tratado futuramente.

---

## RF-059 — Sistema deve registrar última atividade da sessão

Status:
Implementado

Descrição:
O sistema deve registrar a última interação realizada pelo usuário.

Objetivo:
Permitir retomada precisa do contexto.

Prioridade:
P0

Origem:

- Cognitive Continuity

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para Recovery.

---

## RF-060 — Sistema deve restaurar sessões interrompidas

Status:
Implementado

Descrição:
O sistema deve permitir retomada de sessões interrompidas anteriormente.

Objetivo:
Evitar perda de contexto.

Prioridade:
P0

Origem:

- Cognitive Continuity

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Recurso crítico para confiança do usuário.

---

## RF-061 — Sistema deve restaurar contexto cognitivo anterior

Status:
Implementado

Descrição:
O sistema deve recuperar evidências cognitivas produzidas anteriormente na mesma sessão.

Objetivo:
Preservar continuidade cognitiva.

Prioridade:
P0

Origem:

- Cognitive Continuity

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Reduz frustração e abandono.

---

## RF-062 — Sistema deve permitir edição das evidências cognitivas

Status:
Implementado

Descrição:
O sistema deve permitir edição posterior das evidências cognitivas.

Objetivo:
Permitir evolução do conhecimento.

Prioridade:
P0

Origem:

- Meu Material

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Deve manter histórico futuramente.

---

## RF-063 — Sistema deve permitir remoção das evidências cognitivas

Status:
Implementado

Descrição:
O sistema deve permitir remoção das evidências cognitivas.

Objetivo:
Permitir gestão dos materiais produzidos.

Prioridade:
P0

Origem:

- Meu Material

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Exclusão deve exigir confirmação.

---

## RF-064 — Sistema deve solicitar confirmação para remoção

Status:
Implementado

Descrição:
O sistema deve solicitar confirmação antes de remover evidências cognitivas.

Objetivo:
Evitar perda acidental.

Prioridade:
P0

Origem:

- UX Foundation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Ação destrutiva.

---

## RF-065 — Sistema deve preservar ownership das evidências cognitivas

Status:
Implementado

Descrição:
O sistema deve garantir que evidências cognitivas sejam acessíveis apenas ao usuário proprietário.

Objetivo:
Garantir privacidade e segurança.

Prioridade:
P0

Origem:

- Security
- Multi-Tenant

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Nenhum usuário pode visualizar ou alterar dados de terceiros.

# DOM-005 — Review Engine

## RF-066 — Usuário pode acessar área de revisão

Status:
Implementado

Descrição:
O sistema deve disponibilizar uma área dedicada para revisão dos conhecimentos produzidos durante o estudo.

Objetivo:
Centralizar o processo de consolidação do aprendizado.

Prioridade:
P0

Origem:

- MPD
- Review Engine

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Ponto central da aprendizagem de longo prazo.

---

## RF-067 — Usuário pode acessar Meu Material

Status:
Implementado

Descrição:
O sistema deve disponibilizar uma área contendo todos os materiais cognitivos produzidos pelo usuário.

Objetivo:
Permitir recuperação rápida do conhecimento criado.

Prioridade:
P0

Origem:

- Cognitive Persistence

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Área consolidada do conhecimento produzido.

---

## RF-068 — Sistema deve exibir highlights produzidos

Status:
Implementado

Descrição:
O sistema deve exibir highlights criados durante sessões de estudo.

Objetivo:
Facilitar revisões rápidas.

Prioridade:
P0

Origem:

- Study Sessions

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Deve preservar contexto de origem.

---

## RF-069 — Sistema deve exibir anotações produzidas

Status:
Implementado

Descrição:
O sistema deve apresentar anotações criadas durante os estudos.

Objetivo:
Permitir consulta posterior.

Prioridade:
P0

---

## RF-070 — Sistema deve exibir reflexões produzidas

Status:
Implementado

Descrição:
O sistema deve apresentar reflexões criadas pelo usuário.

Objetivo:
Reforçar processamento cognitivo.

Prioridade:
P0

---

## RF-071 — Sistema deve exibir flashcards produzidos

Status:
Implementado

Descrição:
O sistema deve exibir flashcards gerados pelo usuário.

Objetivo:
Promover recuperação ativa.

Prioridade:
P0

---

## RF-072 — Sistema deve exibir explicações produzidas

Status:
Implementado

Descrição:
O sistema deve apresentar explicações registradas pelo usuário.

Objetivo:
Apoiar técnica de Feynman.

Prioridade:
P0

---

## RF-073 — Sistema deve exibir exercícios realizados

Status:
Implementado

Descrição:
O sistema deve apresentar exercícios associados ao estudo.

Objetivo:
Facilitar reaplicação e revisão.

Prioridade:
P0

---

## RF-074 — Usuário pode pesquisar materiais de revisão

Status:
Implementado

Descrição:
O sistema deve permitir pesquisa textual dos materiais disponíveis.

Objetivo:
Localizar rapidamente conhecimentos produzidos.

Prioridade:
P1

---

## RF-075 — Usuário pode filtrar materiais por trilha

Status:
Implementado

Descrição:
O sistema deve permitir filtragem dos materiais por trilha de aprendizagem.

Objetivo:
Reduzir carga cognitiva.

Prioridade:
P1

---

## RF-076 — Usuário pode filtrar materiais por conteúdo

Status:
Implementado

Descrição:
O sistema deve permitir filtragem por conteúdo estudado.

Objetivo:
Facilitar navegação contextual.

Prioridade:
P1

---

## RF-077 — Usuário pode filtrar materiais por sessão

Status:
Implementado

Descrição:
O sistema deve permitir filtragem por sessão de estudo.

Objetivo:
Preservar contexto temporal.

Prioridade:
P1

---

## RF-078 — Sistema deve exibir materiais agrupados por trilha

Status:
Implementado

Descrição:
O sistema deve organizar materiais conforme a trilha selecionada.

Objetivo:
Melhorar organização cognitiva.

Prioridade:
P1

---

## RF-079 — Sistema deve exibir materiais agrupados por conteúdo

Status:
Implementado

Descrição:
O sistema deve organizar materiais conforme o conteúdo estudado.

Objetivo:
Melhorar recuperação do conhecimento.

Prioridade:
P1

---

## RF-080 — Usuário pode selecionar trilha para revisão

Status:
Implementado

Descrição:
O sistema deve permitir escolha de uma trilha específica para revisão.

Objetivo:
Focar o processo de aprendizagem.

Prioridade:
P0

---

## RF-081 — Usuário pode selecionar conteúdo para revisão

Status:
Implementado

Descrição:
O sistema deve permitir escolha de conteúdos específicos.

Objetivo:
Personalizar revisões.

Prioridade:
P0

---

## RF-082 — Usuário pode selecionar sessão para revisão

Status:
Implementado

Descrição:
O sistema deve permitir seleção de sessões estudadas.

Objetivo:
Manter continuidade cognitiva.

Prioridade:
P0

---

## RF-083 — Sistema deve exibir exercícios relacionados à seleção atual

Status:
Implementado

Descrição:
O sistema deve exibir exercícios compatíveis com a trilha, conteúdo ou sessão selecionada.

Objetivo:
Facilitar prática direcionada.

Prioridade:
P0

---

## RF-084 — Sistema deve preservar contexto da revisão

Status:
Implementado

Descrição:
O sistema deve manter contexto da navegação durante o processo de revisão.

Objetivo:
Evitar perda de foco.

Prioridade:
P0

---

## RF-085 — Sistema deve registrar progresso da revisão

Status:
Implementado

Descrição:
O sistema deve registrar evolução das revisões realizadas.

Objetivo:
Permitir acompanhamento da aprendizagem.

Prioridade:
P0

---

## RF-086 — Sistema deve atualizar materiais automaticamente

Status:
Implementado

Descrição:
O sistema deve refletir automaticamente alterações realizadas nos materiais.

Objetivo:
Garantir consistência dos dados.

Prioridade:
P0

---

## RF-087 — Usuário pode editar materiais revisados

Status:
Implementado

Descrição:
O sistema deve permitir edição dos materiais apresentados em Meu Material.

Objetivo:
Permitir refinamento contínuo do conhecimento.

Prioridade:
P0

---

## RF-088 — Usuário pode remover materiais revisados

Status:
Implementado

Descrição:
O sistema deve permitir remoção dos materiais armazenados.

Objetivo:
Permitir gestão dos conhecimentos produzidos.

Prioridade:
P0

---

## RF-089 — Sistema deve preservar ownership dos materiais revisados

Status:
Implementado

Descrição:
O sistema deve garantir que apenas o proprietário tenha acesso aos materiais.

Objetivo:
Garantir segurança e privacidade.

Prioridade:
P0

---

## RF-090 — Sistema deve disponibilizar histórico de revisões

Status:
Implementado

Descrição:
O sistema deve manter histórico das revisões realizadas pelo usuário.

Objetivo:
Permitir acompanhamento da evolução cognitiva.

Prioridade:
P1

Origem:

- Review Engine
- Analytics

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para métricas de retenção e evolução.

# DOM-006 — Cognitive Engine

## RF-091 — Sistema deve calcular score cognitivo do usuário

Status:
Proposto

Descrição:
O sistema deve calcular um score cognitivo baseado em estudos, revisões, exercícios e retenção.

Objetivo:
Mensurar evolução cognitiva.

Prioridade:
P0

Origem:

- Cognitive Engine

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para recomendações futuras.

---

## RF-092 — Sistema deve calcular retenção dos conteúdos estudados

Status:
Proposto

Descrição:
O sistema deve calcular a retenção estimada para cada conteúdo estudado.

Objetivo:
Identificar risco de esquecimento.

Prioridade:
P0

Origem:

- Learning Science

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Baseado em revisões realizadas e tempo decorrido.

---

## RF-093 — Sistema deve identificar conteúdos em risco de esquecimento

Status:
Proposto

Descrição:
O sistema deve identificar conteúdos cuja retenção esteja abaixo do limite definido.

Objetivo:
Priorizar revisões.

Prioridade:
P0

---

## RF-094 — Sistema deve priorizar conteúdos para revisão

Status:
Proposto

Descrição:
O sistema deve ordenar conteúdos conforme necessidade de revisão.

Objetivo:
Maximizar retenção.

Prioridade:
P0

---

## RF-095 — Sistema deve sugerir próximas revisões

Status:
Proposto

Descrição:
O sistema deve recomendar conteúdos que devem ser revisados.

Objetivo:
Guiar o usuário.

Prioridade:
P0

---

## RF-096 — Sistema deve registrar evolução cognitiva

Status:
Proposto

Descrição:
O sistema deve registrar evolução do usuário ao longo do tempo.

Objetivo:
Permitir acompanhamento da aprendizagem.

Prioridade:
P1

---

## RF-097 — Sistema deve associar métricas cognitivas aos conteúdos

Status:
Proposto

Descrição:
O sistema deve associar indicadores cognitivos aos conteúdos estudados.

Objetivo:
Permitir análise granular.

Prioridade:
P1

---

## RF-098 — Sistema deve associar métricas cognitivas às habilidades

Status:
Proposto

Descrição:
O sistema deve associar evolução cognitiva às habilidades trabalhadas.

Objetivo:
Mensurar aquisição de competências.

Prioridade:
P1

---

## RF-099 — Sistema deve recalcular métricas cognitivas após revisões

Status:
Proposto

Descrição:
O sistema deve atualizar métricas cognitivas sempre que novas revisões ocorrerem.

Objetivo:
Manter indicadores atualizados.

Prioridade:
P1

---

## RF-100 — Sistema deve preservar histórico cognitivo

Status:
Proposto

Descrição:
O sistema deve manter histórico completo da evolução cognitiva do usuário.

Objetivo:
Garantir rastreabilidade da aprendizagem.

Prioridade:
P1

Origem:

- Cognitive Engine
- Analytics

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para Analytics e Skill Acquisition.

# DOM-007 — Learning Motivation

## RF-101 — Sistema deve atribuir XP Cognitivo por atividades concluídas

Status:
Proposto

Descrição:
O sistema deve atribuir XP Cognitivo para atividades de aprendizagem concluídas.

Objetivo:
Fornecer feedback de progresso ao usuário.

Prioridade:
P1

Origem:

- Learning Motivation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
XP deve refletir esforço cognitivo real.

---

## RF-102 — Sistema deve registrar evolução de XP Cognitivo

Status:
Proposto

Descrição:
O sistema deve registrar o histórico de XP Cognitivo acumulado.

Objetivo:
Permitir visualização da evolução da aprendizagem.

Prioridade:
P1

Origem:

- Learning Motivation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para métricas motivacionais.

---

## RF-103 — Sistema deve exibir progresso de aprendizagem

Status:
Proposto

Descrição:
O sistema deve apresentar indicadores visuais de progresso da jornada de aprendizagem.

Objetivo:
Aumentar percepção de evolução.

Prioridade:
P1

Origem:

- UX Cognitiva

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Foco em motivação intrínseca.

---

## RF-104 — Sistema deve registrar streak de revisão

Status:
Proposto

Descrição:
O sistema deve registrar sequência de dias consecutivos com revisões realizadas.

Objetivo:
Estimular consistência de aprendizagem.

Prioridade:
P1

Origem:

- Learning Motivation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Não deve gerar ansiedade ou punição excessiva.

---

## RF-105 — Sistema deve registrar marcos de aprendizagem

Status:
Proposto

Descrição:
O sistema deve registrar eventos relevantes da evolução do usuário.

Objetivo:
Tornar o progresso perceptível.

Prioridade:
P1

Origem:

- Learning Motivation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Exemplos: primeira revisão, 100 flashcards, primeira habilidade consolidada.

---

## RF-106 — Sistema deve exibir conquistas cognitivas

Status:
Proposto

Descrição:
O sistema deve apresentar conquistas relacionadas ao desenvolvimento cognitivo.

Objetivo:
Reforçar comportamentos positivos.

Prioridade:
P1

Origem:

- Learning Motivation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Conquistas devem refletir aprendizado e não apenas volume.

---

## RF-107 — Sistema deve associar progresso às habilidades

Status:
Proposto

Descrição:
O sistema deve relacionar evolução do usuário às habilidades trabalhadas.

Objetivo:
Tornar a aprendizagem orientada por competências.

Prioridade:
P1

Origem:

- Skill Acquisition

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Integração futura com DOM-011.

---

## RF-108 — Sistema deve apresentar indicadores de consistência

Status:
Proposto

Descrição:
O sistema deve demonstrar frequência e regularidade das atividades de aprendizagem.

Objetivo:
Promover hábitos sustentáveis de estudo.

Prioridade:
P1

Origem:

- Learning Motivation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Priorizar constância em vez de intensidade.

---

## RF-109 — Sistema deve registrar histórico motivacional

Status:
Proposto

Descrição:
O sistema deve manter histórico dos eventos motivacionais relevantes.

Objetivo:
Permitir análise de engajamento ao longo do tempo.

Prioridade:
P2

Origem:

- Learning Motivation

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para Analytics.

---

## RF-110 — Sistema deve reforçar motivação baseada em progresso

Status:
Proposto

Descrição:
O sistema deve utilizar feedbacks positivos relacionados à evolução do aprendizado.

Objetivo:
Fortalecer motivação intrínseca.

Prioridade:
P1

Origem:

- UX Cognitiva
- Learning Science

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Evitar mecânicas puramente competitivas.

# DOM-011 — Skill Acquisition

## RF-111 — Usuário pode criar habilidades

Status:
Proposto

Descrição:
O sistema deve permitir criação de habilidades que o usuário deseja desenvolver.

Objetivo:
Transformar aprendizagem em evolução prática.

Prioridade:
P0

Origem:

- MPD
- Skill Acquisition

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Habilidades representam o resultado final da aprendizagem.

---

## RF-112 — Usuário pode visualizar habilidades

Status:
Proposto

Descrição:
O sistema deve permitir visualização das habilidades cadastradas.

Objetivo:
Permitir acompanhamento da evolução.

Prioridade:
P0

---

## RF-113 — Usuário pode editar habilidades

Status:
Proposto

Descrição:
O sistema deve permitir atualização das informações de uma habilidade.

Objetivo:
Manter alinhamento com objetivos do usuário.

Prioridade:
P1

---

## RF-114 — Usuário pode remover habilidades

Status:
Proposto

Descrição:
O sistema deve permitir remoção de habilidades cadastradas.

Objetivo:
Permitir gestão das competências.

Prioridade:
P1

---

## RF-115 — Sistema deve associar conteúdos às habilidades

Status:
Proposto

Descrição:
O sistema deve permitir vincular conteúdos de estudo às habilidades.

Objetivo:
Relacionar aprendizagem a competências.

Prioridade:
P0

---

## RF-116 — Sistema deve associar trilhas às habilidades

Status:
Proposto

Descrição:
O sistema deve permitir vincular trilhas de aprendizagem às habilidades.

Objetivo:
Criar jornadas estruturadas de desenvolvimento.

Prioridade:
P0

---

## RF-117 — Sistema deve associar sessões às habilidades

Status:
Proposto

Descrição:
O sistema deve relacionar sessões de estudo às habilidades trabalhadas.

Objetivo:
Mensurar esforço investido.

Prioridade:
P0

---

## RF-118 — Sistema deve calcular progresso da habilidade

Status:
Proposto

Descrição:
O sistema deve calcular evolução da habilidade com base em atividades realizadas.

Objetivo:
Permitir acompanhamento da aquisição da competência.

Prioridade:
P0

---

## RF-119 — Sistema deve exibir progresso visual da habilidade

Status:
Proposto

Descrição:
O sistema deve apresentar indicadores visuais da evolução da habilidade.

Objetivo:
Aumentar percepção de progresso.

Prioridade:
P1

---

## RF-120 — Sistema deve registrar histórico da habilidade

Status:
Proposto

Descrição:
O sistema deve manter histórico de evolução da habilidade.

Objetivo:
Garantir rastreabilidade do aprendizado.

Prioridade:
P1

---

## RF-121 — Sistema deve identificar habilidades em risco

Status:
Proposto

Descrição:
O sistema deve identificar habilidades sem atividade recente ou com baixa retenção.

Objetivo:
Evitar regressão do aprendizado.

Prioridade:
P1

---

## RF-122 — Sistema deve recomendar ações para evolução da habilidade

Status:
Proposto

Descrição:
O sistema deve sugerir estudos, revisões ou exercícios relacionados à habilidade.

Objetivo:
Acelerar desenvolvimento da competência.

Prioridade:
P1

---

## RF-123 — Sistema deve identificar habilidades consolidadas

Status:
Proposto

Descrição:
O sistema deve identificar habilidades que atingiram critérios mínimos de consolidação.

Objetivo:
Mensurar resultados reais da aprendizagem.

Prioridade:
P1

---

## RF-124 — Sistema deve exibir dashboard de habilidades

Status:
Proposto

Descrição:
O sistema deve apresentar visão consolidada das habilidades do usuário.

Objetivo:
Centralizar acompanhamento da evolução.

Prioridade:
P1

---

## RF-125 — Sistema deve permitir organização hierárquica de habilidades

Status:
Proposto

Descrição:
O sistema deve permitir estruturação de habilidades em níveis ou categorias.

Objetivo:
Representar domínios complexos de conhecimento.

Prioridade:
P2

---

## RF-126 — Sistema deve suportar árvore de habilidades

Status:
Proposto

Descrição:
O sistema deve permitir visualização de habilidades em formato de árvore evolutiva.

Objetivo:
Representar progressão de competências.

Prioridade:
P2

---

## RF-127 — Sistema deve relacionar habilidades dependentes

Status:
Proposto

Descrição:
O sistema deve permitir definição de pré-requisitos entre habilidades.

Objetivo:
Orientar evolução estruturada.

Prioridade:
P2

---

## RF-128 — Sistema deve registrar marcos de consolidação

Status:
Proposto

Descrição:
O sistema deve registrar eventos relevantes relacionados à evolução de habilidades.

Objetivo:
Tornar progresso perceptível.

Prioridade:
P1

---

## RF-129 — Sistema deve preservar ownership das habilidades

Status:
Proposto

Descrição:
O sistema deve garantir que habilidades sejam acessíveis apenas ao usuário proprietário.

Objetivo:
Garantir segurança e privacidade.

Prioridade:
P0

---

## RF-130 — Sistema deve preservar histórico de evolução das habilidades

Status:
Proposto

Descrição:
O sistema deve manter histórico completo da evolução das habilidades.

Objetivo:
Permitir análises futuras e rastreabilidade.

Prioridade:
P1

Origem:

- Skill Acquisition
- Analytics

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para métricas de longo prazo.

# DOM-008 — AI Learning Companion

## RF-131 — Sistema deve gerar perguntas a partir do conteúdo estudado

Status:
Proposto

Descrição:
O sistema deve permitir geração automática de perguntas relacionadas ao conteúdo estudado.

Objetivo:
Estimular recuperação ativa.

Prioridade:
P1

Origem:

- AI Learning Companion

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Perguntas devem considerar contexto do conteúdo.

---

## RF-132 — Sistema deve gerar flashcards automaticamente

Status:
Proposto

Descrição:
O sistema deve permitir geração automática de flashcards a partir do conteúdo estudado.

Objetivo:
Acelerar construção do material de revisão.

Prioridade:
P1

---

## RF-133 — Sistema deve gerar exercícios automaticamente

Status:
Proposto

Descrição:
O sistema deve permitir geração automática de exercícios.

Objetivo:
Promover aplicação prática.

Prioridade:
P1

---

## RF-134 — Sistema deve sugerir revisões prioritárias

Status:
Proposto

Descrição:
O sistema deve recomendar revisões com base no Cognitive Engine.

Objetivo:
Aumentar retenção.

Prioridade:
P1

---

## RF-135 — Sistema deve sugerir conteúdos complementares

Status:
Proposto

Descrição:
O sistema deve recomendar conteúdos relacionados ao tema estudado.

Objetivo:
Expandir aprendizagem.

Prioridade:
P2

---

## RF-136 — Sistema deve identificar lacunas de conhecimento

Status:
Proposto

Descrição:
O sistema deve identificar áreas onde o usuário apresenta baixo desempenho ou baixa retenção.

Objetivo:
Direcionar evolução.

Prioridade:
P1

---

## RF-137 — Sistema deve sugerir melhorias em explicações produzidas

Status:
Proposto

Descrição:
O sistema deve analisar explicações criadas pelo usuário e sugerir melhorias.

Objetivo:
Aprimorar entendimento.

Prioridade:
P1

---

## RF-138 — Sistema deve auxiliar construção de habilidades

Status:
Proposto

Descrição:
O sistema deve sugerir conteúdos, revisões e exercícios relacionados às habilidades.

Objetivo:
Acelerar aquisição de competências.

Prioridade:
P1

---

## RF-139 — Sistema deve responder dúvidas relacionadas ao conteúdo estudado

Status:
Proposto

Descrição:
O sistema deve permitir esclarecimento contextualizado de dúvidas.

Objetivo:
Apoiar processo de aprendizagem.

Prioridade:
P1

---

## RF-140 — Sistema deve preservar contexto da conversa educacional

Status:
Proposto

Descrição:
O sistema deve considerar histórico e contexto de aprendizagem durante interações.

Objetivo:
Garantir continuidade cognitiva.

Prioridade:
P1

---

## RF-141 — Sistema deve registrar interações com IA

Status:
Proposto

Descrição:
O sistema deve armazenar histórico das interações educacionais realizadas.

Objetivo:
Garantir rastreabilidade.

Prioridade:
P1

---

## RF-142 — Sistema deve associar interações ao conteúdo estudado

Status:
Proposto

Descrição:
Toda interação da IA deve ser vinculada ao conteúdo relacionado.

Objetivo:
Preservar contexto.

Prioridade:
P1

---

## RF-143 — Sistema deve associar interações às habilidades trabalhadas

Status:
Proposto

Descrição:
A IA deve relacionar suas recomendações às habilidades em evolução.

Objetivo:
Aumentar valor educacional.

Prioridade:
P1

---

## RF-144 — Sistema deve respeitar ownership dos dados utilizados

Status:
Proposto

Descrição:
A IA deve utilizar apenas dados pertencentes ao usuário autenticado.

Objetivo:
Garantir segurança e privacidade.

Prioridade:
P0

---

## RF-145 — Sistema deve explicar recomendações realizadas

Status:
Proposto

Descrição:
O sistema deve justificar recomendações apresentadas ao usuário.

Objetivo:
Aumentar confiança e transparência.

Prioridade:
P1

---

## RF-146 — Sistema deve adaptar recomendações ao perfil de aprendizagem

Status:
Proposto

Descrição:
A IA deve considerar comportamento, histórico e preferências do usuário.

Objetivo:
Personalizar experiência.

Prioridade:
P2

---

## RF-147 — Sistema deve sugerir próximos passos de estudo

Status:
Proposto

Descrição:
A IA deve recomendar ações futuras para evolução do aprendizado.

Objetivo:
Reduzir incerteza sobre o que estudar.

Prioridade:
P1

---

## RF-148 — Sistema deve apoiar construção de trilhas de aprendizagem

Status:
Proposto

Descrição:
A IA deve auxiliar organização de conteúdos em jornadas estruturadas.

Objetivo:
Facilitar planejamento.

Prioridade:
P2

---

## RF-149 — Sistema deve apoiar revisão inteligente

Status:
Proposto

Descrição:
A IA deve auxiliar seleção dos materiais mais relevantes para revisão.

Objetivo:
Aumentar eficiência da aprendizagem.

Prioridade:
P1

---

## RF-150 — Sistema deve preservar privacidade das interações educacionais

Status:
Proposto

Descrição:
O sistema deve garantir proteção das conversas e interações realizadas com a IA.

Objetivo:
Garantir segurança e confiança.

Prioridade:
P0

Origem:

- AI Learning Companion
- Security

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para conformidade com LGPD e privacidade educacional.

# DOM-010 — Security

## RF-151 — Sistema deve validar autenticação para recursos protegidos

Status:
Proposto

Descrição:
O sistema deve exigir autenticação para acesso a recursos protegidos.

Objetivo:
Garantir acesso seguro aos dados.

Prioridade:
P0

Origem:

- Security

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para proteção da plataforma.

---

## RF-152 — Sistema deve validar autorização para ações protegidas

Status:
Proposto

Descrição:
O sistema deve validar permissões antes da execução de ações protegidas.

Objetivo:
Garantir controle de acesso.

Prioridade:
P0

Origem:

- Security

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Deve seguir princípio do menor privilégio.

---

## RF-153 — Sistema deve aplicar isolamento multi-tenant

Status:
Proposto

Descrição:
O sistema deve garantir isolamento entre dados de usuários diferentes.

Objetivo:
Evitar vazamento de dados.

Prioridade:
P0

Origem:

- Security
- Multi-Tenant

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Fundação da arquitetura de segurança.

---

## RF-154 — Sistema deve aplicar ownership obrigatório dos recursos

Status:
Proposto

Descrição:
Todo recurso deve possuir proprietário definido.

Objetivo:
Garantir controle de acesso baseado em ownership.

Prioridade:
P0

Origem:

- Security

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Aplicável a conteúdos, trilhas, sessões e habilidades.

---

## RF-155 — Sistema deve impedir acesso a recursos de terceiros

Status:
Proposto

Descrição:
O sistema deve impedir visualização, edição ou remoção de recursos pertencentes a outros usuários.

Objetivo:
Garantir privacidade.

Prioridade:
P0

Origem:

- Security

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Aplicável em frontend e backend.

---

## RF-156 — Sistema deve registrar eventos de segurança

Status:
Proposto

Descrição:
O sistema deve registrar eventos relacionados à segurança da plataforma.

Objetivo:
Garantir rastreabilidade.

Prioridade:
P0

Origem:

- Security
- Audit

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para observabilidade.

---

## RF-157 — Sistema deve registrar auditoria de autenticação

Status:
Proposto

Descrição:
O sistema deve registrar eventos de login, logout e recuperação de senha.

Objetivo:
Garantir rastreabilidade de acesso.

Prioridade:
P0

---

## RF-158 — Sistema deve registrar auditoria de alterações

Status:
Proposto

Descrição:
O sistema deve registrar alterações realizadas em recursos críticos.

Objetivo:
Permitir investigação futura.

Prioridade:
P0

---

## RF-159 — Sistema deve registrar auditoria de exclusões

Status:
Proposto

Descrição:
O sistema deve registrar exclusões realizadas pelos usuários.

Objetivo:
Garantir rastreabilidade.

Prioridade:
P0

---

## RF-160 — Sistema deve preservar integridade dos registros auditáveis

Status:
Proposto

Descrição:
O sistema deve proteger registros de auditoria contra alteração ou remoção indevida.

Objetivo:
Garantir confiabilidade.

Prioridade:
P0

---

## RF-161 — Sistema deve proteger dados pessoais dos usuários

Status:
Proposto

Descrição:
O sistema deve proteger informações pessoais armazenadas.

Objetivo:
Garantir conformidade com LGPD.

Prioridade:
P0

---

## RF-162 — Sistema deve permitir exportação dos dados do usuário

Status:
Proposto

Descrição:
O sistema deve permitir exportação dos dados pertencentes ao usuário.

Objetivo:
Garantir portabilidade.

Prioridade:
P1

---

## RF-163 — Sistema deve permitir exclusão da conta do usuário

Status:
Proposto

Descrição:
O sistema deve permitir solicitação de exclusão da conta.

Objetivo:
Garantir direitos do titular dos dados.

Prioridade:
P1

---

## RF-164 — Sistema deve invalidar sessões comprometidas

Status:
Proposto

Descrição:
O sistema deve invalidar sessões consideradas inseguras.

Objetivo:
Reduzir riscos de acesso indevido.

Prioridade:
P1

---

## RF-165 — Sistema deve proteger interações com IA

Status:
Proposto

Descrição:
O sistema deve garantir segurança das interações realizadas com a IA.

Objetivo:
Proteger dados educacionais.

Prioridade:
P0

---

## RF-166 — Sistema deve aplicar políticas de acesso seguras por padrão

Status:
Proposto

Descrição:
O sistema deve adotar configuração segura como comportamento padrão.

Objetivo:
Reduzir riscos operacionais.

Prioridade:
P0

---

## RF-167 — Sistema deve registrar tentativas de acesso negadas

Status:
Proposto

Descrição:
O sistema deve registrar eventos de acesso bloqueado.

Objetivo:
Auxiliar monitoramento e segurança.

Prioridade:
P1

---

## RF-168 — Sistema deve proteger recursos contra acesso direto por URL

Status:
Proposto

Descrição:
O sistema deve validar permissões independentemente da navegação da interface.

Objetivo:
Evitar bypass de segurança.

Prioridade:
P0

---

## RF-169 — Sistema deve garantir rastreabilidade de ações críticas

Status:
Proposto

Descrição:
O sistema deve manter histórico das ações críticas executadas.

Objetivo:
Permitir auditoria completa.

Prioridade:
P0

---

## RF-170 — Sistema deve preservar privacidade dos dados educacionais

Status:
Proposto

Descrição:
O sistema deve proteger todo conhecimento produzido pelo usuário.

Objetivo:
Garantir confiança e segurança da plataforma.

Prioridade:
P0

Origem:

- Security
- LGPD
- Privacy

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Dados educacionais são ativos críticos do NeuroLearn.

# DOM-009 — Learning Analytics

## RF-171 — Sistema deve disponibilizar dashboard de aprendizagem

Status:
Proposto

Descrição:
O sistema deve disponibilizar um dashboard consolidado com indicadores da jornada de aprendizagem.

Objetivo:
Permitir acompanhamento da evolução do usuário.

Prioridade:
P1

Origem:

- Learning Analytics

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Dashboard principal do NeuroLearn.

---

## RF-172 — Sistema deve exibir tempo acumulado de estudo

Status:
Proposto

Descrição:
O sistema deve apresentar o tempo total investido em atividades de aprendizagem.

Objetivo:
Tornar o esforço visível.

Prioridade:
P1

---

## RF-173 — Sistema deve exibir quantidade de conteúdos estudados

Status:
Proposto

Descrição:
O sistema deve apresentar quantidade de conteúdos consumidos pelo usuário.

Objetivo:
Mensurar exposição ao conhecimento.

Prioridade:
P1

---

## RF-174 — Sistema deve exibir quantidade de revisões realizadas

Status:
Proposto

Descrição:
O sistema deve apresentar quantidade de revisões concluídas.

Objetivo:
Mensurar prática de retenção.

Prioridade:
P1

---

## RF-175 — Sistema deve exibir indicadores de retenção

Status:
Proposto

Descrição:
O sistema deve apresentar indicadores relacionados à retenção dos conteúdos estudados.

Objetivo:
Permitir acompanhamento da memória de longo prazo.

Prioridade:
P1

---

## RF-176 — Sistema deve exibir evolução cognitiva

Status:
Proposto

Descrição:
O sistema deve apresentar evolução cognitiva do usuário ao longo do tempo.

Objetivo:
Demonstrar crescimento intelectual.

Prioridade:
P1

---

## RF-177 — Sistema deve exibir evolução das habilidades

Status:
Proposto

Descrição:
O sistema deve apresentar progresso das habilidades cadastradas.

Objetivo:
Mensurar aquisição de competências.

Prioridade:
P1

---

## RF-178 — Sistema deve exibir habilidades consolidadas

Status:
Proposto

Descrição:
O sistema deve apresentar habilidades consideradas consolidadas.

Objetivo:
Tornar resultados tangíveis.

Prioridade:
P1

---

## RF-179 — Sistema deve exibir habilidades em risco

Status:
Proposto

Descrição:
O sistema deve identificar habilidades com baixa atividade ou baixa retenção.

Objetivo:
Evitar regressão de competências.

Prioridade:
P1

---

## RF-180 — Sistema deve exibir consistência de estudo

Status:
Proposto

Descrição:
O sistema deve apresentar frequência e regularidade das atividades realizadas.

Objetivo:
Estimular hábitos sustentáveis.

Prioridade:
P1

---

## RF-181 — Sistema deve exibir indicadores de atividade recente

Status:
Proposto

Descrição:
O sistema deve apresentar resumo das atividades realizadas recentemente.

Objetivo:
Facilitar acompanhamento da jornada.

Prioridade:
P2

---

## RF-182 — Sistema deve exibir progresso por trilha

Status:
Proposto

Descrição:
O sistema deve apresentar evolução das trilhas de aprendizagem.

Objetivo:
Permitir acompanhamento contextual.

Prioridade:
P1

---

## RF-183 — Sistema deve exibir progresso por conteúdo

Status:
Proposto

Descrição:
O sistema deve apresentar evolução dos conteúdos estudados.

Objetivo:
Facilitar análise granular.

Prioridade:
P2

---

## RF-184 — Sistema deve exibir métricas de revisão

Status:
Proposto

Descrição:
O sistema deve apresentar métricas relacionadas às revisões executadas.

Objetivo:
Apoiar Cognitive Engine.

Prioridade:
P1

---

## RF-185 — Sistema deve exibir métricas de exercícios

Status:
Proposto

Descrição:
O sistema deve apresentar indicadores relacionados aos exercícios realizados.

Objetivo:
Mensurar aplicação prática.

Prioridade:
P1

---

## RF-186 — Sistema deve exibir marcos de aprendizagem

Status:
Proposto

Descrição:
O sistema deve apresentar eventos relevantes da evolução do usuário.

Objetivo:
Reforçar percepção de progresso.

Prioridade:
P1

---

## RF-187 — Sistema deve registrar eventos analíticos

Status:
Proposto

Descrição:
O sistema deve registrar eventos necessários para geração de métricas e indicadores.

Objetivo:
Garantir rastreabilidade dos dados.

Prioridade:
P1

---

## RF-188 — Sistema deve permitir análise histórica

Status:
Proposto

Descrição:
O sistema deve permitir visualização da evolução ao longo do tempo.

Objetivo:
Permitir comparação e acompanhamento.

Prioridade:
P2

---

## RF-189 — Sistema deve suportar métricas cognitivas futuras

Status:
Proposto

Descrição:
A arquitetura deve permitir inclusão de novos indicadores cognitivos.

Objetivo:
Garantir escalabilidade analítica.

Prioridade:
P2

---

## RF-190 — Sistema deve disponibilizar indicadores da North Star Metric

Status:
Proposto

Descrição:
O sistema deve apresentar métricas relacionadas à evolução das habilidades do usuário.

Objetivo:
Mensurar sucesso do produto.

Prioridade:
P0

Origem:

- Learning Analytics
- Product Strategy

Relacionamentos:

## RN:

## RNF:

## CA:

## TC:

Observações:
Base para a North Star do NeuroLearn.
