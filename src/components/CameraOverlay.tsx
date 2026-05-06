import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';

interface CameraOverlayProps {
  guideText: string;
  isStable: boolean;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({ guideText, isStable }) => {
  const [framingPercentage, setFramingPercentage] = useState(65);
  const [focusLevel, setFocusLevel] = useState(90);
  const [fps, setFps] = useState(60);

  // Simulated telemetry for high-tech feel
  useEffect(() => {
    const interval = setInterval(() => {
      setFramingPercentage(prev => {
        const targetMin = isStable ? 92 : 45;
        const targetMax = isStable ? 99 : 78;
        const step = Math.floor(Math.random() * 7) - 3; 
        let next = prev + step;
        if (next < targetMin) next += 5;
        if (next > targetMax) next -= 5;
        return Math.max(0, Math.min(100, next));
      });

      setFocusLevel(prev => {
        const targetMin = isStable ? 85 : 50;
        const targetMax = isStable ? 99 : 70;
        const step = Math.floor(Math.random() * 5) - 2;
        let next = prev + step;
        if (next < targetMin) next += 3;
        if (next > targetMax) next -= 3;
        return Math.max(0, Math.min(100, next));
      });

      setFps(prev => Math.floor(Math.random() * 3) + 58); // fluctuates between 58 and 60
    }, 350);

    return () => clearInterval(interval);
  }, [isStable]);

  const isFocusGood = focusLevel > 75;
  const overlayColor = isStable && isFocusGood ? '#10B981' : (isStable ? '#F59E0B' : '#EF4444');

  return (
    <View style={styles.container} pointerEvents="none">
      
      {/* Top Telemetry Bar */}
      <View style={styles.topSection}>
        <View style={styles.telemetryRow}>
          <View style={styles.telemetryGroup}>
            <Text style={styles.telemetryLabel}>FPS</Text>
            <Text style={styles.telemetryValue}>{fps}</Text>
          </View>
          <View style={styles.telemetryGroup}>
            <Text style={styles.telemetryLabel}>RES</Text>
            <Text style={styles.telemetryValue}>4K</Text>
          </View>
          <View style={styles.telemetryGroup}>
            <Text style={styles.telemetryLabel}>ISO</Text>
            <Text style={styles.telemetryValue}>Auto</Text>
          </View>
        </View>

        <View style={styles.guideContainer}>
          <Text style={styles.guideText}>{guideText}</Text>
        </View>
      </View>

      {/* Center Framing Area */}
      <View style={styles.middleSection}>
        <View style={styles.sideOverlay} />
        <View style={[styles.focusArea, { borderColor: overlayColor + '40' }]}>
          
          {/* Solid corners for high-tech feel */}
          <View style={[styles.corner, styles.topLeft, { borderColor: overlayColor }]} />
          <View style={[styles.corner, styles.topRight, { borderColor: overlayColor }]} />
          <View style={[styles.corner, styles.bottomLeft, { borderColor: overlayColor }]} />
          <View style={[styles.corner, styles.bottomRight, { borderColor: overlayColor }]} />

          {/* Crosshairs */}
          <View style={styles.crosshairVertical} />
          <View style={styles.crosshairHorizontal} />

          {/* Center Target */}
          <View style={[styles.centerTarget, { borderColor: overlayColor + '80' }]} />

        </View>
        <View style={styles.sideOverlay} />
      </View>

      {/* Bottom Status Indicators */}
      <View style={styles.bottomSection}>
        
        <View style={styles.statusPanel}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>STABILITY</Text>
            <View style={styles.statusBarOuter}>
              <View style={[styles.statusBarInner, { width: `${isStable ? 95 : 40}%`, backgroundColor: isStable ? '#10B981' : '#EF4444' }]} />
            </View>
            <Text style={styles.statusValue}>{isStable ? 'STEADY' : 'SHAKY'}</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>FOCUS</Text>
            <View style={styles.statusBarOuter}>
              <View style={[styles.statusBarInner, { width: `${focusLevel}%`, backgroundColor: isFocusGood ? '#10B981' : '#F59E0B' }]} />
            </View>
            <Text style={styles.statusValue}>{isFocusGood ? 'SHARP' : 'BLUR'}</Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>FRAMING</Text>
            <View style={styles.statusBarOuter}>
              <View style={[styles.statusBarInner, { width: `${framingPercentage}%`, backgroundColor: '#3B82F6' }]} />
            </View>
            <Text style={styles.statusValue}>{framingPercentage}%</Text>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  telemetryRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  telemetryGroup: {
    alignItems: 'center',
  },
  telemetryLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  telemetryValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  guideContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  guideText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  middleSection: {
    flex: 1,
    flexDirection: 'row',
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  focusArea: {
    width: '80%',
    borderWidth: 1, // Full rectangular frame
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  centerTarget: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  bottomSection: {
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: 20,
    paddingHorizontal: 30,
  },
  statusPanel: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    width: 65,
    letterSpacing: 0.5,
  },
  statusBarOuter: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  statusBarInner: {
    height: '100%',
    borderRadius: 2,
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    width: 45,
    textAlign: 'right',
  },
});
