import { useEffect, useState } from "react";
import { fetcher } from "../lib/fetcher";

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
    setError(null);

    try {
      const data = await fetcher<Program[]>("/api/programs");
      setPrograms(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const createProgram = async (program: Omit<Program, "id">) => {
    // L'id est généré côté serveur
    const created = await fetcher<Program>("/api/programs", {
      method: "POST",
      body: JSON.stringify(program),
    });

    setPrograms((prev) => [created, ...prev]);
    return created;
  };

  const deleteProgram = async (id: string) => {
    await fetcher(`/api/programs/${id}`, { method: "DELETE" });
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