from flask import Flask, request, jsonify
from flask_cors import CORS
import predict
import os

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "message": "Crop Disease Identifier AI Service is running.",
        "endpoints": ["/health", "/analyze (POST)"]
    })

@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    
    result = predict.predict_disease(file)
    if "error" in result:
        return jsonify(result), 503 # Service Unavailable if model is missing
        
    return jsonify(result)

@app.route("/health", methods=["GET"])
def health():
    model_instance, error = predict.get_model()
    return jsonify({
        "status": "serving" if error is None else "degraded",
        "model_loaded": model_instance is not None,
        "error": error
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
