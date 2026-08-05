---
name: poster-review
description: Verify that a poster in this repository still holds up at its declared physical print size. Use this whenever you change a poster's copy, layout, CSS, or assets, and whenever the author asks whether a poster looks right, reads at conference distance, is print-ready, has overflow, spacing, or legibility problems, or is ready to finalize or send to a printer. Measures rendered type size, clipped and occluded content, padding encroachment, image resolution, page fills, and print-hostile shadows under print media, then guides the visual judgment that measurement cannot replace. Reach for this instead of reading poster.css, because declared CSS values do not predict printed size.
---

# Poster review

`DESIGN.md` states the standards a poster must meet and each `poster-brief.md` states what one poster must say. Neither is enforced: `pnpm export` only checks PDF page count, paper dimensions, and whether the whole sheet overflows. Everything that decides whether a poster works on a wall three meters away sits in the gap between them.

This skill closes that gap in two passes. Measurement finds what is quantifiable and would otherwise be invisible. Looking finds what is not. Neither substitutes for the other, and the pass that gets skipped is usually the second one.

## Why reading the CSS is not enough

`poster.css` declares geometry in millimeters and type in points, so a value like `font-size: 18pt` looks self-evidently compliant. Printed size still does not follow from the declaration:

- Type inherits. Most text on a poster carries no `font-size` of its own, so grep sees nothing and the reader sees whatever an ancestor set.
- SVG `font-size` is in user units, not points. A diagram label reading `font-size: 20px` prints at whatever the viewBox-to-layout ratio makes it, which is a number no amount of CSS reading will tell you.
- The shared renderer contributes type the poster never mentions. `src/renderers/v1/MacWindow.astro` sets its own titlebar size, and that value lands on every poster that frames a screenshot.
- Print media is not preview media. Styles that only apply to `@media print` change the thing you are actually shipping.

So measure the rendered result under print emulation. That is what the script does.

## 1. Orient before touching anything

Read the poster's `poster-brief.md` first, then the parts of `DESIGN.md` your change touches. The order matters because the brief has authority over its own poster: it may deliberately choose something the shared standards would otherwise discourage, and it may set a legibility floor above 18 pt. A finding that contradicts the brief is not a finding.

Note the brief's reading order and its open decisions. You will need the reading order to judge the layout, and the open decisions are the author's to make. Surface them; do not settle them while doing something else.

## 2. Measure

```sh
pnpm tsx .claude/skills/poster-review/scripts/audit-poster.ts [slug...]
```

With no slug it measures every poster. It starts an `astro dev` daemon on port 4330 if one is not already answering, reuses a running one, and only stops a server it started. Pass `--url http://localhost:4321` to measure against a dev server the author is already running.

Useful options: `--floor <pt>` when the brief sets a higher floor, `--clip <selector>` to also capture a region at 2x for close reading (repeatable), `--no-screenshots` when you only want numbers, `--out <dir>` to relocate the report. Output goes to `tmp/poster-review/`: an `-audit.json` per poster with the full type scale, an `-overview.png` of the whole sheet, and any requested clips. The script exits non-zero when it finds something.

Every measurement runs under print media emulation and is calibrated from the frame's rendered width against its declared millimeters, so the numbers describe the exported PDF rather than the preview.

### Reading the findings

| Finding                   | What it means                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type-below-floor`        | Text renders under the legibility floor. Grouped by the nearest classed ancestor, since one declaration usually owns many text runs.                                                 |
| `content-clipped`         | Ink extends past a clipping box, so it is cut off and will not print.                                                                                                                |
| `text-occluded`           | Something opaque is painted over text, so it is present in the DOM and invisible on paper. Named by the covering element.                                                            |
| `padding-encroached`      | Content reaches into a container's own declared padding, spending the separation `DESIGN.md` asks you to check per side.                                                             |
| `font-family-not-shipped` | Nothing in an element's font stack is packaged with the project, usually a misspelled family, so every character of it is drawn by a host font rather than one symbol.               |
| `image-below-dpi`         | A raster image is stretched below the resolution floor, so it will look soft at print scale.                                                                                         |
| `image-not-loaded`        | An image failed to load and will print as a hole.                                                                                                                                    |
| `print-box-shadow`        | A shadow survives print media. Some pipelines flatten a semi-transparent shadow into a solid fill.                                                                                   |
| `paper-background-filled` | Some element covers the whole sheet with a fill, so the PDF carries a painted rectangle instead of bare paper. The poster's own root is the usual culprit, not the renderer's frame. |

The JSON also carries inventories worth reading even when nothing fails.

`typeScale` is sorted ascending. A hierarchy that steps evenly from body to title is visible in it, and so is one where every text role has drifted to the same size, which is the flattening `DESIGN.md` warns about.

`substitutions` lists glyphs drawn by a face the project does not package, with the face that drew each one. **These are not defects.** The packaged Plex subsets omit most arrows and pictographs, so a character like `→` or `❤️` comes from the exporting machine, and `DESIGN.md`'s archival section accepts that rather than paying for it with reworded copy or an icon dependency. Report the list as context and say where it gets confirmed: `pdffonts output/pdf/<slug>.pdf` shows the same faces embedded, and the archived PDF is what fixes their appearance. Do not propose replacing these characters unless the author raises it.

The line worth acting on is the other one: a family named in CSS that no package supplies, which surfaces as `font-family-not-shipped` because the whole element falls back rather than one glyph.

`borders` lists the border weights as they actually print. Chromium resolves a border width to whole pixels, so `0.35mm` and `0.5mm` can land on the same printed weight and a design that leans on borders to rank or separate things can lose that distinction without any declaration changing. Read it when borders carry meaning; there is no threshold check here, because what counts as too thin depends on the stock and the press.

### A finding is a claim about intent, so check the idiom first

Several deliberate techniques look like defects from the outside, and the script already suppresses the three that appear in this repository: a fixed-size box cropping an oversized image, a full-bleed band meeting both opposite edges, and a negative margin optically aligning art whose file carries its own internal whitespace.

That list is not closed. When a finding looks like something an author would have done on purpose, read the CSS for the idiom before changing anything, and say so in your report rather than silently fixing it. Conversely, do not assume an odd-looking value is intentional just because it is in the repository. Trace it to its declaration and judge it against the brief.

## 3. Look

Measurement cannot see whether the poster communicates. Open the screenshots.

Start with `-overview.png`. It is the whole sheet at half scale, the same view the preview toolbar's 50% button gives, and it approximates standing back from the printed poster. Judge composition here: does the eye land on the title and then the hero, does each section's height match how much it has to say, are peer headings and cards aligned to shared baselines, is any region starved while another is padded out. Then walk the brief's reading order and confirm the poster actually delivers it in that order.

Then clip the regions that carry the argument and read them closely at 2x:

```sh
pnpm tsx .claude/skills/poster-review/scripts/audit-poster.ts <slug> --clip '.hero' --clip '.media-routing'
```

Target a section or a card, not the sheet; a full-width clip is too large to read once it is scaled to fit. Close up, check the things geometry cannot score: whether annotation lines visibly touch both endpoints, whether a transport label sits on the segment it describes rather than on a junction, whether equivalent layers in a side-by-side comparison align and repeated layers share a height, whether headings wrap awkwardly, and whether the copy says something a reader could not already read off the screenshot beside it.

When one of those turns out to matter, measure it rather than estimating from the image. The page is scriptable, so a suspicion about alignment or a diagram's scale factor can be settled exactly: read the endpoint coordinates, compare rendered layer centers, resolve a `viewBox` against its rendered box. An eyeball verdict on a 2 mm misalignment is a guess; the same claim with the two positions in millimeters is something the author can act on or dismiss.

Use each pass for what it is good at. A screenshot will not tell you the difference between 16 pt and 18 pt; the measurement will. The measurement will not tell you that a section's heading buries its point; the screenshot will.

One gap is worth knowing about, because the measurement pass looks like it covers it and does not: **text inside a raster image is invisible to every check here.** The type floor is measured from the DOM, so a screenshot of an editor or an app contributes no text runs at all, and a poster can pass the floor everywhere while its one screenshot is illegible. When a screenshot is carrying part of the argument, size its text by hand: divide the image's rendered width in millimeters by its pixel width to get millimeters per source pixel, measure a glyph in the source image, and compare the result against the floor. A hero image whose code prints at 6 pt is not a legibility violation the script can name, but it is still the reason nobody reads the code.

## 4. Report before fixing

Lead with a short ranked list of what will actually cause trouble, worst first, then give the detail underneath. A poster review turns up many true things of wildly different weight, and a flat list buries the two that matter under a dozen refinements. The author is deciding what to fix before a deadline, so the ordering is most of the value.

Separate what you measured from what you judged, because they carry different confidence and the author will want to argue with them differently. For each point, cite the rule it comes from, in `DESIGN.md` or the brief, and name the declaration site as `file:line`. A finding tied to a rule lets the author disagree with the rule; a bare assertion of taste just invites a fight.

Say what came back clean, too, and name the checks you ran. On a poster that measures well, "nothing is below the floor and nothing is clipped" is the finding, and a review that only lists problems reads as though it found nothing to praise because it did not look. Then list what you deliberately left alone, and the brief's open decisions you ran into.

## 5. Fixing, and where a fix belongs

Visible copy belongs in `poster.mdx`, poster-specific geometry and visual identity in `poster.css`, and replaceable media in the poster's own `assets/`. Preserve official capitalization and spelling of project and product names exactly as the brief or the primary source gives them, and do not normalize a name from memory.

Two constraints shape where a fix can go:

- **The renderer is shared and versioned.** A sub-floor value inside `src/renderers/v1/` reaches every poster on v1, and a renderer version becomes immutable once its first poster is finalized. So a poster-local override in `poster.css` and a new renderer version are different decisions with different costs, and which one applies depends on whether any poster on that version is final. Raise it with the author instead of editing shared code to fix one poster.
- **Poster directories are independent on purpose,** so that a new design cannot silently restyle a finished one. Never edit another poster to resolve a finding in this one.

When type is below the floor, prefer giving the element more room over shrinking neighbors: widen the card, reclaim height from a sparse section, or cut copy. `DESIGN.md` asks you to spend space on hierarchy before enlarging dense body text, and shrinking a neighbor to fit usually just relocates the problem.

## 6. Close the loop

Re-run the measurement after fixing, because layout changes move things you were not looking at, then look again at the regions you touched. Finish with the repository's own checks:

```sh
pnpm check
pnpm export
```

`pnpm export` writes one-page PDFs to `output/pdf` and verifies their physical dimensions with Poppler's `pdfinfo`, which needs `poppler` installed. Its overflow check works at the sheet level, so it passes on problems this skill's per-element measurement catches; a green export is not evidence the poster is sound.

Tell the author what you verified and what still needs their eyes. Automated checks and a review of screenshots do not equal a look at paper, and the poster's declared size is the size that matters.
