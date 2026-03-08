/**
 * Manual Entry Screen
 * Sliders for blood sugar and temperature difference
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { DetectionService } from '../services/DetectionService';
import { RiskCalculator } from '../services/RiskCalculator';
import { DatabaseService } from '../services/DatabaseService';

export default function ManualEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageData = params.imageData as string | undefined;

  const [bloodSugar, setBloodSugar] = useState(120);
  const [tempDifference, setTempDifference] = useState(1.0);
  const [processing, setProcessing] = useState(false);

  const handleAnalyze = async () => {
    setProcessing(true);

    try {
      // Process image if provided
      let aiConfidence = 0.85;
      if (imageData) {
        const detectionService = DetectionService.getInstance();
        const result = await detectionService.processImage(imageData);
        aiConfidence = result.confidence;
      }

      // Calculate risk
      const riskAssessment = RiskCalculator.calculateRisk(aiConfidence, {
        bloodSugar,
        tempDifference,
      });

      // Save to database
      const dbService = DatabaseService.getInstance();
      await dbService.initialize();
      await dbService.saveScan({
        imageData: imageData || undefined,
        riskScore: riskAssessment.riskScore,
        riskLevel: riskAssessment.riskLevel,
        aiConfidence: riskAssessment.aiConfidence,
        bloodSugar,
        tempDifference,
        advice: riskAssessment.advice,
        timestamp: new Date().toISOString(),
      });

      // Navigate to results
      router.push({
        pathname: '/result',
        params: {
          riskScore: riskAssessment.riskScore.toFixed(2),
          riskLevel: riskAssessment.riskLevel,
          color: riskAssessment.color,
          advice: riskAssessment.advice,
          aiConfidence: riskAssessment.aiConfidence.toFixed(2),
          clinicalScore: riskAssessment.clinicalScore.toFixed(2),
          bloodSugar: bloodSugar.toString(),
          tempDifference: tempDifference.toFixed(1),
        },
      });
    } catch (error) {
      console.error('Error processing scan:', error);
      Alert.alert('Error', 'Failed to process scan. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Clinical Data Entry</Text>
      </View>

      {imageData && (
        <View style={styles.imageInfo}>
          <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
          <Text style={styles.imageInfoText}>Foot image captured</Text>
        </View>
      )}

      <View style={styles.inputSection}>
        <View style={styles.inputHeader}>
          <Ionicons name="water" size={24} color="#3b82f6" />
          <Text style={styles.inputLabel}>Blood Sugar Level</Text>
        </View>
        <Text style={styles.inputValue}>{bloodSugar} mg/dL</Text>
        <Slider
          style={styles.slider}
          minimumValue={70}
          maximumValue={300}
          value={bloodSugar}
          onValueChange={setBloodSugar}
          minimumTrackTintColor="#3b82f6"
          maximumTrackTintColor="#334155"
          thumbTintColor="#3b82f6"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>70</Text>
          <Text style={styles.sliderLabel}>300</Text>
        </View>
        <View style={styles.rangeIndicator}>
          <Text style={styles.rangeText}>
            {bloodSugar < 100 ? 'Low' : bloodSugar < 200 ? 'Normal' : 'High'}
          </Text>
        </View>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputHeader}>
          <Ionicons name="thermometer" size={24} color="#ef4444" />
          <Text style={styles.inputLabel}>Foot Temperature Difference</Text>
        </View>
        <Text style={styles.inputValue}>{tempDifference.toFixed(1)} °C</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={5}
          step={0.1}
          value={tempDifference}
          onValueChange={setTempDifference}
          minimumTrackTintColor="#ef4444"
          maximumTrackTintColor="#334155"
          thumbTintColor="#ef4444"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>0.0</Text>
          <Text style={styles.sliderLabel}>5.0</Text>
        </View>
        <View style={styles.rangeIndicator}>
          <Text style={styles.rangeText}>
            {tempDifference < 2.2 ? 'Normal' : 'High Risk'}
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#3b82f6" />
        <Text style={styles.infoText}>
          Temperature difference ≥2.2°C or blood sugar ≥200 mg/dL triggers high risk alert
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.analyzeButton, processing && styles.analyzeButtonDisabled]}
        onPress={handleAnalyze}
        disabled={processing}
        activeOpacity={0.8}
      >
        <Text style={styles.analyzeButtonText}>
          {processing ? 'Analyzing...' : 'Analyze Risk'}
        </Text>
        {!processing && <Ionicons name="arrow-forward" size={24} color="#fff" />}
      </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  imageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  imageInfoText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  inputSection: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
    textAlign: 'center',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  rangeIndicator: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#334155',
    borderRadius: 8,
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  analyzeButton: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});