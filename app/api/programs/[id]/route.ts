import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateProgramPDF } from "@/lib/pdf/generateProgramPDF";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ programId: string }> },
) {
  const { programId } = await params;

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select("id, title, notes, created_at")
    .eq("id", programId)
    .single();

  if (programError || !program) {
    return NextResponse.json(
      { error: "Programme introuvable" },
      { status: 404 },
    );
  }

  const { data: programExercises, error: exError } = await supabase
    .from("program_exercises")
    .select(
      `
      order, sets, reps, duration,
      exercises ( id, name, description, body_part, category )
    `,
    )
    .eq("program_id", programId)
    .order("order", { ascending: true });

  if (exError) {
    return NextResponse.json(
      { error: "Erreur chargement exercices" },
      { status: 500 },
    );
  }

  const pdfBytes = await generateProgramPDF({
    program,
    exercises: (programExercises ?? []) as any[],
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="programme-${programId}.pdf"`,
    },
  });
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

  return new NextResponse(null, { status: 204 });
}
