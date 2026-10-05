// app/api/programs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const [program] = await sql`
      SELECT id, title, notes, created_at, updated_at
      FROM programs
      WHERE id = ${id}
    `;

    if (!program) {
      return NextResponse.json({ error: "Programme introuvable" }, { status: 404 });
    }

    const exercises = await sql`
      SELECT
        pe.id,
        pe.exercise_id AS "exerciseId",
        pe.order_index AS "order",
        pe.sets,
        pe.reps,
        pe.duration,
        to_jsonb(e) AS exercise
      FROM program_exercises pe
      JOIN exercises e ON e.id = pe.exercise_id
      WHERE pe.program_id = ${id}
      ORDER BY pe.order_index ASC
    `;

    return NextResponse.json({ ...program, exercises });
  } catch (error) {
    console.error("GET /api/programs/[id]", error);
    return NextResponse.json({ error: "Erreur chargement programme" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const { title, notes, exercises } = await req.json();

    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: "Titre requis" }, { status: 400 });
    }

    const [exists] = await sql`SELECT id FROM programs WHERE id = ${id}`;
    if (!exists) {
      return NextResponse.json({ error: "Programme introuvable" }, { status: 404 });
    }

    const rows: any[] = Array.isArray(exercises) ? exercises : [];

    await sql.transaction([
      sql`
        UPDATE programs
        SET title = ${String(title).trim()}, notes = ${notes ?? null}, updated_at = now()
        WHERE id = ${id}
      `,
      sql`DELETE FROM program_exercises WHERE program_id = ${id}`,
      ...rows.map(
        (e, idx) => sql`
          INSERT INTO program_exercises (program_id, exercise_id, order_index, sets, reps, duration)
          VALUES (${id}, ${e.exerciseId}, ${idx}, ${e.sets ?? null}, ${e.reps ?? null}, ${e.duration ?? null})
        `,
      ),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/programs/[id]", error);
    return NextResponse.json({ error: "Erreur sauvegarde programme" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const results = await sql.transaction([
      sql`DELETE FROM program_exercises WHERE program_id = ${id}`,
      sql`DELETE FROM programs WHERE id = ${id} RETURNING id`,
    ]);

    if ((results[1] as any[]).length === 0) {
      return NextResponse.json({ error: "Programme introuvable" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/programs/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}