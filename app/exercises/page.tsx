// src/app/exercises/page.tsx
"use client";

import { useState } from "react";
import { ExerciseLibrary } from "@/components/exercises/ExerciseLibrary";
import { ProgramBuilder } from "@/components/programs/ProgramBuilder";
import type { Exercise, ProgramExerciseLocal } from "@/types";
import { generateLocalId } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { ExerciseCard } from "@/components/exercises/ExerciseCard";

export default function ExercisesPage() {
  const [programItems, setProgramItems] = useState<ProgramExerciseLocal[]>([]);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const exercise = event.active.data.current?.exercise as
      | Exercise
      | undefined;
    if (exercise) setActiveExercise(exercise);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveExercise(null);
    const { active, over } = event;

    // Only add if dropped on the program builder zone
    if (!over) return;
    if (
      over.id !== "program-drop-zone" &&
      !String(over.id).startsWith("program-item-")
    )
      return;

    const exercise = active.data.current?.exercise as Exercise | undefined;
    if (!exercise) return;

    // Avoid duplicates
    if (programItems.some((item) => item.exerciseId === exercise.id)) return;

    const newItem: ProgramExerciseLocal = {
      localId: generateLocalId(),
      exerciseId: exercise.id,
      exercise,
      sets: exercise.defaultSets || 3,
      reps: exercise.defaultDuration === 0 ? exercise.defaultReps || 10 : null,
      duration: exercise.defaultDuration > 0 ? exercise.defaultDuration : null,
      order: programItems.length,
    };

    setProgramItems((prev) => [...prev, newItem]);
  }

  function handleUpdateItem(
    localId: string,
    updates: Partial<ProgramExerciseLocal>,
  ) {
    setProgramItems((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, ...updates } : item,
      ),
    );
  }

  function handleRemoveItem(localId: string) {
    setProgramItems((prev) =>
      prev
        .filter((item) => item.localId !== localId)
        .map((item, idx) => ({ ...item, order: idx })),
    );
  }

  function handleReorder(items: ProgramExerciseLocal[]) {
    setProgramItems(items.map((item, idx) => ({ ...item, order: idx })));
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-[calc(100vh-88px)]">
        {/* Left: Exercise library */}
        <div className="w-[420px] shrink-0 overflow-hidden flex flex-col">
          <ExerciseLibrary />
        </div>

        {/* Divider */}
        <div className="w-px bg-stone-200 shrink-0" />

        {/* Right: Program builder */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ProgramBuilder
            items={programItems}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onReorder={handleReorder}
          />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeExercise && (
          <div className="rotate-2 scale-105 shadow-2xl shadow-stone-900/20">
            <ExerciseCard exercise={activeExercise} isDragOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
