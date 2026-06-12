# Sprint 02 — Lessons Learned

**Projeto:** NeuroLearn
**Sprint:** 02 — Knowledge Structure
**Período:** 2026-06-11 a 2026-06-12
**Score:** 96/100
**Data:** 2026-06-12

> Lições capturadas exclusivamente a partir dos eventos, decisões e resultados desta sprint.
> Destinam-se a alimentar o planejamento e a execução da Sprint 03.

---

## 1. Produto

### A camada de organização é pré-requisito para a camada de inteligência

A Sprint 02 entregou a estrutura que permite ao usuário _encontrar_ o que já aprendeu antes
de otimizar _como_ aprender. Projetos → Trilhas → Conteúdos criaram um modelo mental claro
que o Sprint 03 (Cognitive Engine) poderá explorar com qualidade. Uma feature de inteligência
construída sobre uma biblioteca plana teria valor limitado — a sequência foi correta.

### Filtros multidimensionais mudam a relação do usuário com o acervo

A combinação de busca textual + filtro por tipo + filtro por status + filtro por projeto/trilha
transforma a LibraryView de um repositório passivo em uma ferramenta de navegação ativa.
O usuário deixa de _rolar_ e passa a _pesquisar_. Isso é produto, não feature técnica.

### Texto de UI (subtítulos, contadores) é critério de aceite, não detalhe de implementação

O BUG-05 — subtitle inconsistency quando filtros por projeto/trilha ocultam seções inteiras —
revelou que o copy da interface carrega lógica de negócio. A contagem `"N resultado(s) de M conteúdos"`
precisa ser definida no RF com a mesma precisão que as regras de filtro. Textos de UI que dependem
de estado calculado devem ter AC explícito.

### Completion épics dentro de uma sprint regular criam sobrecarga oculta

O Épico 2 (Completion Sprint 01) foi necessário mas não estava no objetivo central da Sprint 02.
Ele consumiu capacidade e atenção que poderiam ter aprofundado a cobertura de Navigation.
Pendências de uma sprint devem ser resolvidas no início da sprint seguinte com épico explícito,
não absorvidas silenciosamente.

---

## 2. Arquitetura

### Two-axis para filtros multidimensionais: padrão reutilizável

A separação entre `filteredTrails` (eixo de seções — quais trilhas aparecem) e `visibleFiltered`
(eixo de conteúdos — quais itens aparecem dentro das trilhas visíveis) eliminou acoplamento e
permitiu adicionar 7 filtros distintos sem aumentar complexidade. O `useMemo` derivado previne
re-renderização desnecessária.

**Padrão:** quando uma view tem seções (grupos) e itens dentro de seções, filtrar os dois eixos
independentemente antes de compor a UI. Aplicar em qualquer nova view com estrutura hierárquica.

### Reducer como espelho de cascades do banco

O `dispatch({ type: 'DELETE_PROJECT' })` que seta `projectId: null` nas trilhas associadas
espelha o `FK ON DELETE SET NULL` do banco. A consequência: a UI reflete a desassociação
imediatamente, sem polling. Esse padrão garante consistência entre estado local e banco
sem custo de rede adicional.

**Regra derivada:** qualquer cascade implícita no banco (ON DELETE SET NULL / CASCADE) deve
ter ação correspondente no reducer. A UI nunca deve depender de um `refetch` para refletir
consequências de exclusão.

### Lazy-load em seções colapsáveis reduz carga inicial

`ExercisesSection` carrega dados via `listExercisesByContent` apenas na primeira expansão.
Seções que exibem dados secundários (exercícios, highlights, notas) não devem ser carregadas
com o componente pai — apenas quando o usuário expressa intenção de vê-las.

### isDirty guard como proteção arquitetural, não UI cosmética

Desabilitar o botão "Salvar" quando `!isDirty` não é cosmética — previne chamadas
desnecessárias ao banco e evita que o usuário salve acidentalmente um formulário sem
modificações, gerando um `updated_at` falso. Aplicar em todos os modais de edição.

### NFD normalization deve ser shared utility, nunca inline

A função `normalize(text)` — `text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()` —
foi implementada em `filterLogic.ts`. Toda busca client-side em PT-BR deve reutilizar essa função.
Reimplementar inline é um risco de divergência silenciosa.

---

## 3. QA

### O QA Estratégico captura o que testes unitários e type-check não capturam

O BUG-04 — ausência de try/catch em `ProjectFormModal.onSubmit` — não foi detectado pelos
484 testes unitários nem pelo type-check. Foi identificado pelo QA Estratégico (Fase 06),
durante revisão de padrões de erro. Testes unitários validam _o que o código faz_;
QA estratégico valida _o que o código omite_.

**Consequência:** o QA Estratégico não é etapa opcional — é a última barreira antes
de falhas silenciosas chegarem ao usuário. Executar obrigatoriamente antes de qualquer aprovação.

### Gate técnico por épico, não apenas ao final da sprint

Executar `type-check + lint + test:unit + build` após cada épico localiza regressões próximas
ao ponto de introdução. O custo de corrigir um erro de tipo no mesmo dia é zero comparado
ao custo de identificar a origem dias depois. Na Sprint 02, nenhuma regressão foi tardia.

### Testes E2E stateful são confiáveis apenas com fixtures explícitas

Os testes de CRUD de sessão dependem de sessões de Focus preexistentes. Em CI limpo, esses
TCs são condicionais. A ausência de fixtures não é um problema de teste — é um problema de
planejamento. Módulos stateful (que dependem de dados criados por outros módulos) precisam
de fixtures que criam o estado necessário antes da suíte executar.

### Cenários multi-entidade exigem helpers de seed planejados na spec

O cenário RN-004 (trilha já associada a outro projeto aparece desabilitada no AssignTrailModal)
foi coberto por unitários mas ficou sem cobertura E2E porque o teste requer dois projetos e uma
trilha compartilhada. Setup multi-entidade deve ser identificado na especificação do plano de
testes — não descoberto durante a escrita do spec E2E.

### 96/100 indica maturidade de processo, não perfeição de produto

Os 4 pontos perdidos correspondem a gaps de cobertura (BUG-05, fixtures stateful), não a
falhas de implementação. Isso é um sinal positivo: o processo está maduro o suficiente para
entregar implementações corretas; a próxima evolução é a infraestrutura de testes.

---

## 4. Governança

### Riscos aceitos devem ter justificativa documentada e dono definido

O BUG-05 e o R-07-01 foram aceitos como known issues com justificativa explícita
("baixa severidade para MVP", "design correto para testes stateful") e registrados
no Release Candidate. Aceitar um risco sem documentar é acumular dívida invisível.
Aceitar com registro é gestão consciente.

### O processo Problema → Discovery → RF → RN → Implementação → QA → Automação não deve ser encurtado

A Sprint 02 seguiu o pipeline integral. A Discovery identificou RN-004 antes de qualquer código
existir — o que evitou um bug de concorrência que só seria descoberto em produção. Toda vez que
uma etapa é pulada para "ganhar velocidade", o custo aparece em retrabalho ou em produção.

### ADRs devem ser consultados na Discovery, não apenas na Implementação

Os ADRs 004, 006, 016 e 018 foram verificados durante a implementação. A verificação seria
mais eficiente se a Discovery listasse os ADRs impactados como artefato explícito — antes
da geração dos RFs. Isso evita ajustes de implementação que poderiam ter sido requisitos.

### Known issues precisam de dono e prazo para não se tornarem dívida permanente

BUG-05 foi aceito para Sprint 03. Se não houver um item explícito no backlog da Sprint 03
com esse ID, o bug sobreviverá indefinidamente. Toda pendência aceita deve gerar um ticket
concreto na sprint seguinte — não apenas uma nota em documento.

---

## 5. DDD

### `projectsService` como bounded service com invariantes de domínio explícitas

O `projectsService.ts` encapsula ownership, RN-004, RN-005, RN-009, RN-013, RN-015 e RN-016.
Nenhuma dessas regras vaza para a view ou para o reducer. A view chama o serviço; o serviço
decide se a operação é permitida. Esse isolamento permite testar as regras de negócio
independentemente da UI.

### `filterLogic.ts` como módulo de domínio separado da view

A lógica de filtro (normalize, filterContents, filterTrailsForSection, filterProjects) foi
extraída para `filterLogic.ts` com 30 testes unitários. A LibraryView consome `filterLogic`
sem conhecer sua implementação. Lógica de filtragem que cresceu na Sprint 02 poderá evoluir
na Sprint 03 sem tocar na view.

### Reducer como ponto único de mutação do estado de domínio

O AppContext reducer é a única fonte que altera o estado em memória. Qualquer operação que
afeta múltiplos domínios (ex.: DELETE_PROJECT afeta Projects E Trails) é resolvida no reducer,
não na view. Isso garante que o estado global permaneça consistente após qualquer operação.

### Domínios Projects e Library não se acoplam diretamente

O filtro por projeto em LibraryView é implementado via `filterProjects(state.projects, ...)` —
o domínio de Library acessa os dados de Projects via estado compartilhado, não via import
direto do módulo Projects. Os limites de domínio foram respeitados.

---

## 6. Spec Driven

### A Discovery encontrou RN-004 antes do código existir

Durante a Discovery do Épico 1, a pergunta "uma trilha pode estar em mais de um projeto?"
revelou RN-004 (trilha pertence a no máximo um projeto). Se essa regra tivesse sido descoberta
durante a implementação do AssignTrailModal, teria gerado retrabalho no `projectsService`,
no reducer e no modal. A Discovery economizou pelo menos um ciclo de correção.

### RFs com dependência entre si devem ser especificados em sequência

RF-206 (filtro por projeto) e RF-207 (filtro por trilha) são dependentes — filtrar por projeto
restringe as trilhas disponíveis no RF-207. A sequência de especificação capturou essa
dependência naturalmente. Especificar RFs independentemente teria gerado inconsistência.

### Plano de testes antes da implementação identificou cenários multi-entidade

O `TEST-SPRINT-02-KNOWLEDGE-STRUCTURE.md` foi gerado antes da implementação. Ele identificou
que RN-004 exigiria dois projetos no setup E2E — mas esse requisito não foi convertido em
helper de seed antes da implementação. Na Sprint 03, a spec de testes deve incluir
explicitamente os helpers necessários, não apenas os cenários.

### RFs de "extensão" devem ser rastreados com clareza

RF-203 (busca por conteúdo) existia desde antes da Sprint 02. Foi estendido para incluir
`trailTitle` no critério de busca. Essa extensão foi registrada como "✅ APROVADO (existia,
estendido)" — correto. Extensões de RFs existentes têm impacto em regressão e devem ser
marcadas explicitamente para que os testes de regressão sejam atualizados.

---

## 7. IA

### O motor cognitivo (SM-2, retenção, mastery) foi preservado sem alteração

A Sprint 02 não tocou em `src/engine/`. Os algoritmos SM-2, decaimento exponencial e mastery
score permanecem intactos e prontos para a Sprint 03. A separação entre a camada de organização
(Sprint 02) e a camada de inteligência (Sprint 03) foi uma decisão arquitetural correta —
construir inteligência sobre dados estruturados é mais eficiente do que sobre dados planos.

### QA Estratégico como inteligência aplicada ao processo

O QA Estratégico (skill) aplicou heurísticas estruturadas (CHIQUE, CREA, ALTER FACE) e
identificou BUG-04 — uma falha de padrão, não de lógica. Esse tipo de análise sistemática
complementa o que testes automatizados fazem. Para a Sprint 03, o QA Estratégico terá
domínios mais complexos para analisar (engine cognitivo, scores, decaimento) — a skill
será ainda mais crítica.

### Features de IA (geração de flashcards, modo professor) não regrediam

Os módulos de IA existentes — geração de flashcards via claude-haiku-4-5 e análise do
Modo Professor — não foram impactados pela Sprint 02. A suite de regressão (global-regression.spec.ts)
confirmou que nenhum fluxo de IA foi quebrado. Isolar mudanças estruturais das features
de IA existentes é uma prática de risco que funcionou corretamente nesta sprint.

### A Sprint 03 exigirá decisões de IA com implicações de UX

Retention Score, Knowledge Decay e Priority Engine produzirão valores numéricos que precisarão
de representação visual compreensível. A forma como esses números são exibidos (badges,
gráficos, alertas, cores) é uma decisão de produto com impacto em confiança do usuário.
A Discovery da Sprint 03 deve incluir a definição dessa linguagem visual antes da implementação.

---

## 8. Tomada de Decisão

### BUG-05 aceito como known issue — decisão correta

O subtitle inconsistency em LibraryView foi identificado tarde no ciclo. A correção exigiria
refatorar a lógica de contagem em `filteredTrails` — escopo não planejado. A decisão de aceitar
e documentar foi correta: o impacto é baixo (texto de UI, não dado incorreto), o usuário
não é induzido a erro, e a correção tem slot na Sprint 03. Aceitar com registro é diferente
de ignorar.

### isDirty guard: decisão de UX com implicação de banco

Desabilitar o botão "Salvar" quando nenhum campo foi alterado foi uma decisão tomada durante
a implementação de RF-193 (editar projeto). Poderia ter sido RF explícito. O padrão foi
estendido a todos os modais de edição da sprint. Decisões de UX que têm impacto em
comportamento de banco devem ser capturadas como RN ou AC — não deixadas implícitas.

### DELETE_PROJECT no reducer: trade-off entre consistência imediata e complexidade

A opção alternativa era aguardar um refetch após a exclusão para refletir as trilhas
desassociadas. A decisão de espelhar o cascade no reducer entrega UX mais fluido ao
custo de lógica duplicada (banco e estado local). O trade-off foi aceito explicitamente.
Para operações de exclusão com cascades, preferir a consistência imediata.

### Épico de Completion dentro da sprint: decisão de capacidade, não de arquitetura

Incluir o Completion Sprint 01 como Épico 2 foi uma decisão de gestão — encerrar dívida
pendente antes de iniciar o Cognitive Engine. A decisão foi correta mas o custo foi
visível: 3 features de completion consumiram capacidade equivalente a 3-4 RFs do
Épico de Navigation. Pendências devem ter épico próprio e estimativa explícita.

---

## 9. O que Repetir

| Prática                                                                           | Por quê Funcionou                                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Pipeline completo Problema → Discovery → RF → RN → Implementação → QA → Automação | RN-004 descoberta antes do código; zero retrabalho de spec                      |
| Gate técnico após cada épico (não apenas no final)                                | Regressões encontradas próximas ao ponto de introdução                          |
| Ownership First como invariante desde o design, não como afterthought             | Eliminou categoria de IDOR antes da implementação                               |
| QA Estratégico antes de qualquer aprovação                                        | BUG-04 capturado — testes unitários não capturam ausência de tratamento de erro |
| Documentação formal de riscos aceitos com justificativa                           | Known issues rastreáveis, sem dívida invisível                                  |
| Two-axis pattern para filtros com hierarquia                                      | 7 filtros implementados sem acoplamento                                         |
| Reducer espelhando cascades do banco                                              | Consistência UI/DB imediata sem polling                                         |
| isDirty guard em todos os modais de edição                                        | UX correto + proteção contra updates desnecessários no banco                    |
| NFD normalization como shared utility                                             | Buscas PT-BR corretas em todos os módulos                                       |

---

## 10. O que Evitar

| Anti-padrão                                                | Consequência Observada na Sprint 02                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Testes E2E stateful sem fixtures de setup                  | TCs de MemoryView condicionais em CI limpo; cobertura real menor que a aparente |
| RFs de filtro sem AC para contadores e subtítulos          | BUG-05: subtitle inconsistency descoberta na validação, não na spec             |
| Verificar ADRs apenas na implementação, não na Discovery   | Ajustes de implementação que poderiam ter sido requisitos                       |
| Cenários multi-entidade sem helpers de seed planejados     | RN-004 ficou sem cobertura E2E — custo de retrofit maior que custo de planejar  |
| Absorver completion épics sem estimativa explícita         | Capacidade oculta consumida; impacto visível no escopo de Navigation            |
| Aceitar risco sem gerar ticket concreto na sprint seguinte | BUG-05 pode virar dívida permanente se não houver item explícito no backlog     |

---

## 11. O que Evoluir

| Área                     | Evolução                                                                           | Prioridade | Sprint Alvo |
| ------------------------ | ---------------------------------------------------------------------------------- | ---------- | ----------- |
| Infraestrutura de testes | Fixtures Playwright para módulos stateful (sessões de Focus, MemoryView)           | P0         | Sprint 03   |
| Processo de spec         | Adicionar "ADRs impactados" como artefato explícito da Discovery                   | P1         | Sprint 03   |
| Plano de testes          | Identificar helpers de seed necessários antes de escrever specs E2E multi-entidade | P1         | Sprint 03   |
| Critérios de aceite      | Incluir comportamento de contadores e subtítulos em RFs de filtro                  | P1         | Sprint 03   |
| Cobertura E2E            | Cenário RN-004 em AssignTrailModal com dois projetos simultâneos                   | P1         | Sprint 03   |
| Gestão de pendências     | Converter cada known issue aceito em ticket explícito antes de encerrar a sprint   | P1         | Sprint 03   |
| UI do Cognitive Engine   | Definir linguagem visual de scores e alertas na Discovery antes da implementação   | P1         | Sprint 03   |
| Produto                  | Corrigir BUG-05 (subtitle inconsistency em LibraryView com filtros ativos)         | P2         | Sprint 03   |

---

_Lessons Learned capturados em 2026-06-12 com base exclusivamente nos eventos da Sprint 02._
