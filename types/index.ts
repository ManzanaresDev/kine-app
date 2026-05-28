// src/types/index.ts

export type ExerciseCategory =
  | 'mobility'
  | 'strengthening'
  | 'cardio'
  | 'balance'
  | 'breathing'

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  mobility: 'Mobilité',
  strengthening: 'Renforcement',
  cardio: 'Cardio',
  balance: 'Équilibre',
  breathing: 'Respiration',
}

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  mobility: 'teal',
  strengthening: 'indigo',
  cardio: 'rose',
  balance: 'amber',
  breathing: 'sky',
}

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  description: string | null
  defaultSets: number
  defaultReps: number
  defaultDuration: number // 0 = reps mode
  pathologies: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ProgramExercise {
  id: string
  programId: string
  exerciseId: string
  sets: number
  reps: number | null
  duration: number | null // seconds
  order: number
  exercise: Exercise
}

export interface Program {
  id: string
  title: string
  notes: string | null
  createdAt: string
  updatedAt: string
  exercises: ProgramExercise[]
}

// Used for the drag-and-drop builder (client-side only, not yet saved)
export interface ProgramExerciseLocal {
  localId: string   // temporary ID before save
  exerciseId: string
  exercise: Exercise
  sets: number
  reps: number | null
  duration: number | null
  order: number
}

export type ExerciseMode = 'reps' | 'duration'
