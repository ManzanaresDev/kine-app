import { useEffect, useState } from "react";
import { fetcher } from "../lib/fetcher";

export type Tag = { id: string; name: string; slug: string };

export type Exercise = {
  id: string;
  name: string;
  description: string | null;
  default_sets: number;
  default_reps: number;
  default_duration: number;
  created_at?: string;
  updated_at?: string;
  tags: Tag[];
  // Plus renvoyés par l'API pour l'instant (voir remarques)
  category_id?: string;
  pathologies?: string[];
};

// Ce que POST /api/exercises accepte
export type ExerciseInput = {
  name: string;
  description?: string;
  default_sets?: number;
  default_reps?: number;
  default_duration?: number;
  tag_ids?: string[];
};

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await fetcher<{ data: Exercise[] }>("/api/exercises");
      setExercises(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const createExercise = async (exercise: ExerciseInput) => {
    const created = await fetcher<Exercise>("/api/exercises", {
      method: "POST",
      body: JSON.stringify(exercise),
    });

    // La route POST renvoie tags: [] → on relit la liste pour avoir les vrais tags
    const { data } = await fetcher<{ data: Exercise[] }>("/api/exercises");
    setExercises(data ?? []);

    return created;
  };

  const deleteExercise = async (id: string) => {
    await fetcher(`/api/exercises/${id}`, { method: "DELETE" });
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  return {
    exercises,
    loading,
    error,
    fetchExercises,
    createExercise,
    deleteExercise,
  };
};