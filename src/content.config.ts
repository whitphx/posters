import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posters = defineCollection({
  loader: glob({ pattern: "20*/poster.mdx", base: "." }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    event: z.string().min(1),
    renderer: z.literal("v1"),
    paper: z.union([
      z.object({
        size: z.enum(["A1", "A2", "A3"]),
        orientation: z.enum(["portrait", "landscape"]),
      }),
      z.object({
        widthMm: z.number().positive(),
        heightMm: z.number().positive(),
      }),
    ]),
    language: z.string().min(2).default("en"),
    status: z.enum(["draft", "final"]).default("draft"),
  }),
});

export const collections = { posters };
