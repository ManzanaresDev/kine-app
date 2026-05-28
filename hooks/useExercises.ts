// src/hooks/useExercises.ts
import useSWR from 'swr'
import type { Exercise, ExerciseCategory } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface UseExercisesOptions {
  category?: ExerciseCategory | null
  search?: string
}

export function useExercises({ category, search }: UseExercisesOptions = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (search) params.set('search', search)

  const url = `/api/exercises${params.toString() ? `?${params}` : ''}`

  const { data, error, mutate } = useSWR<Exercise[]>(url, fetcher)

  return {
    exercises: data,
    isLoading: !data && !error,
    isError: !!error,
    mutate,
  }
}
