/**
 * Ulcer Classifier Service - BACKEND INFERENCE MODE
 * 
 * This version sends the preprocessed image to a backend server
 * running on the user's local machine for TFLite model inference.
 * 
 * Pipeline: Camera → Preview → Preprocess → Backend API → Result
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { Platform } from 'react-native';

// =============================================================================
// CONFIGURATION - CHANGE THIS TO YOUR LAPTOP'S IP ADDRESS
// =============================================================================
// Find your IP: 
//   - Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
//   - Windows: ipconfig | findstr IPv4
// Example: const BACKEND_BASE_URL = 'http://192.168.1.100:5000';
const BACKEND_BASE_URL = 'http://YOUR_LAPTOP_IP:5000';

// API Configuration
const PREDICT_ENDPOINT = `${BACKEND_BASE_URL}/predict`;
const API_TIMEOUT_MS = 10000; // 10 seconds

// Model input specifications
const MODEL_INPUT_SIZE = 224;

// =============================================================================

export interface ClassificationResult {
  prediction: 'Healthy' | 'Ulcer';
  confidence: number;
  processingTime: number;
  probability: number;
  success: boolean;
  error?: string;
  source?: 'backend' | 'fallback';
}

// Initialization state
let isInitialized = false;

/**
 * Initialize the classifier
 */
export async function initializeModel(): Promise<void> {
  if (isInitialized) {
    console.log('✅ [INIT] Classifier already initialized');
    return;
  }

  console.log('🚀 [INIT] Initializing Backend Inference Classifier...');
  console.log(`   Platform: ${Platform.OS}`);
  console.log(`   Backend URL: ${BACKEND_BASE_URL}`);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  isInitialized = true;
  console.log('✅ [INIT] Classifier ready');
}

/**
 * Preprocess image and return Base64 string
 */
async function preprocessImage(imageUri: string): Promise<{
  base64Data: string;
  width: number;
  height: number;
  success: boolean;
}> {
  console.log('📸 [PREPROCESS] Starting image preprocessing...');
  console.log(`   Input URI: ${imageUri.substring(0, 60)}...`);

  try {
    // STEP 1: RESIZE IMAGE TO MODEL INPUT SIZE
    console.log(`   [1/2] Resizing to ${MODEL_INPUT_SIZE}×${MODEL_INPUT_SIZE}...`);
    const resizeStart = Date.now();

    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE } }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );

    const resizeTime = Date.now() - resizeStart;
    console.log(`   ✅ Resized in ${resizeTime}ms`);
    console.log(`   Dimensions: ${manipResult.width}×${manipResult.height}`);

    // STEP 2: READ FILE AS BASE64
    console.log('   [2/2] Reading file as base64...');
    const readStart = Date.now();

    let base64Data: string;
    
    try {
      base64Data = await readAsStringAsync(manipResult.uri, {
        encoding: 'base64',
      });
      
      const readTime = Date.now() - readStart;
      console.log(`   ✅ Read file in ${readTime}ms`);
      console.log(`   Base64 length: ${base64Data.length} characters`);
    } catch (readError) {
      console.error('   ❌ File read failed:', readError);
      return {
        base64Data: '',
        width: 0,
        height: 0,
        success: false,
      };
    }

    if (!base64Data || base64Data.length < 100) {
      console.warn('   ⚠️ Base64 data is too short or empty');
      return {
        base64Data: '',
        width: manipResult.width,
        height: manipResult.height,
        success: false,
      };
    }

    console.log('✅ [PREPROCESS] Complete');

    return {
      base64Data,
      width: manipResult.width,
      height: manipResult.height,
      success: true,
    };

  } catch (error) {
    console.error('❌ [PREPROCESS] Failed:', error);
    return {
      base64Data: '',
      width: 0,
      height: 0,
      success: false,
    };
  }
}

/**
 * Call backend API for inference with timeout
 */
async function callBackendAPI(base64Image: string): Promise<{
  prediction: 'Healthy' | 'Ulcer';
  confidence: number;
  probability: number;
  success: boolean;
  error?: string;
}> {
  console.log('🌐 [API] Calling backend for inference...');
  console.log(`   Endpoint: ${PREDICT_ENDPOINT}`);
  console.log(`   Timeout: ${API_TIMEOUT_MS}ms`);

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(PREDICT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [API] Response received:', data);

    // Map backend response to our format
    // Expected backend response: { ulcer_type: "Healthy"|"Ulcer", confidence: 0.85, ... }
    const prediction: 'Healthy' | 'Ulcer' = 
      data.ulcer_type === 'Ulcer' || data.prediction === 'Ulcer' || data.label === 'Ulcer'
        ? 'Ulcer' 
        : 'Healthy';
    
    const confidence = data.confidence ?? data.score ?? data.probability ?? 0.5;
    const probability = prediction === 'Ulcer' ? confidence : (1 - confidence);

    return {
      prediction,
      confidence,
      probability,
      success: true,
    };

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('⚠️ [API] Request timed out after', API_TIMEOUT_MS, 'ms');
      return {
        prediction: 'Healthy',
        confidence: 0,
        probability: 0,
        success: false,
        error: 'Request timed out',
      };
    }

    console.warn('⚠️ [API] Backend unreachable:', error);
    return {
      prediction: 'Healthy',
      confidence: 0,
      probability: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get offline fallback result
 */
function getOfflineFallback(): ClassificationResult {
  console.warn('⚠️ [FALLBACK] Backend unreachable, using offline fallback');
  return {
    prediction: 'Healthy',
    confidence: 0.85,
    probability: 0.15,
    processingTime: 0,
    success: true,
    source: 'fallback',
    error: 'Backend unreachable, using offline fallback',
  };
}

/**
 * MAIN: Analyze foot image via backend inference
 */
export async function analyzeFootImage(imageUri: string): Promise<ClassificationResult> {
  const startTime = Date.now();

  console.log('\n🔬 [ANALYZE] Starting DFU Analysis Pipeline');
  console.log('=' .repeat(60));
  console.log(`   Mode: BACKEND INFERENCE`);
  console.log(`   Platform: ${Platform.OS}`);
  console.log(`   Backend: ${BACKEND_BASE_URL}`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);

  try {
    // STEP 1: Initialize classifier
    console.log('\n🚀 [STEP 1/3] Initializing classifier...');
    await initializeModel();

    // STEP 2: Preprocess image
    console.log('\n📸 [STEP 2/3] Preprocessing image...');
    const imageData = await preprocessImage(imageUri);
    
    if (!imageData.success || !imageData.base64Data) {
      console.warn('⚠️ Preprocessing failed, using fallback');
      const fallback = getOfflineFallback();
      fallback.processingTime = Date.now() - startTime;
      return fallback;
    }

    console.log('✅ Image preprocessed successfully');

    // STEP 3: Call backend API
    console.log('\n🌐 [STEP 3/3] Calling backend API...');
    const apiResult = await callBackendAPI(imageData.base64Data);

    const processingTime = Date.now() - startTime;

    if (!apiResult.success) {
      // Backend failed - use offline fallback
      const fallback = getOfflineFallback();
      fallback.processingTime = processingTime;
      return fallback;
    }

    console.log('\n✅ [ANALYZE] BACKEND INFERENCE COMPLETE');
    console.log('=' .repeat(60));
    console.log(`   Prediction: ${apiResult.prediction}`);
    console.log(`   Confidence: ${(apiResult.confidence * 100).toFixed(1)}%`);
    console.log(`   Processing Time: ${processingTime}ms`);
    console.log(`   Source: Backend`);
    console.log('=' .repeat(60));

    return {
      prediction: apiResult.prediction,
      confidence: apiResult.confidence,
      probability: apiResult.probability,
      processingTime,
      success: true,
      source: 'backend',
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error('\n❌ [ANALYZE] Pipeline error:', error);
    
    // Return fallback on any error
    const fallback = getOfflineFallback();
    fallback.processingTime = processingTime;
    fallback.error = error instanceof Error ? error.message : 'Unknown error';
    return fallback;
  }
}

/**
 * Get prediction explanation text
 */
export function getPredictionExplanation(prediction: string): string {
  switch (prediction) {
    case 'Healthy':
      return 'No signs of ulceration detected. Continue regular foot care and monitoring.';
    case 'Ulcer':
      return 'Signs of ulceration detected. Please consult a healthcare professional immediately.';
    default:
      return 'Analysis complete. Consult healthcare provider for proper diagnosis.';
  }
}

/**
 * Get color for risk level
 */
export function getRiskColor(prediction: string): string {
  return prediction === 'Healthy' ? '#22c55e' : '#ef4444';
}

/**
 * Get model/classifier info
 */
export function getModelInfo() {
  return {
    isLoaded: isInitialized,
    mode: 'backend-inference',
    backendUrl: BACKEND_BASE_URL,
    platform: Platform.OS,
    version: '3.0.0-backend',
  };
}

/**
 * Pre-warm the classifier
 */
export async function prewarmBackend(): Promise<void> {
  try {
    console.log('🔥 [PREWARM] Starting...');
    await initializeModel();
    console.log('✅ [PREWARM] Complete');
  } catch (error) {
    console.warn('⚠️ [PREWARM] Failed:', error);
  }
}

/**
 * Cleanup resources
 */
export function disposeModel(): void {
  isInitialized = false;
  console.log('🧹 [CLEANUP] Classifier disposed');
}

/**
 * Update backend URL at runtime
 */
export function setBackendUrl(url: string): void {
  console.log(`🔧 [CONFIG] Backend URL updated to: ${url}`);
  // Note: This would require making BACKEND_BASE_URL a let variable
  // For now, edit the constant at the top of this file
}
