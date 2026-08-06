# Project instructions

Before changing poster content, layout, rendering, or export behavior, read [DESIGN.md](./DESIGN.md) and the affected poster's `poster-brief.md`.

- `DESIGN.md` is the source of truth for repository architecture and durable poster design, editorial, attribution, print, and validation standards.
- Each `poster-brief.md` is the source of truth for that poster's audience, message, required content, reading order, format, and open decisions.
- The brief may make a deliberate poster-specific choice within the repository standards. Do not generalize that choice to other posters.
- Keep all visible poster copy in `poster.mdx`; keep poster-specific geometry and visual identity in `poster.css`; keep replaceable assets local to the poster.
- Preserve official capitalization and spelling from the brief or primary sources. Do not normalize product names from memory.
- Treat unresolved questions in a brief as decisions for the author. Do not silently resolve them while implementing unrelated work.
- After changing a poster, run the repository checks and inspect the rendered output at its declared physical size. Automated checks do not replace visual review.
