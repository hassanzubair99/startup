import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ContactForm from "@/components/contact-form";
import { EmergencyContact } from "@shared/schema";

export default function PrimaryContactCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: primaryContact, isLoading } = useQuery<EmergencyContact>({
    queryKey: ['/api/primary-contact'],
  });

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Primary Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Primary Emergency Contact
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <i className="fas fa-edit mr-2"></i>
                {primaryContact ? 'Edit' : 'Set'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>
                  {primaryContact ? 'Edit Primary Contact' : 'Set Primary Contact'}
                </DialogTitle>
              </DialogHeader>
              <ContactForm 
                contact={primaryContact ? { ...primaryContact, isPrimary: true } : null}
                onSuccess={handleFormSuccess}
              />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {primaryContact ? (
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i className="fas fa-user-shield text-red-600 text-xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{primaryContact.name}</h3>
              <p className="text-sm text-gray-600">{primaryContact.phone}</p>
              {primaryContact.relationship && (
                <p className="text-xs text-gray-500">{primaryContact.relationship}</p>
              )}
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-green-600 text-xs"></i>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-user-plus text-gray-400 text-xl"></i>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No Primary Contact Set</h3>
            <p className="text-xs text-gray-600 mb-3">
              Set a primary contact for immediate emergency alerts
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emergency hover:bg-red-700">
                  <i className="fas fa-plus mr-2"></i>
                  Set Primary Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle>Set Primary Contact</DialogTitle>
                </DialogHeader>
                <ContactForm 
                  contact={null}
                  onSuccess={handleFormSuccess}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}