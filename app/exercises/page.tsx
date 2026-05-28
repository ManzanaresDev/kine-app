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
import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { Dumbbell, ClipboardList } from "lucide-react";

type Tab = "library" | "program";

export default function ExercisesPage() {
  const [programItems, setProgramItems] = useState<ProgramExerciseLocal[]>([]);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("library");

  // Support both pointer (desktop) and touch (mobile) sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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
    setActiveExercise(null);
    const { active, over } = event;

    if (!over) return;
    if (
      over.id !== "program-drop-zone" &&
      !String(over.id).startsWith("program-item-")
    )
      return;

    const exercise = active.data.current?.exercise as Exercise | undefined;
    if (!exercise) return;

    addExercise(exercise);
  }

  // Separate function so it can be called from both DnD and tap-to-add
  const addExercise = useCallback(
    (exercise: Exercise) => {
      if (programItems.some((item) => item.exerciseId === exercise.id)) return;

      const newItem: ProgramExerciseLocal = {
        localId: generateLocalId(),
        exerciseId: exercise.id,
        exercise,
        sets: exercise.defaultSets || 3,
        reps:
          exercise.defaultDuration === 0 ? exercise.defaultReps || 10 : null,
        duration:
          exercise.defaultDuration > 0 ? exercise.defaultDuration : null,
        order: programItems.length,
      };

      setProgramItems((prev) => [...prev, newItem]);
    },
    [programItems],
  );

  // Called when user taps "+" on mobile (no drag needed)
  function handleTapAdd(exercise: Exercise) {
    addExercise(exercise);
    // Optionally switch to the program tab so user sees it was added
    // setActiveTab("program");
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
      {/*
       * ── DESKTOP LAYOUT (md+) ──────────────────────────────────────────────
       * Side-by-side: library | divider | program builder
       * Unchanged from original, hidden on mobile.
       */}
      <div className="hidden md:flex gap-4 h-[calc(100vh-88px)]">
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

      {/*
       * ── MOBILE LAYOUT (< md) ─────────────────────────────────────────────
       * Full-screen tabbed view + persistent bottom navigation bar.
       * The bottom nav mirrors iOS/Android conventions so the thumb can reach it.
       */}
      <div className="flex md:hidden flex-col" style={{ height: "calc(100dvh - 88px)" }}>
        {/* Tab panels – only the active one is rendered */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "library" ? (
            <div className="h-full overflow-hidden flex flex-col">
              {/*
               * Pass onTapAdd so ExerciseLibrary can expose a "+" button on
               * each card (no drag required on touch screens).
               * If ExerciseLibrary doesn't support this prop yet, it is simply
               * ignored and drag-to-add still works via DnD.
               */}
              <ExerciseLibrary onTapAdd={handleTapAdd} />
            </div>
          ) : (
            <div className="h-full overflow-hidden flex flex-col">
              <ProgramBuilder
                items={programItems}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
                onReorder={handleReorder}
              />
            </div>
          )}
        </div>

        {/* Bottom navigation bar */}
        <nav className="shrink-0 border-t border-stone-200 bg-white safe-area-inset-bottom">
          <div className="flex">
            <button
              onClick={() => setActiveTab("library")}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors",
                activeTab === "library"
                  ? "text-stone-900"
                  : "text-stone-400 hover:text-stone-600",
              ].join(" ")}
              aria-current={activeTab === "library" ? "page" : undefined}
            >
              <Dumbbell
                size={22}
                strokeWidth={activeTab === "library" ? 2.5 : 1.75}
              />
              <span>Exercises</span>
            </button>

            <button
              onClick={() => setActiveTab("program")}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors relative",
                activeTab === "program"
                  ? "text-stone-900"
                  : "text-stone-400 hover:text-stone-600",
              ].join(" ")}
              aria-current={activeTab === "program" ? "page" : undefined}
            >
              <span className="relative">
                <ClipboardList
                  size={22}
                  strokeWidth={activeTab === "program" ? 2.5 : 1.75}
                />
                {/* Badge showing number of exercises in program */}
                {programItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {programItems.length}
                  </span>
                )}
              </span>
              <span>Program</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Drag overlay – works on both layouts */}
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
