// src/components/exercises/ExerciseLibrary.tsx
'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import type { Exercise, ExerciseCategory } from '@/types'
import { ExerciseCard } from './ExerciseCard'
import { ExerciseFilters } from './ExerciseFilters'
import { ExerciseForm } from './ExerciseForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ExerciseLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

  const { data: exercises, mutate } = useSWR<Exercise[]>('/api/exercises', fetcher)

  const filtered = useMemo(() => {
    if (!exercises) return []
    return exercises.filter((ex) => {
      const matchesCat = !selectedCategory || ex.category === selectedCategory
      const matchesSearch =
        !search ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.description?.toLowerCase().includes(search.toLowerCase()) ||
        ex.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      return matchesCat && matchesSearch
    })
  }, [exercises, selectedCategory, search])

  async function handleCreate(data: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) {
    await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    mutate()
    setIsFormOpen(false)
  }

  async function handleUpdate(data: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!editingExercise) return
    await fetch(`/api/exercises/${editingExercise.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    mutate()
    setEditingExercise(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet exercice ?')) return
    await fetch(`/api/exercises/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-xl text-stone-800">Bibliothèque</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {filtered.length} exercice{filtered.length !== 1 ? 's' : ''}{' '}
              {exercises && filtered.length !== exercises.length
                ? `sur ${exercises.length}`
                : ''}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsFormOpen(true)}
          >
            + Ajouter
          </Button>
        </div>

        <ExerciseFilters
          selected={selectedCategory}
          search={search}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearch}
        />
      </div>

      {/* Drag hint */}
      <div className="shrink-0 mb-3 flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-100 rounded-xl">
        <span className="text-base">👈</span>
        <p className="text-xs text-teal-700">
          Glissez un exercice vers le programme à droite
        </p>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {!exercises && (
          <div className="text-center py-12 text-stone-400 text-sm">Chargement…</div>
        )}

        {exercises && filtered.length === 0 && (
          <div className="text-center py-12 text-stone-400 text-sm">
            Aucun exercice trouvé
          </div>
        )}

        {filtered.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onEdit={(ex) => setEditingExercise(ex)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Create modal */}
      <Modal open={isFormOpen} onClose={() => setIsFormOpen(false)} title="Nouvel exercice">
        <ExerciseForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editingExercise}
        onClose={() => setEditingExercise(null)}
        title="Modifier l'exercice"
      >
        {editingExercise && (
          <ExerciseForm
            initial={editingExercise}
            onSubmit={handleUpdate}
            onCancel={() => setEditingExercise(null)}
          />
        )}
      </Modal>
    </div>
  )
}
