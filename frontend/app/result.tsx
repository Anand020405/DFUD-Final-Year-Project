/**
 * Result Screen
 * Displays risk assessment results with color-coded dashboard
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const riskScore = parseFloat(params.riskScore as string);
  const riskLevel = params.riskLevel as string;
  const color = params.color as string;
  const advice = params.advice as string;
  const aiConfidence = parseFloat(params.aiConfidence as string);
  const clinicalScore = parseFloat(params.clinicalScore as string);
  const bloodSugar = params.bloodSugar as string;
  const tempDifference = params.tempDifference as string;

  const getIcon = () => {
    switch (riskLevel) {
      case 'Low':
        return 'checkmark-circle';
      case 'Moderate':
        return 'warning';
      case 'High':
        return 'alert-circle';
      default:
        return 'information-circle';
    }
  };

  const getStatusMessage = () => {
    switch (riskLevel) {
      case 'Low':
        return 'Low Risk Detected';
      case 'Moderate':
        return 'Moderate Risk - Monitor Closely';
      case 'High':
        return 'High Risk - Urgent Action Needed';
      default:
        return 'Risk Assessment Complete';
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

        <Text style={styles.statusText}>{getStatusMessage()}</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Risk Score</Text>
          <Text style={[styles.scoreValue, { color }]}>
            {(riskScore * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.riskBar}>
          <View
            style={[
              styles.riskBarFill,
              { width: `${riskScore * 100}%`, backgroundColor: color },
            ]}
          />
        </View>

        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>Low</Text>
          <Text style={styles.scaleLabel}>Moderate</Text>
          <Text style={styles.scaleLabel}>High</Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Assessment Details</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="analytics" size={20} color="#3b82f6" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>AI Confidence</Text>
            <Text style={styles.detailValue}>{(aiConfidence * 100).toFixed(0)}%</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="fitness" size={20} color="#8b5cf6" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Clinical Score</Text>
            <Text style={styles.detailValue}>{(clinicalScore * 100).toFixed(0)}%</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="water" size={20} color="#3b82f6" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Blood Sugar</Text>
            <Text style={styles.detailValue}>{bloodSugar} mg/dL</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="thermometer" size={20} color="#ef4444" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Temp Difference</Text>
            <Text style={styles.detailValue}>{tempDifference} °C</Text>
          </View>
        </View>
      </View>

      <View style={[styles.adviceCard, { borderLeftColor: color }]}>
        <View style={styles.adviceHeader}>
          <Ionicons name="medical" size={24} color={color} />
          <Text style={styles.adviceTitle}>Recommended Actions</Text>
        </View>
        <Text style={styles.adviceText}>{advice}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>New Scan</Text>
          <Ionicons name="add-circle" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/history')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>View History</Text>
          <Ionicons name="time" size={24} color="#fff" />
        </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  riskBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  scaleLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  detailsCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
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
});