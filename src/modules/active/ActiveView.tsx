'use client'

import { useState, useRef } from 'react'
import { useAppData } from '@/hooks/useAppData'
import type { Content } from '@/types'
import type { TeachAnalysis } from '@/types/ai'
import { Chevron, X } from '@/components/icons'

type ActiveMode = 'teach' | 'apply' | 'quiz'

const MODES: Record<ActiveMode, { icon: string; title: string; col: string; ret: string; desc: string }> = {
  teach: {
    icon: '🎓',
    title: 'Modo Professor',
    col: '#7c3aed',
    ret: '90%',
    desc: 'Explique o conteúdo como se ensinasse alguém. Técnica de maior consolidação neural.',
  },
  apply: {
    icon: '⚡',
    title: 'Aplicação Prática',
    col: '#06b6d4',
    ret: '75%',
    desc: 'Crie exemplos reais, hipóteses e cenários para transformar teoria em habilidade.',
  },
  quiz: {
    icon: '🧩',
    title: 'Auto-Avaliação',
    col: '#10b981',
    ret: '65%',
    desc: 'Responda perguntas profundas para identificar lacunas e consolidar insights.',
  },
}

const PROMPTS: Record<ActiveMode, string[]> = {
  teach: [
    'Explique o conceito principal como se ensinasse alguém que nunca ouviu sobre o tema.',
    'Se tivesse 2 minutos, o que diria sobre o que aprendeu?',
    'Quais 3 ideias mais importantes? Explique com exemplos.',
  ],
  apply: [
    'Como aplicaria isso no seu trabalho nos próximos 7 dias?',
    'Crie uma hipótese ou experimento baseado no que aprendeu.',
    'Crie um exemplo concreto e real usando o conhecimento.',
  ],
  quiz: [
    'Qual o maior insight que você tirou deste conteúdo?',
    'O que mudou na sua forma de pensar após estudar isso?',
    'Quais dúvidas restam? Como você as responderia?',
  ],
}

export function ActiveView() {
  const { state, dispatch } = useAppData()
  const [mode, setMode] = useState<ActiveMode | 'home'>('home')
  const [sel, setSel] = useState<Content | null>(null)
  const [text, setText] = useState('')
  const [ok, setOk] = useState(false)

  // US-AI-01 — Análise do Modo Professor
  const [analysis, setAnalysis] = useState<TeachAnalysis | null>(null)
  const [analyzeError, setAnalyzeError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const analyzingRef = useRef(false)

  const contents = state.contents

  async function analyzeTeaching() {
    if (analyzingRef.current || !sel || text.trim().length < 100) return
    analyzingRef.current = true
    setIsAnalyzing(true)
    setAnalyzeError('')
    setAnalysis(null)
    try {
      const res = await fetch('/api/ai/analyze-teaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teachText: text.trim(), topic: sel.title }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAnalyzeError(data.error ?? 'Erro ao analisar. Tente novamente.')
        return
      }
      setAnalysis(data as TeachAnalysis)
    } catch {
      setAnalyzeError('Falha na conexão. Verifique sua internet e tente novamente.')
    } finally {
      analyzingRef.current = false
      setIsAnalyzing(false)
    }
  }

  function savePractice() {
    const wordCount = text.split(' ').filter((w) => w).length
    const xp = wordCount > 50 ? 30 : wordCount > 20 ? 20 : 10
    dispatch({ type: 'EARN_XP', payload: { amount: xp } })
    setOk(true)
    setText('')
    setTimeout(() => setOk(false), 3000)
  }

  if (mode === 'home') {
    return (
      <div className="slide-in" style={{ padding: '24px', maxWidth: '880px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', marginBottom: '6px' }}>
          Aprendizado Ativo
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '22px' }}>
          Pirâmide de Glasser: retemos 10% do que lemos, mas até 90% do que ensinamos ou aplicamos.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          {(Object.entries(MODES) as [ActiveMode, (typeof MODES)[ActiveMode]][]).map(([k, m]) => (
            <div
              key={k}
              className="card"
              style={{
                padding: '20px',
                cursor: 'pointer',
                transition: 'all .2s',
                border: `1px solid ${m.col}20`,
              }}
              onClick={() => setMode(k)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = m.col
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = m.col + '20'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{m.icon}</div>
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  marginBottom: '5px',
                }}
              >
                {m.title}
              </h3>
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--text3)',
                  lineHeight: '1.5',
                  marginBottom: '10px',
                }}
              >
                {m.desc}
              </p>
              <span
                className="badge"
                style={{ background: m.col + '20', color: m.col }}
              >
                ~{m.ret} retenção
              </span>
            </div>
          ))}
        </div>
        <div
          className="card"
          style={{
            padding: '16px',
            background: 'rgba(124,58,237,.05)',
            borderColor: 'rgba(124,58,237,.2)',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: '#a78bfa',
              fontWeight: '700',
              marginBottom: '4px',
            }}
          >
            💡 A Pirâmide de Glasser:
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text4)', lineHeight: '1.6' }}>
            Leitura = 10% · Ouvir = 20% · Visualizar = 30% · Demonstrar = 50% · Discussão = 70%
            ·{' '}
            <strong style={{ color: '#a78bfa' }}>Praticar = 75% · Ensinar = 90%</strong>
          </p>
        </div>
      </div>
    )
  }

  const m = MODES[mode as ActiveMode]
  const prompts = PROMPTS[mode as ActiveMode] ?? []

  return (
    <div className="slide-in" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => {
          setMode('home')
          setSel(null)
          setText('')
          setAnalysis(null)
          setAnalyzeError('')
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text3)',
          cursor: 'pointer',
          fontSize: '12px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        ← Voltar
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
        <span style={{ fontSize: '28px' }}>{m.icon}</span>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text)' }}>{m.title}</h1>
          <p style={{ fontSize: '12px', color: 'var(--text3)' }}>~{m.ret} retenção de longo prazo</p>
        </div>
      </div>

      {!sel ? (
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text4)', marginBottom: '10px' }}>
            Escolha um conteúdo:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {contents.map((c) => (
              <div
                key={c.id}
                className="card"
                style={{
                  padding: '13px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color .2s',
                }}
                onClick={() => setSel(c)}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = m.col)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                    {c.author || '—'} · {c.progress > 0 ? `${c.progress}% completo` : 'Não iniciado'}
                  </div>
                </div>
                <Chevron />
              </div>
            ))}
            {contents.length === 0 && (
              <p style={{ color: 'var(--text3)', fontSize: '12px' }}>
                Nenhum conteúdo na biblioteca ainda. Adicione na Biblioteca.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div
            className="card"
            style={{
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderColor: m.col + '40',
              background: m.col + '08',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>
                {sel.title}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{sel.author}</div>
            </div>
            <button
              onClick={() => { setSel(null); setAnalysis(null); setAnalyzeError('') }}
              style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}
            >
              <X />
            </button>
          </div>
          <div
            className="card"
            style={{
              padding: '16px',
              marginBottom: '14px',
              borderColor: m.col + '30',
              background: m.col + '05',
            }}
          >
            <p
              style={{
                fontSize: '10px',
                color: m.col,
                fontWeight: '700',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '.5px',
              }}
            >
              Desafio
            </p>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text)',
                lineHeight: '1.6',
                fontWeight: '500',
              }}
            >
              {prompts[0]}
            </p>
          </div>
          <textarea
            className="textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              mode === 'teach'
                ? 'Comece sua explicação...'
                : mode === 'apply'
                  ? 'Descreva como aplicaria isso...'
                  : 'Suas reflexões...'
            }
            style={{ minHeight: '190px', marginBottom: '12px' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                color:
                  text.split(' ').filter((w) => w).length > 50 ? '#10b981' : 'var(--text3)',
              }}
            >
              {text.split(' ').filter((w) => w).length} palavras
              {text.split(' ').filter((w) => w).length > 50 ? ' · Excelente!' : ''}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => setText('')}>
                Limpar
              </button>
              {/* Botão de análise IA — só visível no Modo Professor com texto suficiente */}
              {mode === 'teach' && text.trim().length >= 100 && (
                <button
                  data-testid="btn-analyze-teaching"
                  onClick={analyzeTeaching}
                  disabled={isAnalyzing}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                    cursor: isAnalyzing ? 'default' : 'pointer',
                    border: '1.5px solid rgba(124,58,237,.4)',
                    background: 'rgba(124,58,237,.1)',
                    color: '#7c3aed',
                    opacity: isAnalyzing ? 0.7 : 1,
                    fontFamily: 'Inter',
                  }}
                >
                  {isAnalyzing ? '⏳ Analisando…' : '✦ Analisar com IA'}
                </button>
              )}
              <button
                className="btn-primary"
                onClick={savePractice}
                disabled={text.length < 10}
              >
                {ok ? '✓ Salvo! +XP' : 'Salvar e ganhar XP →'}
              </button>
            </div>
          </div>

          {/* Erro da análise */}
          {analyzeError && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px' }}>
              {analyzeError}
            </p>
          )}

          {/* Painel de análise do Modo Professor */}
          {analysis && (
            <div
              data-testid="teaching-analysis"
              className="slide-in"
              style={{
                border: '1px solid rgba(124,58,237,.25)',
                borderRadius: '12px',
                padding: '18px',
                background: 'rgba(124,58,237,.04)',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <p style={{ fontSize: '12px', fontWeight: '800', color: '#7c3aed', margin: 0 }}>
                  ✦ Análise Cognitiva
                </p>
                <span
                  data-testid="teaching-retention-badge"
                  style={{
                    fontSize: '11px', fontWeight: '700', color: '#10b981',
                    background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)',
                    borderRadius: '20px', padding: '2px 10px',
                  }}
                >
                  Retenção estimada: {analysis.estimated_retention}%
                </span>
              </div>

              {/* Barras de score */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                {[
                  { label: 'Clareza', value: analysis.clarity_score, testid: 'teaching-clarity-score', color: '#7c3aed' },
                  { label: 'Cobertura', value: analysis.coverage_score, testid: 'teaching-coverage-score', color: '#06b6d4' },
                ].map((s) => (
                  <div key={s.testid}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{s.label}</span>
                      <span data-testid={s.testid} style={{ fontSize: '11px', fontWeight: '700', color: s.color }}>{s.value}/100</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--border2)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: `${s.value}%`, background: s.color, borderRadius: '3px', transition: 'width .5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pontos Fortes */}
              {analysis.strengths.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', marginBottom: '6px' }}>✅ Pontos Fortes</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {analysis.strengths.map((s, i) => (
                      <span key={i} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: 'rgba(16,185,129,.12)', color: '#10b981', border: '1px solid rgba(16,185,129,.25)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lacunas */}
              {analysis.gaps.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', marginBottom: '6px' }}>⚠️ Lacunas Identificadas</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {analysis.gaps.map((g, i) => (
                      <span key={i} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: 'rgba(245,158,11,.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,.25)' }}>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugestões */}
              {analysis.suggestions.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text2)', marginBottom: '6px' }}>💡 Sugestões</p>
                  <ol style={{ margin: 0, paddingLeft: '16px' }}>
                    {analysis.suggestions.map((s, i) => (
                      <li key={i} style={{ fontSize: '11px', color: 'var(--text3)', lineHeight: '1.6', marginBottom: '2px' }}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
          {prompts.slice(1).map((p, i) => (
            <div
              key={i}
              style={{
                padding: '9px 12px',
                background: 'var(--card2)',
                border: '1px solid var(--border)',
                borderRadius: '7px',
                fontSize: '12px',
                color: 'var(--text4)',
                cursor: 'pointer',
                marginBottom: '6px',
                lineHeight: '1.5',
              }}
              onClick={() => setText((t) => t + (t ? '\n\n' : '') + p + '\n')}
            >
              + {p}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
