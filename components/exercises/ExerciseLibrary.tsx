// src/components/exercises/ExerciseLibrary.tsx
"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import type { Exercise, Tag } from "@/types";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseForm } from "./ExerciseForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((res) => (Array.isArray(res) ? res : res.data));

interface ExerciseLibraryProps {
  onTapAdd?: (exercise: Exercise) => void;
  onFilteredCountChange?: (count: number) => void;
}

export function ExerciseLibrary({
  onTapAdd,
  onFilteredCountChange,
}: ExerciseLibraryProps) {
  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const {
    data: exercises,
    mutate,
    isLoading,
  } = useSWR<Exercise[]>("/api/exercises", fetcher);
  const { data: tags } = useSWR<Tag[]>("/api/tags", fetcher);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const list = Array.isArray(exercises) ? exercises : [];
    const q = search.toLowerCase();

    const result = list.filter((ex) => {
      const matchesSearch = !search || ex.name.toLowerCase().includes(q);
      const matchesTags =
        selectedTagIds.size === 0 ||
        ex.tags?.some((t) => selectedTagIds.has(t.id));
      return matchesSearch && matchesTags;
    });

    onFilteredCountChange?.(result.length);
    return result;
  }, [exercises, search, selectedTagIds, onFilteredCountChange]);

  async function handleCreate(data: any) {
    await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    mutate();
    setIsFormOpen(false);
  }

  async function handleUpdate(data: any) {
    if (!editingExercise) return;
    await fetch(`/api/exercises/${editingExercise.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    mutate();
    setEditingExercise(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet exercice ?")) return;
    await fetch(`/api/exercises/${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="shrink-0 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-xl text-stone-800">
              Bibliothèque
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {filtered.length} exercice{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsFormOpen(true)}
          >
            + Ajouter
          </Button>
        </div>

        {/* SEARCH */}
        <input
          type="search"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-salmon-300 focus:border-transparent"
        />

        {/* TAGS */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => {
              const active = selectedTagIds.has(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={[
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                    active
                      ? "bg-salmon-500 text-white border-salmon-500"
                      : "bg-white text-stone-500 border-stone-200 hover:border-salmon-300 hover:text-salmon-600",
                  ].join(" ")}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading && (
          <div className="text-center py-12 text-stone-400 text-sm">
            Chargement…
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-stone-400 text-sm">
            Aucun exercice trouvé
          </div>
        )}

        {filtered.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onEdit={(ex) => setEditingExercise(ex)}
            onDelete={handleDelete}
            onTapAdd={onTapAdd}
          />
        ))}
      </div>

      {/* CREATE */}
      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Nouvel exercice"
      >
        <ExerciseForm
          onSubmit={handleCreate}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* EDIT */}
      <Modal
        open={!!editingExercise}
        onClose={() => setEditingExercise(null)}
        title="Modifier l'exercice"
      >
        {editingExercise && (
          <ExerciseForm
            initial={editingExercise}
            onSubmit={handleUpdate}
            onCancel={() => setEditingExercise(null)}
          />
        )}
      </Modal>
    </div>
  );
}
