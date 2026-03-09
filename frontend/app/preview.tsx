/**
 * Preview Screen - Fixed UI State Management
 * 
 * CRITICAL FIXES:
 * 1. Proper async/await handling
 * 2. UI state updates (analyzing → result)
 * 3. Error boundary and user feedback
 * 4. Race condition prevention
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ImagePreview } from '../components/ImagePreview';
import {
  analyzeFootImage,
  ClassificationResult,
  prewarmBackend,
} from '../services/ulcerClassifier';
import { DatabaseService } from '../services/DatabaseService';

export default function PreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analysisInProgress = useRef(false);

  // Pre-warm TensorFlow backend when preview loads
  useEffect(() => {
    console.log('📱 [PREVIEW] Screen mounted, pre-warming backend...');
    prewarmBackend().catch(err => {
      console.warn('⚠️ [PREVIEW] Pre-warm failed:', err);
    });

    return () => {
      console.log('📱 [PREVIEW] Screen unmounting');
    };
  }, []);

  /**
   * CRITICAL: Main analysis handler with proper async flow
   */
  const handleAnalyzeImage = async () => {
    // Prevent duplicate analysis
    if (analysisInProgress.current) {
      console.warn('⚠️ [PREVIEW] Analysis already in progress, ignoring');
      return;
    }

    if (!imageUri) {
      Alert.alert('Error', 'No image to analyze');
      return;
    }

    console.log('\n🚀 [PREVIEW] User tapped "Analyze Foot"');
    console.log('=' .repeat(70));

    // STEP 1: Set analyzing state immediately
    setAnalyzing(true);
    setError(null);
    analysisInProgress.current = true;

    try {
      console.log('📍 [PREVIEW] Image URI:', imageUri.substring(0, 80) + '...');

      // STEP 2: Run AI analysis (CRITICAL: await completion)
      console.log('🔬 [PREVIEW] Starting AI analysis...');
      const analysisStart = Date.now();

      const result: ClassificationResult = await analyzeFootImage(imageUri);

      const analysisTime = Date.now() - analysisStart;
      console.log(`✅ [PREVIEW] Analysis completed in ${analysisTime}ms`);

      // STEP 3: Check if analysis succeeded
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      console.log('📊 [PREVIEW] Result:', {
        prediction: result.prediction,
        confidence: `${(result.confidence * 100).toFixed(1)}%`,
        time: `${result.processingTime}ms`,
      });

      // STEP 4: Save to database (CRITICAL: await completion)
      console.log('💾 [PREVIEW] Saving to database...');
      const dbStart = Date.now();

      const dbService = DatabaseService.getInstance();
      await dbService.initialize();

      await dbService.saveScan({
        imageData: imageUri,
        riskScore: result.confidence,
        riskLevel: result.prediction,
        aiConfidence: result.confidence,
        bloodSugar: 0,
        tempDifference: 0,
        advice: getAdvice(result.prediction),
        timestamp: new Date().toISOString(),
      });

      const dbTime = Date.now() - dbStart;
      console.log(`✅ [PREVIEW] Saved to database in ${dbTime}ms`);

      // STEP 5: Navigate to results (CRITICAL: only after all async ops complete)
      console.log('🎯 [PREVIEW] Navigating to results...');

      router.push({
        pathname: '/result',
        params: {
          prediction: result.prediction,
          confidence: result.confidence.toFixed(2),
          processingTime: result.processingTime.toString(),
          imageUri: imageUri,
        },
      });

      console.log('✅ [PREVIEW] Navigation complete');
      console.log('=' .repeat(70));

    } catch (error) {
      console.error('\n❌ [PREVIEW] Analysis failed');
      console.error('=' .repeat(70));
      console.error('Error:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('=' .repeat(70));

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);

      Alert.alert(
        'Analysis Failed',
        `Failed to analyze image: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`,
        [
          {
            text: 'Retry',
            onPress: () => {
              setError(null);
              // Allow retry
              analysisInProgress.current = false;
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => router.back(),
          },
        ]
      );

    } finally {
      // CRITICAL: Always reset state
      setAnalyzing(false);
      analysisInProgress.current = false;
    }
  };

  const handleRetakePhoto = () => {
    if (analyzing) {
      Alert.alert(
        'Analysis in Progress',
        'Please wait for the analysis to complete before retaking the photo.'
      );
      return;
    }

    console.log('🔄 [PREVIEW] User chose to retake photo');
    router.back();
  };

  const getAdvice = (prediction: string): string => {
    switch (prediction) {
      case 'Healthy':
        return 'No signs of ulceration detected. Continue regular foot care and monitoring.';
      case 'Ulcer':
        return 'Signs of ulceration detected. Seek immediate medical attention.';
      default:
        return 'Analysis complete.';
    }
  };

  // Error state
  if (!imageUri) {
    console.error('❌ [PREVIEW] No image URI provided');
    Alert.alert('Error', 'No image provided');
    router.back();
    return null;
  }

  // Show loading overlay during analysis
  if (analyzing) {
    return (
      <View style={styles.container}>
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.analyzingText}>Analyzing Image...</Text>
          <Text style={styles.analyzingSubtext}>
            Running AI model on your device
          </Text>
          <View style={styles.progressIndicator}>
            <View style={styles.progressBar} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImagePreview
        imageUri={imageUri}
        onAnalyze={handleAnalyzeImage}
        onRetake={handleRetakePhoto}
        analyzing={analyzing}
      />
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  analyzingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 24,
  },
  analyzingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 8,
  },
  analyzingSubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  progressIndicator: {
    width: '80%',
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '100%',
    backgroundColor: '#22c55e',
    // Animated progress bar
  },
  errorBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ef4444',
    padding: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
