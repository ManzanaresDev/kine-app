// app/api/exercises/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const ExerciseSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  default_sets: z.number().int().min(1).default(3),
  default_reps: z.number().int().min(0).default(10),
  default_duration: z.number().int().min(0).default(0),
  tag_ids: z.array(z.string()).default([]),
});

export async function GET() {
  const { data, error } = await supabase
    .from("exercises")
    .select(
      `
    id,
    name,
    description,
    default_sets,
    default_reps,
    default_duration,
    created_at,
    updated_at,
    exercise_tags(tag_id, tags(id, name, slug))
  `,
    )
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalized = (data ?? []).map((ex) => ({
    ...ex,
    tags: (ex.exercise_tags ?? [])
      .map(
        (et: {
          tag_id: string;
          tags: { id: string; name: string; slug: string } | null;
        }) => et.tags,
      )
      .filter(Boolean),
    exercise_tags: undefined,
  }));

  return NextResponse.json({ data: normalized, error: null });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tag_ids, ...fields } = ExerciseSchema.parse(body);

    const { data: exercise, error } = await supabase
      .from("exercises")
      .insert(fields)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (tag_ids.length > 0) {
      const { error: tagError } = await supabase
        .from("exercise_tags")
        .insert(
          tag_ids.map((tag_id) => ({ exercise_id: exercise.id, tag_id })),
        );

      if (tagError) {
        return NextResponse.json({ error: tagError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ...exercise, tags: [] }, { status: 201 });
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
