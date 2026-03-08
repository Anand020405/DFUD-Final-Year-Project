/**
 * Image Preview Component
 * Displays captured foot image with analysis option
 */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImagePreviewProps {
  imageUri: string;
  onAnalyze: () => void;
  onRetake: () => void;
  analyzing?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUri,
  onAnalyze,
  onRetake,
  analyzing = false,
}) => {
  const { width } = Dimensions.get('window');
  const imageSize = width - 48;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={[styles.image, { width: imageSize, height: imageSize }]} />
        
        <View style={styles.overlay}>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            <Text style={styles.badgeText}>Image Captured</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={onAnalyze}
          disabled={analyzing}
          activeOpacity={0.8}
        >
          {analyzing ? (
            <>
              <Ionicons name="hourglass" size={24} color="#fff" />
              <Text style={styles.buttonText}>Analyzing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="analytics" size={24} color="#fff" />
              <Text style={styles.buttonText}>Analyze Foot</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onRetake}
          disabled={analyzing}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.buttonText}>Retake Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#3b82f6" />
        <Text style={styles.infoText}>
          AI analysis runs entirely on your device. No internet required.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0f172a',
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  image: {
    borderRadius: 14,
  },
  overlay: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
  },
  secondaryButton: {
    backgroundColor: '#475569',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
});
