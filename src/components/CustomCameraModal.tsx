import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Text, Alert, ActivityIndicator } from 'react-native';
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
} from 'react-native-vision-camera';
import { X, Camera as CameraIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraOverlay } from './CameraOverlay';
import { useStability } from '../hooks/useStability';
import { imageValidationService } from '../services/imageValidationService';
import KeepAwake from 'react-native-keep-awake';

export default function CustomCameraModal({ visible, onClose, onPictureTaken, guideText }: any) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const insets = useSafeAreaInsets();
  const [isValidating, setIsValidating] = useState(false);
  const { isStable } = useStability();

  // Keep screen awake while camera is active
  useEffect(() => {
    if (visible) {
      KeepAwake.activate();
    } else {
      KeepAwake.deactivate();
    }
    return () => {
      KeepAwake.deactivate();
    };
  }, [visible]);

  if (!visible) return null;

  if (!hasPermission) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to show the camera</Text>
          <TouchableOpacity style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (!device) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>No camera device found</Text>
          <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
        const photo = await cameraRef.current.takePhoto({ qualityPrioritization: 'balanced' });
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

        onPictureTaken(uri);
        onClose();
      } catch (error) {
        console.error('Failed to take picture', error);
      } finally {
        setIsValidating(false);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={visible}
          photo={true}
        >
          <CameraOverlay guideText={guideText || 'CAPTURE PHOTO'} isStable={isStable} />

          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top > 0 ? insets.top + 5 : 15 }]}
            onPress={onClose}
          >
            <X size={28} color="#fff" />
          </TouchableOpacity>

          <View style={[styles.controls, { bottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
            <TouchableOpacity
              style={[styles.captureButton, !isStable && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isValidating || !isStable}
            >
              <View style={styles.captureButtonInner}>
                {isValidating ? (
                  <ActivityIndicator color="#0787e2" />
                ) : (
                  <CameraIcon size={32} color={isStable ? '#0787e2' : '#ccc'} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    </Modal>
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
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  controls: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
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
