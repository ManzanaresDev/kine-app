// src/app/exercises/page.tsx
"use client";

import { useState, useCallback } from "react";
import { ExerciseLibrary } from "@/components/exercises/ExerciseLibrary";
import { ProgramBuilder } from "@/components/programs/ProgramBuilder";
import type { Exercise, ProgramExerciseLocal } from "@/types";
import { generateLocalId } from "@/lib/utils";
import { Dumbbell, ClipboardList } from "lucide-react";

type Tab = "library" | "program";

export default function ExercisesPage() {
  const [programItems, setProgramItems] = useState<ProgramExerciseLocal[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("library");
  const [filteredCount, setFilteredCount] = useState(0);

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
    <>
      {/* DESKTOP */}
      <div className="hidden md:flex gap-4 h-[calc(100vh-88px)]">
        <div className="w-[420px] shrink-0 overflow-hidden flex flex-col bg-salmon-100 rounded-2xl p-4">
          <ExerciseLibrary
            onTapAdd={addExercise}
            onFilteredCountChange={setFilteredCount}
          />
        </div>
        <div className="w-px bg-stone-200 shrink-0" />
        <div className="flex-1 overflow-hidden flex flex-col bg-salmon-100 rounded-2xl p-4">
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
        <div
          className={[
            "flex-1 overflow-hidden p-4",
            activeTab === "library" ? "bg-salmon-50" : "bg-salmon-100",
          ].join(" ")}
        >
          {activeTab === "library" ? (
            <ExerciseLibrary
              onTapAdd={addExercise}
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

        <nav className="shrink-0 border-t border-stone-200 bg-salmon-100 safe-area-inset-bottom">
          <div className="flex">
            <button
              onClick={() => setActiveTab("library")}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors relative",
                activeTab === "library"
                  ? "text-salmon-600"
                  : "text-stone-400 hover:text-stone-600",
              ].join(" ")}
            >
              <span className="relative">
                <Dumbbell
                  size={22}
                  strokeWidth={activeTab === "library" ? 2.5 : 1.75}
                />
                {filteredCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-salmon-500 text-white text-[10px] font-bold flex items-center justify-center">
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
                  ? "text-salmon-600"
                  : "text-stone-400 hover:text-stone-600",
              ].join(" ")}
            >
              <span className="relative">
                <ClipboardList
                  size={22}
                  strokeWidth={activeTab === "program" ? 2.5 : 1.75}
                />
                {programItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-salmon-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {programItems.length}
                  </span>
                )}
              </span>
              <span>Program</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
