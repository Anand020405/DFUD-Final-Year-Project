/**
 * Preview Screen
 * Displays captured image and provides analyze/retake options
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ImagePreview } from '../components/ImagePreview';
import { analyzeFootImage, ClassificationResult } from '../services/ulcerClassifier';
import { DatabaseService } from '../services/DatabaseService';

export default function PreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;

  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyzeImage = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'No image to analyze');
      return;
    }

    setAnalyzing(true);

    try {
      console.log('Starting analysis for image:', imageUri);
      
      // Run local AI inference
      const result: ClassificationResult = await analyzeFootImage(imageUri);
      
      console.log('Analysis complete:', result);

      // Save to local database
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

      console.log('Scan saved to database');

      // Navigate to results
      router.push({
        pathname: '/result',
        params: {
          prediction: result.prediction,
          confidence: result.confidence.toFixed(2),
          processingTime: result.processingTime.toString(),
          imageUri: imageUri,
        },
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
      setAnalyzing(false);
    }
  };

  const handleRetakePhoto = () => {
    // Go back to camera
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

  if (!imageUri) {
    Alert.alert('Error', 'No image provided');
    router.back();
    return null;
  }

  return (
    <View style={styles.container}>
      <ImagePreview
        imageUri={imageUri}
        onAnalyze={handleAnalyzeImage}
        onRetake={handleRetakePhoto}
        analyzing={analyzing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
