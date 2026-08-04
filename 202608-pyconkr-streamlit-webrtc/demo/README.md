# YOLO object detection demo

This runnable Streamlit-WebRTC app is the source for the poster's hero example. It combines the direct callback from upstream's simple example with the model selector from its full example, while omitting the metadata display.

## Run

```sh
uv sync
uv run streamlit run app.py
```

Choose a YOLO model and allow camera access. Streamlit's built-in dropdown and the Streamlit-WebRTC video component run in the same Python app.
