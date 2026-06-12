'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus } from '@/components/icons'
import { ProjectCard } from './ProjectCard'
import { ProjectFormModal } from './ProjectFormModal'
import { ProjectDetailView } from './ProjectDetailView'
import { useAppData } from '@/hooks/useAppData'
import type { Project } from '@/types'

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function ProjectsView() {
  const { state, loading } = useAppData()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const [search, setSearch] = useState('')
  const projects = state.projects ?? []

  const filteredProjects = useMemo(() => {
    const all = state.projects ?? []
    const q = normalize(search.trim())
    if (!q) return all
    return all.filter((p) => {
      const hay = normalize(`${p.name} ${p.description ?? ''}`)
      return hay.includes(q)
    })
  }, [state.projects, search])

  // Limpa seleção se o projeto for excluído enquanto a tela de detalhe está aberta
  useEffect(() => {
    if (selectedProjectId && !state.projects?.find((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(null)
    }
  }, [selectedProjectId, state.projects])

  const selectedProject = selectedProjectId
    ? (projects.find((p) => p.id === selectedProjectId) ?? null)
    : null

  function openCreate() {
    setEditingProject(null)
    setShowFormModal(true)
  }

  function openEdit(project: Project) {
    setEditingProject(project)
    setShowFormModal(true)
  }

  function handleSaved(project: Project, isNew: boolean) {
    setShowFormModal(false)
    setEditingProject(null)
    if (isNew) {
      setSelectedProjectId(project.id)
    }
  }

  function handleDeleted() {
    setShowFormModal(false)
    setEditingProject(null)
    setSelectedProjectId(null)
  }

  // ── Tela de detalhe ──────────────────────────────────────────────────────────
  if (selectedProject) {
    return (
      <>
        <ProjectDetailView
          project={selectedProject}
          onBack={() => setSelectedProjectId(null)}
          onEdit={() => openEdit(selectedProject)}
        />

        {showFormModal && (
          <ProjectFormModal
            project={editingProject}
            onClose={() => setShowFormModal(false)}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        )}
      </>
    )
  }

  // ── Tela de listagem ─────────────────────────────────────────────────────────
  return (
    <>
      <div
        style={{
          maxWidth: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-4)',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 800,
                color: 'var(--text)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Projetos
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)' }}>
              {search.trim()
                ? `${filteredProjects.length} resultado${filteredProjects.length !== 1 ? 's' : ''} de ${projects.length} projetos`
                : `${projects.length} projeto${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            {projects.length > 0 && (
              <input
                type="search"
                aria-label="Buscar projeto"
                data-testid="project-search"
                placeholder="Buscar projeto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'var(--card2)',
                  border: '1px solid var(--border2)',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '13px',
                  color: 'var(--text)',
                  outline: 'none',
                  width: '180px',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            )}
            <button
              data-testid="create-project-btn"
              onClick={openCreate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '10px 18px',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus />
              Novo projeto
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div style={{ color: 'var(--text3)', fontSize: 'var(--text-sm)' }}>Carregando...</div>
        ) : projects.length === 0 || (search.trim() && filteredProjects.length === 0) ? (
          /* Estado vazio */
          <div
            data-testid="projects-empty-state"
            style={{
              background: 'var(--card)',
              border: '1px dashed var(--border2)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-10)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ fontSize: 48 }}>{search.trim() ? '🔍' : '📁'}</div>
            <div>
              <p
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                {search.trim() ? 'Nenhum projeto encontrado' : 'Nenhum projeto criado ainda'}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', maxWidth: 360 }}>
                {search.trim()
                  ? `Nenhum resultado para "${search}". Tente outro termo.`
                  : 'Projetos agrupam trilhas relacionadas em torno de um objetivo maior.'}
              </p>
            </div>
            {!search.trim() && (
              <button
                data-testid="create-project-empty-btn"
                onClick={openCreate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 20px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <Plus />
                Criar primeiro projeto
              </button>
            )}
          </div>
        ) : (
          /* Grid de projetos */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {filteredProjects.map((project) => {
              const projectTrails = (state.trails ?? []).filter((t) => t.projectId === project.id)
              const projectContents = state.contents.filter((c) =>
                projectTrails.some((t) => t.id === c.trailId)
              )
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  trails={projectTrails}
                  contents={projectContents}
                  onClick={() => setSelectedProjectId(project.id)}
                  onEdit={() => openEdit(project)}
                />
              )
            })}
          </div>
        )}
      </div>

      {showFormModal && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => setShowFormModal(false)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </>
  )
}
