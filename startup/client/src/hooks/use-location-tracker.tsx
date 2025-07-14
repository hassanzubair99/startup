import { useState, useEffect, useRef } from "react";

export function useLocationTracker() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          setLastUpdated(new Date());
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  };

  const startTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsTracking(true);
    setLastUpdated(new Date());
    
    // Update location immediately
    getCurrentLocation();

    // Set up interval to update location every 30 minutes (1800000 ms)
    intervalRef.current = setInterval(() => {
      getCurrentLocation();
      setLastUpdated(new Date());
      console.log("📍 Location updated automatically");
    }, 1800000); // 30 minutes

    console.log("📍 Location tracking started - will update every 30 minutes");
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
    console.log("📍 Location tracking stopped");
  };

  const getNextUpdateTime = () => {
    if (!lastUpdated) return null;
    return new Date(lastUpdated.getTime() + 1800000); // 30 minutes later
  };

  const getTimeUntilNextUpdate = () => {
    const nextUpdate = getNextUpdateTime();
    if (!nextUpdate) return null;
    
    const now = new Date();
    const diff = nextUpdate.getTime() - now.getTime();
    
    if (diff <= 0) return "Updating now...";
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  // Start tracking on component mount
  useEffect(() => {
    startTracking();
    
    // Cleanup on unmount
    return () => {
      stopTracking();
    };
  }, []);

  return {
    location,
    isTracking,
    lastUpdated,
    nextUpdateTime: getNextUpdateTime(),
    timeUntilNextUpdate: getTimeUntilNextUpdate(),
    startTracking,
    stopTracking,
    forceUpdate: getCurrentLocation,
  };
}