import { useState, useEffect } from 'react';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { Subscription } from 'rxjs';

export const useStability = (threshold = 0.05) => {
  const [isStable, setIsStable] = useState(true);
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let subscription: Subscription | null = null;
    let prevData = { x: 0, y: 0, z: 0 };

    try {
      setUpdateIntervalForType(SensorTypes.accelerometer, 100);

      subscription = accelerometer.subscribe({
        next: (accelerometerData: { x: number; y: number; z: number }) => {
          setData(accelerometerData);

          // Calculate the magnitude of the movement
          const movement = Math.sqrt(
            Math.pow(accelerometerData.x - prevData.x, 2) +
            Math.pow(accelerometerData.y - prevData.y, 2) +
            Math.pow(accelerometerData.z - prevData.z, 2)
          );

          prevData = accelerometerData;
          setIsStable(movement < threshold);
        },
        error: (error: any) => {
          console.warn('Accelerometer error:', error);
          setIsStable(true);
        },
      });
    } catch (error) {
      console.warn('Accelerometer not available:', error);
      setIsStable(true);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [threshold]);

  return { isStable, data };
};
