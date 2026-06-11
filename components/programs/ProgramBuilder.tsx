// src/components/programs/ProgramBuilder.tsx
"use client";

import { useState, useEffect } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Dumbbell } from "lucide-react";
import type { ProgramExerciseLocal } from "@/types";
import { ProgramExerciseRow } from "./ProgramExerciseRow";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ProgramBuilderProps {
  items: ProgramExerciseLocal[];
  onUpdateItem: (
    localId: string,
    updates: Partial<ProgramExerciseLocal>,
  ) => void;
  onRemoveItem: (localId: string) => void;
  onReorder: (items: ProgramExerciseLocal[]) => void;
}

export function ProgramBuilder({
  items,
  onUpdateItem,
  onRemoveItem,
  onReorder,
}: ProgramBuilderProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [savedProgramId, setSavedProgramId] = useState<string | null>(null);

  const { isOver, setNodeRef } = useDroppable({ id: "program-drop-zone" });

  // Si le contenu change après une sauvegarde, l'ID n'est plus valide
  useEffect(() => {
    setSavedProgramId(null);
  }, [items, title, notes]);

  async function saveProgram(): Promise<string | null> {
    const res = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        notes: notes.trim() || null,
        exercises: items.map((item, idx) => ({
          exerciseId: item.exerciseId,
          sets: item.sets,
          reps: item.reps,
          duration: item.duration,
          order: idx,
        })),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Erreur sauvegarde:", err);
      alert("Erreur lors de la sauvegarde");
      return null;
    }

    const program = await res.json();
    setSavedProgramId(program.id);
    return program.id;
  }

  async function handleSave() {
    if (items.length === 0) return;
    if (!title.trim()) {
      alert("Donnez un nom au programme");
      return;
    }

    setSaving(true);
    try {
      const id = await saveProgram();
      if (id) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleExportPDF() {
    if (items.length === 0) return;
    if (!title.trim()) {
      alert("Donnez un nom au programme avant d'exporter");
      return;
    }

    setPdfLoading(true);
    try {
      const programId = savedProgramId ?? (await saveProgram());
      if (!programId) return;

      const pdfRes = await fetch(`/api/programs/${programId}/pdf`);
      if (!pdfRes.ok) return;

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `programme-${title.trim().replace(/\s+/g, "-").toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  }

  const isEmpty = items.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <h2 className="font-display text-xl text-stone-800 mb-3">
          Programme en cours
        </h2>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nom du programme…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white
              focus:outline-none focus:ring-2 focus:ring-salmon-300 focus:border-transparent
              placeholder:text-stone-400 font-medium"
          />
          <textarea
            placeholder="Notes cliniques (optionnel)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white
              focus:outline-none focus:ring-2 focus:ring-salmon-300 focus:border-transparent
              placeholder:text-stone-400 resize-none"
          />
        </div>
      </div>

      {/* Drop zone + sortable list */}
      <div
        ref={setNodeRef}
        id="program-drop-zone"
        className={cn(
          "flex-1 overflow-y-auto rounded-2xl border-2 border-dashed transition-all duration-200",
          isOver
            ? "border-salmon-400 bg-salmon-50/50"
            : isEmpty
              ? "border-stone-200 bg-stone-50/50"
              : "border-transparent bg-transparent",
        )}
      >
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16">
            {/* <div className="text-4xl mb-3">🎯</div>
            <p className="text-stone-500 font-medium">
              Glissez des exercices ici
            </p>
            <p className="text-stone-400 text-sm mt-1">
              Depuis la bibliothèque à gauche
            </p> */}
          </div>
        ) : (
          <SortableContext
            items={items.map((i) => i.localId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 p-1">
              {items.map((item) => (
                <ProgramExerciseRow
                  key={item.localId}
                  item={item}
                  onUpdate={(updates) => onUpdateItem(item.localId, updates)}
                  onRemove={() => onRemoveItem(item.localId)}
                />
              ))}

              {isOver && (
                <div className="h-12 rounded-xl border-2 border-dashed border-salmon-300 bg-salmon-50/50 flex items-center justify-center">
                  <span className="text-xs text-salmon-600">Déposer ici</span>
                </div>
              )}
            </div>
          </SortableContext>
        )}
      </div>

      {/* Footer actions */}
      <div className="shrink-0 mt-4 pt-4 border-t border-stone-100 flex items-center gap-3">
        <div className="flex-1">
          <span className="relative inline-flex">
            <Dumbbell size={22} strokeWidth={1.75} className="text-stone-400" />
            {items.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">
                {items.length}
              </span>
            )}
          </span>
        </div>

        {items.length > 0 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPDF}
              disabled={pdfLoading}
            >
              {pdfLoading ? "…" : "📄 PDF"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving || items.length === 0}
              className={cn(saved && "!bg-emerald-600")}
            >
              {saved
                ? "✓ Sauvegardé !"
                : saving
                  ? "Enregistrement…"
                  : "Sauvegarder"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
