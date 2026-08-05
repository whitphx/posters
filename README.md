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

## Deployment

Every push deploys the built site to Cloudflare Pages via [`deploy.yml`](./.github/workflows/deploy.yml):

- `main` deploys to production: `https://whitphx-info-posters.pages.dev`
- Every other branch deploys to a dedicated preview subdomain: `https://<branch>.whitphx-info-posters.pages.dev` (branch names are normalized by Cloudflare, e.g. `feature/foo` becomes `feature-foo`)
- When a branch has an open pull request, the workflow posts the preview URLs as a sticky comment on it

The workflow creates the Pages project automatically on first run. It requires two repository secrets:

| Secret                  | Value                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → Account ID              |
| `CLOUDFLARE_API_TOKEN`  | API token with the **Cloudflare Pages: Edit** account permission |

Custom domains can be attached later in the Cloudflare dashboard (Pages project → Custom domains) without changing the workflow.
