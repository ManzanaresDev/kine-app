// src/components/exercises/ExerciseFilters.tsx
"use client";

import { cn } from "@/lib/utils";
import { getTagNames } from "@/services/tags.service";

const ALL_CATEGORIES = Object.keys(getTagNames());

const CATEGORY_ICONS: Record<ExerciseCategory, string> = {
  genou: "🦵",
  hanche: "🦴",
  colonne: "🧍",
  equilibre: "⚖️",
  marche: "🚶",
  renforcement: "💪",
  respiratoire: "🫁",
};

interface ExerciseFiltersProps {
  selected: ExerciseCategory | null;
  search: string;
  onCategoryChange: (cat: ExerciseCategory | null) => void;
  onSearchChange: (value: string) => void;
}

export function ExerciseFilters({
  selected,
  search,
  onCategoryChange,
  onSearchChange,
}: ExerciseFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
          🔍
        </span>
        <input
          type="search"
          placeholder="Rechercher un exercice…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-stone-200 bg-salmon-50
            focus:outline-none focus:ring-2 focus:ring-salmon-300 focus:border-transparent
            placeholder:text-stone-400 transition-shadow"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            "px-3 py-1 text-xs rounded-full border font-medium transition-all duration-150",
            selected === null
              ? "bg-salmon-500 text-white border-salmon-500"
              : "bg-salmon-200 text-stone-600 border-stone-200 hover:border-salmon-300 hover:text-salmon-600",
          )}
        >
          Tous
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(selected === cat ? null : cat)}
            className={cn(
              "px-3 py-1 text-xs rounded-full border font-medium transition-all duration-150 flex items-center gap-1.5",
              selected === cat
                ? "bg-salmon-500 text-white border-salmon-500"
                : "bg-salmon-200 text-stone-600 border-stone-200 hover:border-salmon-300 hover:text-salmon-600",
            )}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}
