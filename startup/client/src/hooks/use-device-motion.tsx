import { useState, useEffect } from "react";

export function useDeviceMotion() {
  const [shakeDetected, setShakeDetected] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [shakeCount, setShakeCount] = useState(0);

  useEffect(() => {
    let shakeTimeout: NodeJS.Timeout;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const totalAcceleration = Math.abs(acceleration.x || 0) + 
                              Math.abs(acceleration.y || 0) + 
                              Math.abs(acceleration.z || 0);

      // Detect shake (threshold: 25)
      if (totalAcceleration > 25) {
        setShakeCount(prev => {
          const newCount = prev + 1;
          
          // Reset count after 2 seconds
          clearTimeout(shakeTimeout);
          shakeTimeout = setTimeout(() => {
            setShakeCount(0);
          }, 2000);

          // Trigger SOS after 3 shakes
          if (newCount >= 3) {
            setShakeDetected(true);
            setTimeout(() => setShakeDetected(false), 1000);
            return 0; // Reset count
          }
          
          return newCount;
        });
      }
    };

    // Request permission for device motion (iOS 13+)
    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            setPermissionGranted(true);
            window.addEventListener('devicemotion', handleDeviceMotion);
          } else {
            setPermissionGranted(false);
          }
        })
        .catch(() => {
          setPermissionGranted(false);
        });
    } else if (window.DeviceMotionEvent) {
      // Android and older iOS
      setPermissionGranted(true);
      window.addEventListener('devicemotion', handleDeviceMotion);
    } else {
      setPermissionGranted(false);
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      clearTimeout(shakeTimeout);
    };
  }, []);

  return {
    shakeDetected,
    permissionGranted,
    shakeCount,
  };
}
