# Closely follows the real-time YOLO examples in whitphx/ultralytics-streamlit-realtime.
# See THIRD_PARTY_NOTICES.md for source links and the license notice.

import av
import streamlit as st
from streamlit_webrtc import webrtc_streamer
from ultralytics import YOLO

model_name = st.selectbox(
    "YOLO model",
    ["yolo11n.pt", "yolo11s.pt", "yolov8n.pt"],
)

with st.spinner(f"Loading {model_name}..."):
    model = YOLO(model_name)


def process(frame: av.VideoFrame) -> av.VideoFrame:
    image = frame.to_ndarray(format="bgr24")
    result = model(image, verbose=False)[0]
    annotated = result.plot()
    return av.VideoFrame.from_ndarray(annotated, format="bgr24")


webrtc_streamer(
    key="detection",
    video_frame_callback=process,
    media_stream_constraints={"video": True, "audio": False},
)
