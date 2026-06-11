// app/api/exercises/[id]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  default_sets: z.number().int().min(1).optional(),
  default_reps: z.number().int().min(0).optional(),
  default_duration: z.number().int().min(0).optional(),
  tag_ids: z.array(z.string()).optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data: exercise, error } = await supabase
    .from("exercises")
    .select(
      `
      id, name, description, default_sets, default_reps, default_duration,
      created_at, updated_at,
      tags:exercise_tags(tag:tags(id, name, slug))
    `,
    )
    .eq("id", params.id)
    .single();

  if (error || !exercise) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...exercise,
    tags: exercise.tags.map(
      (t: { tag: { id: string; name: string; slug: string } }) => t.tag,
    ),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { tag_ids, ...fields } = UpdateSchema.parse(body);

    // 1. Mettre à jour les champs scalaires
    const { data: exercise, error } = await supabase
      .from("exercises")
      .update(fields)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Remplacer les tags si fournis
    if (tag_ids !== undefined) {
      await supabase
        .from("exercise_tags")
        .delete()
        .eq("exercise_id", params.id);

      if (tag_ids.length > 0) {
        await supabase
          .from("exercise_tags")
          .insert(
            tag_ids.map((tag_id) => ({ exercise_id: params.id, tag_id })),
          );
      }
    }

    return NextResponse.json(exercise);
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
  // exercise_tags supprimés automatiquement par ON DELETE CASCADE
  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
