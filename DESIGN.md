# Poster project design

## Purpose

This repository produces print-ready technical conference posters from version-controlled content. Each poster begins as readable Markdown, gains only the semantic structure needed for layout, and exports through a deterministic browser-based PDF pipeline.

The repository is dedicated to posters. Presentation decks live elsewhere, so slide-oriented features and frameworks are outside its scope.

## Document authority

This document defines repository architecture and standards shared by every poster. Each poster's `poster-brief.md` defines its audience, message, required content, reading order, format, and unresolved editorial decisions. A brief may make a deliberate poster-specific choice within these shared standards; it does not establish a convention for other posters.

Visible copy belongs in `poster.mdx`. Poster-specific geometry and visual identity belong in `poster.css`, and replaceable media belongs in the poster's local `assets/` directory. Do not silently resolve questions that the brief leaves open.

## Goals

- Keep visible poster copy in one Markdown-based source file.
- Support A1, A2, and A3 paper in portrait or landscape orientation.
- Give every poster its own visual identity without duplicating print infrastructure.
- Produce a browser preview and a one-page PDF from the same source.
- Preserve finalized posters when shared rendering code evolves.
- Validate paper dimensions, overflow, fonts, images, and PDF page count automatically.

## Non-goals

- Presentation decks, speaker notes, transitions, or incremental reveals.
- A universal layout that makes every poster look alike.
- Round-trip editing between the repository and Figma.
- Full prepress conversion to CMYK or PDF/X until a printer requires it.

## Poster design standards

### Content and visual semantics

- Every visual element must communicate content, hierarchy, grouping, a relationship, or a flow. Omit elements with no informational purpose.
- Do not add decorative kicker text, rules, rails, patterns, shapes, or marks solely to create visual interest or fill space.
- Use lines only to separate content, define a container, or express a relationship. Prefer typography and spacing when no boundary or connection needs to be shown.
- Treat visible copy as technical content. Do not add slogans, buzzwords, placeholder instructions, or explanations that merely restate a nearby screenshot or code sample.
- Lead with the concrete value proposition and strongest defensible claims. Do not claim qualities such as performance unless the poster presents evidence and the claim is central to the work.
- Use the author's requested public identity verbatim. Add event names, category labels, controls, or other contextual markers only when readers need them.
- Prefer recognizable application outcomes in headings. Put implementation vocabulary in supporting descriptions, diagrams, or compact API-composition labels.
- Preserve the official capitalization and spelling of every project, product, and package name, including `Streamlit-WebRTC`, `Stlite`, `Pyodide`, and `Cloudflare Workers`.
- Do not repeat a section heading in its opening sentence. Use the body to explain mechanism, consequence, or evidence.

### Typography and spatial hierarchy

- Treat 18 pt as the default minimum for body text, code, captions, labels, URLs, and diagram copy on an A1 poster unless its brief requires a larger floor.
- Spend available space on titles, section headings, subheadings, and section subtitles before enlarging dense body paragraphs. Keep the hierarchy visibly stepped instead of scaling every text role together.
- Allocate section height according to information density. Reclaim unused fixed-height space from sparse sections for content that benefits from larger type or clearer structure.
- Preserve enough separation between a section's heading, content groups, checklist or caveat block, and outer edges for each level to remain legible. Check top and bottom padding independently.
- Center the main title and summary against the physical poster, independently of asymmetrical logos or technology marks. Let long summary copy wrap intentionally within a bounded width.
- Align peer headings, labels, package names, and diagrams to shared baselines or vertical positions. Recheck these alignments after changing type size, column width, or wrapping.
- When meaningful subheadings in a primary card wrap awkwardly, give that card more width before reducing type. Reclaim width conservatively from secondary cards and verify that their titles, badges, and body remain readable.

### Technical storytelling

- When a poster promises leverage from a small amount of code, show the essential implementation: the callback signature, meaningful processing, return value, and registration point. Do not hide the core mechanism behind a helper.
- Use the hero result to demonstrate a compelling outcome while keeping the application code short and understandable. Complex work may live in a library when the visible code still shows how the integration works.
- Show coexistence with the host framework when it is part of the value proposition. Keep relevant host features visible instead of presenting an extension as an isolated application.
- Distinguish transport paths from application-side outputs precisely. Label derived results according to where they appear rather than implying that the primary transport carries them.
- Explain an architecture figure in terms that map directly to its visible labels and relationships. Do not introduce surrounding concepts that the diagram does not show.
- Order onboarding material from prerequisite context to immediate action: explain the host, then the extension, installation, and the command that runs the example. Omit steps readers can infer.
- Distinguish a product's user-facing programming model from its underlying machinery when an architectural comparison depends on that difference.
- Organize deployment choices around the decision readers must make, such as where Python runs. Distinguish self-hosted libraries, framework integrations, hosted sharing platforms, packaged desktop targets, and experimental edge runtimes instead of presenting them as equivalent products.
- Connect a technically surprising deployment target to an established platform trend in one concise sentence, then return to the main comparison.

### Diagrams and annotations

- Place a label on the path, object, or region it describes. Do not put a transport label on a boundary, fork, mix, or junction when it describes the transport segment.
- Use callouts only to explain a meaningful code or result relationship. Keep titles conceptual and modality-neutral when the same API pattern applies to audio and video; put sample-specific detail in the body when it aids understanding.
- Keep callout copy concise and widen the box before reducing legible type. Recheck nearby code, screenshots, and connectors after changing a callout.
- Treat endpoint coordinates as the source of truth for annotation geometry. After moving a box or endpoint, update every connected line so it visibly touches both ends at print scale.
- Keep circular endpoints physically square and use non-scaling strokes where transformed SVG geometry would otherwise squash circles or thin lines.
- In side-by-side stack comparisons, align equivalent layers and give repeated layers equal heights. Use center mapping labels to distinguish what stays the same from what is replaced or adapted.
- Show infrastructure layers that materially explain a comparison, including servers, runtimes, and transport bridges. Use accurate interface language such as HTTP requests becoming ASGI calls and worker messages carrying HTTP and WebSocket traffic.
- Center mapping labels in their own column with balanced connectors to both stacks. After changing typography or layer heights, verify both endpoints.
- Use borders thick enough to survive physical printing. Keep diagram headings close enough to their stacks that the relationship is immediate, while separating the figure caption clearly from both columns.
- Use official technology logos or familiar licensed icons when they help readers identify components quickly. Apply icons consistently to comparable components, and omit them when a neighboring set intentionally uses plain package labels.

### Application examples and attribution

- Present application examples with a useful preview, a short outcome-focused description, and compact labels defined by the poster brief. Do not add code snippets when those labels communicate the composition more clearly.
- Use side-by-side preview and description layouts when vertical stacking would make screenshots too wide or reduce information density.
- Credit every externally sourced example with enough information to find the original: creator name, account or source identity, date when available, and an exact permalink encoded as a readable URL or QR code. Keep the preview and credit clickable in digital output.
- Record every local preview asset's source permalink and retrieval details in the poster's attribution file. Style all link states explicitly so visited links do not alter the printed hierarchy.
- Give citation text and URLs enough horizontal room to avoid awkward wrapping or uneven card heights. Reduce citation type only within the poster's legibility floor.

### Production and validation

- Treat the physical paper as the default white page. Do not add a full-page background fill unless the brief explicitly requires one. Preview paper colors must not appear in print output.
- Use section numbering only when order or sequence carries semantic meaning. Do not add numeric markers as decoration.
- Keep screenshot placeholders as local, individually replaceable assets. Do not print replacement notes or placeholder explanations on the poster.
- Size body text, code, labels, URLs, and screenshots for reading at conference-poster distance.
- Use window or device frames only when the poster brief explicitly requests them.
- Do not use box shadows on printable poster elements. Some print pipelines render semi-transparent shadows as solid fills; use borders or spacing when separation is necessary. Preview-only shadows are acceptable when print styles remove them explicitly.
- Keep footers limited to useful provenance and destinations. Remove redundant taglines, repeated explanations, and separators that do not clarify grouping.
- Validate the final poster for its declared physical dimensions, one-page output, overflow, font loading, image loading, and visual legibility.

## Technology

- Astro renders static HTML and provides content collections.
- MDX keeps copy readable while allowing semantic Astro components when native Markdown is insufficient.
- TypeScript validates poster metadata and implements export checks.
- Purpose-written CSS controls physical geometry in millimeters and typography in points.
- Playwright drives Chromium to create PDFs from print CSS.
- Poppler provides independent PDF dimension inspection and raster previews.
- QR codes are generated as SVG from their destination URLs.
- pnpm locks application and renderer dependencies.

Slidev was considered. Its Markdown workflow, custom layouts, syntax highlighting, and Playwright exporter overlap with this project, but its primary abstraction is a sequence of pixel-sized presentation slides. A poster is one physical page with exact print dimensions and prepress checks. Astro provides the useful content features without the unused presentation runtime.

## Content and rendering model

Each poster directory contains its brief, printable MDX, local CSS, and assets:

```text
202608-pyconkr-streamlit-webrtc/
├── poster-brief.md
├── poster.mdx
├── poster.css
└── assets/
```

`poster.mdx` is the only source of visible poster copy. The brief records audience, purpose, requirements, and open editorial questions. CSS and assets stay with their poster so a new design cannot silently restyle an older one.

Frontmatter records the stable rendering contract:

```yaml
title: Streamlit-WebRTC
summary: Build complete real-time audio and video web apps using only Python.
event: PyCon Korea 2026
renderer: v1
paper:
  size: A1
  orientation: portrait
language: en
status: draft
```

Astro's content collection discovers `20*/poster.mdx`, validates this metadata, and creates one static route per poster. MDX may import semantic components from its declared renderer version. Components encode relationships such as a QR destination or media path; poster-specific geometry remains in local CSS.

## Repository structure

```text
.
├── src/
│   ├── content.config.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── posters.json.ts
│   │   └── posters/[slug].astro
│   ├── renderers/
│   │   └── v1/
│   │       ├── MacWindow.astro
│   │       ├── PosterShell.astro
│   │       ├── QrLink.astro
│   │       └── foundation.css
│   └── lib/paper.ts
├── scripts/export-posters.ts
├── output/pdf/
└── tmp/pdfs/
```

The shared renderer owns paper dimensions, preview controls, print reset rules, and QR generation. It does not own poster colors, typography, or section geometry. The preview can simulate white, cool, or warm paper without changing the exported poster.

`MacWindow.astro` provides a reusable screenshot frame with a macOS-style title bar. Its wrapper pattern is adapted from `whitphx/slidev-addon-window-mockup`; poster-specific image sizing remains in each poster's CSS and MDX.

## Export pipeline

```text
poster.mdx + poster.css + local assets
                  |
                  v
             Astro build
                  |
        +---------+----------+
        |                    |
        v                    v
 browser preview      Playwright export
                             |
                             v
                       one-page PDF
                             |
                             v
                  Poppler and visual QA
```

The exporter builds the static site, starts a local preview server, retrieves the generated poster manifest, and visits each poster in Chromium. Before export it waits for `document.fonts.ready`, decodes every image, switches to print media, and rejects canvas overflow. It writes the PDF with print backgrounds and CSS page size enabled, then uses `pdfinfo` to verify the page count and dimensions.

The final quality pass renders each PDF to PNG. Visual inspection remains required because text extraction and dimension checks cannot detect poor hierarchy, clipped decorations, or weak contrast.

## Archival stability

Stable output requires policy as well as code:

1. Every poster declares a renderer version.
2. A renderer version becomes immutable when its first poster is finalized.
3. New shared markup or CSS is introduced in a new renderer version.
4. Poster CSS, images, and fonts are local or package-locked, never fetched remotely at build time.
5. Node, pnpm, Playwright, Chromium, and dependencies are pinned.
6. CI rebuilds every poster and compares finalized posters with approved reference previews.
7. A finalized release preserves the PDF, preview PNG, source commit, and checksum.

Reproducible source and archived output solve different problems. The versioned renderer lets the source continue to build; the approved PDF preserves the artifact even if the toolchain eventually becomes unavailable.

Pinning fonts governs the typefaces a poster loads, not every character it sets. The packaged Plex subsets omit most arrows and pictographs, so marks such as → and ❤️ are drawn by whatever font the exporting machine supplies. Accept that substitution. These are punctuation-scale characters that carry no product identity, and the alternatives cost more than they protect: rewording copy to avoid a glyph distorts the sentence, and importing an icon set to replace one adds a dependency and an attribution obligation. The archived PDF is what fixes their appearance, because it embeds the glyphs actually used, so confirm them there with `pdffonts` and a visual pass before a release rather than treating a substitution as a defect. A family named in CSS that no package supplies is a different matter and remains a defect, because every character of that element falls back rather than one.

## Print geometry and prepress

The shared paper map uses ISO dimensions:

| Size | Portrait     | Landscape    |
| ---- | ------------ | ------------ |
| A1   | 594 x 841 mm | 841 x 594 mm |
| A2   | 420 x 594 mm | 594 x 420 mm |
| A3   | 297 x 420 mm | 420 x 297 mm |

Poster designs may use backgrounds inside meaningful content regions, such as code panels or grouped containers. The shared preview's paper colors are inspection aids and are forced to transparent during print export.

Browser-generated output is RGB. Before marking a poster final, confirm the printer's requirements for bleed, crop marks, PDF/X, CMYK, and ICC profiles. If conversion is required, it becomes an explicit prepress stage after the validated browser PDF.

## Sources

- [Astro installation](https://docs.astro.build/en/install-and-setup/)
- [Astro MDX integration](https://docs.astro.build/en/guides/integrations-guide/mdx/)
- [Astro content loader API](https://docs.astro.build/en/reference/content-loader-reference/)
- [Playwright PDF API](https://playwright.dev/docs/api/class-page/#page-pdf)
- [CSS `@page`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40page)
- [Slidev canvas sizing](https://sli.dev/features/canvas-size)
- [Slidev exporting](https://sli.dev/guide/exporting.html)
- [Slidev Addon Window Mockup](https://github.com/whitphx/slidev-addon-window-mockup)
- [Streamlit WebRTC quick tutorial](https://github.com/whitphx/streamlit-webrtc#quick-tutorial)
