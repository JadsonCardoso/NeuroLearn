'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { loadState } from '@/services/localStorageService'
import { createContent } from '@/services/contentsService'
import { createFlashcards } from '@/services/flashcardsService'
import { addUserSkill } from '@/services/skillsService'

const MIGRATION_KEY = 'nl_migration_done'

export function useMigration(userId: string | null) {
  const [hasPendingData, setHasPendingData] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!userId) return
    if (localStorage.getItem(MIGRATION_KEY)) return

    const local = loadState()
    if (local.contents.length > 0 || local.cards.length > 0) {
      setHasPendingData(true)
    }
  }, [userId])

  async function migrate() {
    if (!userId) return
    setMigrating(true)

    const supabase = createClient()
    const local = loadState()

    try {
      // Importa conteúdos e mapeia IDs antigos → novos
      const contentIdMap: Record<string, string> = {}
      for (const c of local.contents) {
        const created = await createContent(userId, {
          title: c.title,
          type: c.type,
          author: c.author,
          desc: c.desc,
          color: c.color,
        })
        contentIdMap[c.id] = created.id
      }

      // Importa flashcards agrupados por conteúdo
      const cardsByContent: Record<string, typeof local.cards> = {}
      for (const card of local.cards) {
        const newCid = contentIdMap[card.cid]
        if (!newCid) continue
        cardsByContent[newCid] = cardsByContent[newCid] ?? []
        cardsByContent[newCid].push(card)
      }
      for (const [cid, cards] of Object.entries(cardsByContent)) {
        await createFlashcards(userId, cid, cards)
      }

      // Importa skills
      for (const skill of local.skills) {
        const { data: globalSkillData } = await supabase
          .from('skills')
          .select('id')
          .eq('name', skill.name)
          .maybeSingle()

        const globalSkill = globalSkillData as { id: string } | null
        let skillId = globalSkill?.id

        if (!skillId) {
          const { data: newSkillData } = await supabase
            .from('skills')
            .insert({ name: skill.name, category: skill.cat, color: skill.color })
            .select('id')
            .single()
          const newSkill = newSkillData as { id: string } | null
          skillId = newSkill?.id
        }

        if (skillId) await addUserSkill(userId, skillId)
      }

      // Marca migração como feita e limpa localStorage
      localStorage.setItem(MIGRATION_KEY, '1')
      localStorage.removeItem('nl_v2')

      setHasPendingData(false)
      setDone(true)
    } catch (err) {
      console.error('[useMigration] Erro ao migrar dados:', err)
    } finally {
      setMigrating(false)
    }
  }

  function dismiss() {
    localStorage.setItem(MIGRATION_KEY, '1')
    setHasPendingData(false)
  }

  return { hasPendingData, migrating, done, migrate, dismiss }
}
