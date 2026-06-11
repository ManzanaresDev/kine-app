import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Program = {
  id: string;
  title: string;
  notes: string | null;
};

export const usePrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    setLoading(true);

    const { data, error } = await supabase.from("programs").select("*");

    if (error) {
      setError(error.message);
    } else {
      setPrograms(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const createProgram = async (program: Omit<Program, "id">) => {
    const { data, error } = await supabase
      .from("programs")
      .insert([
        {
          id: crypto.randomUUID(),
          ...program,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    setPrograms((prev) => [...prev, data]);

    return data;
  };

  const deleteProgram = async (id: string) => {
    const { error } = await supabase.from("programs").delete().eq("id", id);

    if (error) throw error;

    setPrograms((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    programs,
    loading,
    error,
    fetchPrograms,
    createProgram,
    deleteProgram,
  };
};
