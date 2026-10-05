// app/api/exercises/[id]/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  default_sets: z.number().int().min(1).optional(),
  default_reps: z.number().int().min(0).optional(),
  default_duration: z.number().int().min(0).optional(),
  tag_ids: z.array(z.string()).optional(),
});

type Ctx = { params: { id: string } };

export async function GET(_: Request, { params }: Ctx) {
  try {
    const { id } = params;

    const [exercise] = await sql`
      SELECT
        e.id, e.name, e.description,
        e.default_sets, e.default_reps, e.default_duration,
        e.created_at, e.updated_at,
        COALESCE(
          (
            SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
            FROM exercise_tags et
            JOIN tags t ON t.id = et.tag_id
            WHERE et.exercise_id = e.id
          ),
          '[]'::jsonb
        ) AS tags
      FROM exercises e
      WHERE e.id = ${id}
    `;

    if (!exercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("GET /api/exercises/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  try {
    const { id } = params;
    const body = await request.json();
    const { tag_ids, ...f } = UpdateSchema.parse(body);

    // Mise à jour partielle : COALESCE garde la valeur actuelle si non fournie.
    // description peut être mise à null explicitement, d'où le flag.
    const descriptionProvided = f.description !== undefined;

    const updateQuery = sql`
      UPDATE exercises SET
        name             = COALESCE(${f.name ?? null}::text, name),
        description      = CASE WHEN ${descriptionProvided}::boolean
                                THEN ${f.description ?? null}::text
                                ELSE description END,
        default_sets     = COALESCE(${f.default_sets ?? null}::int, default_sets),
        default_reps     = COALESCE(${f.default_reps ?? null}::int, default_reps),
        default_duration = COALESCE(${f.default_duration ?? null}::int, default_duration),
        updated_at       = now()
      WHERE id = ${id}
      RETURNING *
    `;

    let exercise;

    if (tag_ids !== undefined) {
      const [updated] = await sql.transaction([
        updateQuery,
        sql`DELETE FROM exercise_tags WHERE exercise_id = ${id}`,
        sql`
          INSERT INTO exercise_tags (exercise_id, tag_id)
          SELECT ${id}::uuid, unnest(${tag_ids}::text[])
        `,
      ]);
      exercise = updated[0];
    } else {
      [exercise] = await updateQuery;
    }

    if (!exercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("PUT /api/exercises/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    const { id } = params;

    await sql.transaction([
      sql`DELETE FROM exercise_tags WHERE exercise_id = ${id}`,
      sql`DELETE FROM program_exercises WHERE exercise_id = ${id}`,
      sql`DELETE FROM exercises WHERE id = ${id}`,
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/exercises/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}