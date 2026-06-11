// app/api/tags/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  let query = supabase.from("tags").select("id, name, slug").order("name");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug } = TagSchema.parse(body);

    const finalSlug = slug ?? toSlug(name);

    // Upsert : retourne le tag existant si le slug existe déjà
    const { data: tag, error } = await supabase
      .from("tags")
      .upsert({ name, slug: finalSlug }, { onConflict: "slug" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
