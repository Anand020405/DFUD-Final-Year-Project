/**
 * Result Screen - Offline AI Classification Results
 * Displays prediction, confidence, and recommendations
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRiskColor, getPredictionExplanation } from '../services/ulcerClassifier';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const prediction = params.prediction as string;
  const confidence = parseFloat(params.confidence as string);
  const processingTime = params.processingTime as string;
  const imageUri = params.imageUri as string;

  const color = getRiskColor(prediction);
  const explanation = getPredictionExplanation(prediction);

  const getIcon = () => {
    switch (prediction) {
      case 'Healthy':
        return 'checkmark-circle';
      case 'Ulcer':
        return 'alert-circle';
      default:
        return 'information-circle';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.resultCard, { borderColor: color }]}>
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Ionicons name={getIcon()} size={64} color="#fff" />
        </View>

        <Text style={styles.statusText}>Prediction</Text>
        <Text style={[styles.predictionText, { color }]}>{prediction}</Text>

        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <Text style={[styles.confidenceValue, { color }]}>
            {(confidence * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${confidence * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>

      {imageUri && (
        <View style={styles.imageCard}>
          <Text style={styles.cardTitle}>Analyzed Image</Text>
          <Image source={{ uri: imageUri }} style={styles.analyzedImage} />
        </View>
      )}

      <View style={styles.detailsCard}>
        <View style={styles.detailHeader}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.cardTitle}>Analysis Details</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="flash" size={20} color="#eab308" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Processing Time</Text>
            <Text style={styles.detailValue}>{processingTime}ms</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="phone-portrait" size={20} color="#22c55e" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Processing Location</Text>
            <Text style={styles.detailValue}>On Device (Offline)</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Data Privacy</Text>
            <Text style={styles.detailValue}>100% Private</Text>
          </View>
        </View>
      </View>

      <View style={[styles.adviceCard, { borderLeftColor: color }]}>
        <View style={styles.adviceHeader}>
          <Ionicons name="medical" size={24} color={color} />
          <Text style={styles.adviceTitle}>Recommendation</Text>
        </View>
        <Text style={styles.adviceText}>{explanation}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/')}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.buttonText}>New Analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/history')}
          activeOpacity={0.8}
        >
          <Ionicons name="time" size={24} color="#fff" />
          <Text style={styles.buttonText}>View History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="alert-circle" size={20} color="#ef4444" />
        <Text style={styles.disclaimerText}>
          This is an AI screening tool. Always consult healthcare professionals for proper diagnosis and treatment.
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: '#1e293b',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 8,
  },
  predictionText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  confidenceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  confidenceValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  imageCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  analyzedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  detailsCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#94a3b8',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  adviceCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  adviceText: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 24,
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
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
  },
});
