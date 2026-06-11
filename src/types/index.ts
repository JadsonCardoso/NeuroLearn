// ── Domain entities ────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin' | 'super_admin'

export type ContentType = 'book' | 'course' | 'video' | 'article' | 'note'

export type TrailType =
  | 'course'
  | 'book'
  | 'article'
  | 'free'
  | 'certification'
  | 'research'
  | 'tech'

export interface LearningTrail {
  id: string
  title: string
  type: TrailType
  description: string
  color: string
  iconEmoji: string
  goal: string
  skillId: string | null
  createdAt: string
}

export interface Content {
  id: string
  title: string
  type: ContentType
  author: string
  desc: string
  progress: number
  color: string
  addedAt: string
  trailId: string | null
}

export type ExerciseType = 'free_response' | 'multiple_choice'

export interface Exercise {
  id: string
  contentId: string
  question: string
  answer: string
  type: ExerciseType
  notes: string | null
  createdAt: string
}

export type CardMastery = 'new' | 'learning' | 'review' | 'strong'

export interface FlashCard {
  id: string
  cid: string
  front: string
  back: string
  ef: number
  interval: number
  reps: number
  nextReview: string | null
  lastReview: string | null
  mastery: CardMastery
}

export type SkillCategory =
  | 'product'
  | 'tech'
  | 'soft'
  | 'data'
  | 'business'
  | 'leadership'
  | 'design'
  | 'languages'
  | 'methods'
  | 'science'

export interface Skill {
  id: string
  name: string
  level: number
  xp: number
  maxXp: number
  cat: SkillCategory
  color: string
}

export interface StudySession {
  id: string
  cid: string
  date: string
  duration: number
  cardsCreated: number
  highlights: string[]
  notes: string
  teach: string
}

// ── App state ──────────────────────────────────────────────────────────────

export interface AppState {
  contents: Content[]
  cards: FlashCard[]
  skills: Skill[]
  sessions: StudySession[]
  trails: LearningTrail[]
  streak: number
  lastStudyDate: string
  totalXp: number
  streakShields: number
}

// ── Store actions ──────────────────────────────────────────────────────────

export type AppAction =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'ADD_CONTENT'; payload: Content }
  | { type: 'DELETE_CONTENT'; payload: string }
  | { type: 'UPDATE_CONTENT'; payload: Partial<Content> & { id: string } }
  | { type: 'UPDATE_CONTENT_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'ADD_CARDS'; payload: FlashCard[] }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'UPDATE_CARD'; payload: { id: string; front: string; back: string } }
  | { type: 'RATE_CARD'; payload: RateCardPayload }
  | { type: 'ADD_SKILL'; payload: Skill }
  | { type: 'DELETE_SKILL'; payload: string }
  | { type: 'GAIN_XP'; payload: { skillId: string; amount: number } }
  | { type: 'FINISH_SESSION'; payload: FinishSessionPayload }
  | { type: 'EARN_XP'; payload: { amount: number } }
  | { type: 'UPDATE_STREAK' }
  | { type: 'ADD_TRAIL'; payload: LearningTrail }
  | { type: 'UPDATE_TRAIL'; payload: Partial<LearningTrail> & { id: string } }
  | { type: 'DELETE_TRAIL'; payload: string }
  | { type: 'ASSIGN_CONTENT_TRAIL'; payload: { contentId: string; trailId: string | null } }
  | { type: 'LOAD_SHIELDS'; payload: number }
  | { type: 'USE_SHIELD' }

export interface RateCardPayload {
  cardId: string
  quality: 1 | 2 | 3 | 4
  ef: number
  interval: number
  repetitions: number
  nextReview: string
  lastReview: string
  mastery: CardMastery
  xpEarned: number
}

export interface FinishSessionPayload {
  session: StudySession
  cards: FlashCard[]
  contentId: string
}

// ── SM-2 ───────────────────────────────────────────────────────────────────

export interface SM2Result {
  ef: number
  interval: number
  repetitions: number
}

// ── Component props helpers ────────────────────────────────────────────────

export interface FocusResult {
  session: StudySession
  cards: FlashCard[]
}
