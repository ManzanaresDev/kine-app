// src/components/exercises/ExerciseCard.tsx
'use client'

import { useDraggable } from '@dnd-kit/core'
import type { Exercise } from '@/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/utils'

interface ExerciseCardProps {
  exercise: Exercise
  isDragOverlay?: boolean
  onEdit?: (exercise: Exercise) => void
  onDelete?: (id: string) => void
}

export function ExerciseCard({ exercise, isDragOverlay, onEdit, onDelete }: ExerciseCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `exercise-${exercise.id}`,
    data: { exercise },
    disabled: !!isDragOverlay,
  })

  const color = CATEGORY_COLORS[exercise.category]
  const defaultParam =
    exercise.defaultDuration > 0
      ? formatDuration(exercise.defaultDuration)
      : `${exercise.defaultReps} rép.`

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group bg-white border border-stone-200 rounded-xl p-3 select-none',
        'transition-all duration-150',
        isDragging ? 'opacity-30 scale-95' : 'hover:border-stone-300 hover:shadow-sm',
        isDragOverlay && 'shadow-xl ring-2 ring-teal-500/30'
      )}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Drag handle + content */}
        <div
          {...listeners}
          className="flex items-start gap-2.5 flex-1 min-w-0 cursor-grab active:cursor-grabbing"
        >
          {/* Drag handle dots */}
          <div className="mt-0.5 flex flex-col gap-[3px] shrink-0 opacity-30 group-hover:opacity-60 transition-opacity">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-[3px]">
                <div className="w-[3px] h-[3px] rounded-full bg-stone-600" />
                <div className="w-[3px] h-[3px] rounded-full bg-stone-600" />
              </div>
            ))}
          </div>

          {/* Text */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-stone-900 leading-snug">
                {exercise.name}
              </span>
              <Badge color={color as any}>{CATEGORY_LABELS[exercise.category]}</Badge>
            </div>
            {exercise.description && (
              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                {exercise.description}
              </p>
            )}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[11px] text-stone-400">
                {exercise.defaultSets} séries · {defaultParam}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(exercise) }}
                className="w-6 h-6 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center text-xs transition-colors"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(exercise.id) }}
                className="w-6 h-6 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center text-xs transition-colors"
              >
                🗑
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
