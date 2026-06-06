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
      { n: '1', t: 'Veja as revisões do dia', d: 'Toda vez que abrir o app, o painel mostra quantos flashcards estão vencidos. Sempre comece por aqui.' },
      { n: '2', t: 'Cheque o alerta laranja', d: 'Se aparecer o aviso "Risco de Esquecimento", você está prestes a perder conteúdo que já estudou. Revise antes que a retenção caia abaixo de 50%.' },
      { n: '3', t: 'Calendário da semana', d: 'As barras mostram quantas revisões estão agendadas por dia. Planeje seus estudos para não acumular.' },
      { n: '4', t: 'Mapa de Retenção', d: 'O anel mostra sua média geral. Verde = sólido. Amarelo = precisa de atenção. Vermelho = urgente.' },
    ],
    tip: '💡 O Dashboard é o único lugar que você precisa visitar todo dia. 5 minutos de revisão aqui valem mais do que 1 hora de leitura passiva.',
    science: 'Curva de Ebbinghaus: revisar no momento certo (antes de esquecer) multiplica a estabilidade neural. Cada revisão bem feita dobra o próximo intervalo.',
  },
  {
    id: 'library',
    icon: '📚',
    title: 'Biblioteca',
    color: '#06b6d4',
    tagline: 'Organize tudo que você quer aprender',
    steps: [
      { n: '1', t: 'Adicione um conteúdo', d: 'Clique em "Adicionar" e preencha título, tipo (livro/curso/vídeo/artigo) e autor. Cada conteúdo terá seus próprios flashcards e revisões.' },
      { n: '2', t: 'Acompanhe o progresso', d: 'A barra de progresso avança automaticamente a cada sessão de foco finalizada (+10%). Você também vê a retenção média dos flashcards daquele conteúdo.' },
      { n: '3', t: 'Inicie o estudo', d: 'Clique em "Estudar →" em qualquer card para abrir a Sessão de Foco daquele conteúdo.' },
    ],
    tip: '💡 Não adicione 20 livros de uma vez. Foque em 2-3 conteúdos ativos por vez para manter a consistência.',
    science: 'Distribuição de atenção: focar em menos conteúdos simultaneamente aumenta a profundidade do aprendizado e reduz a sobrecarga cognitiva.',
  },
  {
    id: 'focus',
    icon: '⏱',
    title: 'Sessão de Foco',
    color: '#ec4899',
    tagline: 'Pomodoro + Extração + Modo Professor',
    steps: [
      { n: '1', t: 'Fase 1 — Pomodoro', d: 'Estude o conteúdo por 25 minutos com foco total. Anote insights e destaque os conceitos mais importantes.' },
      { n: '2', t: 'Fase 2 — Extração', d: 'Após estudar, responda 3 perguntas de reflexão e crie flashcards dos conceitos aprendidos. Esse é o momento de consolidar.' },
      { n: '3', t: 'Fase 3 — Modo Professor', d: 'Explique o que aprendeu como se ensinasse alguém. Use seus highlights como guia. Quanto mais detalhada a explicação, maior a retenção.' },
    ],
    tip: '💡 A Fase 3 é a mais importante. Mesmo que você ache que "sabe", tente explicar em voz alta ou por escrito.',
    science: 'Técnica Feynman: ensinar força o cérebro a identificar lacunas reais no conhecimento e reorganizar a memória de forma mais profunda.',
  },
  {
    id: 'review',
    icon: '🔄',
    title: 'Revisão',
    color: '#7c3aed',
    tagline: 'Revisão espaçada com SM-2',
    steps: [
      { n: '1', t: 'Veja o card', d: 'Leia a pergunta e tente lembrar a resposta antes de revelar. Esse esforço de recuperação é o que fortalece a memória.' },
      { n: '2', t: 'Avalie honestamente', d: 'Clique em "Revelar" e avalie sua lembrança: Esqueci / Difícil / Bom / Fácil. Seja honesto — isso calibra o algoritmo.' },
      { n: '3', t: 'O algoritmo faz o resto', d: 'O SM-2 calcula o próximo intervalo com base na sua avaliação. Quanto melhor você lembrou, mais tempo até a próxima revisão.' },
    ],
    tip: '💡 Nunca pule uma sessão de revisão. 5 minutos de revisão diária são mais eficazes que 2 horas uma vez por semana.',
    science: 'Algoritmo SM-2 (SuperMemo 2): otimiza o momento exato de cada revisão para maximizar retenção com o mínimo de repetições.',
  },
  {
    id: 'active',
    icon: '⚡',
    title: 'Aprendizado Ativo',
    color: '#10b981',
    tagline: 'Praticar retém 75% · Ensinar retém 90%',
    steps: [
      { n: '1', t: 'Escolha um modo', d: 'Modo Professor (explicar), Aplicação Prática (criar exemplos), ou Auto-Avaliação (responder perguntas profundas).' },
      { n: '2', t: 'Selecione um conteúdo', d: 'Escolha um conteúdo que você já estudou. O aprendizado ativo funciona melhor com material que você já foi exposto.' },
      { n: '3', t: 'Escreva sem parar', d: 'Não edite enquanto escreve. Deixe o pensamento fluir. Quanto mais palavras, maior a consolidação.' },
    ],
    tip: '💡 Use o Modo Professor sempre após uma Sessão de Foco para reforçar o que acabou de aprender.',
    science: 'Recuperação ativa: o ato de resgatar uma informação da memória é mais eficaz para retenção do que re-ler o material original.',
  },
  {
    id: 'skills',
    icon: '🌳',
    title: 'Árvore de Habilidades',
    color: '#f59e0b',
    tagline: 'Medimos domínio real, não consumo',
    steps: [
      { n: '1', t: 'Adicione uma habilidade', d: 'Crie habilidades que você quer desenvolver. Associe a uma categoria: Produto, Tecnologia, Dados ou Soft Skills.' },
      { n: '2', t: 'Ganhe XP praticando', d: 'XP é ganho automaticamente ao fazer revisões e praticar aprendizado ativo. Você também pode adicionar XP manualmente após aplicar o conhecimento na prática real.' },
      { n: '3', t: 'Suba de nível', d: 'Cada nível representa um salto real de capacidade. Nível 3+ indica que você consegue aplicar de forma independente.' },
    ],
    tip: '💡 Vincule seus conteúdos às habilidades que eles desenvolvem. Isso cria uma visão clara de qual conhecimento impacta cada capacidade.',
    science: 'Skill acquisition: a progressão por níveis ativa o sistema de recompensa dopaminérgico, sustentando a motivação no longo prazo.',
  },
]

export function HelpView() {
  const [open, setOpen] = useState<string | null>(null)

  function toggle(id: string) {
    setOpen((o) => (o === id ? null : id))
  }

  return (
    <div className="slide-in" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', marginBottom: '6px' }}>
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
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => toggle(mod.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(mod.id) } }}
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
                    <div
                      style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}
                    >
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
              </div>

              {isOpen && (
                <div
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
                          <div style={{ fontSize: '12px', color: 'var(--text4)', lineHeight: '1.5' }}>
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
