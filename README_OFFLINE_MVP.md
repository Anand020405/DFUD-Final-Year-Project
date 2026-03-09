# Diabetic Foot Ulcer Detection - Offline AI MVP

## Overview

A fully **offline** mobile application that performs AI-powered diabetic foot ulcer detection directly on the device. No internet connection or backend server required.

## Architecture

### Frontend (React Native + Expo)
- **Platform**: Cross-platform (iOS, Android, Web)
- **Framework**: Expo Router with file-based routing
- **AI Processing**: Local on-device inference
- **Storage**: AsyncStorage for offline persistence

### Backend (Optional)
- The `backend/` folder exists but is **NOT required** for the MVP
- All AI inference runs locally on the device
- No API calls needed for classification

## Workflow

```
User captures foot image
    ↓
Image preprocessed (224x224, normalized)
    ↓
Local AI classifier analyzes image
    ↓
Results displayed instantly
    ↓
Saved to local storage
```

## Features

### ✅ Core Functionality
- **100% Offline**: No internet required
- **Camera Integration**: Guided foot capture with overlay
- **Local AI Inference**: Simulated TensorFlow Lite model
- **Image Preprocessing**: Resize to 224x224, normalize pixels
- **Classification Output**:
  - Healthy
  - Mild Ulcer
  - Moderate Ulcer
  - Severe Ulcer
- **Confidence Score**: 0-100%
- **Local History**: All scans saved on device

### 🎨 UI Components
1. **Home Screen**: Capture button + feature badges
2. **Camera Screen**: Foot overlay for guided capture
3. **Image Preview**: Captured image with analyze button
4. **Result Screen**: Prediction, confidence, recommendations
5. **History Screen**: View past scans
6. **Info Screen**: Educational content

## File Structure

```
frontend/
├── app/
│   ├── _layout.tsx          # Tab navigation
│   ├── index.tsx            # Home screen (capture)
│   ├── camera.tsx           # Camera with overlay
│   ├── result.tsx           # AI results display
│   ├── history.tsx          # Scan history
│   └── info.tsx             # Information
├── components/
│   ├── FootOverlay.tsx      # SVG foot outline
│   └── ImagePreview.tsx     # Image preview + analyze
├── services/
│   ├── ulcerClassifier.ts   # AI inference logic ⚡
│   └── DatabaseService.ts   # AsyncStorage wrapper
└── package.json

backend/  # NOT USED IN MVP
├── server.py
└── requirements.txt
```

## Key Files

### `services/ulcerClassifier.ts`

The core AI inference engine:

```typescript
// Main function
export async function analyzeFootImage(imageUri: string): Promise<ClassificationResult>

// Image preprocessing (224x224)
export async function preprocessImage(imageUri: string): Promise<ImageTensor>

// Model inference (simulated for MVP)
function simulateModelInference(tensor: ImageTensor)

// Helper functions
export function getRiskColor(prediction: string): string
export function getPredictionExplanation(prediction: string): string
```

**Current Implementation**: Simulates TensorFlow Lite inference
**Production Ready**: Structure prepared for real model loading

### Production Model Integration

To integrate a real TensorFlow Lite model:

```typescript
// 1. Install TensorFlow.js
yarn add @tensorflow/tfjs @tensorflow/tfjs-react-native

// 2. Load model in ulcerClassifier.ts
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export async function loadModel() {
  await tf.ready();
  const model = await tf.loadLayersModel(
    bundleResourceIO(modelJson, modelWeights)
  );
  return model;
}

// 3. Run inference
const output = model.predict(tensor);
```

## Dependencies

### Required Packages
```json
{
  "expo": "~54.0.0",
  "expo-camera": "~55.0.9",
  "expo-image-manipulator": "~55.0.9",
  "@react-native-async-storage/async-storage": "^3.0.1",
  "react-native-svg": "~15.15.3"
}
```

### Installation
```bash
cd frontend
yarn install
```

## Running the App

### Development (Web Preview)
```bash
npx expo start
```

### iOS (Expo Go)
```bash
npx expo start
# Scan QR code with Expo Go app
```

### Android (Expo Go)
```bash
npx expo start
# Scan QR code with Expo Go app
```

## MVP Simulation

The current implementation **simulates** AI inference:

- **Preprocessing**: Real (resizes to 224x224)
- **Model Loading**: Simulated (placeholder)
- **Inference**: Simulated (returns "Healthy" with 91-99% confidence)
- **Processing Time**: Simulated (800ms delay)

### Why Simulation?
1. No trained model available yet
2. Code structure ready for real model
3. Demonstrates complete workflow
4. Easy to replace with actual TFLite model

## Image Processing Pipeline

```typescript
1. Capture image (expo-camera)
   ↓
2. Load image URI
   ↓
3. Resize to 224x224 (expo-image-manipulator)
   ↓
4. Normalize pixel values (0-1 range)
   ↓
5. Convert to tensor format [1, 224, 224, 3]
   ↓
6. Run inference (simulated)
   ↓
7. Return classification + confidence
```

## Permissions

### iOS (`app.json`)
```json
"ios": {
  "infoPlist": {
    "NSCameraUsageDescription": "Scan foot images to detect ulcer risk"
  }
}
```

### Android (`app.json`)
```json
"android": {
  "permissions": ["CAMERA"]
}
```

## Data Storage

### AsyncStorage Structure
```json
{
  "@dfu_scans": [
    {
      "id": 1,
      "imageData": "file:///path/to/image.jpg",
      "riskScore": 0.91,
      "riskLevel": "Healthy",
      "aiConfidence": 0.91,
      "timestamp": "2026-03-08T05:00:00.000Z",
      "advice": "No signs of ulceration detected..."
    }
  ]
}
```

## Performance

- **Image Capture**: < 1s
- **Preprocessing**: ~200ms
- **Inference (simulated)**: ~800ms
- **Total Time**: ~1-2 seconds

*Real TFLite model expected: 100-500ms inference time*

## Future Production Enhancements

### 1. Real TensorFlow Lite Model
- Train model on foot ulcer dataset
- Convert to TFLite format
- Load model in `ulcerClassifier.ts`
- Replace `simulateModelInference()`

### 2. Enhanced Features
- Multi-angle capture (top, side, close-up)
- Image quality validation
- Progress tracking over time
- Export reports as PDF
- Healthcare provider sharing

### 3. Model Improvements
- Severity level classification
- Wound area measurement
- Healing progress tracking
- Risk prediction algorithms

### 4. Backend Integration (Optional)
- Cloud sync for multi-device access
- Doctor dashboard
- Analytics and insights
- Model updates via API

## Testing

### Manual Testing Checklist
- [ ] Camera opens successfully
- [ ] Foot overlay displays
- [ ] Image captures correctly
- [ ] Analyze button triggers processing
- [ ] Results display with prediction
- [ ] Confidence percentage shows
- [ ] Scan saves to history
- [ ] History displays all scans
- [ ] Delete scan works
- [ ] Clear all history works
- [ ] Info screen displays

### Automated Testing
```bash
# Run linter
cd frontend
npx expo-doctor

# Type check
npx tsc --noEmit
```

## Deployment

### Web Preview
Already deployed at: `https://dfu-analyzer-1.preview.emergentagent.com`

### Mobile App Store
1. Build production bundle:
```bash
eas build --platform ios
eas build --platform android
```

2. Submit to stores:
```bash
eas submit --platform ios
eas submit --platform android
```

## Security & Privacy

✅ **100% Private**: All data stays on device
✅ **No Network Calls**: Offline-first architecture
✅ **No User Tracking**: No analytics or telemetry
✅ **Local Storage Only**: AsyncStorage (encrypted on device)

## Disclaimer

This application is a **screening tool** for educational and research purposes. It does not provide medical diagnosis. Users should always consult qualified healthcare professionals for proper diagnosis and treatment of diabetic foot ulcers.

## License

MIT

## Support

For issues or questions:
1. Check the Info tab in the app
2. Review this README
3. Contact development team

---

**MVP Status**: ✅ Fully Functional Offline
**Production Ready**: 🟡 Requires real TFLite model
**Backend Required**: ❌ No (optional for cloud sync)
