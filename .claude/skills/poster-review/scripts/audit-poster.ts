/**
 * Measures a rendered poster against the physical print standards in DESIGN.md
 * and writes review screenshots.
 *
 * Every measurement runs under print media emulation so the numbers describe the
 * exported PDF rather than the preview. Sizes are self-calibrated from the paper
 * frame's rendered width against its declared millimeters, so the report stays
 * correct even when a preview transform or a different paper size is in effect.
 *
 * Usage from the repository root:
 *   pnpm tsx .claude/skills/poster-review/scripts/audit-poster.ts [slug...]
 *
 * Options:
 *   --floor <pt>       Legibility floor. Default 18, per DESIGN.md.
 *   --min-dpi <n>      Raster image resolution floor. Default 150.
 *   --out <dir>        Screenshot and JSON destination. Default tmp/poster-review.
 *   --clip <selector>  Also screenshot matching regions at full print
 *                      resolution. Repeatable.
 *   --port <n>         Dev server port. Default 4330.
 *   --url <origin>     Measure against a server already running; skips spawning.
 *   --no-screenshots   Measure only.
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser, type Page } from "playwright";

interface PosterManifestEntry {
  slug: string;
  widthMm: number;
  heightMm: number;
}

interface Finding {
  kind: string;
  selector: string;
  detail: string;
  text?: string;
}

interface Substitution {
  selector: string;
  family: string;
  glyphs: string[];
}

interface Measurement {
  mmPerPx: number;
  findings: Finding[];
  typeScale: { pt: number; selector: string; sample: string }[];
  borders: { usedPx: number; pt: number; selectors: string[] }[];
}

const argv = process.argv.slice(2);

function flag(name: string, fallback: string) {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (argv[index + 1] ?? fallback);
}

const valueFlags = [
  "--floor",
  "--min-dpi",
  "--out",
  "--port",
  "--url",
  "--clip",
];

const clipSelectors = argv
  .map((value, index) => (argv[index - 1] === "--clip" ? value : ""))
  .filter(Boolean);

const floorPt = Number.parseFloat(flag("floor", "18"));
const minDpi = Number.parseFloat(flag("min-dpi", "150"));
const outputDirectory = path.resolve(flag("out", "tmp/poster-review"));
const port = Number.parseInt(flag("port", "4330"), 10);
const explicitOrigin = argv.includes("--url") ? flag("url", "") : "";
const wantScreenshots = !argv.includes("--no-screenshots");
const requestedSlugs = argv.filter(
  (value, index) =>
    !value.startsWith("--") && !valueFlags.includes(argv[index - 1] ?? ""),
);

const host = "127.0.0.1";
const origin = explicitOrigin || `http://${host}:${port}`;

async function fetchManifest(timeoutMs: number) {
  const response = await fetch(`${origin}/posters.json`, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`manifest responded ${response.status}`);
  return (await response.json()) as PosterManifestEntry[];
}

async function waitForManifest() {
  for (let attempt = 0; attempt < 160; attempt += 1) {
    try {
      return await fetchManifest(1_000);
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`no poster manifest at ${origin}/posters.json`);
}

const astroExecutable = path.resolve(
  process.platform === "win32"
    ? "node_modules/.bin/astro.cmd"
    : "node_modules/.bin/astro",
);

/**
 * `astro dev` runs as a background daemon, so the spawned process exits 0 as
 * soon as the daemon is handed off and its exit says nothing about readiness.
 * Reuse a server that already answers, and only stop one this run started.
 */
async function startServer() {
  try {
    await fetchManifest(1_500);
    return { startedByUs: false };
  } catch {}

  await new Promise<void>((resolve, reject) => {
    const attempt = spawn(
      astroExecutable,
      ["dev", "--host", host, "--port", String(port)],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    attempt.stderr?.pipe(process.stderr);
    attempt.on("error", reject);
    attempt.on("exit", () => resolve());
  });

  return { startedByUs: true };
}

async function stopServer() {
  await new Promise<void>((resolve) => {
    const stop = spawn(astroExecutable, ["dev", "stop"], { stdio: "ignore" });
    stop.on("exit", () => resolve());
    stop.on("error", () => resolve());
  });
}

async function settle(page: Page) {
  await page.emulateMedia({ media: "print" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images, (image) =>
        image.complete ? undefined : image.decode().catch(() => undefined),
      ),
    );
  });
}

/**
 * Which non-packaged faces actually drew text, asked of Chromium directly.
 *
 * DESIGN.md accepts these: the packaged Plex subsets omit most arrows and
 * pictographs, so a mark like an arrow or a heart comes from the exporting
 * machine's fonts, and rewording copy or importing an icon set to avoid one
 * costs more than it protects. So this is reported as an inventory rather than
 * as a finding. The author needs to know which glyphs are machine-dependent so
 * they can be confirmed in the archived PDF, not be told to remove them.
 *
 * This has to come from the browser's own answer rather than from measuring
 * glyph widths. A width comparison against a deliberately absent family looks
 * like it should work and does not: `"IBM Plex Sans Variable", sans-serif` and a
 * nonexistent family resolve to different host fallbacks, so the two widths
 * differ and the glyph reads as supplied when nothing supplied it. That gives
 * false negatives on exactly the glyphs most likely to be missing, the arrows
 * and symbols a poster sets in prose, and a check that quietly passes is worse
 * than no check. `CSS.getPlatformFontsForNode` reports the faces that actually
 * rendered, which is the same thing `pdffonts` later shows embedded in the PDF.
 *
 * `pdffonts` on the exported PDF is the cross-check: the faces listed here are
 * the ones that show up embedded there.
 */
async function substitutedFonts(page: Page): Promise<Substitution[]> {
  const locked = await page.evaluate(() => {
    const families = new Set<string>();
    document.fonts.forEach((face) =>
      families.add(face.family.replace(/^["']|["']$/g, "")),
    );
    return [...families];
  });

  const cdp = await page.context().newCDPSession(page);
  const substitutions: Substitution[] = [];

  try {
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = (await cdp.send("DOM.getDocument", { depth: -1 })) as {
      root: { nodeId: number };
    };
    const { nodeIds } = (await cdp.send("DOM.querySelectorAll", {
      nodeId: root.nodeId,
      selector: ".poster-frame [data-audit-text]",
    })) as { nodeIds: number[] };

    // measure() tags the text carriers this walks. Failing loudly beats
    // returning an empty inventory that reads as "no substitutions".
    if (!nodeIds.length) {
      throw new Error(
        "no [data-audit-text] nodes; substitutedFonts() must run after measure()",
      );
    }

    // Chromium names the face it used ("IBM Plex Mono Medium") where the
    // @font-face rule names the family ("IBM Plex Mono"), so neither string
    // contains the other reliably in one direction. The prefix match leaves one
    // ambiguity: a developer machine with Plex installed system-wide reports the
    // same name as the packaged face, so a genuine substitution there reads as
    // packaged. `font-family-not-shipped` is what covers that case.
    const isLocked = (family: string) =>
      locked.some(
        (own) =>
          family.startsWith(own) ||
          own.startsWith(family) ||
          own.replace(/ Variable$/, "") === family,
      );

    const grouped = new Map<string, { glyphs: Set<string> }>();

    for (const nodeId of nodeIds) {
      let fonts: { fonts?: { familyName: string; glyphCount: number }[] };
      try {
        fonts = (await cdp.send("CSS.getPlatformFontsForNode", { nodeId })) as {
          fonts?: { familyName: string; glyphCount: number }[];
        };
      } catch {
        continue;
      }

      const host = (fonts.fonts ?? []).filter(
        (font) => font.glyphCount > 0 && !isLocked(font.familyName),
      );
      if (!host.length) continue;

      const { object } = (await cdp.send("DOM.resolveNode", { nodeId })) as {
        object: { objectId: string };
      };
      const described = (await cdp.send("Runtime.callFunctionOn", {
        objectId: object.objectId,
        functionDeclaration: `function () {
          const own = Array.from(this.childNodes)
            .filter((node) => node.nodeType === 3)
            .map((node) => node.textContent.trim())
            .join(" ")
            .trim();
          let region = this;
          while (region && !region.classList.length && region.parentElement) {
            region = region.parentElement;
          }
          const classes = Array.from(region.classList).map((c) => "." + c).join("");
          return JSON.stringify({
            own,
            region: region.tagName.toLowerCase() + classes,
          });
        }`,
        returnByValue: true,
      })) as { result: { value: string } };

      const { own, region } = JSON.parse(described.result.value) as {
        own: string;
        region: string;
      };

      for (const font of host) {
        const key = `${region}|${font.familyName}`;
        const entry = grouped.get(key) ?? { glyphs: new Set<string>() };
        // Only non-Latin runs realistically fall through, so showing them names
        // the offending character instead of the whole label.
        for (const glyph of own) {
          const code = glyph.codePointAt(0) ?? 0;
          if (code <= 0x7f) continue;
          // Variation selectors and joiners carry no outline, so naming them
          // would list an invisible character beside the emoji they modify.
          if ((code >= 0xfe00 && code <= 0xfe0f) || code === 0x200d) continue;
          entry.glyphs.add(glyph);
        }
        grouped.set(key, entry);
      }
    }

    for (const [key, entry] of grouped) {
      const [region, family] = key.split("|");
      // Nothing nameable means the face drew Latin text, which is the webfonts
      // having failed to load rather than one symbol falling through, and a line
      // per element would bury the symbols this is meant to surface.
      if (!entry.glyphs.size) continue;
      substitutions.push({
        selector: region,
        family,
        glyphs: [...entry.glyphs].map(
          (glyph) =>
            `${glyph} (U+${glyph.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0")})`,
        ),
      });
    }
  } finally {
    await cdp.detach().catch(() => undefined);
  }

  return substitutions;
}

async function measure(
  page: Page,
  poster: PosterManifestEntry,
  limits: { floorPt: number; minDpi: number },
): Promise<Measurement> {
  return page.evaluate(
    ({ poster, limits }) => {
      const frame = document.querySelector(".poster-frame");
      if (!frame) throw new Error("no .poster-frame in the rendered poster");

      const frameRect = frame.getBoundingClientRect();
      // Self-calibration: the frame's declared width in mm divided by the width
      // it actually occupies converts any rendered length into physical size.
      const mmPerPx = poster.widthMm / frameRect.width;
      const toPt = (px: number) => (px * mmPerPx * 72) / 25.4;

      // Print media drops the preview's scale transform, but reading it from the
      // frame keeps the numbers right if the audit ever runs in screen media.
      const frameScale =
        new DOMMatrixReadOnly(getComputedStyle(frame).transform).a || 1;

      const findings: Finding[] = [];
      const typeScale: { pt: number; selector: string; sample: string }[] = [];

      function describe(element: Element): string {
        const id = element.id ? `#${element.id}` : "";
        const classes = Array.from(element.classList)
          .map((name) => `.${name}`)
          .join("");
        return `${element.tagName.toLowerCase()}${id}${classes}`;
      }

      function rendered(element: Element): boolean {
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden")
          return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 || rect.height > 0;
      }

      /**
       * Screen pixels per unit of the element's own font-size.
       *
       * SVG font-size is expressed in user units, so a `font-size: 20px` label
       * inside a viewBox prints at whatever the viewBox-to-layout ratio makes
       * it, a number a CSS grep cannot predict. The screen CTM resolves that.
       * HTML font-size is already in CSS pixels, needing only the frame scale.
       */
      function fontScale(element: Element): number {
        const svg = element as SVGGraphicsElement;
        if (typeof svg.getScreenCTM === "function") {
          const ctm = svg.getScreenCTM();
          if (ctm) return Math.hypot(ctm.b, ctm.d) || frameScale;
        }

        return frameScale;
      }

      const textCarriers = new Map<Element, string>();
      const walker = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const content = (node.textContent ?? "").trim();
        const parent = node.parentElement;
        if (!content || !parent) continue;
        const existing = textCarriers.get(parent) ?? "";
        textCarriers.set(parent, `${existing} ${content}`.trim());
      }

      // Text carriers are tagged so the caller can ask Chromium which font
      // actually drew each one; see substitutedFonts().
      for (const element of textCarriers.keys()) {
        if (rendered(element)) element.setAttribute("data-audit-text", "");
      }

      /**
       * An element whose whole stack names nothing the project ships. DESIGN.md
       * accepts a single arrow or pictograph coming from a host font, because
       * the packaged subsets simply do not carry those characters. This is the
       * different case it still calls a defect: a misspelled or unavailable
       * family name means every character of the element falls back, so the
       * text itself changes shape from one machine to the next.
       */
      const shipped = new Set<string>();
      document.fonts.forEach((face) =>
        shipped.add(face.family.replace(/^["']|["']$/g, "")),
      );

      const unshipped = new Map<string, string>();
      for (const element of textCarriers.keys()) {
        if (!rendered(element)) continue;
        const stack = getComputedStyle(element)
          .fontFamily.split(",")
          .map((family) => family.trim().replace(/^["']|["']$/g, ""));
        if (stack.some((family) => shipped.has(family))) continue;
        unshipped.set(region(element), getComputedStyle(element).fontFamily);
      }

      for (const [owner, stack] of unshipped) {
        findings.push({
          kind: "font-family-not-shipped",
          selector: owner,
          detail: `no family in "${stack}" is packaged with this project, so all of its text is drawn by a host font`,
        });
      }

      /**
       * The nearest ancestor-or-self carrying a class name. Syntax highlighting
       * and inline emphasis wrap text in dozens of anonymous spans that inherit
       * one declared size, so reporting each of them separately would bury the
       * finding. The named region is what the author would actually edit.
       */
      function region(element: Element): string {
        for (
          let current: Element | null = element;
          current && current !== frame;
          current = current.parentElement
        ) {
          if (current.classList.length) return describe(current);
        }
        return describe(element);
      }

      const undersized = new Map<
        string,
        { pt: number; region: string; count: number; samples: string[] }
      >();

      for (const [element, sample] of textCarriers) {
        if (!rendered(element)) continue;

        const declared = Number.parseFloat(getComputedStyle(element).fontSize);
        if (!Number.isFinite(declared)) continue;

        const pt = toPt(declared * fontScale(element));
        const rounded = Math.round(pt * 10) / 10;
        const shortSample =
          sample.length > 70 ? `${sample.slice(0, 67)}...` : sample;
        typeScale.push({
          pt: rounded,
          selector: describe(element),
          sample: shortSample,
        });

        // A tenth of a point of slack keeps subpixel layout noise from turning
        // type declared exactly at the floor into a violation.
        if (pt >= limits.floorPt - 0.1) continue;

        const owner = region(element);
        const key = `${owner}|${rounded}`;
        const group = undersized.get(key) ?? {
          pt: rounded,
          region: owner,
          count: 0,
          samples: [],
        };
        group.count += 1;
        if (group.samples.length < 3) group.samples.push(shortSample);
        undersized.set(key, group);
      }

      for (const group of [...undersized.values()].sort(
        (a, b) => a.pt - b.pt,
      )) {
        const runs =
          group.count === 1 ? "1 text run" : `${group.count} text runs`;
        findings.push({
          kind: "type-below-floor",
          selector: group.region,
          detail: `${group.pt}pt across ${runs}, below the ${limits.floorPt}pt floor`,
          text: group.samples.join(" / "),
        });
      }

      /**
       * The element stacked over `covered` that actually hides it, or null when
       * the hit is merely an adjacent inline box.
       *
       * Only the part of the hit's ancestry that is not also an ancestor of the
       * covered text can be in front of it. Everything above their common
       * ancestor sits behind both, so a code panel's dark background must not
       * count as burying the tokens painted on top of it.
       */
      function occluder(hit: Element, covered: Element): Element | null {
        for (
          let current: Element | null = hit;
          current && current !== frame && !current.contains(covered);
          current = current.parentElement
        ) {
          const style = getComputedStyle(current);
          const alpha = style.backgroundColor.startsWith("rgba")
            ? Number.parseFloat(style.backgroundColor.split(",")[3] ?? "1")
            : 1;
          const opaque =
            (style.backgroundColor !== "rgba(0, 0, 0, 0)" && alpha >= 0.5) ||
            style.backgroundImage !== "none" ||
            ["img", "svg", "picture", "video"].includes(
              current.tagName.toLowerCase(),
            );
          if (opaque) return current;
        }

        return null;
      }

      /**
       * Text painted over by something opaque. An absolutely positioned callout
       * placed in millimeters has no relationship to where a line of code
       * happens to end, so it can bury the tail of a statement and leave syntax
       * that reads as broken. Nothing else in the pipeline notices: the text is
       * present in the DOM, at the right size, inside its box, and the sheet
       * reports no overflow. Hit testing each line box is what catches it.
       */
      const occluded = new Map<
        string,
        { cover: string; region: string; samples: string[]; worst: number }
      >();

      for (const [element, sample] of textCarriers) {
        if (!rendered(element)) continue;

        const range = document.createRange();
        range.selectNodeContents(element);
        const lines = Array.from(range.getClientRects());
        range.detach();

        let probes = 0;
        let buried = 0;
        const coveredBy = new Set<string>();

        for (const line of lines) {
          if (line.width < 1 || line.height < 1) continue;

          const y = line.top + line.height / 2;
          for (let step = 0; step <= 10; step += 1) {
            // Inset the sweep so a neighbour's border sitting flush against the
            // first or last glyph is not mistaken for something covering it.
            const x = line.left + 1 + ((line.width - 2) * step) / 10;
            if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;

            probes += 1;
            const hit = document.elementFromPoint(x, y);
            if (!hit || hit === element) continue;
            if (element.contains(hit) || hit.contains(element)) continue;

            const cover = occluder(hit, element);
            if (!cover) continue;

            buried += 1;
            coveredBy.add(describe(cover));
          }
        }

        if (!probes || !buried) continue;

        // Group by what is doing the covering: one mispositioned callout buries
        // several adjacent tokens, and the callout is the thing to move.
        const share = Math.round((buried / probes) * 100);
        const cover = [...coveredBy].join(", ");
        const key = `${cover}|${region(element)}`;
        const group = occluded.get(key) ?? {
          cover,
          region: region(element),
          samples: [],
          worst: 0,
        };
        group.worst = Math.max(group.worst, share);
        if (group.samples.length < 6) group.samples.push(sample.trim());
        occluded.set(key, group);
      }

      for (const group of [...occluded.values()].sort(
        (a, b) => b.worst - a.worst,
      )) {
        findings.push({
          kind: "text-occluded",
          selector: group.cover,
          detail: `paints over text in ${group.region}, burying up to ${group.worst}% of a run`,
          text: group.samples.join(" ").slice(0, 120),
        });
      }

      /**
       * Everything that leaves a visible mark on paper: text, replaced media,
       * and any box that paints its own background or border. Purely structural
       * wrappers are excluded, because a transparent full-width container
       * touching an edge is layout, not crowding.
       */
      const ink = new Set<Element>(textCarriers.keys());
      for (const replaced of frame.querySelectorAll(
        "img, svg, picture, video",
      )) {
        ink.add(replaced);
      }
      for (const element of frame.querySelectorAll("*")) {
        if (ink.has(element)) continue;
        const style = getComputedStyle(element);
        const paintsBackground =
          (style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
            style.backgroundColor !== "transparent") ||
          style.backgroundImage !== "none";
        const paintsBorder = (["Top", "Right", "Bottom", "Left"] as const).some(
          (side) =>
            Number.parseFloat(style[`border${side}Width`]) > 0 &&
            style[`border${side}Style`] !== "none" &&
            style[`border${side}Color`] !== "rgba(0, 0, 0, 0)",
        );
        if (paintsBackground || paintsBorder) ink.add(element);
      }

      /**
       * Where an element's ink actually lands. For text this is the union of its
       * line boxes rather than its element box: a syntax-highlighted code line
       * is a full-bleed block whose glyphs still sit inside the padding, and
       * measuring the box instead of the glyphs would call that crowding.
       */
      function inkBox(element: Element): DOMRect {
        if (textCarriers.has(element)) {
          const range = document.createRange();
          range.selectNodeContents(element);
          const rect = range.getBoundingClientRect();
          range.detach();
          if (rect.width > 0 || rect.height > 0) return rect;
        }
        return element.getBoundingClientRect();
      }

      const clippers: Element[] = [];
      if (["hidden", "clip"].includes(getComputedStyle(frame).overflowY)) {
        clippers.push(frame);
      }

      for (const element of frame.querySelectorAll("*")) {
        if (!rendered(element)) continue;
        const style = getComputedStyle(element);

        // DESIGN.md forbids shadows on printable elements because some print
        // pipelines flatten a semi-transparent shadow into a solid fill.
        if (style.boxShadow && style.boxShadow !== "none") {
          findings.push({
            kind: "print-box-shadow",
            selector: describe(element),
            detail: `box-shadow survives print media: ${style.boxShadow}`,
          });
        }

        const clips =
          ["hidden", "clip"].includes(style.overflowY) ||
          ["hidden", "clip"].includes(style.overflowX);
        if (clips) clippers.push(element);
      }

      /**
       * `scrollHeight` cannot answer either overflow question on its own: it
       * folds padding into the scrollable area, so an element whose child merely
       * reaches into its bottom padding reports the same spill as one whose
       * child is genuinely being cut off. Comparing descendant geometry against
       * the border box and the content box separately keeps the two apart,
       * because losing content and losing breathing room need different fixes.
       */
      for (const element of clippers) {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const pad = {
          top: Number.parseFloat(style.paddingTop) || 0,
          right: Number.parseFloat(style.paddingRight) || 0,
          bottom: Number.parseFloat(style.paddingBottom) || 0,
          left: Number.parseFloat(style.paddingLeft) || 0,
        };

        // Signed distance from the outermost descendant to each border edge:
        // positive means it reaches beyond the edge, negative means that much
        // clear space survives between the content and the edge.
        const past = {
          top: -Infinity,
          right: -Infinity,
          bottom: -Infinity,
          left: -Infinity,
        };
        const descendants = Array.from(element.querySelectorAll("*"));

        // Only ink counts. Block containers, highlight rows, and full-bleed
        // backgrounds routinely span the whole width by design, so measuring
        // every box would flag those as crowding. What matters is whether a word
        // or an image is the thing sitting on the edge.
        const culprit: Record<string, string> = {};

        for (const descendant of descendants.filter(
          (candidate) => ink.has(candidate) && element !== candidate,
        )) {
          if (!rendered(descendant)) continue;
          const box = inkBox(descendant);
          if (box.width === 0 && box.height === 0) continue;

          const reach = {
            top: rect.top - box.top,
            left: rect.left - box.left,
            right: box.right - rect.right,
            bottom: box.bottom - rect.bottom,
          };

          // A band meeting both opposite edges is full-bleed by construction: a
          // footer rule, a highlighted code line, a section background. Its
          // position on that axis says nothing about whether content is
          // crowded, though its extent on the other axis still does.
          const spansWidth = reach.left >= -1 && reach.right >= -1;
          const spansHeight = reach.top >= -1 && reach.bottom >= -1;
          const skip = new Set<string>();
          if (spansWidth) {
            skip.add("left");
            skip.add("right");
          }
          if (spansHeight) {
            skip.add("top");
            skip.add("bottom");
          }

          // A negative margin is the author saying where this edge belongs,
          // usually to optically align art whose file carries its own internal
          // whitespace. The element box then sits outside the visible mark, so
          // measuring it would report crowding the eye never sees.
          const descendantStyle = getComputedStyle(descendant);
          for (const side of ["top", "right", "bottom", "left"] as const) {
            const margin = Number.parseFloat(
              descendantStyle[
                `margin${side[0].toUpperCase()}${side.slice(1)}` as
                  "marginTop" | "marginRight" | "marginBottom" | "marginLeft"
              ],
            );
            if (margin < 0) skip.add(side);
          }

          for (const side of ["top", "right", "bottom", "left"] as const) {
            if (skip.has(side)) continue;
            if (reach[side] > past[side]) {
              past[side] = reach[side];
              culprit[side] = describe(descendant);
            }
          }
        }

        const sides = ["top", "right", "bottom", "left"] as const;

        // A side stays infinite when every ink descendant was skipped on that
        // axis, which the full-bleed and negative-margin rules do routinely.
        // The other sides are still measured, so only give up when none is.
        if (!sides.some((side) => Number.isFinite(past[side]))) continue;

        const asMm = (px: number) => Math.round(px * mmPerPx * 10) / 10;

        // A small box holding an image is the crop idiom rather than a layout
        // failure, so reporting lost content there would be wrong. Declared size
        // cannot be part of the test: computed width and height resolve to used
        // pixel values for any rendered element, never "auto".
        const looksLikeCrop =
          descendants.length <= 3 &&
          descendants.some((descendant) =>
            ["img", "svg", "picture", "video"].includes(
              descendant.tagName.toLowerCase(),
            ),
          );

        const lost = sides.filter((side) => past[side] > 1);
        if (lost.length && !looksLikeCrop) {
          findings.push({
            kind: "content-clipped",
            selector: describe(element),
            detail: `content is cut off ${lost
              .map(
                (side) =>
                  `${asMm(past[side])}mm past the ${side} edge (${culprit[side]})`,
              )
              .join(", ")}`,
          });
        }

        // Declared padding that survives as actual clear space. DESIGN.md asks
        // for each level's separation to be checked per side, and a section that
        // silently spends its own padding is how that separation disappears.
        const squeezed = sides
          .filter((side) => pad[side] > 1 && past[side] <= 1)
          .map((side) => ({
            side,
            clear: -past[side],
            declared: pad[side],
            by: culprit[side],
          }))
          .filter((entry) => entry.clear < entry.declared * 0.4);

        if (squeezed.length && !looksLikeCrop) {
          findings.push({
            kind: "padding-encroached",
            selector: describe(element),
            detail: squeezed
              .map(
                (entry) =>
                  `${entry.side} padding is ${asMm(entry.declared)}mm but ${entry.by} reaches within ${asMm(Math.max(entry.clear, 0))}mm of the edge`,
              )
              .join("; "),
          });
        }
      }

      for (const image of Array.from(frame.querySelectorAll("img"))) {
        if (!rendered(image)) continue;
        const rect = image.getBoundingClientRect();

        if (!image.complete || image.naturalWidth === 0) {
          findings.push({
            kind: "image-not-loaded",
            selector: describe(image),
            detail: `did not load: ${image.getAttribute("src") ?? "(no src)"}`,
          });
          continue;
        }

        if (image.currentSrc.includes(".svg") || rect.width === 0) continue;

        const widthInches = (rect.width * mmPerPx) / 25.4;
        const dpi = image.naturalWidth / widthInches;
        if (dpi < limits.minDpi) {
          findings.push({
            kind: "image-below-dpi",
            selector: describe(image),
            detail: `${Math.round(dpi)} DPI at ${Math.round(rect.width * mmPerPx)}mm wide, below the ${limits.minDpi} DPI floor (source is ${image.naturalWidth}px)`,
          });
        }
      }

      /**
       * A page fill, wherever it is declared. Checking only `.poster-frame`
       * misses the common case: the poster's own root element covers the whole
       * sheet, so a background on it is a full-page fill that reaches the PDF
       * even while the renderer dutifully clears the frame behind it.
       */
      for (const element of [frame, ...frame.querySelectorAll("*")]) {
        const style = getComputedStyle(element);
        const fill = style.backgroundColor;
        if (fill === "rgba(0, 0, 0, 0)" || fill === "transparent") continue;

        const box = element.getBoundingClientRect();
        const coversSheet =
          box.width >= frameRect.width - 1 &&
          box.height >= frameRect.height - 1;
        if (!coversSheet) continue;

        findings.push({
          kind: "paper-background-filled",
          selector: describe(element),
          detail: `covers the full ${poster.widthMm} x ${poster.heightMm} mm sheet with ${fill} under print media`,
        });
      }

      /**
       * Borders as printed rather than as declared. Chromium resolves a border
       * width to whole CSS pixels, so 0.5mm (1.89px) is used as 1px, which is
       * 0.75pt on paper, thin enough that large-format printing can break or
       * drop the line. The declaration reads reassuringly and the used value is
       * the one that gets inked.
       */
      const borderScale = new Map<
        number,
        { pt: number; selectors: string[] }
      >();
      for (const element of frame.querySelectorAll("*")) {
        if (!rendered(element)) continue;
        const style = getComputedStyle(element);

        for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
          const used = Number.parseFloat(style[`border${side}Width`]);
          if (
            !used ||
            style[`border${side}Style`] === "none" ||
            style[`border${side}Color`] === "rgba(0, 0, 0, 0)"
          ) {
            continue;
          }

          const group = borderScale.get(used) ?? {
            pt: Math.round(toPt(used) * 100) / 100,
            selectors: [],
          };
          const selector = describe(element);
          if (!group.selectors.includes(selector)) {
            group.selectors.push(selector);
          }
          borderScale.set(used, group);
        }
      }

      typeScale.sort((a, b) => a.pt - b.pt);
      const borders = [...borderScale.entries()]
        .map(([usedPx, group]) => ({ usedPx, ...group }))
        .sort((a, b) => a.pt - b.pt);

      return { mmPerPx, findings, typeScale, borders };
    },
    { poster, limits },
  );
}

async function main() {
  const server = explicitOrigin ? { startedByUs: false } : await startServer();

  let browser: Browser | undefined;

  try {
    const manifest = await waitForManifest();

    const posters = requestedSlugs.length
      ? manifest.filter((poster) => requestedSlugs.includes(poster.slug))
      : manifest;

    const unknown = requestedSlugs.filter(
      (slug) => !manifest.some((poster) => poster.slug === slug),
    );
    if (unknown.length) {
      throw new Error(
        `unknown poster ${unknown.join(", ")}; manifest has ${manifest.map((poster) => poster.slug).join(", ")}`,
      );
    }

    await mkdir(outputDirectory, { recursive: true });
    browser = await chromium.launch();
    let failed = false;

    const openPoster = async (
      slug: string,
      deviceScaleFactor: number,
      viewport = { width: 1600, height: 1200 },
    ) => {
      const page = await browser!.newPage({ viewport, deviceScaleFactor });
      // tsx compiles this file with esbuild's keepNames, which references a
      // `__name` helper inside every function it rewrites, including the ones
      // handed to page.evaluate. The browser has no such helper.
      await page.addInitScript({
        content: "globalThis.__name ||= (fn) => fn;",
      });
      await page.goto(`${origin}/posters/${slug}/`, {
        waitUntil: "networkidle",
      });
      await settle(page);
      return page;
    };

    for (const poster of posters) {
      // The occlusion pass hit-tests points with elementFromPoint, which only
      // answers inside the viewport, so the whole sheet has to fit in it.
      const sheet = {
        width: Math.ceil((poster.widthMm * 96) / 25.4) + 40,
        height: Math.ceil((poster.heightMm * 96) / 25.4) + 40,
      };
      const page = await openPoster(poster.slug, 1, sheet);
      const result = await measure(page, poster, { floorPt, minDpi });
      const substitutions = await substitutedFonts(page);

      if (wantScreenshots) {
        // Half scale reproduces the preview toolbar's 50% view: the whole sheet
        // small enough to judge hierarchy, balance, and where the eye lands.
        const overview = await openPoster(poster.slug, 0.5);
        await overview.locator(".poster-frame").screenshot({
          path: path.join(outputDirectory, `${poster.slug}-overview.png`),
          scale: "device",
        });
        await overview.close();

        // Requested regions at 2x, where small type stays legible to a reviewer
        // reading the image rather than the paper.
        if (clipSelectors.length) {
          const detail = await openPoster(poster.slug, 2);

          for (const [index, selector] of clipSelectors.entries()) {
            const matches = detail.locator(`.poster-frame ${selector}`);
            const count = await matches.count();

            if (!count) {
              console.log(`  no element matches --clip ${selector}`);
              continue;
            }

            for (let match = 0; match < Math.min(count, 6); match += 1) {
              const suffix = count > 1 ? `-${match + 1}` : "";
              await matches.nth(match).screenshot({
                path: path.join(
                  outputDirectory,
                  `${poster.slug}-clip${index + 1}${suffix}.png`,
                ),
                scale: "device",
              });
            }
          }

          await detail.close();
        }
      }

      await writeFile(
        path.join(outputDirectory, `${poster.slug}-audit.json`),
        `${JSON.stringify({ poster, limits: { floorPt, minDpi }, ...result, substitutions }, null, 2)}\n`,
      );
      await page.close();

      const byKind = new Map<string, Finding[]>();
      for (const finding of result.findings) {
        byKind.set(finding.kind, [
          ...(byKind.get(finding.kind) ?? []),
          finding,
        ]);
      }

      console.log(
        `\n${poster.slug}: ${poster.widthMm} x ${poster.heightMm} mm`,
      );
      console.log(
        `  smallest rendered type: ${result.typeScale[0]?.pt ?? "n/a"}pt` +
          `   largest: ${result.typeScale.at(-1)?.pt ?? "n/a"}pt`,
      );
      // Chromium resolves border widths to whole pixels, so distinct declared
      // weights can collapse into one printed weight. Worth a glance when a
      // design leans on borders to separate or rank things.
      console.log(
        `  printed border weights: ${
          result.borders.map((border) => `${border.pt}pt`).join(", ") || "none"
        }`,
      );

      // Accepted by DESIGN.md, so shown as context rather than counted as a
      // violation; the archived PDF is where these get confirmed.
      if (substitutions.length) {
        console.log(
          "  glyphs drawn by host fonts (accepted, confirm in the PDF):",
        );
        for (const substitution of substitutions) {
          console.log(
            `    ${substitution.selector}: ${substitution.glyphs.join(", ")} via ${substitution.family}`,
          );
        }
      }

      if (!result.findings.length) {
        console.log("  no measurable violations");
      } else {
        failed = true;
        for (const [kind, findings] of byKind) {
          console.log(`  ${kind} (${findings.length})`);
          for (const finding of findings.slice(0, 12)) {
            console.log(`    ${finding.selector}: ${finding.detail}`);
            if (finding.text) console.log(`      text: "${finding.text}"`);
          }
          if (findings.length > 12) {
            console.log(`    ... ${findings.length - 12} more, see the JSON`);
          }
        }
      }

      console.log(
        `  report: ${path.relative(process.cwd(), outputDirectory)}/`,
      );
    }

    console.log(
      "\nMeasurement is a gate, not a review. Open the screenshots and judge hierarchy,\n" +
        "alignment, connector endpoints, and wording against the poster brief.",
    );

    if (failed) process.exitCode = 1;
  } finally {
    await browser?.close();
    if (server.startedByUs) await stopServer();
  }
}

await main();
