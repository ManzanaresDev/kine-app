// src/app/api/exercises/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.enum(['mobility', 'strengthening', 'cardio', 'balance', 'breathing']).optional(),
  description: z.string().optional().nullable(),
  defaultSets: z.number().int().min(1).optional(),
  defaultReps: z.number().int().min(0).optional(),
  defaultDuration: z.number().int().min(0).optional(),
  pathologies: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const exercise = await prisma.exercise.findUnique({ where: { id: params.id } })
  if (!exercise) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(exercise)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const data = UpdateSchema.parse(body)

    const exercise = await prisma.exercise.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(exercise)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.exercise.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
