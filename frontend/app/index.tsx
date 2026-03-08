/**
 * Main Screen - Offline AI Foot Ulcer Detection
 * Simple workflow: Capture → Analyze → Result
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ImagePreview } from '../components/ImagePreview';
import { analyzeFootImage, ClassificationResult } from '../services/ulcerClassifier';
import { DatabaseService } from '../services/DatabaseService';

export default function HomeScreen() {
  const router = useRouter();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    // Initialize database on app start
    DatabaseService.getInstance().initialize().catch(console.error);
  }, []);

  const handleCaptureImage = () => {
    router.push('/camera');
  };

  const handleAnalyzeImage = async () => {
    if (!capturedImage) return;

    setAnalyzing(true);

    try {
      // Run local AI inference
      const result: ClassificationResult = await analyzeFootImage(capturedImage);

      // Save to local database
      const dbService = DatabaseService.getInstance();
      await dbService.initialize();
      await dbService.saveScan({
        imageData: capturedImage,
        riskScore: result.confidence,
        riskLevel: result.prediction,
        aiConfidence: result.confidence,
        bloodSugar: 0,
        tempDifference: 0,
        advice: getAdvice(result.prediction),
        timestamp: new Date().toISOString(),
      });

      // Navigate to results
      router.push({
        pathname: '/result',
        params: {
          prediction: result.prediction,
          confidence: result.confidence.toFixed(2),
          processingTime: result.processingTime.toString(),
          imageUri: capturedImage,
        },
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
  };

  const getAdvice = (prediction: string): string => {
    switch (prediction) {
      case 'Healthy':
        return 'No signs of ulceration detected. Continue regular foot care and monitoring.';
      case 'Mild Ulcer':
        return 'Early signs of ulceration detected. Consult healthcare provider for assessment.';
      case 'Moderate Ulcer':
        return 'Moderate ulceration detected. Seek medical attention promptly for proper treatment.';
      case 'Severe Ulcer':
        return 'Severe ulceration detected. Urgent medical attention required.';
      default:
        return 'Analysis complete.';
    }
  };

  // Listen for captured image from camera screen
  React.useEffect(() => {
    const handleRouteParams = () => {
      // This will be set by the camera screen when returning
      const params = router.params as any;
      if (params?.capturedImageUri) {
        setCapturedImage(params.capturedImageUri);
      }
    };
    handleRouteParams();
  }, [router.params]);

  if (capturedImage) {
    return (
      <ImagePreview
        imageUri={capturedImage}
        onAnalyze={handleAnalyzeImage}
        onRetake={handleRetakePhoto}
        analyzing={analyzing}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.iconContainer}>
          <Ionicons name="fitness" size={80} color="#22c55e" />
        </View>
        <Text style={styles.title}>Diabetic Foot Ulcer Detection</Text>
        <Text style={styles.subtitle}>
          AI-powered offline analysis using your device camera
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Ionicons name="phone-portrait" size={32} color="#3b82f6" />
          <Text style={styles.featureTitle}>100% Offline</Text>
          <Text style={styles.featureText}>AI runs on your device</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="flash" size={32} color="#eab308" />
          <Text style={styles.featureTitle}>Instant Results</Text>
          <Text style={styles.featureText}>Analysis in seconds</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="shield-checkmark" size={32} color="#22c55e" />
          <Text style={styles.featureTitle}>Private</Text>
          <Text style={styles.featureText}>Data stays on device</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.captureButton}
        onPress={handleCaptureImage}
        activeOpacity={0.8}
      >
        <Ionicons name="camera" size={32} color="#fff" />
        <Text style={styles.captureButtonText}>Capture Foot Image</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color="#3b82f6" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            1. Capture a clear image of your foot{' \n'}
            2. AI analyzes the image locally{' \n'}
            3. Get instant classification results
          </Text>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="medical" size={20} color="#94a3b8" />
        <Text style={styles.disclaimerText}>
          This is a screening tool. Always consult healthcare professionals for diagnosis.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 24,
  },
  hero: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 12,
  },
  feature: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  captureButton: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    gap: 12,
    marginBottom: 24,
  },
  captureButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    gap: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
});
