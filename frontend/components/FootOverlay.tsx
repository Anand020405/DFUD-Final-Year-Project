/**
 * Foot Overlay Component
 * SVG overlay for guided camera capture
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export const FootOverlay: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg height="300" width="200" viewBox="0 0 200 300" style={styles.svg}>
        {/* Foot outline */}
        <Path
          d="M 100 50 Q 95 40, 90 35 Q 85 30, 80 28 Q 75 26, 70 28 Q 65 30, 62 35 L 60 45 Q 58 55, 60 65 L 65 85 Q 68 100, 70 115 L 75 145 Q 78 170, 80 195 Q 82 220, 85 240 Q 87 260, 90 275 L 95 285 Q 100 295, 105 295 Q 110 295, 115 285 L 120 275 Q 123 260, 125 240 Q 127 220, 128 195 Q 129 170, 130 145 L 132 115 Q 133 100, 135 85 L 138 65 Q 140 55, 138 45 L 136 35 Q 133 30, 128 28 Q 123 26, 118 28 Q 113 30, 108 35 Q 103 40, 100 50 Z"
          stroke="#22c55e"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10,5"
        />
        
        {/* Toe circles */}
        <Circle cx="90" cy="35" r="8" stroke="#22c55e" strokeWidth="2" fill="none" />
        <Circle cx="100" cy="30" r="8" stroke="#22c55e" strokeWidth="2" fill="none" />
        <Circle cx="110" cy="35" r="8" stroke="#22c55e" strokeWidth="2" fill="none" />
        
        {/* Guide markers */}
        <Path
          d="M 40 150 L 50 150 M 150 150 L 160 150"
          stroke="#22c55e"
          strokeWidth="2"
          opacity="0.6"
        />
        <Path
          d="M 100 10 L 100 20 M 100 310 L 100 320"
          stroke="#22c55e"
          strokeWidth="2"
          opacity="0.6"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  svg: {
    opacity: 0.8,
  },
});