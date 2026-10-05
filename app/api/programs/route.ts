import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
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

// Un seul aller-retour : programmes + program_exercises + exercise imbriqué
// Si id est null → tous les programmes, sinon un seul
async function fetchPrograms(id: string | null = null) {
  return sql`
    SELECT
      p.*,
      COALESCE(
        jsonb_agg(
          to_jsonb(pe) || jsonb_build_object('exercise', to_jsonb(e))
          ORDER BY pe.order_index
        ) FILTER (WHERE pe.program_id IS NOT NULL),
        '[]'::jsonb
      ) AS exercises
    FROM programs p
    LEFT JOIN program_exercises pe ON pe.program_id = p.id
    LEFT JOIN exercises e ON e.id = pe.exercise_id
 WHERE (${id}::text IS NULL OR p.id::text = ${id}::text)
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `;
}

export async function GET() {
  try {
    return NextResponse.json(await fetchPrograms());
  } catch (error) {
    console.error("GET /api/programs", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreateProgramSchema.parse(body);

    const id = crypto.randomUUID();

    // Transaction : tout est inséré ou rien (plus besoin du rollback manuel)
    await sql.transaction([
      sql`
        INSERT INTO programs (id, title, notes)
        VALUES (${id}, ${data.title}, ${data.notes ?? null})
      `,
      ...data.exercises.map(
        (e) => sql`
          INSERT INTO program_exercises
            (program_id, exercise_id, sets, reps, duration, order_index)
          VALUES
            (${id}, ${e.exerciseId}, ${e.sets}, ${e.reps}, ${e.duration}, ${e.order})
        `,
      ),
    ]);

    const [fullProgram] = await fetchPrograms(id);
    return NextResponse.json(fullProgram, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/programs", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}