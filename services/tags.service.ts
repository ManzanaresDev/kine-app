import { fetcher } from "@/lib/fetcher";

export async function getTagNames(): Promise<string[]> {
  try {
    const tags = await fetcher<{ name: string }[]>("/api/tags");
    return tags.map((tag) => tag.name);
  } catch (error) {
    console.error(error);
    return [];
  }
}