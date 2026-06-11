// src/app/programs/page.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import type { Program } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((res) => (Array.isArray(res) ? res : (res.data ?? [])));

export default function ProgramsPage() {
  const { data: programs, mutate } = useSWR<Program[]>(
    "/api/programs",
    fetcher,
  );
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/programs/${deleteTarget.id}`, { method: "DELETE" });
    mutate();
    setDeleting(false);
    setDeleteTarget(null);
  }

  async function handleDownloadPDF(id: string, title: string) {
    const res = await fetch(`/api/programs/${id}/pdf`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `programme-${title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-stone-800">
            Programmes sauvegardés
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {programs?.length ?? "…"} programme
            {(programs?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Button as="a" href="/exercises" variant="primary" size="sm">
          + Nouveau programme
        </Button>
      </div>

      {!programs && (
        <div className="text-center py-16 text-stone-400">Chargement…</div>
      )}

      {programs?.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-xl">
          <p className="text-stone-500 font-medium">
            Aucun programme sauvegardé
          </p>
          <p className="text-stone-400 text-sm mt-1">
            Composez un programme depuis la bibliothèque d'exercices
          </p>
        </div>
      )}

      <div className="space-y-3">
        {programs?.map((program) => (
          <div
            key={program.id}
            className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div>
              <h2 className="font-medium text-stone-900">{program.title}</h2>
              <p className="text-sm text-stone-500 mt-0.5">
                {program.exercises.length} exercice
                {program.exercises.length !== 1 ? "s" : ""} •{" "}
                {new Date(program.updated_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {program.notes && (
                <p className="text-sm text-stone-400 mt-1 line-clamp-1">
                  {program.notes}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDownloadPDF(program.id, program.title)}
                className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
              >
                PDF
              </button>
              <button
                onClick={() => setDeleteTarget(program)}
                className="px-3 py-1.5 text-xs rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le programme"
      >
        <div className="space-y-5">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-lg shrink-0">
              🗑
            </div>
            <div>
              <p className="text-sm text-stone-700">
                Vous êtes sur le point de supprimer le programme
              </p>
              <p className="font-semibold text-stone-900 mt-0.5">
                « {deleteTarget?.title} »
              </p>
              <p className="text-sm text-stone-500 mt-2">
                Cette action est irréversible. Les{" "}
                {deleteTarget?.exercises.length} exercice
                {(deleteTarget?.exercises.length ?? 0) !== 1 ? "s" : ""} du
                programme seront également supprimés.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
