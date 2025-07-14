import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function ProjectDownload() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateProjectZip = async () => {
    setIsGenerating(true);
    
    try {
      // Get all project files
      const response = await fetch('/api/project-files');
      const files = await response.json();
      
      // Create a zip file containing all project files
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      
      // Add all files to zip
      for (const file of files) {
        const fileResponse = await fetch(`/api/project-files/${encodeURIComponent(file.path)}`);
        const content = await fileResponse.text();
        zip.file(file.path, content);
      }
      
      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safeguard-women-safety-app-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your project files are being downloaded as a ZIP file.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate project download. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateManualDownload = () => {
    // Create a simple text file with project structure and key files
    const projectInfo = `
# SafeGuard - Women Safety App

## Project Structure
- client/src/ - React frontend application
- server/ - Express.js backend server
- shared/ - Shared TypeScript types and schemas
- components.json - UI component configuration
- package.json - Dependencies and scripts

## Key Features
- Emergency SOS button with shake detection
- GPS location tracking with automatic updates
- Primary emergency contact management
- SMS alerts and automatic calling
- Audio recording during emergencies
- Progressive Web App (PWA) capabilities

## Setup Instructions
1. Install dependencies: npm install
2. Start development server: npm run dev
3. Access app at: http://localhost:5000

## Emergency Features
- Shake detection (3 shakes triggers SOS)
- Automatic location updates every 30 minutes
- E.164 international phone number validation
- Primary contact SMS + automatic calling
- Audio recording for 10 seconds
- Siren and flashlight activation

## Technologies Used
- React 18 with TypeScript
- Express.js server
- TanStack Query for state management
- Tailwind CSS for styling
- Radix UI components
- Drizzle ORM for database operations

Generated on: ${new Date().toISOString()}
`;

    const blob = new Blob([projectInfo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safeguard-project-info-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Project Info Downloaded",
      description: "Project information and setup instructions have been downloaded.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <i className="fas fa-download mr-2"></i>
          Download Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Download Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Download project details, setup instructions, and feature overview.
              </p>
              <Button 
                onClick={generateManualDownload}
                className="w-full"
                variant="outline"
              >
                <i className="fas fa-file-text mr-2"></i>
                Download Project Info
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Full Source Code</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Download complete source code as ZIP file (requires backend support).
              </p>
              <Button 
                onClick={generateProjectZip}
                disabled={isGenerating}
                className="w-full"
              >
                <i className={`fas ${isGenerating ? 'fa-spinner animate-spin' : 'fa-file-archive'} mr-2`}></i>
                {isGenerating ? 'Generating ZIP...' : 'Download Full Project'}
              </Button>
            </CardContent>
          </Card>

          <div className="text-xs text-gray-500 text-center">
            Note: The full source code download requires additional backend configuration.
            The project info download is always available.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}