'use client'

import { useState } from 'react'

interface HelpModule {
  id: string
  icon: string
  title: string
  color: string
  tagline: string
  steps: { n: string; t: string; d: string }[]
  tip: string
  science: string
}

const MODULES: HelpModule[] = [
  {
    id: 'dashboard',
    icon: '📊',
    title: 'Dashboard',
    color: '#7c3aed',
    tagline: 'Sua central de comando diária',
    steps: [
      {
        n: '1',
        t: 'Veja as revisões do dia',
        d: 'Toda vez que abrir o app, o painel mostra quantos flashcards estão vencidos. Sempre comece por aqui.',
      },
      {
        n: '2',
        t: 'Cheque seu Cognitive Score',
        d: 'O score 0–100 combina retenção, mastery, consistência e aprendizado ativo. Verde (70+) = sólido. Amarelo (40–70) = atenção. Vermelho (<40) = urgente revisar.',
      },
      {
        n: '3',
        t: 'Observe o alerta de risco',
        d: 'Se aparecer o aviso "Risco de Esquecimento", você está prestes a perder conteúdo já estudado. Revise antes que a retenção caia abaixo de 50%.',
      },
      {
        n: '4',
        t: 'Calendário da semana',
        d: 'As barras mostram quantas revisões estão agendadas por dia. Planeje seus estudos para não acumular.',
      },
    ],
    tip: '💡 O Dashboard é o único lugar que você precisa visitar todo dia. 5 minutos de revisão aqui valem mais do que 1 hora de leitura passiva.',
    science:
      'Curva de Ebbinghaus: revisar no momento certo (antes de esquecer) multiplica a estabilidade neural. Cada revisão bem feita dobra o próximo intervalo.',
  },
  {
    id: 'library',
    icon: '📚',
    title: 'Biblioteca',
    color: '#06b6d4',
    tagline: 'Organize tudo que você quer aprender',
    steps: [
      {
        n: '1',
        t: 'Adicione um conteúdo',
        d: 'Clique em "Adicionar" e preencha título, tipo (livro/curso/vídeo/artigo) e autor. Cada conteúdo terá seus próprios flashcards e revisões.',
      },
      {
        n: '2',
        t: 'Organize em Trilhas',
        d: 'Use o botão "+ Trilha" para criar trilhas e agrupar conteúdos por objetivo ou disciplina. Conteúdos sem trilha ficam na seção "Sem Trilha".',
      },
      {
        n: '3',
        t: 'Busque por título',
        d: 'O campo de busca filtra conteúdos em tempo real, sem distinção de acentos. Funciona dentro de qualquer trilha.',
      },
      {
        n: '4',
        t: 'Inicie o estudo',
        d: 'Clique em "Estudar →" em qualquer card para abrir a Sessão de Foco daquele conteúdo.',
      },
    ],
    tip: '💡 Não adicione 20 livros de uma vez. Foque em 2-3 conteúdos ativos por vez para manter a consistência.',
    science:
      'Distribuição de atenção: focar em menos conteúdos simultaneamente aumenta a profundidade do aprendizado e reduz a sobrecarga cognitiva.',
  },
  {
    id: 'trails',
    icon: '🗺️',
    title: 'Trilhas de Aprendizado',
    color: '#8b5cf6',
    tagline: 'Organize conteúdos por objetivo ou projeto',
    steps: [
      {
        n: '1',
        t: 'Crie uma trilha',
        d: 'Na Biblioteca, clique em "+ Trilha". Escolha nome, tipo (Curso, Livro, Artigo, Livre, Certificação, Pesquisa ou Tecnologia), cor e emoji representativo.',
      },
      {
        n: '2',
        t: 'Vincule conteúdos',
        d: 'Ao adicionar ou editar um conteúdo, selecione a trilha desejada. Conteúdos sem trilha aparecem na seção "Sem Trilha" da Biblioteca.',
      },
      {
        n: '3',
        t: 'Navegue por trilhas',
        d: 'A Biblioteca exibe cada trilha como seção com contagem de conteúdos. Clique no ícone de lápis ao lado do nome para editar ou excluir a trilha.',
      },
    ],
    tip: '💡 Crie trilhas por objetivo ("Pós-graduação 2026") ou por área ("Backend"). Ao excluir uma trilha, os conteúdos são mantidos — apenas deixam de estar vinculados.',
    science:
      'Organização por contexto: agrupar material por objetivo reduz o custo de alternância cognitiva (context-switching) e facilita a recuperação de informação relacionada.',
  },
  {
    id: 'focus',
    icon: '⏱',
    title: 'Sessão de Foco',
    color: '#ec4899',
    tagline: 'Pomodoro + Extração + Modo Professor',
    steps: [
      {
        n: '1',
        t: 'Fase 1 — Pomodoro',
        d: 'Estude o conteúdo por 25 minutos com foco total. Anote insights e destaque os conceitos mais importantes com os highlights âmbar.',
      },
      {
        n: '2',
        t: 'Fase 2 — Extração',
        d: 'Após estudar, responda 3 perguntas de reflexão e crie flashcards dos conceitos aprendidos. Esse é o momento de consolidar.',
      },
      {
        n: '3',
        t: 'Fase 3 — Modo Professor',
        d: 'Explique o que aprendeu como se ensinasse alguém. Use seus highlights como guia. Seus rascunhos são salvos automaticamente a cada 30 segundos.',
      },
    ],
    tip: '💡 A Fase 3 é a mais importante. Mesmo que você ache que "sabe", tente explicar em voz alta ou por escrito.',
    science:
      'Técnica Feynman: ensinar força o cérebro a identificar lacunas reais no conhecimento e reorganizar a memória de forma mais profunda.',
  },
  {
    id: 'review',
    icon: '🔄',
    title: 'Revisão',
    color: '#7c3aed',
    tagline: 'Revisão espaçada com SM-2 + atalhos de teclado',
    steps: [
      {
        n: '1',
        t: 'Veja o card',
        d: 'Leia a pergunta e tente lembrar a resposta antes de revelar. Esse esforço de recuperação é o que fortalece a memória. Pressione Space para revelar.',
      },
      {
        n: '2',
        t: 'Avalie honestamente',
        d: 'Após revelar, avalie: 1 = Esqueci, 2 = Difícil, 3 = Bom, 4 = Fácil. Use as teclas 1–4 ou os botões na tela. Seja honesto — isso calibra o algoritmo.',
      },
      {
        n: '3',
        t: 'Navegue com o teclado',
        d: 'Backspace volta ao card anterior. Space revela/esconde o card. 1–4 avaliam. Os atalhos funcionam apenas enquanto a aba de Revisão está ativa.',
      },
      {
        n: '4',
        t: 'Consulte seu Material',
        d: 'Clique na aba "📔 Meu Material" no topo para ver highlights e notas das sessões de foco, sem sair do fluxo de revisão.',
      },
    ],
    tip: '💡 Nunca pule uma sessão de revisão. 5 minutos de revisão diária são mais eficazes que 2 horas uma vez por semana.',
    science:
      'Algoritmo SM-2 (SuperMemo 2): otimiza o momento exato de cada revisão para maximizar retenção com o mínimo de repetições.',
  },
  {
    id: 'material',
    icon: '📔',
    title: 'Meu Material de Estudo',
    color: '#d97706',
    tagline: 'Highlights e anotações sempre à mão durante a revisão',
    steps: [
      {
        n: '1',
        t: 'Acesse durante a revisão',
        d: 'Na tela de Revisão, clique na aba "📔 Meu Material" no topo. Seu material fica acessível sem interromper o fluxo de revisão.',
      },
      {
        n: '2',
        t: 'Busque entre conteúdos',
        d: 'Use a busca para filtrar highlights por palavra-chave. O accordion agrupa highlights e anotações por conteúdo estudado.',
      },
      {
        n: '3',
        t: 'Crie highlights na Sessão de Foco',
        d: 'Durante o Pomodoro (Fase 1), selecione textos e clique "Destacar" para criar highlights âmbar. Eles ficam salvos permanentemente aqui.',
      },
    ],
    tip: '💡 Consulte o Material durante a revisão para relembrar o contexto original de um flashcard difícil. Isso ativa memória associativa — mais eficaz do que reler o livro.',
    science:
      'Memória associativa: ver o contexto original (highlight + notas) no momento da revisão aumenta a taxa de recuperação e fortalece as ligações neurais entre conceitos relacionados.',
  },
  {
    id: 'active',
    icon: '⚡',
    title: 'Aprendizado Ativo',
    color: '#10b981',
    tagline: 'Praticar retém 75% · Ensinar retém 90%',
    steps: [
      {
        n: '1',
        t: 'Escolha um modo',
        d: 'Modo Professor (explicar), Aplicação Prática (criar exemplos), ou Auto-Avaliação (responder perguntas profundas).',
      },
      {
        n: '2',
        t: 'Selecione um conteúdo',
        d: 'Escolha um conteúdo que você já estudou. O aprendizado ativo funciona melhor com material que você já foi exposto.',
      },
      {
        n: '3',
        t: 'Escreva sem parar',
        d: 'Não edite enquanto escreve. Deixe o pensamento fluir. Ao terminar, use "✦ Analisar com IA" para receber feedback sobre pontos fortes e lacunas do seu entendimento.',
      },
    ],
    tip: '💡 Use o Modo Professor sempre após uma Sessão de Foco para reforçar o que acabou de aprender.',
    science:
      'Recuperação ativa: o ato de resgatar uma informação da memória é mais eficaz para retenção do que re-ler o material original.',
  },
  {
    id: 'achievements',
    icon: '🏆',
    title: 'Conquistas',
    color: '#f59e0b',
    tagline: '12 badges que medem progresso real, não tempo de tela',
    steps: [
      {
        n: '1',
        t: 'Veja seus badges em Habilidades',
        d: 'Acesse a tela de Habilidades para ver a grade de 12 conquistas. Badges desbloqueados aparecem coloridos; os ainda não conquistados ficam em cinza.',
      },
      {
        n: '2',
        t: 'Desbloqueie pelo uso real',
        d: 'Conquistas são ganhas por ações concretas: criar flashcards, manter streak, completar revisões, atingir Cognitive Score alto, entre outras.',
      },
      {
        n: '3',
        t: 'Receba notificações de desbloqueio',
        d: 'Quando um badge é conquistado, um toast de sucesso aparece automaticamente. Você pode revisar todos os desbloqueios na grade a qualquer momento.',
      },
    ],
    tip: '💡 Os badges funcionam como marcos de progresso. Cada conquista representa um padrão de estudo consistente associado à retenção de longo prazo.',
    science:
      'Dopamina e aprendizado: marcos de progresso visíveis ativam o sistema de recompensa dopaminérgico, sustentando a motivação intrínseca mesmo em períodos sem resultados imediatos visíveis.',
  },
  {
    id: 'skills',
    icon: '🌳',
    title: 'Árvore de Habilidades',
    color: '#10b981',
    tagline: 'Medimos domínio real, não consumo',
    steps: [
      {
        n: '1',
        t: 'Adicione uma habilidade',
        d: 'Crie habilidades que você quer desenvolver. Associe a uma categoria: Produto, Tecnologia, Dados, Soft Skills e mais.',
      },
      {
        n: '2',
        t: 'Ganhe XP praticando',
        d: 'XP é ganho automaticamente ao fazer revisões e praticar aprendizado ativo. Você também pode adicionar XP manualmente após aplicar o conhecimento na prática real.',
      },
      {
        n: '3',
        t: 'Suba de nível e conquiste badges',
        d: 'Cada nível representa um salto real de capacidade. Nível 3+ indica que você consegue aplicar de forma independente. Confira seus badges na grade de Conquistas.',
      },
    ],
    tip: '💡 Vincule seus conteúdos às habilidades que eles desenvolvem. Isso cria uma visão clara de qual conhecimento impacta cada capacidade.',
    science:
      'Skill acquisition: a progressão por níveis ativa o sistema de recompensa dopaminérgico, sustentando a motivação no longo prazo.',
  },
  {
    id: 'profile',
    icon: '👤',
    title: 'Perfil',
    color: '#06b6d4',
    tagline: 'Personalize sua identidade no NeuroLearn',
    steps: [
      {
        n: '1',
        t: 'Edite seu nome',
        d: 'Acesse o Perfil pelo ícone na sidebar. Atualize seu nome de exibição a qualquer momento — ele aparece nos e-mails e notificações push.',
      },
      {
        n: '2',
        t: 'Escolha um avatar',
        d: 'Selecione um dos 12 emojis disponíveis como avatar. A alteração reflete na sidebar instantaneamente.',
      },
      {
        n: '3',
        t: 'Gerencie notificações push',
        d: 'Ative ou desative lembretes de revisão diretamente na tela de Perfil, sem precisar alterar as configurações do navegador.',
      },
    ],
    tip: '💡 Manter o perfil atualizado cria uma experiência mais pessoal e reforça a identidade de aprendiz contínuo.',
    science:
      'Identidade e aprendizado: ter uma identidade clara de aprendiz (nome, avatar, streak visível) ativa o compromisso de consistência — um dos princípios de Cialdini para comportamentos duradouros.',
  },
  {
    id: 'settings',
    icon: '⚙️',
    title: 'Configurações',
    color: '#6b7280',
    tagline: 'Backup, importação e controle dos seus dados',
    steps: [
      {
        n: '1',
        t: 'Exporte um backup',
        d: 'Clique em "Exportar dados" para baixar um arquivo JSON com todos os seus conteúdos, flashcards, sessões e habilidades. Salve em local seguro.',
      },
      {
        n: '2',
        t: 'Importe um backup',
        d: 'Clique em "Importar dados" e selecione um JSON exportado pelo NeuroLearn. Os dados são validados automaticamente — arquivos inválidos são rejeitados com mensagem clara.',
      },
      {
        n: '3',
        t: 'Exclua sua conta',
        d: 'Em caso de encerramento, "Excluir conta" remove permanentemente todos os dados do servidor (LGPD). Essa ação é irreversível — exporte um backup antes.',
      },
    ],
    tip: '💡 Exporte um backup antes de qualquer mudança significativa. O arquivo JSON pode ser importado em outro dispositivo ou mantido como cópia offline.',
    science:
      'Controle e autonomia: saber que seus dados estão seguros e acessíveis reduz a ansiedade de dependência de plataforma e aumenta a confiança no sistema de aprendizado.',
  },
  {
    id: 'pwa',
    icon: '📲',
    title: 'App Instalável + Notificações',
    color: '#0ea5e9',
    tagline: 'Instale no celular e receba lembretes de revisão',
    steps: [
      {
        n: '1',
        t: 'Instale no celular (Android)',
        d: 'No Chrome, toque nos três pontos (⋮) e selecione "Adicionar à tela inicial" ou "Instalar app". O NeuroLearn abrirá como app nativo, sem barra do navegador.',
      },
      {
        n: '2',
        t: 'Instale no iPhone (Safari)',
        d: 'Toque no ícone de compartilhar (□↑) e selecione "Adicionar à Tela de Início". Confirme tocando em "Adicionar". Funciona no iOS 16.4 ou superior.',
      },
      {
        n: '3',
        t: 'Ative os lembretes de revisão',
        d: 'Um banner aparecerá na parte inferior do app. Clique em "✅ Ativar notificações" para receber alertas quando tiver flashcards vencidos — mesmo com o navegador fechado.',
      },
    ],
    tip: '💡 O app instalado abre mais rápido, ocupa toda a tela e mantém você em contexto de aprendizado. Se dispensou o banner, ative nas configurações do navegador (site neurolearn.tech → Notificações → Permitir).',
    science:
      'Notificações contextuais: lembretes no momento certo (quando o intervalo de revisão vence) são mais eficazes do que alarmes fixos, pois respeitam o ritmo do algoritmo SM-2.',
  },
]

export function HelpView() {
  const [open, setOpen] = useState<string | null>(null)

  function toggle(id: string) {
    setOpen((o) => (o === id ? null : id))
  }

  return (
    <div
      data-testid="help-view"
      className="slide-in"
      style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}
    >
      <h1
        style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', marginBottom: '6px' }}
      >
        Central de Ajuda
      </h1>
      <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '24px' }}>
        Como usar cada módulo do NeuroLearn para maximizar seu aprendizado.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {MODULES.map((mod) => {
          const isOpen = open === mod.id
          return (
            <div
              key={mod.id}
              className="card"
              style={{
                overflow: 'hidden',
                borderColor: isOpen ? mod.color + '60' : 'var(--border)',
                transition: 'border-color .2s',
              }}
            >
              <button
                type="button"
                data-testid={`help-module-${mod.id}`}
                aria-expanded={isOpen}
                onClick={() => toggle(mod.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '16px 20px',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      fontSize: '20px',
                      background: mod.color + '18',
                      borderRadius: '8px',
                      padding: '6px',
                      display: 'flex',
                    }}
                  >
                    {mod.icon}
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                      {mod.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{mod.tagline}</div>
                  </div>
                </div>
                <span
                  style={{
                    color: 'var(--text3)',
                    transition: 'transform .2s',
                    transform: isOpen ? 'rotate(90deg)' : 'none',
                    fontSize: '16px',
                  }}
                >
                  ›
                </span>
              </button>

              {isOpen && (
                <div
                  data-testid={`help-content-${mod.id}`}
                  className="slide-in"
                  style={{
                    padding: '0 20px 20px',
                    borderTop: `1px solid ${mod.color}20`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      marginTop: '14px',
                      marginBottom: '14px',
                    }}
                  >
                    {mod.steps.map((step) => (
                      <div
                        key={step.n}
                        style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                      >
                        <div
                          style={{
                            minWidth: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: mod.color + '20',
                            color: mod.color,
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {step.n}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: 'var(--text)',
                              marginBottom: '2px',
                            }}
                          >
                            {step.t}
                          </div>
                          <div
                            style={{ fontSize: '12px', color: 'var(--text4)', lineHeight: '1.5' }}
                          >
                            {step.d}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      background: mod.color + '10',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '10px',
                      borderLeft: `3px solid ${mod.color}`,
                    }}
                  >
                    <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.5' }}>
                      {mod.tip}
                    </p>
                  </div>

                  <div
                    style={{
                      background: 'var(--card2)',
                      borderRadius: '8px',
                      padding: '12px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '10px',
                        color: mod.color,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '.5px',
                        marginBottom: '4px',
                      }}
                    >
                      Base Científica
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text3)', lineHeight: '1.5' }}>
                      {mod.science}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
