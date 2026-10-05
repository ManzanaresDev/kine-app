// api/api/exercises/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
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
  try {
    const data = await sql`
      SELECT
        e.id, e.name, e.description,
        e.default_sets, e.default_reps, e.default_duration,
        e.created_at, e.updated_at,
        COALESCE(
          jsonb_agg(
            jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
            ORDER BY t.name
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::jsonb
        ) AS tags
      FROM exercises e
      LEFT JOIN exercise_tags et ON et.exercise_id = e.id
      LEFT JOIN tags t ON t.id = et.tag_id
      GROUP BY e.id
      ORDER BY e.name
    `;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("GET /api/exercises", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tag_ids, ...f } = ExerciseSchema.parse(body);

    // Une seule requête (donc atomique) : insert de l'exercice + de ses tags
    const [exercise] = await sql`
      WITH new_ex AS (
        INSERT INTO exercises (name, description, default_sets, default_reps, default_duration)
        VALUES (${f.name}, ${f.description ?? null}, ${f.default_sets}, ${f.default_reps}, ${f.default_duration})
        RETURNING *
      ),
      ins AS (
        INSERT INTO exercise_tags (exercise_id, tag_id)
        SELECT new_ex.id, unnest(${tag_ids}::text[]) FROM new_ex
      )
      SELECT * FROM new_ex
    `;

    return NextResponse.json({ ...exercise, tags: [] }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/exercises", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}