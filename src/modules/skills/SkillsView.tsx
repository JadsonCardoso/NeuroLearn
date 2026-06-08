'use client'

import { useState, useEffect } from 'react'
import { useAppData } from '@/hooks/useAppData'
import { useToast } from '@/hooks/useToast'
import { computeAchievements } from '@/engine/achievements'
import type { Skill, SkillCategory } from '@/types'
import { uid } from '@/lib/utils'
import { Plus } from '@/components/icons'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const CATS: Record<SkillCategory, { l: string; c: string }> = {
  product:    { l: 'Produto',       c: '#7c3aed' },
  tech:       { l: 'Tecnologia',    c: '#06b6d4' },
  soft:       { l: 'Soft Skills',   c: '#ec4899' },
  data:       { l: 'Dados',         c: '#f59e0b' },
  business:   { l: 'Negócios',      c: '#f97316' },
  leadership: { l: 'Liderança',     c: '#8b5cf6' },
  design:     { l: 'Design',        c: '#f43f5e' },
  languages:  { l: 'Idiomas',       c: '#14b8a6' },
  methods:    { l: 'Metodologias',  c: '#64748b' },
  science:    { l: 'Ciências',      c: '#22c55e' },
}

const LEVELS = ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Expert', 'Mestre']

export function SkillsView() {
  const { state, dispatch } = useAppData()
  const { toast } = useToast()
  const [sel, setSel] = useState<Skill | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', cat: 'product' as SkillCategory })
  const [confirmDeleteSkill, setConfirmDeleteSkill] = useState<Skill | null>(null)

  // Detecta conquistas recém-desbloqueadas e dispara toast.
  // localStorage persiste IDs já notificados entre navegações SPA — evita spam por remontagem.
  useEffect(() => {
    const stored = typeof window !== 'undefined'
      ? localStorage.getItem('neurolearn:achievements:notified')
      : null
    const notified = new Set<string>(stored ? (JSON.parse(stored) as string[]) : [])

    const achievements = computeAchievements(state)
    const newlyUnlocked = achievements.filter((a) => a.unlocked && !notified.has(a.id))

    for (const ach of newlyUnlocked) {
      toast.success(`${ach.icon} ${ach.name}`, 'Conquista Desbloqueada!')
      notified.add(ach.id)
    }

    if (newlyUnlocked.length > 0) {
      localStorage.setItem('neurolearn:achievements:notified', JSON.stringify([...notified]))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  useEffect(() => {
    if (!showAdd) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setShowAdd(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showAdd])

  function addSkill() {
    if (!form.name.trim()) return
    const skill: Skill = {
      id: uid(),
      name: form.name,
      cat: form.cat,
      level: 0,
      xp: 0,
      maxXp: 200,
      color: CATS[form.cat]?.c ?? '#7c3aed',
    }
    dispatch({ type: 'ADD_SKILL', payload: skill })
    setForm({ name: '', cat: 'product' })
    setShowAdd(false)
  }

  function gainXp(id: string, amount: number) {
    dispatch({ type: 'GAIN_XP', payload: { skillId: id, amount } })
  }

  const bycat = (Object.keys(CATS) as SkillCategory[]).reduce<Record<SkillCategory, Skill[]>>(
    (acc, k) => {
      acc[k] = state.skills.filter((s) => s.cat === k)
      return acc
    },
    { product: [], tech: [], soft: [], data: [], business: [], leadership: [], design: [], languages: [], methods: [], science: [] }
  )

  return (
    <div className="slide-in" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '22px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>
            Árvore de Habilidades
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>
            Medimos capacidade real, não consumo
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setShowAdd(true)}
        >
          <Plus />
          Nova Habilidade
        </button>
      </div>

      {showAdd && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.6)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowAdd(false)}
        >
          <div
            className="card slide-in"
            style={{ padding: '24px', width: '100%', maxWidth: '380px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '14px',
              }}
            >
              Nova Habilidade
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome da habilidade"
              />
              <select
                className="input"
                value={form.cat}
                onChange={(e) => setForm({ ...form, cat: e.target.value as SkillCategory })}
              >
                {(Object.entries(CATS) as [SkillCategory, { l: string }][]).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.l}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '9px', marginTop: '4px' }}>
                <button
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowAdd(false)}
                >
                  Cancelar
                </button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={addSkill}>
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: '12px',
          marginBottom: '22px',
        }}
      >
        {[
          { l: 'Total XP', v: (state.totalXp ?? 0).toLocaleString(), c: '#7c3aed' },
          { l: 'Habilidades', v: state.skills.length, c: '#06b6d4' },
          {
            l: 'Nível médio',
            v: state.skills.length
              ? (state.skills.reduce((a, s) => a + s.level, 0) / state.skills.length).toFixed(1)
              : '0',
            c: '#10b981',
          },
          { l: 'Expert+ (Nv4)', v: state.skills.filter((s) => s.level >= 4).length, c: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: s.c }}>{s.v}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Skills by category */}
      {(Object.entries(CATS) as [SkillCategory, { l: string; c: string }][]).map(([cat, ci]) => {
        const skills = bycat[cat] ?? []
        if (!skills.length) return null
        return (
          <div key={cat} style={{ marginBottom: '22px' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}
            >
              <div
                style={{ width: '3px', height: '14px', background: ci.c, borderRadius: '2px' }}
              />
              <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>
                {ci.l}
              </h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))',
                gap: '11px',
              }}
            >
              {skills.map((sk) => {
                const isSel = sel?.id === sk.id
                const pct = Math.round((sk.xp / sk.maxXp) * 100)
                return (
                  <div
                    key={sk.id}
                    className="card skill-card"
                    style={{
                      padding: '15px',
                      border: isSel ? `1px solid ${sk.color}` : '1px solid var(--border)',
                    }}
                    onClick={() => setSel(isSel ? null : sk)}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '9px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: 'var(--text)',
                            marginBottom: '1px',
                          }}
                        >
                          {sk.name}
                        </div>
                        <div style={{ fontSize: '10px', color: sk.color }}>
                          {LEVELS[sk.level]}
                        </div>
                      </div>
                      <div
                        style={{
                          background: sk.color + '20',
                          border: `1px solid ${sk.color}40`,
                          borderRadius: '6px',
                          padding: '3px 7px',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{ fontSize: '13px', fontWeight: '800', color: sk.color }}
                        >
                          Nv.{sk.level}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '9px' }}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: '4px',
                            borderRadius: '2px',
                            background: i < sk.level ? sk.color : 'var(--border)',
                          }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '3px',
                      }}
                    >
                      <span style={{ fontSize: '10px', color: 'var(--text3)' }}>
                        XP {sk.xp}/{sk.maxXp}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: pct + '%', background: sk.color }}
                      />
                    </div>
                    {isSel && (
                      <div
                        className="slide-in"
                        style={{
                          marginTop: '11px',
                          paddingTop: '11px',
                          borderTop: '1px solid var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              gainXp(sk.id, 10)
                            }}
                            style={{
                              flex: 1,
                              padding: '6px',
                              borderRadius: '6px',
                              border: '1px solid var(--border2)',
                              background: 'var(--card2)',
                              color: 'var(--text3)',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontFamily: 'Inter',
                            }}
                          >
                            +10 XP
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              gainXp(sk.id, 25)
                            }}
                            style={{
                              flex: 1,
                              padding: '6px',
                              borderRadius: '6px',
                              border: `1px solid ${sk.color}50`,
                              background: sk.color + '18',
                              color: sk.color,
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '700',
                              fontFamily: 'Inter',
                            }}
                          >
                            +25 XP
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDeleteSkill(sk)
                          }}
                          style={{
                            padding: '5px',
                            borderRadius: '6px',
                            border: '1px solid rgba(239,68,68,.3)',
                            background: 'rgba(239,68,68,.08)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontFamily: 'Inter',
                          }}
                        >
                          Remover habilidade
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Grade de Conquistas — US-GM-01 */}
      {(() => {
        const achievements = computeAchievements(state)
        const unlocked = achievements.filter((a) => a.unlocked).length
        return (
          <div style={{ marginTop: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '3px', height: '14px', background: '#f59e0b', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>
                Conquistas
              </h2>
              <span style={{
                fontSize: '11px', padding: '2px 9px', borderRadius: '20px', fontWeight: '700',
                background: 'rgba(245,158,11,.15)', color: '#f59e0b',
                border: '1px solid rgba(245,158,11,.3)',
              }}>
                {unlocked}/{achievements.length}
              </span>
            </div>
            <div
              data-testid="achievements-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))',
                gap: '10px',
              }}
            >
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  data-testid={`achievement-${ach.id}`}
                  title={ach.description}
                  style={{
                    padding: '13px',
                    borderRadius: '10px',
                    border: ach.unlocked
                      ? `1px solid ${ach.color}40`
                      : '1px solid var(--border)',
                    background: ach.unlocked
                      ? ach.color + '0d'
                      : 'var(--card)',
                    opacity: ach.unlocked ? 1 : 0.45,
                    transition: 'all .2s',
                    cursor: 'default',
                  }}
                >
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{ach.icon}</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: ach.unlocked ? ach.color : 'var(--text3)', marginBottom: '3px' }}>
                    {ach.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text4)', lineHeight: '1.4' }}>
                    {ach.description}
                  </div>
                  {ach.unlocked && (
                    <div style={{ marginTop: '7px', fontSize: '9px', fontWeight: '700', color: ach.color, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                      ✓ Desbloqueado
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      <ConfirmDialog
        open={!!confirmDeleteSkill}
        title="Remover habilidade"
        description={`Remover "${confirmDeleteSkill?.name}" do seu perfil? Isso não pode ser desfeito.`}
        confirmLabel="Remover"
        variant="danger"
        onConfirm={() => {
          if (!confirmDeleteSkill) return
          dispatch({ type: 'DELETE_SKILL', payload: confirmDeleteSkill.id })
          setSel(null)
          setConfirmDeleteSkill(null)
        }}
        onCancel={() => setConfirmDeleteSkill(null)}
      />
    </div>
  )
}
