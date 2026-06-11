// src/app/exercises/page.tsx
"use client";

import { useState, useCallback } from "react";
import { ExerciseLibrary } from "@/components/exercises/ExerciseLibrary";
import { ProgramBuilder } from "@/components/programs/ProgramBuilder";
import type { Exercise, ProgramExerciseLocal } from "@/types";
import { generateLocalId } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { Dumbbell, ClipboardList } from "lucide-react";

type Tab = "library" | "program";

export default function ExercisesPage() {
  const [programItems, setProgramItems] = useState<ProgramExerciseLocal[]>([]);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("library");
  const [filteredCount, setFilteredCount] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const exercise = event.active.data.current?.exercise as
      | Exercise
      | undefined;
    if (exercise) setActiveExercise(exercise);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveExercise(null);
    if (!over) return;

    const isValidDrop =
      over.id === "program-drop-zone" ||
      String(over.id).startsWith("program-item-");
    if (!isValidDrop) return;

    const exercise = active.data.current?.exercise as Exercise | undefined;
    if (!exercise) return;
    addExercise(exercise);
  }

  const addExercise = useCallback((exercise: Exercise) => {
    setProgramItems((prev) => {
      const exists = prev.some((item) => item.exerciseId === exercise.id);
      if (exists) return prev;

      const newItem: ProgramExerciseLocal = {
        localId: generateLocalId(),
        exerciseId: exercise.id,
        exercise,
        sets: exercise.default_sets || 3,
        reps:
          exercise.default_reps && exercise.default_reps > 0
            ? exercise.default_reps
            : null,
        duration:
          exercise.default_duration && exercise.default_duration > 0
            ? exercise.default_duration
            : null,
        order: prev.length,
      };

      return [...prev, newItem];
    });
  }, []);

  function handleTapAdd(exercise: Exercise) {
    addExercise(exercise);
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
      {/* DESKTOP */}
      <div className="hidden md:flex gap-4 h-[calc(100vh-88px)]">
        <div className="w-[420px] shrink-0 overflow-hidden flex flex-col">
          <ExerciseLibrary
            onTapAdd={handleTapAdd}
            onFilteredCountChange={setFilteredCount}
          />
        </div>

        <div className="w-px bg-stone-200 shrink-0" />

        <div className="flex-1 overflow-hidden flex flex-col">
          <ProgramBuilder
            items={programItems}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onReorder={handleReorder}
          />
        </div>
      </div>

      {/* MOBILE */}
      <div
        className="flex md:hidden flex-col"
        style={{ height: "calc(100dvh - 88px)" }}
      >
        <div className="flex-1 overflow-hidden">
          {activeTab === "library" ? (
            <ExerciseLibrary
              onTapAdd={handleTapAdd}
              onFilteredCountChange={setFilteredCount}
            />
          ) : (
            <ProgramBuilder
              items={programItems}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
              onReorder={handleReorder}
            />
          )}
        </div>

        <nav className="shrink-0 border-t border-stone-200 bg-white safe-area-inset-bottom">
          <div className="flex">
            <button
              onClick={() => setActiveTab("library")}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors relative",
                activeTab === "library"
                  ? "text-stone-900"
                  : "text-stone-400 hover:text-stone-600",
              ].join(" ")}
            >
              <span className="relative">
                <Dumbbell
                  size={22}
                  strokeWidth={activeTab === "library" ? 2.5 : 1.75}
                />
                {filteredCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">
                    {filteredCount}
                  </span>
                )}
              </span>
              <span>Exercices</span>
            </button>

            <button
              onClick={() => setActiveTab("program")}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors relative",
                activeTab === "program"
                  ? "text-stone-900"
                  : "text-stone-400 hover:text-stone-600",
              ].join(" ")}
            >
              <span className="relative">
                <ClipboardList
                  size={22}
                  strokeWidth={activeTab === "program" ? 2.5 : 1.75}
                />
                {programItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">
                    {programItems.length}
                  </span>
                )}
              </span>
              <span>Program</span>
            </button>
          </div>
        </nav>
      </div>

      {/* DRAG OVERLAY */}
      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {activeExercise && (
          <div
            style={{ width: 360 }}
            className="rotate-2 scale-105 shadow-2xl shadow-stone-900/20"
          >
            <ExerciseCard exercise={activeExercise} isDragOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
