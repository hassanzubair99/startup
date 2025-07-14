import { useState } from "react";
import SOSButton from "@/components/sos-button";
import LocationDisplay from "@/components/location-display";
import StatusCard from "@/components/status-card";
import EmergencyModal from "@/components/emergency-modal";
import PrimaryContactCard from "@/components/primary-contact-card";
import ProjectDownload from "@/components/project-download";
import { useLocationTracker } from "@/hooks/use-location-tracker";
import { useDeviceMotion } from "@/hooks/use-device-motion";
import { useQuery } from "@tanstack/react-query";
import { EmergencyContact } from "@shared/schema";

export default function Home() {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const { 
    location, 
    isTracking, 
    lastUpdated, 
    timeUntilNextUpdate, 
    forceUpdate 
  } = useLocationTracker();
  const { shakeDetected, permissionGranted: motionPermission } = useDeviceMotion();

  // Fetch emergency contacts and primary contact
  const { data: contacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ['/api/emergency-contacts'],
  });
  
  const { data: primaryContact } = useQuery<EmergencyContact>({
    queryKey: ['/api/primary-contact'],
  });

  // Check permissions
  const locationPermission = location !== null || navigator.geolocation !== undefined;
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  // Check microphone permission
  useState(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => setMicPermission(true))
        .catch(() => setMicPermission(false));
    } else {
      setMicPermission(false);
    }
  });

  const systemReady = locationPermission && micPermission && primaryContact;

  // Handle SOS trigger
  const handleSOSTrigger = () => {
    if (isSOSActive) return;
    
    setIsSOSActive(true);
    setShowEmergencyModal(true);
    
    // Get current location if not already available
    if (!location) {
      getCurrentLocation();
    }
  };

  // Handle shake detection
  useState(() => {
    if (shakeDetected) {
      handleSOSTrigger();
    }
  });

  const handleCancelSOS = () => {
    setIsSOSActive(false);
    setShowEmergencyModal(false);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emergency rounded-full flex items-center justify-center">
                <i className="fas fa-shield-heart text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SafeGuard</h1>
                <p className="text-sm text-gray-600">Women Safety App</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  systemReady ? 'bg-success' : 'bg-warning'
                }`}></div>
                <span className={`text-sm font-medium ${
                  systemReady ? 'text-success' : 'text-warning'
                }`}>
                  {systemReady ? 'Ready' : 'Setup Needed'}
                </span>
              </div>
              <ProjectDownload />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        
        {/* SOS Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency SOS</h2>
            <p className="text-gray-600 mb-6">Tap for immediate help or shake phone 3 times</p>
            
            <SOSButton 
              onTrigger={handleSOSTrigger}
              isActive={isSOSActive}
            />
            
            <p className="text-sm text-gray-500 mt-4">Hold for 3 seconds or shake device</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatusCard
            icon="fas fa-map-marker-alt"
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
            title="Location"
            status={locationPermission ? "Enabled" : "Disabled"}
            statusColor={locationPermission ? "text-success" : "text-emergency"}
          />
          <StatusCard
            icon="fas fa-microphone"
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
            title="Microphone"
            status={micPermission ? "Enabled" : micPermission === false ? "Disabled" : "Checking..."}
            statusColor={micPermission ? "text-success" : micPermission === false ? "text-emergency" : "text-warning"}
          />
        </div>

        {/* Primary Contact Card */}
        <PrimaryContactCard />

        {/* Location Display */}
        <LocationDisplay 
          location={location}
          loading={false}
          error={null}
          onRefresh={forceUpdate}
        />
        
        {/* Location Tracking Status */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Location Tracking</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isTracking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {isTracking ? 'Active' : 'Inactive'}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Updates every:</span>
              <span className="font-medium text-gray-900">30 minutes</span>
            </div>
            
            {lastUpdated && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last updated:</span>
                <span className="font-medium text-gray-900">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {timeUntilNextUpdate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Next update in:</span>
                <span className="font-medium text-blue-600">
                  {timeUntilNextUpdate}
                </span>
              </div>
            )}
            
            <div className="pt-2 border-t">
              <div className="flex items-center text-xs text-gray-500">
                <i className="fas fa-info-circle mr-1"></i>
                Automatic location updates help emergency contacts find you quickly
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={handleCancelSOS}
        location={location}
        contacts={contacts}
      />
    </>
  );
}
