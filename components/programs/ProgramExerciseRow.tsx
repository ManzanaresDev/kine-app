// src/components/programs/ProgramExerciseRow.tsx
"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ProgramExerciseLocal } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, formatDuration } from "@/lib/utils";

interface ProgramExerciseRowProps {
  item: ProgramExerciseLocal;
  onUpdate: (updates: Partial<ProgramExerciseLocal>) => void;
  onRemove: () => void;
}

type Mode = "reps" | "duration";

export function ProgramExerciseRow({
  item,
  onUpdate,
  onRemove,
}: ProgramExerciseRowProps) {
  const [mode, setMode] = useState<Mode>(
    item.duration !== null ? "duration" : "reps",
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.localId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleModeSwitch(newMode: Mode) {
    setMode(newMode);
    if (newMode === "reps") {
      onUpdate({ reps: item.exercise.default_reps || 10, duration: null });
    } else {
      onUpdate({ reps: null, duration: item.exercise.default_duration || 30 });
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-salmon-50 border border-stone-200 rounded-xl p-3 group",
        "transition-shadow duration-150",
        isDragging
          ? "opacity-40 shadow-2xl ring-2 ring-salmon-400/30"
          : "hover:shadow-sm hover:border-stone-300",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 flex flex-col gap-[3px] shrink-0 opacity-30 group-hover:opacity-60 cursor-grab active:cursor-grabbing transition-opacity touch-none"
          aria-label="Réordonner"
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-[3px]">
              <div className="w-[3px] h-[3px] rounded-full bg-stone-600" />
              <div className="w-[3px] h-[3px] rounded-full bg-stone-600" />
            </div>
          ))}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-sm font-medium text-stone-900">
              {item.exercise.name}
            </span>
            {item.exercise.tags?.map((tag) => (
              <Badge key={tag.id} color="salmon">
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <label className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500">Séries</span>
              <input
                type="number"
                min={1}
                max={20}
                value={item.sets}
                onChange={(e) =>
                  onUpdate({ sets: Math.max(1, Number(e.target.value)) })
                }
                className="w-14 px-2 py-1 text-sm text-center rounded-lg border border-stone-200 bg-stone-50
                  focus:outline-none focus:ring-2 focus:ring-salmon-300 focus:border-transparent"
              />
            </label>

            <span className="text-stone-300">×</span>

            <div className="flex items-center gap-1.5">
              <div className="flex rounded-lg border border-stone-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleModeSwitch("reps")}
                  className={cn(
                    "px-2 py-1 text-[11px] font-medium transition-all",
                    mode === "reps"
                      ? "bg-salmon-500 text-white"
                      : "bg-white text-stone-500 hover:bg-stone-50",
                  )}
                >
                  Rép.
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch("duration")}
                  className={cn(
                    "px-2 py-1 text-[11px] font-medium transition-all border-l border-stone-200",
                    mode === "duration"
                      ? "bg-salmon-500 text-white"
                      : "bg-white text-stone-500 hover:bg-stone-50",
                  )}
                >
                  Durée
                </button>
              </div>

              {mode === "reps" ? (
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={item.reps ?? 10}
                  onChange={(e) =>
                    onUpdate({ reps: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-16 px-2 py-1 text-sm text-center rounded-lg border border-stone-200 bg-stone-50
                    focus:outline-none focus:ring-2 focus:ring-salmon-300 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={5}
                    max={3600}
                    step={5}
                    value={item.duration ?? 30}
                    onChange={(e) =>
                      onUpdate({
                        duration: Math.max(5, Number(e.target.value)),
                      })
                    }
                    className="w-20 px-2 py-1 text-sm text-center rounded-lg border border-stone-200 bg-stone-50
                      focus:outline-none focus:ring-2 focus:ring-salmon-300 focus:border-transparent"
                  />
                  <span className="text-xs text-stone-400">
                    = {formatDuration(item.duration ?? 30)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={onRemove}
          aria-label="Retirer du programme"
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
