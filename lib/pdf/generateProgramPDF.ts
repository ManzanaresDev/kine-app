import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface Exercise {
  order: number;
  sets: number | null;
  reps: number | null;
  duration: number | null;
  exercises: {
    id: string;
    name: string;
    description: string | null;
    body_part: string | null;
    category: string | null;
  } | null;
}

interface Program {
  id: string;
  title: string;
  notes: string | null;
  created_at: string;
}

interface GeneratePDFParams {
  program: Program;
  exercises: Exercise[];
}

export async function generateProgramPDF({
  program,
  exercises,
}: GeneratePDFParams): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let page = pdfDoc.addPage([595, 842]);
  const { width } = page.getSize();
  let y = 842 - 50;

  const checkNewPage = () => {
    if (y < 100) {
      page = pdfDoc.addPage([595, 842]);
      y = 842 - 50;
    }
  };

  const drawText = (
    text: string,
    x: number,
    size: number,
    color = rgb(0, 0, 0),
    useBold = false,
  ) => {
    checkNewPage();
    page.drawText(text.slice(0, 100), {
      x,
      y,
      size,
      font: useBold ? fontBold : font,
      color,
    });
    y -= size + 6;
  };

  // ── Header ──────────────────────────────────────────
  drawText(program.title, 50, 22, rgb(0.11, 0.1, 0.09), true);

  drawText(
    `Créé le ${new Date(program.created_at).toLocaleDateString("fr-FR")}`,
    50,
    10,
    rgb(0.53, 0.53, 0.53),
  );

  if (program.notes) {
    drawText(program.notes, 50, 11, rgb(0.27, 0.27, 0.27));
  }

  y -= 10;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.9, 0.91, 0.92),
  });
  y -= 20;

  // ── Exercises ────────────────────────────────────────
  exercises.forEach((item, idx) => {
    const ex = item.exercises;
    if (!ex) return; // ✅ return au lieu de continue dans forEach

    checkNewPage();

    drawText(`${idx + 1}. ${ex.name}`, 50, 13, rgb(0.11, 0.1, 0.09), true);

    const meta: string[] = [];
    if (item.sets) meta.push(`${item.sets} séries`);
    if (item.reps) meta.push(`${item.reps} reps`);
    if (item.duration) meta.push(`${item.duration}s`);
    if (meta.length > 0) {
      drawText(meta.join("  ·  "), 66, 10, rgb(0.42, 0.45, 0.5));
    }

    const tags: string[] = [];
    if (ex.body_part) tags.push(ex.body_part);
    if (ex.category) tags.push(ex.category);
    if (tags.length > 0) {
      drawText(tags.join("  /  "), 66, 9, rgb(0.61, 0.64, 0.67));
    }

    if (ex.description) {
      drawText(ex.description, 66, 10, rgb(0.22, 0.25, 0.32));
    }

    y -= 8;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 0.5,
      color: rgb(0.95, 0.96, 0.96),
    });
    y -= 16;
  }); // ✅ fermeture correcte du forEach

  // ── Footer ───────────────────────────────────────────
  page.drawText(`kine-app · ${exercises.length} exercice(s)`, {
    x: 50,
    y: 30,
    size: 9,
    font,
    color: rgb(0.82, 0.84, 0.86),
  });

  return pdfDoc.save();
}
