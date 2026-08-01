# Streamlit WebRTC poster brief

## Audience

Python developers at PyCon Korea who know how quickly Streamlit creates data apps but may not know that it can also host real-time media processing.

## Primary message

Build a real-time audio or video application with a small amount of Python. Streamlit WebRTC handles the browser connection and media transport while Python callbacks control what happens to each frame.

## Reading order

1. Product name and primary message
2. Python example beside its application result
3. Browser-to-Python media path
4. Advanced input, processing, routing, mixing, and output patterns
5. Project and documentation QR codes

## Format

- A1 portrait
- English
- Designed for reading at conference-poster distance
- Unprinted white paper background with no decorative page rails
- RGB browser PDF unless the printer specifies a different prepress format

## Required content

### Hero

Show approximately twenty lines of Python beside the resulting Streamlit application. The comparison should make the implementation feel immediately achievable.

### How it works

Explain that the browser captures camera or microphone input, WebRTC transports the media, and server-side Python callbacks receive and return audio or video frames. Streamlit and the custom component manage the front-end communication.

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

- Final conference-demo application screenshot
- Confirmed PyCon Korea logo usage, if desired
- Confirmed event print-shop requirements
