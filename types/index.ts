// src/types/index.ts

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/* =========================
   EXERCISE
========================= */
export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  default_sets: number;
  default_reps: number;
  default_duration: number;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export type ExerciseFormInput = {
  name: string;
  description?: string | null;
  sets: number;
  reps?: number | null;
  duration?: number | null;
};

export type ExerciseMode = "reps" | "duration";

/* =========================
   PROGRAM — DB row
========================= */
export interface ProgramExercise {
  id: string;
  program_id: string;
  exercise_id: string;
  sets: number;
  reps: number | null;
  duration: number | null;
  order_index: number;
}

/* =========================
   PROGRAM — API response
   (exercises enrichis avec la relation exercise + order camelCase)
========================= */
export interface ProgramExerciseAPI {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number | null;
  duration: number | null;
  order: number;
}

export interface Program {
  id: string;
  title: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  exercises: ProgramExerciseAPI[];
}

/* =========================
   LOCAL (état React, avant sauvegarde)
========================= */
export interface ProgramExerciseLocal {
  localId: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number | null;
  duration: number | null;
  order: number;
}
