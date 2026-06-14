// src/components/exercises/ExerciseCard.tsx
"use client";

import type { Exercise } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDuration } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (id: string) => void;
  onTapAdd?: (exercise: Exercise) => void;
}

export function ExerciseCard({
  exercise,
  onEdit,
  onDelete,
  onTapAdd,
}: ExerciseCardProps) {
  const defaultParam =
    exercise.default_duration > 0
      ? formatDuration(exercise.default_duration)
      : `${exercise.default_reps} rép.`;

  return (
    <div
      className={cn(
        "group bg-salmon-50 border border-stone-200 rounded-xl p-3 select-none",
        "transition-all duration-150 hover:border-salmon-200 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div className="min-w-0">
            <span className="text-sm font-medium text-stone-900 leading-snug">
              {exercise.name}
            </span>

            {exercise.description && (
              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                {exercise.description}
              </p>
            )}

            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[11px] text-stone-400">
                {exercise.default_sets} séries · {defaultParam}
              </span>
            </div>

            {exercise.tags && exercise.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {exercise.tags.map((tag) => (
                  <Badge key={tag.id} color="salmon">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {(onTapAdd || onEdit || onDelete) && (
            <div className="flex gap-1">
              {onTapAdd && (
                <Tooltip text="Ajouter au programme">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTapAdd(exercise);
                    }}
                    aria-label={`Ajouter ${exercise.name} au programme`}
                  >
                    <Plus size={13} strokeWidth={2.5} />
                  </Button>
                </Tooltip>
              )}
              {onEdit && (
                <Tooltip text="Editer l'exercice">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(exercise);
                    }}
                    className="w-6 h-6 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center text-xs transition-colors"
                  >
                    ✏️
                  </button>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip text="Supprimer l'exercice">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(exercise.id);
                    }}
                    className="w-6 h-6 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center text-xs transition-colors"
                  >
                    🗑
                  </button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
