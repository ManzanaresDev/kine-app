// app/api/tags/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { z } from "zod";

const TagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

// Génère un slug depuis un nom : "Isométrique" → "isometrique"
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprime les accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const tags = search
      ? await sql`
          SELECT id, name, slug
          FROM tags
          WHERE name ILIKE ${`%${search}%`}
          ORDER BY name
        `
      : await sql`
          SELECT id, name, slug
          FROM tags
          ORDER BY name
        `;

    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET /api/tags", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug } = TagSchema.parse(body);

    const finalSlug = slug ?? toSlug(name);

    // Upsert : si le slug existe déjà, on met à jour le nom et on renvoie la ligne
    const [tag] = await sql`
      INSERT INTO tags (name, slug)
      VALUES (${name}, ${finalSlug})
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING *
    `;

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/tags", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}