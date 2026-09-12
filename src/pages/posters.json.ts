import { getCollection } from "astro:content";
import { getPaperDimensions } from "../lib/paper";

export const prerender = true;

export async function GET() {
  const posters = await getCollection("posters");
  const manifest = posters.map((poster) => {
    const dimensions = getPaperDimensions(poster.data.paper);

    return {
      slug: poster.id.replace(/\/poster$/, ""),
      ...dimensions,
    };
  });

  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/json" },
  });
}
