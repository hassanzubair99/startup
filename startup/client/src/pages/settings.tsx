import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AppSettings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ProjectDownload from "@/components/project-download";

export default function Settings() {
  const { toast } = useToast();
  const [emergencyMessage, setEmergencyMessage] = useState("");

  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: ['/api/settings'],
    onSuccess: (data) => {
      setEmergencyMessage(data.emergencyMessage || "");
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<AppSettings>) => {
      const response = await apiRequest('PUT', '/api/settings', newSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (setting: keyof AppSettings, value: boolean) => {
    updateSettingsMutation.mutate({ [setting]: value });
  };

  const handleMessageUpdate = () => {
    updateSettingsMutation.mutate({ emergencyMessage });
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm h-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-cog text-purple-600 text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Configure app preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        
        {/* Emergency Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Emergency Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Shake Detection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-mobile-alt text-orange-600"></i>
                </div>
                <div>
                  <Label className="font-medium text-gray-900">Shake Detection</Label>
                  <p className="text-sm text-gray-600">3 shakes to trigger SOS</p>
                </div>
              </div>
              <Switch
                checked={settings.shakeDetectionEnabled}
                onCheckedChange={(checked) => handleToggle('shakeDetectionEnabled', checked)}
              />
            </div>

            {/* Audio Recording */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-microphone text-red-600"></i>
                </div>
                <div>
                  <Label className="font-medium text-gray-900">Audio Recording</Label>
                  <p className="text-sm text-gray-600">10 seconds during emergency</p>
                </div>
              </div>
              <Switch
                checked={settings.audioRecordingEnabled}
                onCheckedChange={(checked) => handleToggle('audioRecordingEnabled', checked)}
              />
            </div>

            {/* Flashlight */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-flashlight text-yellow-600"></i>
                </div>
                <div>
                  <Label className="font-medium text-gray-900">Auto Flashlight</Label>
                  <p className="text-sm text-gray-600">Turn on during SOS</p>
                </div>
              </div>
              <Switch
                checked={settings.flashlightEnabled}
                onCheckedChange={(checked) => handleToggle('flashlightEnabled', checked)}
              />
            </div>

            {/* Siren Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-volume-up text-indigo-600"></i>
                </div>
                <div>
                  <Label className="font-medium text-gray-900">Siren Sound</Label>
                  <p className="text-sm text-gray-600">Play alert sound</p>
                </div>
              </div>
              <Switch
                checked={settings.sirenEnabled}
                onCheckedChange={(checked) => handleToggle('sirenEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Message */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Emergency Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="emergency-message" className="text-sm font-medium text-gray-700">
                Custom message sent with location
              </Label>
              <Textarea
                id="emergency-message"
                value={emergencyMessage}
                onChange={(e) => setEmergencyMessage(e.target.value)}
                placeholder="Emergency! I need help. My location:"
                className="mt-2"
                rows={3}
              />
            </div>
            <Button 
              onClick={handleMessageUpdate}
              disabled={updateSettingsMutation.isPending}
              className="w-full"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Message"}
            </Button>
          </CardContent>
        </Card>

        {/* Project Download Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Project Download</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-download text-blue-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Download Source Code</p>
                  <p className="text-sm text-gray-600">Get the complete project files</p>
                </div>
              </div>
              <ProjectDownload />
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">January 2024</span>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 text-center">
                SafeGuard is designed to help ensure your safety in emergency situations. 
                Always contact local emergency services (911) for immediate assistance.
              </p>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
