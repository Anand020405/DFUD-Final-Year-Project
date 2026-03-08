/**
 * Camera Screen with Foot Overlay
 * Captures foot image and navigates to preview
 * 
 * FIX: CameraView children moved outside, proper navigation to preview screen
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FootOverlay } from '../components/FootOverlay';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={80} color="#6b7280" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          We need access to your camera to capture foot images for local AI analysis.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (photo && photo.uri) {
          // Navigate to preview screen with image URI
          router.push({
            pathname: '/preview',
            params: { imageUri: photo.uri }
          });
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to capture image. Please try again.');
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      {/* CameraView without children - Expo requirement */}
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      
      {/* Overlays outside CameraView */}
      <FootOverlay />
      
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>
            Align your foot within the green outline
          </Text>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={styles.iconButton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: 48,
  },
  instructionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
    marginHorizontal: 24,
    borderRadius: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#22c55e',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22c55e',
  },
});
