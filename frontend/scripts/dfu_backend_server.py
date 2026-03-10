"""
DFU Detection Backend Server
============================

Flask server that receives Base64-encoded images from the React Native app
and runs inference using a TFLite model.

Author: DFU Detection App
Version: 1.0.0
"""

import os
import io
import time
import base64
import logging
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==============================================================================
# CONFIGURATION
# ==============================================================================

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent.absolute()

# Model file path - place dfu_model.tflite in the same folder as this script
MODEL_PATH = SCRIPT_DIR / 'dfu_model.tflite'

# Model input configuration (adjust if your model uses different dimensions)
MODEL_INPUT_SIZE = 224
MODEL_INPUT_CHANNELS = 3

# Class labels (index 0 = Healthy, index 1 = Ulcer)
# Adjust based on how your model was trained
CLASS_LABELS = ['Healthy', 'Ulcer']

# ==============================================================================
# FLASK APP SETUP
# ==============================================================================

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native requests

# Global TFLite interpreter
interpreter = None
input_details = None
output_details = None

# ==============================================================================
# MODEL LOADING
# ==============================================================================

def load_model():
    """Load the TFLite model and allocate tensors."""
    global interpreter, input_details, output_details
    
    logger.info(f"Looking for model at: {MODEL_PATH}")
    
    if not MODEL_PATH.exists():
        logger.error(f"MODEL FILE NOT FOUND: {MODEL_PATH}")
        logger.error(f"Please place 'dfu_model.tflite' in: {SCRIPT_DIR}")
        return False
    
    try:
        # Import TensorFlow Lite
        import tensorflow as tf
        
        # Load the TFLite model
        interpreter = tf.lite.Interpreter(model_path=str(MODEL_PATH))
        interpreter.allocate_tensors()
        
        # Get input and output tensor details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        # Log model information
        logger.info("=" * 60)
        logger.info("MODEL LOADED SUCCESSFULLY")
        logger.info("=" * 60)
        logger.info(f"Input shape:  {input_details[0]['shape']}")
        logger.info(f"Input dtype:  {input_details[0]['dtype']}")
        logger.info(f"Output shape: {output_details[0]['shape']}")
        logger.info(f"Output dtype: {output_details[0]['dtype']}")
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return False

# ==============================================================================
# IMAGE PREPROCESSING
# ==============================================================================

def preprocess_image(base64_string: str) -> np.ndarray:
    """
    Convert Base64 string to preprocessed numpy array for model input.
    
    Args:
        base64_string: Base64-encoded image string from the mobile app
        
    Returns:
        Preprocessed image as numpy array with shape [1, 224, 224, 3]
    """
    try:
        # Decode Base64 to bytes
        image_bytes = base64.b64decode(base64_string)
        
        # Open as PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size
        image = image.resize((MODEL_INPUT_SIZE, MODEL_INPUT_SIZE), Image.BILINEAR)
        
        # Convert to numpy array
        img_array = np.array(image, dtype=np.float32)
        
        # Normalize to [0, 1] range
        img_array = img_array / 255.0
        
        # Add batch dimension: [224, 224, 3] -> [1, 224, 224, 3]
        img_array = np.expand_dims(img_array, axis=0)
        
        logger.info(f"Preprocessed image shape: {img_array.shape}")
        logger.info(f"Value range: [{img_array.min():.3f}, {img_array.max():.3f}]")
        
        return img_array
        
    except Exception as e:
        logger.error(f"Image preprocessing failed: {e}")
        raise

# ==============================================================================
# MODEL INFERENCE
# ==============================================================================

def run_inference(image_array: np.ndarray) -> dict:
    """
    Run inference using the TFLite model.
    
    Args:
        image_array: Preprocessed image with shape [1, 224, 224, 3]
        
    Returns:
        Dictionary with prediction results
    """
    global interpreter, input_details, output_details
    
    if interpreter is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")
    
    try:
        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], image_array)
        
        # Run inference
        interpreter.invoke()
        
        # Get output tensor
        output_data = interpreter.get_tensor(output_details[0]['index'])
        
        logger.info(f"Raw output: {output_data}")
        logger.info(f"Output shape: {output_data.shape}")
        
        # Process output based on model architecture
        # Handle different output formats:
        
        if output_data.shape[-1] == 1:
            # Binary classification with sigmoid output (single value 0-1)
            # Value > 0.5 = Ulcer, Value <= 0.5 = Healthy
            probability = float(output_data[0][0])
            predicted_class = 1 if probability > 0.5 else 0
            confidence = probability if predicted_class == 1 else (1 - probability)
            
        elif output_data.shape[-1] == 2:
            # Two-class softmax output [healthy_prob, ulcer_prob]
            probabilities = output_data[0]
            predicted_class = int(np.argmax(probabilities))
            confidence = float(probabilities[predicted_class])
            probability = float(probabilities[1])  # Ulcer probability
            
        else:
            # Unknown format - take argmax
            predicted_class = int(np.argmax(output_data[0]))
            confidence = float(np.max(output_data[0]))
            probability = confidence
        
        # Get class label
        ulcer_type = CLASS_LABELS[predicted_class]
        
        logger.info(f"Prediction: {ulcer_type} (class {predicted_class})")
        logger.info(f"Confidence: {confidence:.4f}")
        
        return {
            'ulcer_type': ulcer_type,
            'confidence': confidence,
            'probability': probability,
            'raw_output': output_data.tolist()
        }
        
    except Exception as e:
        logger.error(f"Inference failed: {e}")
        raise

# ==============================================================================
# API ENDPOINTS
# ==============================================================================

@app.route('/', methods=['GET'])
def index():
    """Root endpoint - API information."""
    return jsonify({
        'service': 'DFU Detection Backend',
        'version': '1.0.0',
        'model_loaded': interpreter is not None,
        'model_path': str(MODEL_PATH),
        'endpoints': {
            'POST /predict': 'Send Base64 image for DFU prediction',
            'GET /health': 'Health check endpoint'
        }
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': interpreter is not None,
        'model_path': str(MODEL_PATH),
        'model_exists': MODEL_PATH.exists()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Prediction endpoint.
    
    Expected request body:
    {
        "image": "BASE64_ENCODED_IMAGE_STRING"
    }
    
    Response:
    {
        "ulcer_type": "Healthy" | "Ulcer",
        "confidence": 0.85,
        "processing_time_ms": 150
    }
    """
    start_time = time.time()
    
    try:
        # Check if model is loaded
        if interpreter is None:
            return jsonify({
                'error': 'Model not loaded',
                'message': f'Please place dfu_model.tflite in: {SCRIPT_DIR}'
            }), 500
        
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No JSON data provided',
                'expected': '{"image": "BASE64_STRING"}'
            }), 400
        
        if 'image' not in data:
            return jsonify({
                'error': 'Missing "image" field in request body',
                'expected': '{"image": "BASE64_STRING"}'
            }), 400
        
        base64_image = data['image']
        logger.info(f"Received image: {len(base64_image)} characters")
        
        # Preprocess image
        logger.info("Preprocessing image...")
        image_array = preprocess_image(base64_image)
        
        # Run inference
        logger.info("Running inference...")
        result = run_inference(image_array)
        
        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # Build response
        response = {
            'ulcer_type': result['ulcer_type'],
            'confidence': round(result['confidence'], 4),
            'processing_time_ms': processing_time_ms
        }
        
        logger.info("=" * 60)
        logger.info(f"PREDICTION: {result['ulcer_type']}")
        logger.info(f"CONFIDENCE: {result['confidence']*100:.1f}%")
        logger.info(f"TIME: {processing_time_ms}ms")
        logger.info("=" * 60)
        
        return jsonify(response)
        
    except Exception as e:
        processing_time_ms = int((time.time() - start_time) * 1000)
        logger.error(f"Prediction error: {e}")
        
        return jsonify({
            'error': str(e),
            'ulcer_type': 'Healthy',
            'confidence': 0.5,
            'processing_time_ms': processing_time_ms
        }), 500

# ==============================================================================
# MAIN ENTRY POINT
# ==============================================================================

if __name__ == '__main__':
    print("="  * 60)
    print("  DFU DETECTION BACKEND SERVER")
    print("=" * 60)
    print()
    
    # Load the model
    model_loaded = load_model()
    
    if not model_loaded:
        print()
        print("WARNING: Model not loaded!")
        print(f"Please place 'dfu_model.tflite' in:")
        print(f"  {SCRIPT_DIR}")
        print()
        print("The server will start but predictions will fail.")
        print()
    
    # Get local IP address for convenience
    print()
    print("NETWORK INFORMATION:")
    print("-" * 40)
    
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        
        print(f"Local IP Address: {local_ip}")
        print(f"Server URL: http://{local_ip}:5000")
        print()
        print("UPDATE YOUR MOBILE APP:")
        print(f"  BACKEND_BASE_URL = 'http://{local_ip}:5000'")
    except Exception:
        print("Could not detect local IP.")
        print("Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)")
        print("to find your IP address.")
    
    print("-" * 40)
    print()
    print("Starting server on http://0.0.0.0:5000")
    print("Press Ctrl+C to stop.")
    print()
    
    # Run the Flask server
    app.run(host='0.0.0.0', port=5000, debug=False)
