// src/app/api/programs/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ProgramExerciseInput = z.object({
  exerciseId: z.string(),
  sets: z.number().int().min(1).default(3),
  reps: z.number().int().min(0).nullable().default(null),
  duration: z.number().int().min(0).nullable().default(null),
  order: z.number().int().min(0).default(0),
})

const UpdateProgramSchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().optional().nullable(),
  exercises: z.array(ProgramExerciseInput).optional(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const program = await prisma.program.findUnique({
    where: { id: params.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' },
      },
    },
  })
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(program)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const data = UpdateProgramSchema.parse(body)

    // If exercises are provided, replace all
    if (data.exercises !== undefined) {
      await prisma.programExercise.deleteMany({ where: { programId: params.id } })
      await prisma.programExercise.createMany({
        data: data.exercises.map((e) => ({
          programId: params.id,
          exerciseId: e.exerciseId,
          sets: e.sets,
          reps: e.reps,
          duration: e.duration,
          order: e.order,
        })),
      })
    }

    const program = await prisma.program.update({
      where: { id: params.id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(program)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.program.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
