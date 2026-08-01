# Posters

This repository builds print-ready technical conference posters from MDX, local assets, and poster-specific CSS.

## Commands

```sh
pnpm install
pnpm setup:browser
pnpm dev
pnpm check
pnpm export
```

`pnpm dev` opens the poster index and browser previews. The preview toolbar can simulate white, cool, or warm paper, while print output keeps the page background unfilled. `pnpm export` builds every poster, exports one-page PDFs to `output/pdf`, and verifies their physical dimensions with Poppler's `pdfinfo`.

Install Poppler before exporting locally:

```sh
brew install poppler
```

On Debian or Ubuntu, install the `poppler-utils` package instead.

See [DESIGN.md](./DESIGN.md) for the content contract, renderer architecture, print pipeline, and archival policy.
