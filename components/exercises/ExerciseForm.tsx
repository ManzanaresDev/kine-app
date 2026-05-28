// src/components/exercises/ExerciseForm.tsx
'use client'

import { useState } from 'react'
import type { Exercise, ExerciseCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface ExerciseFormProps {
  initial?: Partial<Exercise>
  onSubmit: (data: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onCancel: () => void
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ExerciseCategory[]

export function ExerciseForm({ initial, onSubmit, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<ExerciseCategory>(initial?.category ?? 'mobility')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [defaultSets, setDefaultSets] = useState(initial?.defaultSets ?? 3)
  const [defaultReps, setDefaultReps] = useState(initial?.defaultReps ?? 10)
  const [defaultDuration, setDefaultDuration] = useState(initial?.defaultDuration ?? 0)
  const [pathologies, setPathologies] = useState((initial?.pathologies ?? []).join(', '))
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '))
  const [mode, setMode] = useState<'reps' | 'duration'>(
    (initial?.defaultDuration ?? 0) > 0 ? 'duration' : 'reps'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom est requis'); return }

    setLoading(true)
    setError('')
    try {
      await onSubmit({
        name: name.trim(),
        category,
        description: description.trim() || null,
        defaultSets,
        defaultReps: mode === 'reps' ? defaultReps : 0,
        defaultDuration: mode === 'duration' ? defaultDuration : 0,
        pathologies: pathologies.split(',').map((s) => s.trim()).filter(Boolean),
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      })
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nom de l'exercice" value={name} onChange={(e) => setName(e.target.value)} required />

      <div>
        <label className="text-xs font-medium text-stone-600 uppercase tracking-wide block mb-1.5">
          Catégorie
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                category === cat
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-stone-600 uppercase tracking-wide block mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
            placeholder:text-stone-400 resize-none"
          placeholder="Description optionnelle de l'exercice…"
        />
      </div>

      {/* Mode: reps or duration */}
      <div>
        <label className="text-xs font-medium text-stone-600 uppercase tracking-wide block mb-1.5">
          Mode par défaut
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('reps')}
            className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
              mode === 'reps'
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
            }`}
          >
            Répétitions
          </button>
          <button
            type="button"
            onClick={() => setMode('duration')}
            className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
              mode === 'duration'
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
            }`}
          >
            Durée (secondes)
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Input
          label="Séries"
          type="number"
          min={1}
          max={20}
          value={defaultSets}
          onChange={(e) => setDefaultSets(Number(e.target.value))}
          className="w-24"
        />
        {mode === 'reps' ? (
          <Input
            label="Répétitions"
            type="number"
            min={1}
            max={100}
            value={defaultReps}
            onChange={(e) => setDefaultReps(Number(e.target.value))}
            className="w-24"
          />
        ) : (
          <Input
            label="Durée (s)"
            type="number"
            min={5}
            max={3600}
            step={5}
            value={defaultDuration}
            onChange={(e) => setDefaultDuration(Number(e.target.value))}
            className="w-24"
          />
        )}
      </div>

      <Input
        label="Pathologies (séparées par des virgules)"
        value={pathologies}
        onChange={(e) => setPathologies(e.target.value)}
        placeholder="Lombalgie, Cervicalgie…"
      />

      <Input
        label="Tags (séparés par des virgules)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="genou, isométrique…"
      />

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Enregistrement…' : initial?.id ? 'Mettre à jour' : 'Créer l\'exercice'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
