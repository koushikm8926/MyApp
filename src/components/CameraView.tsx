import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
} from 'react-native-vision-camera';
import { Camera as CameraIcon, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraOverlay } from './CameraOverlay';
import { useStability } from '../hooks/useStability';
import { imageValidationService } from '../services/imageValidationService';
import KeepAwake from 'react-native-keep-awake';
import LinearGradient from 'react-native-linear-gradient';

interface CameraViewProps {
  onPictureTaken?: (uri: string) => void;
  onClose?: () => void;
  guideText?: string;
  isModal?: boolean;
}

export default function CameraView({ onPictureTaken, onClose, guideText, isModal = false }: CameraViewProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const insets = useSafeAreaInsets();
  const [isValidating, setIsValidating] = useState(false);
  const { isStable } = useStability();

  useEffect(() => {
    KeepAwake.activate();
    return () => KeepAwake.deactivate();
  }, []);

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
        {onClose && (
          <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No camera device found</Text>
        {onClose && (
          <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const takePicture = async () => {
    if (!isStable) {
      Alert.alert('Steady!', 'Please hold the device still while capturing.');
      return;
    }

    if (cameraRef.current && !isValidating) {
      try {
        setIsValidating(true);
        const photo = await cameraRef.current.takePhoto();
        const uri = `file://${photo.path}`;

        const validation = await imageValidationService.validateImage(uri);

        if (!validation.isValid) {
          Alert.alert(
            'Quality Issue Detected',
            validation.errors.join('\n'),
            [{ text: 'Try Again', onPress: () => setIsValidating(false) }]
          );
          return;
        }

        if (onPictureTaken) onPictureTaken(uri);
        if (isModal && onClose) onClose();
      } catch (error) {
        console.error('Failed to take picture', error);
      } finally {
        setIsValidating(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      >
        <CameraOverlay guideText={guideText || 'CAPTURE PHOTO'} isStable={isStable} />

        {onClose && (
          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top > 0 ? insets.top + 10 : 20 }]}
            onPress={onClose}
          >
            <X size={28} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={[styles.controls, { bottom: insets.bottom > 0 ? insets.bottom + 20 : 40 }]}>
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                !isStable && styles.captureButtonDisabled
              ]}
              onPress={takePicture}
              disabled={isValidating || !isStable}
            >
              <LinearGradient
                colors={isStable ? ['#0787e2', '#056cb5'] : ['#475569', '#334155']}
                style={styles.captureButtonInner}
              >
                {isValidating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <CameraIcon size={32} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            {!isStable && (
              <View style={styles.stabilityWarning}>
                <Text style={styles.warningText}>HOLD STEADY TO CAPTURE</Text>
              </View>
            )}
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 3000,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2000,
    elevation: 20,
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureButtonDisabled: {
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  captureButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  captureButtonContainer: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
  },
  stabilityWarning: {
    marginTop: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  warningText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    color: '#1E293B',
    fontWeight: '600',
  },
  btn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#94A3B8',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
