// src/components/exercises/ExerciseForm.tsx
"use client";

import { useState } from "react";
import type { Exercise, Tag, ExerciseFormInput } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagSelector } from "@/components/ui/TagSelector/TagSelector";

type Props = {
  initial?: Partial<ExerciseFormInput & { tags?: Tag[] }>;
  onSubmit: (data: ExerciseFormInput & { tag_ids: string[] }) => void;
  onCancel: () => void;
};

export function ExerciseForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<ExerciseFormInput>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    sets: initial?.sets ?? 3,
    reps: initial?.reps ?? 10,
    duration: initial?.duration ?? 0,
  });

  const [mode, setMode] = useState<"reps" | "duration">(
    (initial?.duration ?? 0) > 0 ? "duration" : "reps",
  );

  const [selectedTags, setSelectedTags] = useState<Tag[]>(initial?.tags ?? []);

  const [loading] = useState(false);
  const [error] = useState("");

  function update<K extends keyof ExerciseFormInput>(
    key: K,
    value: ExerciseFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onSubmit({
      ...form,
      tag_ids: selectedTags.map((t) => t.id),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* NAME */}
      <Input
        label="Nom de l'exercice"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        required
      />

      {/* DESCRIPTION */}
      <div>
        <label className="text-xs font-medium text-stone-600 uppercase mb-1 block">
          Description
        </label>

        <textarea
          value={form.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200"
        />
      </div>

      {/* MODE */}
      <div>
        <label className="text-xs font-medium text-stone-600 uppercase mb-1 block">
          Mode par défaut
        </label>

        <div className="flex gap-2">
          {(["reps", "duration"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-xs rounded-lg border ${
                mode === m
                  ? "bg-stone-800 text-white border-stone-800"
                  : "bg-white text-stone-600 border-stone-200"
              }`}
            >
              {m === "reps" ? "Répétitions" : "Durée"}
            </button>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="flex gap-3">
        <Input
          label="Séries"
          type="number"
          value={form.sets}
          onChange={(e) => update("sets", Number(e.target.value))}
        />

        {mode === "reps" ? (
          <Input
            label="Répétitions"
            type="number"
            value={form.reps ?? 0}
            onChange={(e) => update("reps", Number(e.target.value))}
          />
        ) : (
          <Input
            label="Durée (s)"
            type="number"
            value={form.duration ?? 0}
            onChange={(e) => update("duration", Number(e.target.value))}
          />
        )}
      </div>

      {/* TAGS */}
      <TagSelector selected={selectedTags} onChange={setSelectedTags} />

      {/* ERROR */}
      {error && <p className="text-sm text-rose-500">{error}</p>}

      {/* ACTIONS */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {initial ? "Mettre à jour" : "Créer l'exercice"}
        </Button>

        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
