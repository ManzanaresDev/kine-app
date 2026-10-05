// app/programs/[id]/page.tsx
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { pdf } from '@react-pdf/renderer'
import type { Program, ProgramExerciseLocal } from '@/types'
import { Button } from '@/components/ui/Button'
import { ProgramExerciseRow } from '@/components/programs/ProgramExerciseRow'
import { ProgramPDFDocument } from '@/components/programs/ProgramPDF'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  })

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<ProgramExerciseLocal[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const { data: program, error, mutate } = useSWR<Program>(
    `/api/programs/${id}`,
    fetcher,
    {
      onSuccess: (data) => {
        setTitle(data.title)
        setNotes(data.notes ?? '')
        setItems(
          data.exercises.map((pe) => ({
            localId: pe.id,
            exerciseId: pe.exerciseId,
            exercise: pe.exercise,
            sets: pe.sets,
            reps: pe.reps,
            duration: pe.duration,
            order: pe.order,
          }))
        )
      },
    }
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.localId === active.id)
      const newIndex = prev.findIndex((i) => i.localId === over.id)
      return arrayMove(prev, oldIndex, newIndex).map((item, idx) => ({ ...item, order: idx }))
    })
  }

  function handleUpdateItem(localId: string, updates: Partial<ProgramExerciseLocal>) {
    setItems((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, ...updates } : item))
    )
  }

  function handleRemoveItem(localId: string) {
    setItems((prev) =>
      prev.filter((item) => item.localId !== localId).map((item, idx) => ({ ...item, order: idx }))
    )
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      })
      if (!res.ok) throw new Error('Sauvegarde échouée')
      mutate()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error(e)
      alert('Échec de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer définitivement ce programme ?')) return
    try {
      const res = await fetch(`/api/programs/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 404) throw new Error('Suppression échouée')
      router.push('/programs')
    } catch (e) {
      console.error(e)
      alert('Échec de la suppression')
    }
  }

  async function handleDownloadPDF() {
    if (!program) return
    setPdfLoading(true)
    try {
      const current = {
        ...program,
        title,
        notes,
        exercises: items.map((item, idx) => ({
          id: item.localId,
          exerciseId: item.exerciseId,
          exercise: item.exercise,
          sets: item.sets,
          reps: item.reps,
          duration: item.duration,
          order: idx,
        })),
      }
      const blob = await pdf(<ProgramPDFDocument program={current as any} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `programme-${title.replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('Échec de la génération du PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Impossible de charger le programme ({error.message})
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400">
        Chargement…
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <a href="/programs" className="hover:text-stone-800 transition-colors">
          Programmes
        </a>
        <span>/</span>
        <span className="text-stone-800 font-medium">{program.title}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 font-display text-2xl text-stone-800 rounded-xl border border-transparent
              hover:border-stone-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-salmon-300
              bg-transparent hover:bg-white focus:bg-white transition-all"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes cliniques…"
            rows={2}
            className="w-full px-3 py-2 text-sm text-stone-600 rounded-xl border border-transparent
              hover:border-stone-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-salmon-300
              bg-transparent hover:bg-white focus:bg-white placeholder:text-stone-300 resize-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-2 shrink-0 pt-1">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className={saved ? '!bg-emerald-600' : ''}
          >
            {saved ? '✓ Sauvegardé' : saving ? 'Enregistrement…' : 'Sauvegarder'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF} disabled={pdfLoading}>
            {pdfLoading ? '…' : '📄 PDF'}
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Supprimer
          </Button>
        </div>
      </div>

      {/* Meta */}
      <p className="text-xs text-stone-400 mb-4">
        {items.length} exercice{items.length !== 1 ? 's' : ''} · Modifié le{' '}
        {new Date(program.updated_at).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </p>

      {/* Exercise list */}
      {items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400">
          <p className="font-medium">Aucun exercice dans ce programme</p>
          <p className="text-sm mt-1">
            <a href="/exercises" className="text-salmon-600 hover:text-salmon-700 hover:underline">
              Retournez à la bibliothèque
            </a>{' '}
            pour en ajouter
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.localId)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <ProgramExerciseRow
                  key={item.localId}
                  item={item}
                  onUpdate={(updates) => handleUpdateItem(item.localId, updates)}
                  onRemove={() => handleRemoveItem(item.localId)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}