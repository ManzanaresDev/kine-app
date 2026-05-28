// src/hooks/useProgram.ts
import { useState, useCallback } from 'react'
import type { ProgramExerciseLocal, Exercise } from '@/types'
import { generateLocalId } from '@/lib/utils'

export function useProgram() {
  const [items, setItems] = useState<ProgramExerciseLocal[]>([])
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')

  const addExercise = useCallback((exercise: Exercise) => {
    // Avoid duplicates
    setItems((prev) => {
      if (prev.some((item) => item.exerciseId === exercise.id)) return prev
      const newItem: ProgramExerciseLocal = {
        localId: generateLocalId(),
        exerciseId: exercise.id,
        exercise,
        sets: exercise.defaultSets || 3,
        reps: exercise.defaultDuration === 0 ? (exercise.defaultReps || 10) : null,
        duration: exercise.defaultDuration > 0 ? exercise.defaultDuration : null,
        order: prev.length,
      }
      return [...prev, newItem]
    })
  }, [])

  const updateItem = useCallback(
    (localId: string, updates: Partial<ProgramExerciseLocal>) => {
      setItems((prev) =>
        prev.map((item) => (item.localId === localId ? { ...item, ...updates } : item))
      )
    },
    []
  )

  const removeItem = useCallback((localId: string) => {
    setItems((prev) =>
      prev
        .filter((item) => item.localId !== localId)
        .map((item, idx) => ({ ...item, order: idx }))
    )
  }, [])

  const reorder = useCallback((newItems: ProgramExerciseLocal[]) => {
    setItems(newItems.map((item, idx) => ({ ...item, order: idx })))
  }, [])

  const clear = useCallback(() => {
    setItems([])
    setTitle('')
    setNotes('')
  }, [])

  async function save(): Promise<{ id: string } | null> {
    if (!title.trim() || items.length === 0) return null

    const res = await fetch('/api/programs', {
      method: 'POST',
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

    if (!res.ok) return null
    return res.json()
  }

  return {
    items,
    title,
    notes,
    setTitle,
    setNotes,
    addExercise,
    updateItem,
    removeItem,
    reorder,
    clear,
    save,
  }
}
