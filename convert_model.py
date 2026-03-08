#!/usr/bin/env python3
"""
TFLite to TensorFlow.js Converter
Converts dfu_model.tflite to Expo Go compatible format
"""

import sys
import os

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import tensorflowjs as tfjs
        import tensorflow as tf
        print("✅ TensorFlow and TensorFlow.js installed")
        print(f"   TensorFlow version: {tf.__version__}")
        return True
    except ImportError as e:
        print("❌ Missing dependencies!")
        print("\nInstall required packages:")
        print("  pip install tensorflow tensorflowjs")
        return False

def convert_tflite_to_tfjs(tflite_path, output_dir):
    """
    Convert TFLite model to TensorFlow.js format
    
    Args:
        tflite_path: Path to .tflite model file
        output_dir: Directory to save converted model
    """
    import tensorflow as tf
    import tensorflowjs as tfjs
    
    print(f"\n🔄 Converting: {tflite_path}")
    print(f"📁 Output dir: {output_dir}")
    
    # Method 1: Try direct TFLite to TF.js conversion
    try:
        print("\n📦 Method 1: Direct TFLite conversion...")
        
        # Load TFLite model
        interpreter = tf.lite.Interpreter(model_path=tflite_path)
        interpreter.allocate_tensors()
        
        # Get input/output details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print(f"   Input shape: {input_details[0]['shape']}")
        print(f"   Output shape: {output_details[0]['shape']}")
        
        # For TFLite to TF.js, we need SavedModel format
        # This requires converting TFLite → TF SavedModel → TF.js
        print("\n⚠️  TFLite requires intermediate SavedModel conversion")
        print("   Please use Method 2 below if you have the original SavedModel")
        
    except Exception as e:
        print(f"❌ Method 1 failed: {e}")
    
    # Method 2: If you have the original SavedModel
    print("\n📦 Method 2: Convert from SavedModel...")
    print("   If you have the original TensorFlow SavedModel:")
    print("   Run: tensorflowjs_converter \\")
    print("        --input_format=tf_saved_model \\")
    print("        --output_format=tfjs_graph_model \\")
    print(f"        /path/to/saved_model \\")
    print(f"        {output_dir}")
    
    # Method 3: Using command line
    print("\n📦 Method 3: Using tfjs command line...")
    print("   Run: tensorflowjs_converter \\")
    print("        --input_format=tf_saved_model \\")
    print(f"        {tflite_path} \\")
    print(f"        {output_dir}")

def verify_conversion(output_dir):
    """Verify that conversion was successful"""
    model_json = os.path.join(output_dir, 'model.json')
    
    if os.path.exists(model_json):
        print(f"\n✅ Conversion successful!")
        print(f"   Found: {model_json}")
        
        # List all files
        files = os.listdir(output_dir)
        print(f"\n📁 Generated files:")
        for f in files:
            size = os.path.getsize(os.path.join(output_dir, f))
            print(f"   - {f} ({size / 1024:.1f} KB)")
        
        return True
    else:
        print(f"\n⚠️  model.json not found in {output_dir}")
        return False

def main():
    """Main conversion function"""
    print("=" * 60)
    print("TFLite → TensorFlow.js Converter")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Paths
    tflite_path = "../assets/models/dfu_model.tflite"
    output_dir = "../assets/models/"
    
    # Check if TFLite file exists
    if not os.path.exists(tflite_path):
        print(f"\n❌ TFLite model not found: {tflite_path}")
        print("\nUsage:")
        print(f"  python {sys.argv[0]} <path_to_tflite_model>")
        sys.exit(1)
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Convert
    convert_tflite_to_tfjs(tflite_path, output_dir)
    
    # Verify
    verify_conversion(output_dir)
    
    print("\n" + "=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print("1. Copy generated files to: frontend/assets/models/")
    print("2. Restart Expo: npx expo start -c")
    print("3. Test in Expo Go app")
    print("=" * 60)

if __name__ == "__main__":
    main()
