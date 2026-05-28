// src/app/api/programs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ProgramExerciseInput = z.object({
  exerciseId: z.string(),
  sets: z.number().int().min(1).default(3),
  reps: z.number().int().min(0).nullable().default(10),
  duration: z.number().int().min(0).nullable().default(null),
  order: z.number().int().min(0).default(0),
});

const CreateProgramSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional().nullable(),
  exercises: z.array(ProgramExerciseInput).default([]),
});

export async function GET() {
  const programs = await prisma.program.findMany({
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(programs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreateProgramSchema.parse(body);

    const program = await prisma.program.create({
      data: {
        title: data.title,
        notes: data.notes,
        exercises: {
          create: data.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            sets: e.sets,
            reps: e.reps,
            duration: e.duration,
            order: e.order,
          })),
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
