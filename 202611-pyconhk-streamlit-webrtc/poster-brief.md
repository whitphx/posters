# Streamlit-WebRTC poster brief

## Relationship to the other editions

This is the PyCon Hong Kong 2026 edition of the poster first prepared for PyCon Korea 2026 in `202608-pyconkr-streamlit-webrtc` and shown again at PyCon TW 2026 in `202610-pycontw-streamlit-webrtc`. It was copied from the PyCon TW edition, which carries the corrected image dimensions and the third-party notice for the hero snippet. Its layout and assets are the same, and the editions are expected to stay close apart from the content changes recorded below.

The sheets differ. PyCon Korea's edition is A1, PyCon TW's is 780 x 1090 mm, and this one is A0. The layout is enlarged onto A0 rather than redrawn, so its lengths and type sizes are still written against the A1 canvas and each one prints about 41 percent larger than the same declaration in the PyCon Korea edition. A0 and A1 share an aspect ratio, so the enlargement fills the sheet apart from about 1 mm of width left over from ISO rounding.

The runnable source for the hero snippet is `202608-pyconkr-streamlit-webrtc/demo/app.py`, which the editions share rather than duplicate. This is the third edition, the point the PyCon TW brief named for moving `demo/` above the poster directories; that move is left for the author because it changes the preserved PyCon Korea directory.

## Changes from the PyCon TW edition

Visitors at PyCon TW asked two questions often enough that this edition answers them on the poster:

- **What do Streamlit and Streamlit-WebRTC each do?** Visitors who did not already know Streamlit could not follow the poster without its basic idea: you write a Python script, Streamlit runs it, and it becomes an interactive web app. The header abstract now opens with that idea, and Get started shows it as a flow from Python script to `streamlit run` to web app.
- **Which library does which part of the demo?** The demo combines Streamlit for the app and its widgets, Streamlit-WebRTC for real-time video, and Ultralytics YOLO for detection, and visitors wanted the boundaries shown. The hero now attributes every library-owned line of the snippet, each callout, and each region of the screenshot to one library by colour, with a legend in the code panel's title bar.

These are content decisions for this edition only. The PyCon Korea and PyCon TW editions are already exhibited and stay as they are.

## Audience

Python developers at PyCon Hong Kong who know how quickly Streamlit creates data apps but may not know that it can also host real-time media processing.

## Primary message

Build a complete real-time audio and video web app using only Python. A small amount of code defines the interface and media processing in one language, with no frontend implementation. Streamlit-WebRTC supplies the browser component and handles WebRTC transport.

## Reading order

1. Product name and primary message
2. Python example beside its application result
3. What Streamlit is, how a script becomes an app, what the component adds, and how to install it
4. Browser-to-Python media path
5. Real projects shared by Streamlit-WebRTC users
6. Project and documentation QR codes

## Format

- A0 portrait, 841 x 1189 mm. The author confirmed A0; portrait follows the existing composition and has not been checked against the event's board
- Submitted to PyCon Hong Kong as a print-ready A0 PDF
- English
- Designed for reading at conference-poster distance, about a metre and further
- Unprinted white paper background with no decorative page rails
- RGB browser PDF unless the printer specifies a different prepress format
- The hero screenshot prints at 116 DPI, below the review script's 150 DPI default, and that `image-below-dpi` finding is accepted rather than outstanding for the same reason the PyCon TW edition accepts 126 DPI: the file clears the default at A1, so the shortfall is this sheet's enlargement rather than a poor capture, and 1770 px is the most the source display can produce. One arcminute, the Snellen 20/20 acuity limit, subtends about 0.29 mm at a metre, or roughly 87 DPI, so the shortfall is still finer than a reader resolves at the distance above.

## Required content

### Hero

Show approximately twenty lines of Python beside a real-time YOLO object detection application. Keep Streamlit's built-in model dropdown and the full callback contract visible: the `av.VideoFrame` argument, conversion to an image array, model invocation, annotated frame conversion, return value, and `video_frame_callback` registration. Use arrowed callouts to connect explanations directly to the built-in Streamlit elements, the freely programmable frame callback, and the callback registration that lets Streamlit-WebRTC handle media exchange. Continue each callout across to its visible result: built-in elements point to the screenshot's dropdown, the callback points to the detections drawn into the live video, and the streamer points to the video component's controls.

Make the division of labour explicit with one colour per party, used consistently across a legend in the code panel's title bar, a gutter bar and tint on each line, the callouts and their arrows, and outlines on the screenshot:

- Streamlit, in Streamlit red: the `streamlit` import and the `st.selectbox` and `st.spinner` calls. It builds the app and every widget outside the video from plain Python. The screenshot outline covers the model dropdown.
- Streamlit-WebRTC, in purple: its import and the `webrtc_streamer` call. One call adds the video component, which handles browser capture, WebRTC transport, and playback of the returned frames. The screenshot outline covers the video and its controls.
- Your Python, here Ultralytics YOLO, in amber: the `av` and `ultralytics` imports, model loading, and the frame callback. Any library can run in the callback.

Each callout title names its party, so the strength each one contributes is readable without the legend. `demo/app.py` remains aligned with the poster snippet and closely follows the two examples in `whitphx/ultralytics-streamlit-realtime`. This comparison should make the leverage explicit: a small amount of application code, one language, a native Streamlit widget, and a complete user-facing result.

### Get started

Introduce Streamlit before the component, for readers who have not used it: it turns a Python script into an interactive web app, each `st.*` call draws a UI element, and no frontend code is involved. Show that idea as a short flow from a Python script through `streamlit run` to a web app. Then explain that Streamlit-WebRTC is a component that adds real-time camera and microphone streams to a Streamlit app and passes each frame to the reader's Python code. Show `uv add streamlit streamlit-webrtc` as the installation command and `uv run streamlit run app.py` as the run command, while leaving detailed setup to the linked documentation.

### How it works

Explain that the browser captures camera or microphone input, WebRTC transports the media, and server-side Python callbacks receive and return audio or video frames. Streamlit and Streamlit-WebRTC manage the frontend communication, so researchers can turn computer vision, audio, and AI models into user-facing apps without building a JavaScript frontend or WebRTC stack. Cover input-only apps that return metadata or text, transformed bidirectional streams, output-only generated media, and combinations of these modes.

### Project gallery

Use a three-column by three-row grid for nine real projects shown through media previews from their builders' public posts. Label the section “Applications” and explain that apps are built by composing video and audio inputs, processing, and outputs. Pair each preview with a source credit containing the builder's display name, source identity, date, and a QR code for the exact source URL. Keep the preview and credit clickable in digital output, explicitly style every link state, and record the asset-to-permalink mapping and retrieval date in `assets/ATTRIBUTION.md`. Add a concise explanation of the application followed by compact tags for its audio or video modality and its `SINK`, `FILTER`, `SOURCE`, or `MIX` roles. Use `SIDE OUTPUT` when a filter also exposes recognition results or statistics to the Streamlit app. Do not add implementation snippets to these cards. The examples cover programmable audio generation, emotion-based music recommendation, StreamDiffusion, a voice interface using Whisper and ChatGPT, paper molecular-model recognition, a guitar tuner, local real-time speech-to-text, BitePulse eating-pace feedback, and an SFU / MCU video chat that routes or mixes tracks with face filters before delivery.

### Footer

Include QR codes and readable URLs for the project repository and documentation.

## Assets still required

- PyCon Hong Kong's published poster specification, which could not be retrieved while preparing this edition: orientation, bleed, crop marks, colour mode or PDF/X, and the submission deadline
