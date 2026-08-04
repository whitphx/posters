# Streamlit-WebRTC poster brief

## Audience

Python developers at PyCon Korea who know how quickly Streamlit creates data apps but may not know that it can also host real-time media processing.

## Primary message

Build a complete real-time audio and video web app using only Python. A small amount of code defines the interface and media processing in one language, with no frontend implementation. Streamlit-WebRTC supplies the browser component and handles WebRTC transport.

## Reading order

1. Product name and primary message
2. Python example beside its application result
3. What the component is, what Streamlit is, and how to install it
4. Browser-to-Python media path
5. Advanced input, processing, routing, mixing, and output patterns
6. Project and documentation QR codes

## Format

- A1 portrait
- English
- Designed for reading at conference-poster distance
- Unprinted white paper background with no decorative page rails
- RGB browser PDF unless the printer specifies a different prepress format

## Required content

### Hero

Show approximately twenty lines of Python beside a real-time YOLO object detection application. Keep Streamlit's built-in model dropdown and the full callback contract visible: the `av.VideoFrame` argument, conversion to an image array, model invocation, annotated frame conversion, return value, and `video_frame_callback` registration. `demo/app.py` remains aligned with the poster snippet and closely follows the two examples in `whitphx/ultralytics-streamlit-realtime`. This comparison should make the leverage explicit: a small amount of application code, one language, a native Streamlit widget, and a complete user-facing result.

### Get started

Explain that Streamlit-WebRTC is a custom component for existing Streamlit apps. Define Streamlit as a Python web UI framework for building interactive applications without frontend code. Show `pip install streamlit-webrtc` as the installation command, while leaving detailed setup to the linked documentation.

### How it works

Explain that the browser captures camera or microphone input, WebRTC transports the media, and server-side Python callbacks receive and return audio or video frames. Streamlit and Streamlit-WebRTC manage the frontend communication, so researchers can turn computer vision, audio, and AI models into user-facing apps without building a JavaScript frontend or WebRTC stack. Cover input-only apps that return metadata or text, transformed bidirectional streams, output-only generated media, and combinations of these modes.

### Advanced patterns

- Direct loopback
- Filtering or recognition inside a callback
- Generating or replacing an output source
- Routing Client A to Client B
- Mixing multiple clients into shared outputs
- Combining independent audio and video paths

### Footer

Include QR codes and readable URLs for the project repository and documentation.

## Assets still required

- Final screenshots for the six feature examples
- Final screenshots for the three application examples
- Confirmed PyCon Korea logo usage, if desired
- Confirmed event print-shop requirements
