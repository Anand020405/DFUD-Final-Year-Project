/**
 * Root Layout with Tab Navigation
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTintColor: '#fff',
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
          headerTitle: 'DFU Detection',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
          headerTitle: 'Scan History',
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: 'Info',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle" size={size} color={color} />
          ),
          headerTitle: 'Information',
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="preview"
        options={{
          href: null, // Hide from tabs
          headerTitle: 'Preview Image',
        }}
      />
      <Tabs.Screen
        name="manual-entry"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          href: null, // Hide from tabs
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1f2937',
    borderTopColor: '#374151',
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
  },
  header: {
    backgroundColor: '#1f2937',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
});