/**
 * History Screen
 * Displays list of past scans
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DatabaseService, ScanRecord } from '../services/DatabaseService';

export default function HistoryScreen() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadScans = async () => {
    try {
      setLoading(true);
      const dbService = DatabaseService.getInstance();
      const records = await dbService.getAllScans();
      setScans(records);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadScans();
    }, [])
  );

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const dbService = DatabaseService.getInstance();
              await dbService.deleteScan(id);
              loadScans();
            } catch (error) {
              console.error('Error deleting scan:', error);
              Alert.alert('Error', 'Failed to delete scan');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all scan records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const dbService = DatabaseService.getInstance();
              await dbService.clearAllScans();
              loadScans();
            } catch (error) {
              console.error('Error clearing scans:', error);
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low':
        return '#22c55e';
      case 'Moderate':
        return '#eab308';
      case 'High':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderScanItem = ({ item }: { item: ScanRecord }) => (
    <View style={[styles.scanCard, { borderLeftColor: getRiskColor(item.riskLevel) }]}>
      <View style={styles.scanHeader}>
        <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.riskLevel) }]}>
          <Text style={styles.riskBadgeText}>{item.riskLevel}</Text>
        </View>
        <Text style={styles.scanDate}>{formatDate(item.timestamp)}</Text>
        <TouchableOpacity
          onPress={() => item.id && handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.scanDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="analytics" size={16} color="#94a3b8" />
          <Text style={styles.detailText}>
            Risk: {(item.riskScore * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="water" size={16} color="#94a3b8" />
          <Text style={styles.detailText}>
            Sugar: {item.bloodSugar} mg/dL
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="thermometer" size={16} color="#94a3b8" />
          <Text style={styles.detailText}>
            Temp: {item.tempDifference.toFixed(1)} °C
          </Text>
        </View>
      </View>

      {item.imageData && (
        <View style={styles.imageIndicator}>
          <Ionicons name="image" size={16} color="#22c55e" />
          <Text style={styles.imageIndicatorText}>Image included</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={80} color="#6b7280" />
      <Text style={styles.emptyTitle}>No Scan History</Text>
      <Text style={styles.emptyText}>
        Your scan results will appear here. Start by performing your first scan.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : (
        <>
          {scans.length > 0 && (
            <View style={styles.header}>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{scans.length}</Text>
                  <Text style={styles.statLabel}>Total Scans</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {scans.filter(s => s.riskLevel === 'High').length}
                  </Text>
                  <Text style={styles.statLabel}>High Risk</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearAll}
              >
                <Ionicons name="trash" size={20} color="#ef4444" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={scans}
            renderItem={renderScanItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  header: {
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  clearButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    gap: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  scanCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  scanDate: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
  },
  deleteButton: {
    padding: 8,
  },
  scanDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#fff',
  },
  imageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  imageIndicatorText: {
    fontSize: 12,
    color: '#22c55e',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
});