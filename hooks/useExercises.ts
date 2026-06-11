import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Exercise = {
  id: string;
  name: string;
  description: string;
  category_id: string;
  default_sets: number;
  default_reps: number;
  default_duration: number;
  pathologies: string[];
  tags: string[];
};

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async () => {
    setLoading(true);

    const { data, error } = await supabase.from("exercises").select("*");

    if (error) {
      setError(error.message);
    } else {
      setExercises(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const createExercise = async (exercise: Omit<Exercise, "id">) => {
    const { data, error } = await supabase
      .from("exercises")
      .insert([
        {
          id: crypto.randomUUID(),
          ...exercise,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    setExercises((prev) => [...prev, data]);

    return data;
  };

  const deleteExercise = async (id: string) => {
    const { error } = await supabase.from("exercises").delete().eq("id", id);

    if (error) throw error;

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
