import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmergencyContact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { emergencyService } from "@/lib/emergency-service";
import { useAudioRecording } from "@/hooks/use-audio-recording";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: GeolocationPosition | null;
  contacts: EmergencyContact[];
}

export default function EmergencyModal({ isOpen, onClose, location, contacts }: EmergencyModalProps) {
  const [alertStatus, setAlertStatus] = useState<'sending' | 'sent' | 'error'>('sending');
  const [contactsNotified, setContactsNotified] = useState<string[]>([]);
  const [isCallInitiated, setIsCallInitiated] = useState(false);
  const [primaryContactName, setPrimaryContactName] = useState<string>('');
  const { startRecording, stopRecording, isRecording } = useAudioRecording();

  const createAlertMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/emergency-trigger', {
        latitude: location?.coords.latitude || null,
        longitude: location?.coords.longitude || null,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAlertStatus('sent');
      setContactsNotified([data.primaryContact.phone]);
      setPrimaryContactName(data.primaryContact.name);
      
      // Automatically call the primary contact after SMS
      setTimeout(() => {
        setIsCallInitiated(true);
        initiateCall(data.primaryContact.phone);
      }, 2000);
    },
    onError: () => {
      setAlertStatus('error');
    },
  });

  const initiateCall = (phoneNumber: string) => {
    try {
      console.log(`📞 Initiating call to ${phoneNumber}`);
      
      // Create a tel: link to initiate the call
      const telLink = `tel:${phoneNumber}`;
      
      // Try to open the tel link
      if (window.location.href.includes('replit.app') || window.location.href.includes('localhost')) {
        // In development/web environment, show a notification
        console.log(`🔔 Would call ${phoneNumber} in mobile environment`);
        alert(`Calling ${phoneNumber}...`);
      } else {
        // In mobile environment, actually initiate the call
        window.location.href = telLink;
      }
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAlertStatus('sending');
      setContactsNotified([]);
      setIsCallInitiated(false);
      setPrimaryContactName('');
      
      // Start emergency sequence
      emergencyService.triggerEmergency();
      
      // Start audio recording
      startRecording();
      
      // Stop recording after 10 seconds
      setTimeout(() => {
        stopRecording();
      }, 10000);
      
      // Create alert in database
      createAlertMutation.mutate();
    }
  }, [isOpen]);

  const handleCancel = () => {
    stopRecording();
    emergencyService.cancelEmergency();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-emergency rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-exclamation text-white text-2xl"></i>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {alertStatus === 'sent' ? 'Emergency Alert Sent!' : 
             alertStatus === 'error' ? 'Alert Failed' : 'Sending Emergency Alert...'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {alertStatus === 'sent' ? 
              'Your location and alert have been sent to emergency contacts.' :
             alertStatus === 'error' ?
              'There was an error sending your alert. Please try again.' :
              'Gathering your information and notifying emergency contacts...'}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <i className={`fas fa-map-marker-alt ${location ? 'text-success' : 'text-warning'}`}></i>
              <span className={location ? 'text-success' : 'text-warning'}>
                Location: {location ? 'Acquired' : 'Getting location...'}
              </span>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <i className={`fas fa-microphone ${isRecording ? 'text-success animate-pulse' : 'text-gray-400'}`}></i>
              <span className={isRecording ? 'text-success' : 'text-gray-500'}>
                Audio: {isRecording ? 'Recording...' : 'Ready'}
              </span>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <i className={`fas fa-mobile-alt ${
                alertStatus === 'sent' ? 'text-success' : 
                alertStatus === 'error' ? 'text-emergency' : 'text-warning'
              }`}></i>
              <span className={
                alertStatus === 'sent' ? 'text-success' : 
                alertStatus === 'error' ? 'text-emergency' : 'text-warning'
              }>
                SMS: {alertStatus === 'sent' ? `Sent to ${contactsNotified.length} contacts` : 
                      alertStatus === 'error' ? 'Failed' : 'Sending...'}
              </span>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <i className="fas fa-volume-up text-success"></i>
              <span className="text-success">Siren: Active</span>
            </div>
            
            {isCallInitiated && (
              <div className="flex items-center justify-center space-x-2">
                <i className="fas fa-phone text-blue-600 animate-pulse"></i>
                <span className="text-blue-600">
                  Calling {primaryContactName}...
                </span>
              </div>
            )}
          </div>

          {alertStatus === 'sent' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                Emergency alert sent to {primaryContactName}!
              </p>
              <p className="text-xs text-green-600 mt-1">
                SMS sent with your location. {isCallInitiated ? 'Initiating call...' : 'Calling will start in 2 seconds.'}
              </p>
            </div>
          )}

          <Button 
            onClick={handleCancel}
            variant="secondary"
            className="w-full mt-6"
          >
            Cancel Alert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
