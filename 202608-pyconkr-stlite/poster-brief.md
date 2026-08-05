# Stlite poster brief

## Current state

The first complete content draft is on the printable canvas. Its central figure compares standard Streamlit with Stlite as vertically aligned stacks, making the runtime substitution and transport adaptation visible without suggesting that the application or Streamlit layers have been rewritten.

## Audience

Python developers at PyCon Korea who know Streamlit as a framework for building interactive apps in Python, but may assume every Streamlit app needs a remotely hosted Python server.

## Working tagline

Streamlit-Lite, in-browser Streamlit.

## Central idea

Stlite is a WebAssembly port of Streamlit that moves the Streamlit Python server from a remote machine into the web browser. Pyodide supplies the CPython runtime. The Streamlit frontend and Python server then run together on the visitor's device, while the remote web server only has to serve static files.

This architectural move is the subject of the poster. The benefits, applications, and constraints should be presented as consequences of moving the runtime across that boundary, not as an unrelated feature list.

## Why the architecture is interesting

### Original Streamlit

A Streamlit app normally starts a Python web server. Its browser frontend continuously communicates with that server, and user events trigger server-side Python execution that updates the frontend.

### Stlite

Stlite mounts the Streamlit frontend into a page, loads Pyodide, and launches the Streamlit Python server inside the browser. The application remains recognizably Streamlit, including reruns, widgets, file watching, multipage apps, and Python packages that are compatible with Pyodide.

### Consequences of moving the runtime

- Offline capability: after the required resources have loaded, the application can continue running without a server connection.
- Data privacy: files selected through the app can be processed locally without being sent to a remote application server.
- Scalability: Python computation is distributed across visitors' devices instead of concentrating on one server.
- Static deployment: HTML, JavaScript, CSS, Python source, data, and other assets can be served from a static host.
- Browser-native authoring: a live editor can write into the virtual file system and use Streamlit's file-change and rerun behavior for immediate preview.
- Multi-platform packaging: the same browser runtime can support web apps, installable PWAs, and Electron desktop applications.

## Applications and use cases

### Stlite Sharing

Stlite Sharing combines an online file editor with a live Streamlit preview. An app's source and data can be encoded in the URL fragment, making the app shareable without storing that content on the service's server. The same encoded state can be reopened in the editor.

### Self-hosted static apps

`@stlite/browser` can launch a Streamlit app from a `<streamlit-app>` element or the `mount()` API. A static site can provide multiple files, requirements, configuration, archives, and an isolated virtual file system.

### Local data tools

Data exploration, image processing, statistics, teaching materials, reproducible examples, and internal utilities can benefit when computation and selected files remain on the user's device.

### Desktop and installable apps

Because the runtime already lives in a browser environment, a Stlite application can be packaged with Electron or delivered as an installable web application.

## Deployment targets

The poster groups Stlite deployment by where Python runs rather than by package name alone.

- Browser SPA: `@stlite/browser` mounts an app in a static page, `@stlite/react` embeds it in an existing React application, and Stlite Sharing transfers app files in a URL fragment for local decoding and execution.
- Desktop: `@stlite/desktop` packages the browser runtime in an Electron application.
- Cloudflare Workers (experimental): `@stlite/cloudflare` runs the Stlite-patched Streamlit runtime on Pyodide in Cloudflare Python Workers. The normal browser frontend communicates with the edge-hosted server over WebSocket, preserving Streamlit's client and server architecture.

The deployment map must not replace the explanation of why browser-run Stlite is useful. Keep the local-runtime benefits and their decision context visible: private local file processing, offline operation, visitor-supplied compute for public demos, and reuse across embedded web and desktop targets. Pair those benefits with the browser constraints so the poster also explains when another target is the better choice.

## Trade-offs to explain

- Packages with native extensions need Pyodide-compatible builds.
- The initial payload includes a Python runtime and required packages.
- Browser networking rules such as CORS still apply.
- Source code and hosted data are delivered to the visitor, so secrets cannot live in the app bundle.
- Browser CPU, memory, threading, and API constraints differ from a normal server environment.

## Layout blueprint

The page explains one transformation: the Python server moves from the remote side of the network into the browser. All other material attaches to that transformation.

```text
+------------------------------------------------------+
| Stlite                                               |
| Streamlit-Lite, in-browser Streamlit.                |
| concise statement of the architectural move          |
+------------------------------------------------------+
|                                                      |
| STANDARD STREAMLIT                  STLITE            |
| [app script]         same           [app script]      |
| [Streamlit server]   same           [Streamlit server]|
| [CPython]            replaced by    [Pyodide]         |
|       |                                      |        |
| HTTP + WebSocket     adapted to     Worker messages   |
|       |                                      |        |
| [browser frontend]   same           [browser frontend]|
|                                      ^               |
|                                static files          |
|                                                      |
| Privacy, offline operation, and distributed compute  |
| attach directly to the moved runtime.                |
+------------------------------------------------------+
| BROWSER SPA              | DESKTOP       | WORKERS  |
| browser / React / Sharing| Electron      | edge     |
+------------------------------------------------------+
| Browser constraints                    project links  |
+------------------------------------------------------+
```

The architecture comparison is the primary visual and should occupy most of the poster. Lines and arrows are appropriate only inside this diagram because they express communication and movement. The benefits should be positioned next to the part of the architecture that causes them. Application examples should use real screenshots or assets, not decorative cards or illustrations.

## Format

- A1 portrait
- English
- Designed for reading at conference-poster distance
- Unprinted white paper background
- RGB browser PDF unless the printer specifies a different prepress format

## Assets to select

- Stlite Sharing editor and preview screenshot
- A privacy-sensitive or offline-capable application example, such as local OpenCV image processing
- Optional desktop application screenshot if desktop packaging remains in scope
- Stlite project logo, subject to final placement and attribution handling

## Decisions still open

- Which one or two application examples best communicate potential beyond the architecture
- PyCon Korea logo usage and print-shop requirements

## Primary sources

- [Stlite repository and current README](https://github.com/whitphx/stlite)
- [Streamlit meets WebAssembly, Stlite](https://www.whitphx.info/posts/20221104-streamlit-wasm-stlite/)
- [Stlite documentation](https://stlite.net/)
- [`@stlite/browser` documentation](https://stlite.net/browser/)
- [`@stlite/react` documentation](https://stlite.net/react/)
- [`@stlite/desktop` documentation](https://stlite.net/desktop/)
- [`@stlite/cloudflare` documentation](https://github.com/whitphx/stlite/blob/main/docs/src/content/docs/cloudflare.mdx)
- [Stlite Sharing](https://edit.share.stlite.net/)
- [Pyodide](https://pyodide.org/)
