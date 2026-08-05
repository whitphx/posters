# Project instructions

## Poster design

- Every visual element must communicate content, hierarchy, grouping, a relationship, or a flow. When an element has no informational purpose, omit it.
- Do not add decorative kicker text, rules, rails, patterns, shapes, or marks solely to create visual interest or fill space.
- Do not use a line as a substitute for clear typography and spacing. Add one only when it separates content, defines a container, or expresses a relationship.
- Treat visible copy as technical content. Do not add slogans, taglines, buzzwords, placeholder instructions, or explanatory text that merely states what a nearby screenshot or code sample already shows.
- Lead with the concrete value proposition and strongest defensible claims. Do not claim qualities such as performance unless the poster presents evidence and the claim is central to the work.
- Preserve official project capitalization and spelling consistently, such as `Streamlit-WebRTC`.
- Use the author's requested public identity verbatim. Do not add conference names, category labels, fake controls, or other contextual markers unless they provide information readers need.
- Prefer recognizable application outcomes in headings. Put implementation vocabulary in supporting descriptions, diagrams, or compact API-composition labels.
- Preserve the official capitalization of every product and package name, such as `Stlite`, `Pyodide`, and `Cloudflare Workers`. Do not normalize names from memory or infer a different brand style.

## Typography and spatial hierarchy

- Treat 18 pt as the default minimum for body text, code, captions, labels, URLs, and diagram copy on an A1 conference poster unless its brief requires a larger floor.
- Spend available space on titles, section headings, subheadings, and section subtitles before enlarging dense body paragraphs. Keep the hierarchy visibly stepped rather than scaling every text role together.
- Allocate section height according to information density. Remove unused fixed-height space from sparse sections and redistribute it to content that benefits from larger type or clearer structure.
- Tightening a section does not mean zeroing its margins. Preserve enough separation between its heading, content groups, checklist or caveat block, and outer edges for each level to remain legible.
- Check top and bottom padding independently. A compact section can still need extra room below its final element even when its internal gaps are correct.
- Center the main title and summary against the physical poster, independently of asymmetrical logos or technology marks placed on either side. Allow long summary copy to wrap intentionally within a bounded width.
- Keep peer headings, labels, package names, and diagrams aligned to shared baselines or vertical positions. Recheck these alignments whenever font size, column width, or wrapping changes.
- When a primary card's meaningful subheadings wrap awkwardly, give that card more width before reducing type. Reclaim width conservatively from secondary cards and verify that their titles, badges, and body copy remain readable.

## Technical storytelling

- When a poster promises leverage from a small amount of code, keep the essential implementation visible. Show the callback signature, meaningful processing, return value, and registration point instead of hiding the core mechanism behind a helper.
- Use the hero result to demonstrate something visually compelling while keeping the application code short and understandable. It is acceptable to delegate complex work to a library when the visible code still shows how the integration works.
- Show coexistence with the host framework when it is part of the value proposition. For Streamlit examples, keep relevant built-in widgets visible alongside Streamlit-WebRTC rather than presenting the media component as an isolated application.
- Distinguish transport paths from application-side outputs precisely. WebRTC carries transformed audio and video; text, metadata, and metrics normally appear through Streamlit elements. Use `SIDE OUTPUT` when a media processor also exposes such derived results to the app.
- Explain an architecture figure in terms that map directly to its visible labels and relationships. Avoid surrounding prose that introduces concepts the diagram does not show.
- When readers need an onboarding bridge, order it from prerequisite context to immediate action. Explain the host framework, then the extension, installation, and the command that runs the example; omit steps that readers can infer or that the poster does not need.
- Do not repeat a section heading in its opening sentence. Let the heading state the claim and use the body to explain mechanism, consequence, or evidence.
- For Streamlit architecture explanations, distinguish the user-facing programming model from the machinery beneath it. Standard Streamlit starts a Python server, serves a frontend SPA, and maintains network communication for interaction; Stlite substitutes Pyodide for native CPython so the server process can run inside the browser while the programming model remains familiar.
- Describe Pyodide precisely as CPython compiled to WebAssembly, not merely as something that supplies a Python runtime.
- Organize deployment choices around the question readers must answer, such as where Python runs. Distinguish self-hosted libraries, framework integrations, hosted sharing platforms, packaged desktop targets, and experimental edge runtimes rather than presenting them as equivalent products.
- When introducing a technically surprising deployment target, connect it to an established platform trend in one concise sentence, then return to the poster's main comparison. Do not let the aside overwhelm the deployment choice it explains.

## Diagrams and annotations

- Place a label on the path, object, or region it describes. Do not put a transport label on a boundary or near a fork, mix, or junction when it refers to the transport segment itself.
- Use callouts only to explain a meaningful code or result relationship. Keep titles conceptual and modality-neutral when the same API pattern applies to audio and video; put sample-specific detail in the body only when it aids understanding.
- Keep callout copy concise and widen the box before reducing legible type. Recheck nearby code, screenshots, and connectors whenever a box changes size or position.
- Treat endpoint coordinates as the source of truth for annotation geometry. After moving a box or endpoint, update every connected line so it visibly touches both ends at print scale.
- Keep circular endpoints physically square and use non-scaling strokes where transformed SVG geometry would otherwise squash circles or thin lines.
- In a side-by-side stack comparison, align equivalent layers and give repeated layers equal heights. Use the center mapping labels to distinguish what stays the same from what is replaced or adapted.
- Show infrastructure layers that materially explain the comparison, including servers, runtimes, and transport bridges. Use accurate interface language such as HTTP requests becoming ASGI calls and worker messages carrying HTTP and WebSocket traffic.
- Keep mapping labels centered in their own column with balanced connectors to both stacks. After changing typography or layer heights, verify both the left and right endpoints instead of correcting only one edge.
- Use borders thick enough to survive physical printing. Bring diagram headings close enough to their stacks that the relationship is immediate, while keeping the figure caption clearly separated from both columns.
- Add official technology logos or familiar licensed icons when they help readers identify components quickly. Apply icons consistently to comparable components, and omit them when a neighboring set intentionally uses plain package labels.

## Application examples and attribution

- Present application examples with a useful preview, a short outcome-focused description, and compact modality and API-role tags such as `AUDIO`, `VIDEO`, `SINK`, `FILTER`, `SOURCE`, `MIX`, and `SIDE OUTPUT`. Do not add code snippets when those tags communicate the composition more clearly.
- Use side-by-side preview and description layouts when vertically stacking them would make screenshots too wide or reduce information density.
- Credit every externally sourced example with enough information to find the original: creator name, account or source identity, date when available, and an exact permalink encoded as a readable URL or QR code. Keep the preview and credit clickable in digital output.
- Record each local preview asset's source permalink and retrieval details in the poster's attribution file. Style all link states explicitly so visited links do not alter the printed visual hierarchy.
- Give citation text and URLs enough horizontal room to avoid awkward wrapping or variable card heights. Reduce citation type only within the poster's established legibility floor.

## Poster production

- Treat the physical paper as the default white page. Do not add a full-page background fill unless a poster brief explicitly requires one. Preview paper colors must not appear in print output.
- Use section numbering only when order or sequence carries semantic meaning. Do not add 01/02/03-style markers as decoration.
- Keep screenshot placeholders as local, individually replaceable assets. Do not print asset replacement notes or placeholder explanations on the poster.
- Size body text, code, labels, URLs, and screenshots for reading at conference-poster distance.
- Use window or device frames only when the poster brief explicitly requests them.
- Do not use box shadows on printable poster elements. Some print pipelines render semi-transparent shadows as solid fills; use borders or spacing when separation is necessary. Preview-only shadows are acceptable when print styles remove them explicitly.
- Keep footers limited to useful provenance and destinations. Remove redundant taglines, repeated explanations, and separators that do not clarify grouping.
- Validate the final poster for its declared physical dimensions, one-page output, overflow, font loading, image loading, and visual legibility.
