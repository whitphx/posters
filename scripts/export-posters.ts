import { execFile, spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { chromium, type Browser } from "playwright";

const execFileAsync = promisify(execFile);
const host = "127.0.0.1";
const port = 4321;
const origin = `http://${host}:${port}`;
const outputDirectory = path.resolve("output/pdf");

interface PosterManifestEntry {
  slug: string;
  widthMm: number;
  heightMm: number;
}

async function waitForServer(server: ReturnType<typeof spawn>) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Astro preview exited with code ${server.exitCode}`);
    }

    try {
      const response = await fetch(`${origin}/posters.json`, {
        signal: AbortSignal.timeout(1_000),
      });
      if (response.ok) return;
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Astro preview did not become ready");
}

async function verifyPdf(file: string, poster: PosterManifestEntry) {
  let stdout: string;

  try {
    ({ stdout } = await execFileAsync("pdfinfo", [file]));
  } catch (error) {
    throw new Error("Poppler's pdfinfo is required to verify poster PDFs", {
      cause: error,
    });
  }

  const pages = stdout.match(/^Pages:\s+(\d+)$/m)?.[1];
  const dimensions = stdout.match(/^Page size:\s+([\d.]+) x ([\d.]+) pts/m);

  if (pages !== "1" || !dimensions) {
    throw new Error(`${poster.slug}: expected one measurable PDF page`);
  }

  const expectedWidth = (poster.widthMm * 72) / 25.4;
  const expectedHeight = (poster.heightMm * 72) / 25.4;
  const actualWidth = Number.parseFloat(dimensions[1]);
  const actualHeight = Number.parseFloat(dimensions[2]);
  const tolerance = 0.75;

  if (
    Math.abs(actualWidth - expectedWidth) > tolerance ||
    Math.abs(actualHeight - expectedHeight) > tolerance
  ) {
    throw new Error(
      `${poster.slug}: expected ${poster.widthMm} x ${poster.heightMm} mm, received ${actualWidth} x ${actualHeight} pt`,
    );
  }
}

await mkdir(outputDirectory, { recursive: true });

const astroExecutable = path.resolve(
  process.platform === "win32"
    ? "node_modules/.bin/astro.cmd"
    : "node_modules/.bin/astro",
);
const server = spawn(
  astroExecutable,
  ["preview", "--host", host, "--port", String(port)],
  {
    stdio: ["ignore", "pipe", "pipe"],
  },
);
server.stdout?.pipe(process.stdout);
server.stderr?.pipe(process.stderr);

let browser: Browser | undefined;

try {
  await waitForServer(server);

  const response = await fetch(`${origin}/posters.json`);
  const posters = (await response.json()) as PosterManifestEntry[];
  browser = await chromium.launch();

  for (const poster of posters) {
    const page = await browser.newPage();
    await page.goto(`${origin}/posters/${poster.slug}/`, {
      waitUntil: "networkidle",
    });
    await page.emulateMedia({ media: "print" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images, (image) =>
          image.complete ? undefined : image.decode(),
        ),
      );
    });

    const overflow = await page
      .locator(".poster-frame")
      .evaluate((posterFrame) => ({
        horizontal: posterFrame.scrollWidth - posterFrame.clientWidth,
        vertical: posterFrame.scrollHeight - posterFrame.clientHeight,
      }));

    if (overflow.horizontal > 1 || overflow.vertical > 1) {
      throw new Error(
        `${poster.slug}: poster overflows by ${overflow.horizontal}px horizontally and ${overflow.vertical}px vertically`,
      );
    }

    const paperBackground = await page
      .locator(".poster-frame")
      .evaluate((posterFrame) => getComputedStyle(posterFrame).backgroundColor);

    if (paperBackground !== "rgba(0, 0, 0, 0)") {
      throw new Error(
        `${poster.slug}: preview paper color must be transparent during print export`,
      );
    }

    const outputPath = path.join(outputDirectory, `${poster.slug}.pdf`);
    await page.pdf({
      path: outputPath,
      width: `${poster.widthMm}mm`,
      height: `${poster.heightMm}mm`,
      preferCSSPageSize: true,
      printBackground: true,
      tagged: true,
    });
    await page.close();
    await verifyPdf(outputPath, poster);
    console.log(`Exported ${poster.slug}`);
  }
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
