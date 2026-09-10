# Streamlit-WebRTC poster brief

## Relationship to the PyCon Korea edition

This is the PyCon TW 2026 edition of the poster first prepared for PyCon Korea 2026 in `202608-pyconkr-streamlit-webrtc`. Its copy, layout, and assets are the same, and the two editions are expected to stay close.

The sheets differ. PyCon Korea's edition is A1; this one is 780 x 1090 mm. The layout is enlarged onto it rather than redrawn, so its lengths and type sizes are still written against the A1 canvas and each one prints about 30 percent larger than the same declaration in the PyCon Korea edition.

The runnable source for the hero snippet is `202608-pyconkr-streamlit-webrtc/demo/app.py`, which both editions share rather than duplicate. That directory becomes a preserved artifact once the PyCon Korea edition is finalized, so a third edition, or any change to the snippet after that point, is the moment to move `demo/` above the poster directories.

## Audience

Python developers at PyCon TW who know how quickly Streamlit creates data apps but may not know that it can also host real-time media processing.

## Primary message

Build a complete real-time audio and video web app using only Python. A small amount of code defines the interface and media processing in one language, with no frontend implementation. Streamlit-WebRTC supplies the browser component and handles WebRTC transport.

## Reading order

1. Product name and primary message
2. Python example beside its application result
3. What the component is, what Streamlit is, and how to install it
4. Browser-to-Python media path
5. Real projects shared by Streamlit-WebRTC users
6. Project and documentation QR codes

## Format

- 780 x 1090 mm portrait, the sheet PyCon TW specifies
- English
- Designed for reading at conference-poster distance
- Unprinted white paper background with no decorative page rails
- RGB browser PDF unless the printer specifies a different prepress format

## Required content

### Hero

Show approximately twenty lines of Python beside a real-time YOLO object detection application. Keep Streamlit's built-in model dropdown and the full callback contract visible: the `av.VideoFrame` argument, conversion to an image array, model invocation, annotated frame conversion, return value, and `video_frame_callback` registration. Use arrowed callouts to connect explanations directly to the built-in Streamlit elements, the freely programmable frame callback, and the callback registration that lets Streamlit-WebRTC handle media exchange. Continue each callout across to its visible result: built-in elements point to the screenshot's dropdown, while the callback and streamer point to the live-video region. `demo/app.py` remains aligned with the poster snippet and closely follows the two examples in `whitphx/ultralytics-streamlit-realtime`. This comparison should make the leverage explicit: a small amount of application code, one language, a native Streamlit widget, and a complete user-facing result.

### Get started

Explain that Streamlit-WebRTC is a custom component for existing Streamlit apps. Define Streamlit as a Python web UI framework for building interactive applications without frontend code. Show `uv add streamlit streamlit-webrtc` as the installation command, while leaving detailed setup to the linked documentation.

### How it works

Explain that the browser captures camera or microphone input, WebRTC transports the media, and server-side Python callbacks receive and return audio or video frames. Streamlit and Streamlit-WebRTC manage the frontend communication, so researchers can turn computer vision, audio, and AI models into user-facing apps without building a JavaScript frontend or WebRTC stack. Cover input-only apps that return metadata or text, transformed bidirectional streams, output-only generated media, and combinations of these modes.

### Project gallery

Use a three-column by three-row grid for nine real projects shown through media previews from their builders' public posts. Label the section “Applications” and explain that apps are built by composing video and audio inputs, processing, and outputs. Pair each preview with a source credit containing the builder's display name, source identity, date, and a QR code for the exact source URL. Keep the preview and credit clickable in digital output, explicitly style every link state, and record the asset-to-permalink mapping and retrieval date in `assets/ATTRIBUTION.md`. Add a concise explanation of the application followed by compact tags for its audio or video modality and its `SINK`, `FILTER`, `SOURCE`, or `MIX` roles. Use `SIDE OUTPUT` when a filter also exposes recognition results or statistics to the Streamlit app. Do not add implementation snippets to these cards. The examples cover programmable audio generation, emotion-based music recommendation, StreamDiffusion, a voice interface using Whisper and ChatGPT, paper molecular-model recognition, a guitar tuner, local real-time speech-to-text, BitePulse eating-pace feedback, and an SFU / MCU video chat that routes or mixes tracks with face filters before delivery.

### Footer

Include QR codes and readable URLs for the project repository and documentation.

## Assets still required

- A replacement `assets/hero-yolo-detection.png` of at least 2400 px wide. The current capture is 1770 px, which prints at 126 DPI once enlarged onto this sheet, below the 150 DPI floor. Its `width` and `height` attributes in `poster.mdx` also describe a different image than the file and need correcting with it.
