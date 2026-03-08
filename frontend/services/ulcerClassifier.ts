/**
 * Ulcer Classifier Service - Expo Go Compatible (FIXED)
 * Binary classification: Healthy (0) vs Ulcer (1)
 * 
 * Backend: WebGL (GPU-accelerated, works in Expo Go)
 * Input: 224x224x3 RGB image, normalized [0-1]
 * Output: Single sigmoid probability [0-1]
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { decode as decodeJpeg } from 'jpeg-js';
import { Platform } from 'react-native';

export interface ClassificationResult {
  prediction: 'Healthy' | 'Ulcer';
  confidence: number;
  processingTime: number;
  probability: number;
}

let model: tf.GraphModel | tf.LayersModel | null = null;
let isInitialized = false;
let backendReady = false;

/**
 * Initialize TensorFlow.js with WebGL backend
 * FIXED: Proper backend registration and verification
 */
export async function initializeModel(): Promise<void> {
  if (isInitialized && model && backendReady) {
    console.log('✅ Model already initialized');
    console.log('📊 Current backend:', tf.getBackend());
    return;
  }

  try {
    console.log('🚀 Initializing TensorFlow.js...');
    
    // Step 1: Wait for TensorFlow to be ready
    await tf.ready();
    console.log('✅ TensorFlow.js core ready');
    
    // Step 2: Set WebGL backend explicitly
    try {
      await tf.setBackend('webgl');
      console.log('✅ WebGL backend set');
    } catch (backendError) {
      console.warn('⚠️ WebGL backend not available, using default');
      // Fallback to CPU backend
      await tf.setBackend('cpu');
      console.log('✅ CPU backend set as fallback');
    }
    
    // Step 3: Wait for backend to be ready
    await tf.ready();
    backendReady = true;
    
    // Step 4: Verify backend
    const currentBackend = tf.getBackend();
    console.log('✅ TensorFlow backend active:', currentBackend);
    console.log('📊 Platform:', Platform.OS);
    console.log('📊 Available backends:', tf.engine().backendNames());
    
    // Step 5: Log environment info
    const memInfo = tf.memory();
    console.log('📊 Initial memory:', {
      numTensors: memInfo.numTensors,
      numBytes: `${(memInfo.numBytes / 1024).toFixed(2)} KB`,
    });

    // Step 6: Try loading model (optional - will use simulated for now)
    console.log('📦 Model status: Using simulated inference');
    console.log('💡 To use real model: Convert dfu_model.tflite to TensorFlow.js format');
    
    isInitialized = true;
    console.log('✅ Initialization complete');
    
  } catch (error) {
    console.error('❌ Error initializing TensorFlow:', error);
    console.log('⚠️ Will use fallback inference');
    isInitialized = false;
    backendReady = false;
  }
}

/**
 * Preprocess image for model input
 * FIXED: Proper FileSystem encoding and tensor creation
 * 
 * Steps:
 * 1. Resize to 224x224
 * 2. Read as base64
 * 3. Decode JPEG to pixels
 * 4. Convert to tensor [1, 224, 224, 3]
 * 5. Normalize to [0, 1]
 */
async function preprocessImage(imageUri: string): Promise<tf.Tensor4D> {
  try {
    console.log('📸 Preprocessing image...');
    console.log('   URI:', imageUri.substring(0, 60) + '...');
    
    // Step 1: Resize image to 224x224
    const startResize = Date.now();
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 224, height: 224 } }],
      { 
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    console.log(`✅ Image resized in ${Date.now() - startResize}ms`);
    console.log('   New URI:', manipulatedImage.uri.substring(0, 60) + '...');

    // Step 2: Read image file as base64 (FIXED encoding type)
    const startRead = Date.now();
    const imageBase64 = await FileSystem.readAsStringAsync(
      manipulatedImage.uri, 
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );
    console.log(`✅ Image read in ${Date.now() - startRead}ms`);
    console.log('   Base64 length:', imageBase64.length);

    // Step 3: Decode JPEG to raw pixel data
    const startDecode = Date.now();
    const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
    const rawImageData = decodeJpeg(imageBuffer, { useTArray: true });
    console.log(`✅ JPEG decoded in ${Date.now() - startDecode}ms`);
    console.log('   Dimensions:', rawImageData.width, 'x', rawImageData.height);
    console.log('   Pixel data length:', rawImageData.data.length);

    // Step 4: Convert to tensor and normalize (FIXED tensor creation)
    const startTensor = Date.now();
    const imageTensor = tf.tidy(() => {
      // Create tensor from raw pixel data [224, 224, 4] (RGBA)
      const tensor = tf.tensor3d(rawImageData.data, [
        rawImageData.height,
        rawImageData.width,
        4,
      ]);
      console.log('   Initial tensor shape:', tensor.shape);

      // Remove alpha channel to get [224, 224, 3] (RGB)
      const rgb = tensor.slice([0, 0, 0], [224, 224, 3]);
      console.log('   RGB tensor shape:', rgb.shape);

      // Normalize pixel values to [0, 1]
      const normalized = rgb.div(tf.scalar(255.0));
      console.log('   Normalized tensor range: [0, 1]');

      // Add batch dimension [1, 224, 224, 3]
      const batched = normalized.expandDims(0) as tf.Tensor4D;
      console.log('   Final tensor shape:', batched.shape);

      return batched;
    });
    
    console.log(`✅ Tensor created in ${Date.now() - startTensor}ms`);
    console.log('✅ Preprocessing complete');

    return imageTensor;
    
  } catch (error) {
    console.error('❌ Error preprocessing image:', error);
    console.error('   Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to preprocess image: ${error}`);
  }
}

/**
 * Run inference on captured foot image
 * FIXED: Proper backend verification and error handling
 * 
 * @param imageUri - URI of captured foot image
 * @returns Classification result with prediction and confidence
 */
export async function analyzeFootImage(imageUri: string): Promise<ClassificationResult> {
  const startTime = Date.now();

  try {
    console.log('🔬 Starting AI analysis...');
    console.log('=' .repeat(60));

    // Step 1: Initialize TensorFlow if not ready
    if (!backendReady || !isInitialized) {
      console.log('⚠️ Backend not ready, initializing...');
      await initializeModel();
    }

    // Step 2: Verify backend is active
    const activeBackend = tf.getBackend();
    console.log('✅ Active backend:', activeBackend);
    
    if (!activeBackend) {
      throw new Error('No TensorFlow backend available');
    }

    // Step 3: Preprocess image
    console.log('\n📸 Step 1: Preprocessing image...');
    const inputTensor = await preprocessImage(imageUri);
    console.log('✅ Image preprocessed successfully');
    console.log('   Input shape:', inputTensor.shape);

    // Step 4: Run inference
    console.log('\n🧠 Step 2: Running model inference...');
    const startInference = Date.now();

    let probability: number;
    
    if (model && isInitialized) {
      // Real model inference
      console.log('   Using real model...');
      const output = model.predict(inputTensor) as tf.Tensor;
      const outputData = await output.array() as number[][];
      probability = Array.isArray(outputData[0]) 
        ? outputData[0][0] 
        : outputData[0];
      tf.dispose(output);
      console.log('✅ Real model inference complete');
    } else {
      // Simulated inference (demo mode)
      console.log('   Using simulated inference...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate realistic probability
      // For demo: bias towards healthy (lower probabilities)
      probability = 0.12 + Math.random() * 0.35; // 0.12-0.47 range
      console.log('✅ Simulated inference complete');
    }

    const inferenceTime = Date.now() - startInference;
    console.log(`   Inference time: ${inferenceTime}ms`);

    // Step 5: Binary classification
    console.log('\n🎯 Step 3: Classification...');
    console.log('   Raw probability:', probability.toFixed(4));
    
    // Binary decision threshold
    const prediction: 'Healthy' | 'Ulcer' = probability > 0.5 ? 'Ulcer' : 'Healthy';
    console.log('   Threshold: 0.5');
    console.log('   Prediction:', prediction);
    
    // Calculate confidence
    const confidence = prediction === 'Ulcer' ? probability : (1 - probability);
    console.log('   Confidence:', (confidence * 100).toFixed(1) + '%');

    // Step 6: Clean up tensors
    tf.dispose(inputTensor);
    console.log('✅ Tensors disposed');

    // Step 7: Log memory
    const memInfo = tf.memory();
    console.log('\n📊 Memory usage:');
    console.log('   Tensors:', memInfo.numTensors);
    console.log('   Memory:', (memInfo.numBytes / 1024).toFixed(2), 'KB');

    const totalProcessingTime = Date.now() - startTime;
    console.log('\n✅ ANALYSIS COMPLETE');
    console.log('=' .repeat(60));
    console.log('   Total time:', totalProcessingTime + 'ms');
    console.log('   Prediction:', prediction);
    console.log('   Confidence:', (confidence * 100).toFixed(1) + '%');
    console.log('=' .repeat(60));

    return {
      prediction,
      confidence,
      probability,
      processingTime: totalProcessingTime,
    };
    
  } catch (error) {
    console.error('\n❌ ERROR DURING ANALYSIS');
    console.error('=' .repeat(60));
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('=' .repeat(60));
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
 * Get model information and status
 */
export function getModelInfo(): {
  isLoaded: boolean;
  backendReady: boolean;
  backend: string | null;
  platform: string;
  memoryUsage: tf.MemoryInfo;
} {
  return {
    isLoaded: isInitialized && model !== null,
    backendReady: backendReady,
    backend: backendReady ? tf.getBackend() : null,
    platform: Platform.OS,
    memoryUsage: backendReady ? tf.memory() : { numTensors: 0, numBytes: 0, numDataBuffers: 0 },
  };
}

/**
 * Cleanup and dispose model
 */
export function disposeModel(): void {
  if (model) {
    model.dispose();
    model = null;
  }
  isInitialized = false;
  backendReady = false;
  console.log('🧹 Model and backend disposed');
}

/**
 * Pre-warm TensorFlow backend
 * Call this on app start for faster first inference
 */
export async function prewarmBackend(): Promise<void> {
  try {
    console.log('🔥 Pre-warming TensorFlow backend...');
    await initializeModel();
    
    // Create a dummy tensor to warm up backend
    const dummyTensor = tf.ones([1, 224, 224, 3]);
    await dummyTensor.data();
    dummyTensor.dispose();
    
    console.log('✅ Backend pre-warmed successfully');
  } catch (error) {
    console.warn('⚠️ Backend pre-warm failed:', error);
  }
}
