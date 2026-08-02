# Poster project design

## Purpose

This repository produces print-ready technical conference posters from version-controlled content. Each poster begins as readable Markdown, gains only the semantic structure needed for layout, and exports through a deterministic browser-based PDF pipeline.

The repository is dedicated to posters. Presentation decks live elsewhere, so slide-oriented features and frameworks are outside its scope.

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
title: Streamlit WebRTC
summary: Real-time audio and video processing in Python-only Streamlit apps.
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

## Editorial standards

Every visible phrase must explain a capability, limitation, action, provenance, or destination. Do not add taglines, slogans, buzzwords, or other filler solely to balance a layout or make it appear polished. When a composition needs more visual weight, change the geometry or add useful technical content instead of inventing copy.

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

## Print constraints

The shared paper map uses ISO dimensions:

| Size | Portrait     | Landscape    |
| ---- | ------------ | ------------ |
| A1   | 594 x 841 mm | 841 x 594 mm |
| A2   | 420 x 594 mm | 594 x 420 mm |
| A3   | 297 x 420 mm | 420 x 297 mm |

The poster canvas has no background fill by default because the physical paper supplies the white surface. Preview paper colors are inspection aids only and are forced to transparent during print export. Poster designs may use backgrounds inside meaningful content regions, such as code panels or grouped containers.

Lines must communicate structure or behavior. Rules that separate sections, borders that define containers, and connectors that show flow are appropriate. Lines used only as decoration are not part of the design system.

Browser-generated output is RGB. Before marking a poster final, confirm the printer's requirements for bleed, crop marks, PDF/X, CMYK, and ICC profiles. If conversion is required, it becomes an explicit prepress stage after the validated browser PDF.

## Streamlit WebRTC poster direction

The first poster targets Python developers at PyCon Korea. Its single job is to make the ease of the Python callback immediately credible, then explain how the same mechanism supports much more flexible media routing.

The A1 portrait composition follows this order:

```text
+------------------------------------------------+
| Name, thesis, and media status                 |
+-----------------------+------------------------+
| Python callback       | resulting app          |
+-----------------------+------------------------+
| device -> WebRTC -> Python -> returned media   |
+-----------------------+------------------------+
| loopback | filter     | replace | generate     |
| route A/B | mix       | inspect | compose      |
+-----------------------------------+------------+
| project and docs                  | QR links   |
+------------------------------------------------+
```

Blue and teal are reserved for functional media-flow lines in the architecture section. Borders and rules separate content regions, and the poster has no decorative page rails.

The first implementation is a content-complete visual prototype. Its application panel is an explicitly labeled illustration until a final capture from the conference demo is available.

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
