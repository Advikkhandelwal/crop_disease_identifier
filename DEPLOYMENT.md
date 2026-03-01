# Deployment Guide: Optimized AI Model

Good news! The AI model has been optimized from **128MB** down to **21.31MB** using TFLite compression.

It now fits under the **25MB** limit, so you can upload it directly to GitHub or Render without complex storage solutions.

## ✅ Project Structure
Ensure your root directory looks like this:
- `main.py`
- `predict.py`
- `model.tflite` (The optimized model)
- `requirements.txt`
- `runtime.txt`
- `package.json` (Frontend)

## 🚀 Render Settings
1.  **Start Command**:
    ```bash
    gunicorn main:app
    ```
2.  **Build Command**:
    ```bash
    pip install -r requirements.txt
    ```

## 📦 Requirements
Ensure your `requirements.txt` includes `tensorflow-cpu` (or `tensorflow`). Even though we use `.tflite`, the `tensorflow` package provides the easiest way to run the interpreter in a cloud environment.

Visit `https://your-app.onrender.com/health` to verify that `model_loaded: true`.
