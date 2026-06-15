export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { renderToBuffer } from "@react-pdf/renderer";
import { ProgramPDFDocument } from "@/components/programs/ProgramPDF";
import React from "react";
import type { Program } from "@/types";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data: program, error } = await supabase
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
    .eq("id", params.id)
    .order("order", { referencedTable: "program_exercises", ascending: true })
    .single();

  if (error || !program) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const serialized: Program = JSON.parse(JSON.stringify(program));

  const element = React.createElement(ProgramPDFDocument, {
    program: serialized,
  });

  const buffer = await renderToBuffer(element);

  const filename = `programme-${program.title
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase()}.pdf`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
