/**
 * Main Scan Screen
 * Entry point with options to scan or manually enter data
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DatabaseService } from '../services/DatabaseService';

export default function ScanScreen() {
  const router = useRouter();

  useEffect(() => {
    // Initialize database on app start
    DatabaseService.getInstance().initialize().catch(console.error);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Ionicons name="medical" size={80} color="#22c55e" />
        <Text style={styles.title}>Diabetic Foot Ulcer Detection</Text>
        <Text style={styles.subtitle}>
          AI-powered screening for early detection of foot complications
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/camera')}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={32} color="#fff" />
          <Text style={styles.buttonText}>Capture Foot Image</Text>
          <Text style={styles.buttonSubtext}>Use guided camera overlay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/manual-entry')}
          activeOpacity={0.8}
        >
          <Ionicons name="create" size={32} color="#fff" />
          <Text style={styles.buttonText}>Manual Entry</Text>
          <Text style={styles.buttonSubtext}>Enter clinical data only</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color="#3b82f6" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            Our AI analyzes foot images combined with clinical data (blood sugar and temperature) to assess ulcer risk.
          </Text>
        </View>
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
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  actions: {
    gap: 16,
    marginBottom: 32,
  },
  button: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
  },
  secondaryButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
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
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
});