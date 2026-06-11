import { createClient } from '@/lib/supabase/client'
import type { DbExercise } from '@/types/database.types'
import type { Exercise, ExerciseType } from '@/types'

export interface ExerciseInput {
  question: string
  answer: string
  type?: ExerciseType
  notes?: string | null
}

function toExercise(row: DbExercise): Exercise {
  return {
    id: row.id,
    contentId: row.content_id,
    question: row.question,
    answer: row.answer,
    type: row.type as ExerciseType,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export async function listExercisesByContent(
  userId: string,
  contentId: string
): Promise<Exercise[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(toExercise)
}

export async function createExercise(
  userId: string,
  contentId: string,
  input: ExerciseInput
): Promise<Exercise> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      user_id: userId,
      content_id: contentId,
      question: input.question,
      answer: input.answer,
      type: input.type ?? 'free_response',
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return toExercise(data)
}

export async function updateExercise(
  id: string,
  userId: string,
  input: Partial<ExerciseInput>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('exercises')
    .update({
      ...(input.question !== undefined && { question: input.question }),
      ...(input.answer !== undefined && { answer: input.answer }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.notes !== undefined && { notes: input.notes }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

export async function deleteExercise(id: string, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('exercises').delete().eq('id', id).eq('user_id', userId)

  if (error) throw error
}
