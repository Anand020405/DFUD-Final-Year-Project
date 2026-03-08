/**
 * Info Screen
 * Educational content about DFU detection
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InfoScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Ionicons name="information-circle" size={80} color="#3b82f6" />
        <Text style={styles.title}>About DFU Detection</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="medical" size={24} color="#22c55e" />
          <Text style={styles.sectionTitle}>What is DFU?</Text>
        </View>
        <Text style={styles.sectionText}>
          Diabetic Foot Ulcers (DFU) are open wounds that occur in approximately 15% of patients with diabetes. Early detection is crucial for preventing serious complications.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics" size={24} color="#3b82f6" />
          <Text style={styles.sectionTitle}>How It Works</Text>
        </View>
        <Text style={styles.sectionText}>
          Our AI-powered system combines image analysis with clinical data to assess ulcer risk:
        </Text>
        <View style={styles.formula}>
          <Text style={styles.formulaText}>Risk Score = (AI × 0.6) + (Clinical × 0.4)</Text>
        </View>
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>AI analyzes foot images for visual signs</Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>Clinical data includes blood sugar and temperature</Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>Combined score determines risk level</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="warning" size={24} color="#eab308" />
          <Text style={styles.sectionTitle}>Risk Triggers</Text>
        </View>
        <Text style={styles.sectionText}>
          Automatic high risk classification when:
        </Text>
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <View style={[styles.bullet, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.bulletText}>Temperature difference ≥ 2.2°C</Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={[styles.bullet, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.bulletText}>Blood sugar ≥ 200 mg/dL</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="color-palette" size={24} color="#8b5cf6" />
          <Text style={styles.sectionTitle}>Risk Levels</Text>
        </View>
        <View style={styles.riskLevels}>
          <View style={styles.riskLevel}>
            <View style={[styles.riskIndicator, { backgroundColor: '#22c55e' }]} />
            <View style={styles.riskContent}>
              <Text style={styles.riskTitle}>Low Risk (&lt;40%)</Text>
              <Text style={styles.riskDescription}>
                Regular monitoring and daily foot care recommended
              </Text>
            </View>
          </View>

          <View style={styles.riskLevel}>
            <View style={[styles.riskIndicator, { backgroundColor: '#eab308' }]} />
            <View style={styles.riskContent}>
              <Text style={styles.riskTitle}>Moderate Risk (40-70%)</Text>
              <Text style={styles.riskDescription}>
                Close monitoring needed, schedule check-up within a week
              </Text>
            </View>
          </View>

          <View style={styles.riskLevel}>
            <View style={[styles.riskIndicator, { backgroundColor: '#ef4444' }]} />
            <View style={styles.riskContent}>
              <Text style={styles.riskTitle}>High Risk (≥70%)</Text>
              <Text style={styles.riskDescription}>
                Urgent medical attention required, contact specialist immediately
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="fitness" size={24} color="#22c55e" />
          <Text style={styles.sectionTitle}>Prevention Tips</Text>
        </View>
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>Inspect feet daily for cuts or changes</Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>Wash feet daily with mild soap</Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>Keep skin moisturized</Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>Wear proper fitting shoes</Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>Maintain healthy blood sugar levels</Text>
          </View>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="alert-circle" size={20} color="#ef4444" />
        <Text style={styles.disclaimerText}>
          This app is a screening tool and does not replace professional medical advice. Always consult with healthcare providers for diagnosis and treatment.
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
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  section: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionText: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 24,
    marginBottom: 12,
  },
  formula: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  formulaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    textAlign: 'center',
  },
  bulletList: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  riskLevels: {
    gap: 16,
  },
  riskLevel: {
    flexDirection: 'row',
    gap: 16,
  },
  riskIndicator: {
    width: 4,
    borderRadius: 2,
  },
  riskContent: {
    flex: 1,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  riskDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
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