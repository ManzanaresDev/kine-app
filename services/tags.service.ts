// src/services/tags.service.ts
import { supabase } from "@/lib/supabase";

export async function getTagNames() {
  const { data, error } = await supabase.from("tags").select("name");

  if (error) {
    console.error(error);
    return [];
  }

  return data?.map((tag) => tag.name) ?? [];
}
