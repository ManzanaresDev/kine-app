// app/api/programs/[id]/route.ts
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

const UpdateProgramSchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().optional().nullable(),
  exercises: z.array(ProgramExerciseInput).optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data: program, error } = await supabase
    .from("programs")
    .select(`*, exercises:program_exercises (*, exercise:exercises (*))`)
    .eq("id", params.id)
    .order("order_index", {
      referencedTable: "program_exercises",
      ascending: true,
    })
    .single();

  if (error || !program) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(program);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const data = UpdateProgramSchema.parse(body);

    if (data.exercises !== undefined) {
      const { error: deleteError } = await supabase
        .from("program_exercises")
        .delete()
        .eq("program_id", params.id); // ✅ snake_case

      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 },
        );
      }

      if (data.exercises.length > 0) {
        const { error: insertError } = await supabase
          .from("program_exercises")
          .insert(
            data.exercises.map((e) => ({
              program_id: params.id, // ✅ snake_case
              exercise_id: e.exerciseId, // ✅ snake_case
              sets: e.sets,
              reps: e.reps,
              duration: e.duration,
              order_index: e.order, // ✅ snake_case
            })),
          );

        if (insertError) {
          return NextResponse.json(
            { error: insertError.message },
            { status: 500 },
          );
        }
      }
    }

    const updateFields = {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    };

    if (Object.keys(updateFields).length > 0) {
      const { error: updateError } = await supabase
        .from("programs")
        .update(updateFields)
        .eq("id", params.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 },
        );
      }
    }

    const { data: program, error: fetchError } = await supabase
      .from("programs")
      .select(`*, exercises:program_exercises (*, exercise:exercises (*))`)
      .eq("id", params.id)
      .order("order_index", {
        referencedTable: "program_exercises",
        ascending: true,
      })
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json(program);
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

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
