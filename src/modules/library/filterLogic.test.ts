import { describe, it, expect } from 'vitest'
import type { Content, ContentType, LearningTrail } from '@/types'

// Helpers extracted from LibraryView/ProjectsView for testability

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

type FilterStatus = 'all' | 'new' | 'in_progress' | 'done'

function filterContents(
  contents: Content[],
  trails: LearningTrail[],
  search: string,
  filterTypes: Set<ContentType>,
  filterStatus: FilterStatus
): Content[] {
  let result = contents
  const q = normalize(search.trim())
  if (q) {
    const trailMap = new Map(trails.map((t) => [t.id, t.title]))
    result = result.filter((c) => {
      const trailTitle = c.trailId ? (trailMap.get(c.trailId) ?? '') : ''
      return (
        normalize(c.title).includes(q) ||
        normalize(c.author).includes(q) ||
        normalize(c.desc).includes(q) ||
        normalize(trailTitle).includes(q)
      )
    })
  }
  if (filterTypes.size > 0) {
    result = result.filter((c) => filterTypes.has(c.type))
  }
  if (filterStatus !== 'all') {
    result = result.filter((c) => {
      if (filterStatus === 'new') return c.progress === 0
      if (filterStatus === 'in_progress') return c.progress > 0 && c.progress < 100
      return c.progress === 100
    })
  }
  return result
}

function filterTrailsForSection(
  trails: LearningTrail[],
  filterProject: string | null,
  filterTrail: string | null
): LearningTrail[] {
  let result = trails
  if (filterProject) result = result.filter((t) => t.projectId === filterProject)
  if (filterTrail) result = result.filter((t) => t.id === filterTrail)
  return result
}

function filterProjects(
  projects: { id: string; name: string; description: string | null }[],
  search: string
) {
  const q = normalize(search.trim())
  if (!q) return projects
  return projects.filter((p) => {
    const hay = normalize(`${p.name} ${p.description ?? ''}`)
    return hay.includes(q)
  })
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeContent(overrides: Partial<Content> = {}): Content {
  return {
    id: 'c1',
    title: 'Aprendendo TypeScript',
    type: 'book',
    author: 'Fulano',
    desc: 'Livro de introdução',
    progress: 0,
    color: '#7c3aed',
    addedAt: '2024-01-01',
    trailId: null,
    ...overrides,
  }
}

function makeTrail(overrides: Partial<LearningTrail> = {}): LearningTrail {
  return {
    id: 't1',
    title: 'Trilha Frontend',
    type: 'course',
    description: '',
    color: '#06b6d4',
    iconEmoji: '🎓',
    goal: '',
    skillId: null,
    projectId: null,
    createdAt: '2024-01-01',
    ...overrides,
  }
}

// ── normalize ─────────────────────────────────────────────────────────────────

describe('normalize', () => {
  it('converte para minúsculas', () => {
    expect(normalize('TypeScript')).toBe('typescript')
  })

  it('remove acentos', () => {
    expect(normalize('Álgebra')).toBe('algebra')
    expect(normalize('ação')).toBe('acao')
    expect(normalize('Programação')).toBe('programacao')
  })

  it('string vazia permanece vazia', () => {
    expect(normalize('')).toBe('')
  })
})

// ── filterContents — text search ─────────────────────────────────────────────

describe('filterContents — busca textual', () => {
  const contents = [
    makeContent({ id: 'c1', title: 'TypeScript Avançado', author: 'Silva', desc: 'desc1' }),
    makeContent({
      id: 'c2',
      title: 'React Hooks',
      author: 'Oliveira',
      desc: 'desc2',
      type: 'course',
    }),
    makeContent({
      id: 'c3',
      title: 'Node.js Básico',
      author: 'Costa',
      desc: 'intro ao node',
      type: 'video',
    }),
  ]

  it('retorna todos quando busca está vazia', () => {
    expect(filterContents(contents, [], '', new Set(), 'all')).toHaveLength(3)
  })

  it('filtra por título', () => {
    const result = filterContents(contents, [], 'typescript', new Set(), 'all')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })

  it('filtra por autor', () => {
    const result = filterContents(contents, [], 'oliveira', new Set(), 'all')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c2')
  })

  it('filtra por descrição', () => {
    const result = filterContents(contents, [], 'intro', new Set(), 'all')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c3')
  })

  it('filtra por título de trilha', () => {
    const trail = makeTrail({ id: 't1', title: 'Trilha Backend' })
    const contentsWithTrail = [
      makeContent({ id: 'c1', trailId: 't1' }),
      makeContent({ id: 'c2', trailId: null }),
    ]
    const result = filterContents(contentsWithTrail, [trail], 'backend', new Set(), 'all')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })

  it('busca case-insensitive com acentos', () => {
    const c = makeContent({ id: 'c1', title: 'Programação Funcional' })
    const result = filterContents([c], [], 'programacao', new Set(), 'all')
    expect(result).toHaveLength(1)
  })

  it('retorna vazio quando não há correspondência', () => {
    const result = filterContents(contents, [], 'python', new Set(), 'all')
    expect(result).toHaveLength(0)
  })
})

// ── filterContents — tipo ─────────────────────────────────────────────────────

describe('filterContents — filtro de tipo', () => {
  const contents = [
    makeContent({ id: 'c1', type: 'book' }),
    makeContent({ id: 'c2', type: 'course' }),
    makeContent({ id: 'c3', type: 'video' }),
    makeContent({ id: 'c4', type: 'article' }),
    makeContent({ id: 'c5', type: 'note' }),
  ]

  it('sem filtro de tipo retorna todos', () => {
    expect(filterContents(contents, [], '', new Set(), 'all')).toHaveLength(5)
  })

  it('filtra por um tipo', () => {
    const result = filterContents(contents, [], '', new Set<ContentType>(['book']), 'all')
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('book')
  })

  it('filtra por múltiplos tipos', () => {
    const result = filterContents(contents, [], '', new Set<ContentType>(['book', 'video']), 'all')
    expect(result).toHaveLength(2)
    expect(result.map((c) => c.type).sort()).toEqual(['book', 'video'])
  })
})

// ── filterContents — status ───────────────────────────────────────────────────

describe('filterContents — filtro de status', () => {
  const contents = [
    makeContent({ id: 'c1', progress: 0 }),
    makeContent({ id: 'c2', progress: 50 }),
    makeContent({ id: 'c3', progress: 100 }),
    makeContent({ id: 'c4', progress: 1 }),
    makeContent({ id: 'c5', progress: 99 }),
  ]

  it('all retorna todos', () => {
    expect(filterContents(contents, [], '', new Set(), 'all')).toHaveLength(5)
  })

  it('new retorna apenas progress === 0', () => {
    const result = filterContents(contents, [], '', new Set(), 'new')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })

  it('in_progress retorna progress 1-99', () => {
    const result = filterContents(contents, [], '', new Set(), 'in_progress')
    expect(result).toHaveLength(3)
    expect(result.map((c) => c.id).sort()).toEqual(['c2', 'c4', 'c5'])
  })

  it('done retorna apenas progress === 100', () => {
    const result = filterContents(contents, [], '', new Set(), 'done')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c3')
  })
})

// ── filterContents — combinação ───────────────────────────────────────────────

describe('filterContents — filtros combinados', () => {
  it('busca + tipo funcionam juntos', () => {
    const contents = [
      makeContent({ id: 'c1', title: 'React', type: 'course' }),
      makeContent({ id: 'c2', title: 'React', type: 'book' }),
      makeContent({ id: 'c3', title: 'Vue', type: 'course' }),
    ]
    const result = filterContents(contents, [], 'react', new Set<ContentType>(['course']), 'all')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })

  it('tipo + status funcionam juntos', () => {
    const contents = [
      makeContent({ id: 'c1', type: 'book', progress: 0 }),
      makeContent({ id: 'c2', type: 'book', progress: 100 }),
      makeContent({ id: 'c3', type: 'course', progress: 0 }),
    ]
    const result = filterContents(contents, [], '', new Set<ContentType>(['book']), 'new')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })
})

// ── filterTrailsForSection ─────────────────────────────────────────────────────

describe('filterTrailsForSection', () => {
  const trails = [
    makeTrail({ id: 't1', projectId: 'p1' }),
    makeTrail({ id: 't2', projectId: 'p1' }),
    makeTrail({ id: 't3', projectId: 'p2' }),
    makeTrail({ id: 't4', projectId: null }),
  ]

  it('sem filtros retorna todas as trilhas', () => {
    expect(filterTrailsForSection(trails, null, null)).toHaveLength(4)
  })

  it('filtra por projeto', () => {
    const result = filterTrailsForSection(trails, 'p1', null)
    expect(result).toHaveLength(2)
    expect(result.every((t) => t.projectId === 'p1')).toBe(true)
  })

  it('filtra por trilha específica', () => {
    const result = filterTrailsForSection(trails, null, 't3')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('t3')
  })

  it('projeto + trilha combinados', () => {
    const result = filterTrailsForSection(trails, 'p1', 't1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('t1')
  })

  it('projeto sem trilhas retorna vazio', () => {
    const result = filterTrailsForSection(trails, 'p99', null)
    expect(result).toHaveLength(0)
  })
})

// ── filterProjects ─────────────────────────────────────────────────────────────

describe('filterProjects', () => {
  const projects = [
    { id: 'p1', name: 'Backend com Node', description: 'APIs REST' },
    { id: 'p2', name: 'Frontend React', description: null },
    { id: 'p3', name: 'Machine Learning', description: 'Python e PyTorch' },
  ]

  it('busca vazia retorna todos', () => {
    expect(filterProjects(projects, '')).toHaveLength(3)
  })

  it('filtra por nome', () => {
    const result = filterProjects(projects, 'react')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('p2')
  })

  it('filtra por description', () => {
    const result = filterProjects(projects, 'pytorch')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('p3')
  })

  it('filtra com acentos normalizados', () => {
    const result = filterProjects(projects, 'apis')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('p1')
  })

  it('description null não causa erro', () => {
    const result = filterProjects(projects, 'react')
    expect(result[0].id).toBe('p2')
  })

  it('retorna vazio sem correspondência', () => {
    expect(filterProjects(projects, 'java')).toHaveLength(0)
  })
})
