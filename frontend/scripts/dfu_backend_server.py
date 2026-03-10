"""
DFU Detection Backend Server
============================

This Flask server receives Base64-encoded images from the mobile app
and runs inference using a TFLite model.

SETUP:
1. Install dependencies:
   pip install flask flask-cors tensorflow pillow numpy

2. Place your dfu_model.tflite in the same directory as this file

3. Run the server:
   python dfu_backend_server.py

4. Update the BACKEND_BASE_URL in the mobile app's ulcerClassifier.ts
   to point to your laptop's IP address (e.g., http://192.168.1.100:5000)

Find your IP:
  - Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
  - Windows: ipconfig | findstr IPv4
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import base64
import io
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for mobile app requests

# Model configuration
MODEL_PATH = 'dfu_model.tflite'  # Place your TFLite model here
MODEL_INPUT_SIZE = 224
CLASS_NAMES = ['Healthy', 'Ulcer']

# Global interpreter
interpreter = None

def load_model():
    """Load TFLite model"""
    global interpreter
    
    if not os.path.exists(MODEL_PATH):
        logger.warning(f"Model file not found: {MODEL_PATH}")
        logger.warning("Running in MOCK MODE - will return random predictions")
        return False
    
    try:
        interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
        
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        logger.info(f"✅ Model loaded successfully")
        logger.info(f"   Input shape: {input_details[0]['shape']}")
        logger.info(f"   Output shape: {output_details[0]['shape']}")
        
        return True
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        return False

def preprocess_image(base64_string: str) -> np.ndarray:
    """Convert Base64 string to preprocessed numpy array"""
    # Decode base64 to bytes
    image_bytes = base64.b64decode(base64_string)
    
    # Open as PIL Image
    image = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize to model input size
    image = image.resize((MODEL_INPUT_SIZE, MODEL_INPUT_SIZE))
    
    # Convert to numpy array and normalize to [0, 1]
    img_array = np.array(image, dtype=np.float32) / 255.0
    
    # Add batch dimension [1, 224, 224, 3]
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def run_inference(image_array: np.ndarray) -> dict:
    """Run inference using TFLite model"""
    global interpreter
    
    if interpreter is None:
        # Mock mode - return random prediction
        import random
        is_ulcer = random.random() > 0.7  # 30% chance of ulcer
        confidence = random.uniform(0.7, 0.95)
        
        return {
            'ulcer_type': 'Ulcer' if is_ulcer else 'Healthy',
            'confidence': confidence,
            'mock': True
        }
    
    try:
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], image_array)
        
        # Run inference
        interpreter.invoke()
        
        # Get output
        output_data = interpreter.get_tensor(output_details[0]['index'])
        
        # Process output (assuming binary classification with sigmoid output)
        probability = float(output_data[0][0]) if output_data.shape[-1] == 1 else float(output_data[0][1])
        
        # Threshold at 0.5
        prediction = 'Ulcer' if probability > 0.5 else 'Healthy'
        confidence = probability if prediction == 'Ulcer' else (1 - probability)
        
        return {
            'ulcer_type': prediction,
            'confidence': confidence,
            'probability': probability,
            'mock': False
        }
        
    except Exception as e:
        logger.error(f"Inference error: {e}")
        return {
            'ulcer_type': 'Healthy',
            'confidence': 0.5,
            'error': str(e),
            'mock': True
        }

@app.route('/predict', methods=['POST'])
def predict():
    """
    Prediction endpoint
    
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
    import time
    start_time = time.time()
    
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'error': 'Missing "image" field in request body',
                'expected': '{"image": "BASE64_STRING"}'
            }), 400
        
        base64_image = data['image']
        logger.info(f"📸 Received image: {len(base64_image)} chars")
        
        # Preprocess
        logger.info("🔄 Preprocessing image...")
        image_array = preprocess_image(base64_image)
        logger.info(f"   Shape: {image_array.shape}")
        
        # Run inference
        logger.info("🧠 Running inference...")
        result = run_inference(image_array)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        response = {
            'ulcer_type': result['ulcer_type'],
            'confidence': result['confidence'],
            'processing_time_ms': processing_time,
            'mock': result.get('mock', False)
        }
        
        logger.info(f"✅ Prediction: {result['ulcer_type']} ({result['confidence']*100:.1f}%)")
        logger.info(f"   Processing time: {processing_time}ms")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {e}")
        return jsonify({
            'error': str(e),
            'ulcer_type': 'Healthy',
            'confidence': 0.5
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': interpreter is not None,
        'model_path': MODEL_PATH
    })

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API info"""
    return jsonify({
        'service': 'DFU Detection Backend',
        'version': '1.0.0',
        'endpoints': {
            '/predict': 'POST - Send Base64 image for prediction',
            '/health': 'GET - Health check'
        },
        'model_loaded': interpreter is not None
    })

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("🚀 Starting DFU Detection Backend Server")
    logger.info("=" * 60)
    
    # Load model
    model_loaded = load_model()
    
    if not model_loaded:
        logger.warning("⚠️ Running in MOCK MODE (no model loaded)")
    
    # Get local IP for convenience
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        logger.info(f"\n📱 Update your mobile app with this URL:")
        logger.info(f"   BACKEND_BASE_URL = 'http://{local_ip}:5000'")
    except:
        logger.info("\n📱 Find your IP and update BACKEND_BASE_URL in the app")
    
    logger.info("\n" + "=" * 60)
    
    # Run server
    app.run(host='0.0.0.0', port=5000, debug=True)
