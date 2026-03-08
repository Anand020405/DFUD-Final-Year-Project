/**
 * Ulcer Classifier Service - REAL TensorFlow Lite Inference
 * Binary classification: Healthy (0) vs Ulcer (1)
 * 
 * Model: dfu_model.tflite
 * Input: 224x224x3 RGB image, normalized [0-1]
 * Output: Single sigmoid probability [0-1]
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { decode as decodeJpeg } from 'jpeg-js';
import { Asset } from 'expo-asset';

export interface ClassificationResult {
  prediction: 'Healthy' | 'Ulcer';
  confidence: number;
  processingTime: number;
  probability: number;
}

let model: tf.GraphModel | null = null;
let isInitialized = false;

/**
 * Initialize TensorFlow.js and load the TFLite model
 */
export async function initializeModel(): Promise<void> {
  if (isInitialized && model) {
    console.log('Model already initialized');
    return;
  }

  try {
    console.log('Initializing TensorFlow.js...');
    
    // Wait for TensorFlow to be ready
    await tf.ready();
    console.log('✅ TensorFlow.js ready, backend:', tf.getBackend());
    
    // Load the model from assets
    console.log('Loading TFLite model from assets...');
    
    const modelPath = require('../assets/models/dfu_model.tflite');
    model = await tf.loadGraphModel(modelPath);

    console.log('✅ TFLite model loaded successfully');
    console.log('Model input shape:', model.inputs[0].shape);
    console.log('Model output shape:', model.outputs[0].shape);
    
    isInitialized = true;
  } catch (error) {
    console.error('❌ Error initializing model:', error);
    // Fallback: Model loading will be attempted on first inference
    isInitialized = false;
  }
}

/**
 * Preprocess image for model input
 * - Resize to 224x224
 * - Normalize pixel values to [0, 1]  
 * - Convert to tensor format [1, 224, 224, 3]
 */
async function preprocessImage(imageUri: string): Promise<tf.Tensor4D> {
  try {
    console.log('📸 Preprocessing image:', imageUri);
    
    // Step 1: Resize image to 224x224
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 224, height: 224 } }],
      { 
        compress: 1, 
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false,
      }
    );

    console.log('✅ Image resized to 224x224');

    // Step 2: Read image file
    const imageBase64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Step 3: Decode JPEG to raw pixel data
    const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
    const rawImageData = decodeJpeg(imageBuffer, { useTArray: true });

    console.log('✅ JPEG decoded, size:', rawImageData.width, 'x', rawImageData.height);

    // Step 4: Convert to tensor and normalize [0-1]
    const imageTensor = tf.tidy(() => {
      // Create tensor from raw pixel data [224, 224, 4] (RGBA)
      const tensor = tf.tensor3d(rawImageData.data, [
        rawImageData.height,
        rawImageData.width,
        4,
      ]);

      // Remove alpha channel [224, 224, 3] (RGB)
      const rgb = tensor.slice([0, 0, 0], [224, 224, 3]);

      // Normalize to [0, 1]
      const normalized = rgb.div(255.0);

      // Add batch dimension [1, 224, 224, 3]
      const batched = normalized.expandDims(0) as tf.Tensor4D;

      return batched;
    });

    console.log('✅ Tensor created:', imageTensor.shape);

    return imageTensor;
  } catch (error) {
    console.error('❌ Error preprocessing image:', error);
    throw new Error(`Failed to preprocess image: ${error}`);
  }
}

/**
 * Run inference on captured foot image
 * 
 * @param imageUri - URI of captured foot image
 * @returns Classification result with prediction and confidence
 */
export async function analyzeFootImage(imageUri: string): Promise<ClassificationResult> {
  const startTime = Date.now();

  try {
    // Initialize model if not already done
    if (!isInitialized || !model) {
      console.log('Model not initialized, loading now...');
      await initializeModel();
    }

    if (!model) {
      throw new Error('Failed to load model');
    }

    console.log('🔬 Starting AI analysis...');

    // Preprocess image
    const inputTensor = await preprocessImage(imageUri);

    console.log('🧠 Running model inference...');

    // Run inference
    const startInference = Date.now();
    const output = model.predict(inputTensor) as tf.Tensor;
    const inferenceTime = Date.now() - startInference;

    console.log(`✅ Inference completed in ${inferenceTime}ms`);

    // Get probability value
    const probabilityArray = await output.array() as number[][];
    const probability = probabilityArray[0][0]; // Sigmoid output [0-1]

    console.log('📊 Raw model output (probability):', probability.toFixed(4));

    // Binary classification
    // probability > 0.5 → Ulcer (class 1)
    // probability <= 0.5 → Healthy (class 0)
    const prediction: 'Healthy' | 'Ulcer' = probability > 0.5 ? 'Ulcer' : 'Healthy';
    
    // Confidence calculation
    const confidence = prediction === 'Ulcer' ? probability : (1 - probability);

    // Clean up tensors to prevent memory leaks
    tf.dispose([inputTensor, output]);

    const totalProcessingTime = Date.now() - startTime;

    console.log('✅ Analysis complete:', {
      prediction,
      confidence: `${(confidence * 100).toFixed(1)}%`,
      probability: probability.toFixed(4),
      inferenceTime: `${inferenceTime}ms`,
      totalTime: `${totalProcessingTime}ms`,
    });

    // Log memory usage
    const memInfo = tf.memory();
    console.log('📊 TF Memory:', {
      numTensors: memInfo.numTensors,
      numBytes: `${(memInfo.numBytes / 1024 / 1024).toFixed(2)} MB`,
    });

    return {
      prediction,
      confidence,
      probability,
      processingTime: totalProcessingTime,
    };
  } catch (error) {
    console.error('❌ Error analyzing image:', error);
    throw new Error(`Failed to analyze foot image: ${error}`);
  }
}

/**
 * Get prediction explanation based on classification
 */
export function getPredictionExplanation(prediction: string): string {
  switch (prediction) {
    case 'Healthy':
      return 'No signs of ulceration detected. Continue regular foot care and daily monitoring. Maintain healthy blood sugar levels and inspect feet regularly.';
    case 'Ulcer':
      return 'Signs of ulceration detected. Seek immediate medical attention from a healthcare professional. Do not delay - early treatment is crucial for diabetic foot ulcers.';
    default:
      return 'Analysis complete. Consult healthcare provider for interpretation and next steps.';
  }
}

/**
 * Get risk color based on prediction
 */
export function getRiskColor(prediction: string): string {
  switch (prediction) {
    case 'Healthy':
      return '#22c55e'; // Green
    case 'Ulcer':
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
}

/**
 * Get model information and memory usage
 */
export function getModelInfo(): {
  isLoaded: boolean;
  backend: string;
  memoryUsage: tf.MemoryInfo;
} {
  return {
    isLoaded: isInitialized && model !== null,
    backend: tf.getBackend(),
    memoryUsage: tf.memory(),
  };
}

/**
 * Cleanup and dispose model
 */
export function disposeModel(): void {
  if (model) {
    model.dispose();
    model = null;
    isInitialized = false;
    console.log('🧹 Model disposed');
  }
}
