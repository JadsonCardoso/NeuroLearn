# RF Catalog

Projeto: NeuroLearn

Versão: 1.0

Status: Oficial

Última atualização: 2026-06-11

Responsável: Product Governance

---

# Domínios

- DOM-001 — Identity & Access
- DOM-002 — Learning Content
- DOM-003 — Learning Trails
- DOM-004 — Study Sessions
- DOM-005 — Review Engine
- DOM-006 — Cognitive Engine
- DOM-007 — Gamification
- DOM-008 — AI Learning Assistant
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

Observações:
Base para isolamento multi-tenant.
