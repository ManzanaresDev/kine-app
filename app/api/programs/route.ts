// app/api/programs/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const ProgramExerciseInput = z.object({
  exerciseId: z.string(),
  sets: z.number().int().min(1).default(3),
  reps: z.number().int().min(0).nullable().default(null),
  duration: z.number().int().min(0).nullable().default(null),
  order: z.number().int().min(0).default(0),
});

const CreateProgramSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional().nullable(),
  exercises: z.array(ProgramExerciseInput).default([]),
});

export async function GET() {
  const { data: programs, error } = await supabase
    .from("programs")
    .select(
      `
      *,
      exercises:program_exercises (
        *,
        exercise:exercises (*)
      )
    `,
    )
    .order("updated_at", { ascending: false })
    .order("order_index", {
      referencedTable: "program_exercises",
      ascending: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(programs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreateProgramSchema.parse(body);

    const { data: program, error: programError } = await supabase
      .from("programs")
      .insert({ title: data.title, notes: data.notes })
      .select()
      .single();

    if (programError) {
      return NextResponse.json(
        { error: programError.message },
        { status: 500 },
      );
    }

    if (data.exercises.length > 0) {
      const { error: exError } = await supabase
        .from("program_exercises")
        .insert(
          data.exercises.map((e) => ({
            program_id: program.id,
            exercise_id: e.exerciseId,
            sets: e.sets,
            reps: e.reps,
            duration: e.duration,
            order_index: e.order,
          })),
        );

      if (exError) {
        await supabase.from("programs").delete().eq("id", program.id);
        return NextResponse.json({ error: exError.message }, { status: 500 });
      }
    }

    const { data: fullProgram, error: fetchError } = await supabase
      .from("programs")
      .select(
        `
        *,
        exercises:program_exercises (
          *,
          exercise:exercises (*)
        )
      `,
      )
      .eq("id", program.id)
      .order("order_index", {
        referencedTable: "program_exercises",
        ascending: true,
      })
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json(fullProgram, { status: 201 });
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
