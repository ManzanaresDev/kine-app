// app/api/exercises/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ExerciseSchema = z.object({
  name: z.string().min(2),
  category: z.enum([
    "mobility",
    "strengthening",
    "cardio",
    "balance",
    "breathing",
  ]),
  description: z.string().optional(),
  defaultSets: z.number().int().min(1).default(3),
  defaultReps: z.number().int().min(0).default(10),
  defaultDuration: z.number().int().min(0).default(0),
  pathologies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const exercises = await prisma.exercise.findMany({
    where: {
      ...(category ? { category: category as any } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { tags: { has: search } },
            ],
          }
        : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(exercises);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = ExerciseSchema.parse(body);

    const exercise = await prisma.exercise.create({ data });
    return NextResponse.json(exercise, { status: 201 });
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
