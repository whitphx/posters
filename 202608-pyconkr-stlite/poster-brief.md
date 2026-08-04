# StLite poster brief

## Audience

Python developers at PyCon Korea who know Streamlit as a server-hosted Python web app framework but may not know that a Streamlit app can run inside a browser.

## Primary message

Run a Streamlit app entirely in the browser. StLite uses Pyodide to execute Python and Streamlit in a Web Worker, so a static website can provide an interactive Python app without an application server.

## Reading order

1. Product name and primary message
2. Familiar Streamlit code beside the resulting in-browser app
3. Browser, Web Worker, Pyodide, and Streamlit execution path
4. Good fits and practical browser boundaries
5. StLite Sharing and static-site starting points
6. Project and documentation QR codes

## Format

- A1 portrait
- English
- Designed for reading at conference-poster distance
- Unprinted white paper background
- RGB browser PDF unless the printer specifies a different prepress format

## Required content

### Hero

Make the central claim visible before any architecture detail: familiar Streamlit Python runs in the visitor's browser, with no application server. Pair a concise Python example with a browser-framed result. The first draft uses an illustrative application UI rather than a product screenshot.

### How it runs

Show the page loading StLite, the app starting in a Web Worker, Pyodide providing Python through WebAssembly, and Streamlit rendering the interface. Explain that the browser owns the session and virtual file system.

### Good fits

- Interactive documentation and reproducible examples
- Static-hosted data explorers and teaching tools
- Local processing where input does not need to be sent to an application server

### Boundaries

- Python dependencies need browser-compatible packages or Pyodide-compatible wheels.
- Startup downloads and the browser's CPU and memory budget matter.
- Code and credentials delivered to the browser are visible to the visitor, so secrets need a server-side boundary.

### Start paths

- StLite Sharing for editing and sharing from the browser
- `@stlite/browser` for embedding an app in a static web page

### Footer

Include QR codes and readable URLs for the project repository and documentation.

## Rough-draft decisions to revisit

- Confirm whether the displayed product name should follow the repository's “Stlite” capitalization or use “StLite” for the conference poster.
- Replace the illustrative application UI with a final screenshot or selected demo.
- Decide whether the final poster should cover only `@stlite/browser` or give more space to React, desktop, and Cloudflare targets.
- Confirm PyCon Korea logo usage and event print-shop requirements.
- Review the limitations against the release selected for the conference.

## Sources

- [StLite repository](https://github.com/whitphx/stlite)
- [StLite documentation](https://stlite.net/)
- [`@stlite/browser` documentation](https://stlite.net/browser/)
- [StLite Sharing](https://edit.share.stlite.net/)
- [Pyodide](https://pyodide.org/)
