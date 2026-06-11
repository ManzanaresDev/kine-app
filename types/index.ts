// src/types/index.ts
export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/* =========================
   DB MODEL (Supabase)
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
  tags?: Tag[]; // ← relation via exercise_tags, normalisée par l'API
}

/* =========================
   PROGRAM
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

export interface Program {
  id: string;
  title: string;
  notes: string | null;
  created_at: string; // ✅ snake_case
  updated_at: string; // ✅ snake_case
  exercises: ProgramExercise[];
}

export interface ProgramExerciseLocal {
  localId: string;
  exerciseId: string;
  exercise: Exercise;

  sets: number;
  reps: number | null;
  duration: number | null;

  order: number;
}

export type ExerciseMode = "reps" | "duration";
