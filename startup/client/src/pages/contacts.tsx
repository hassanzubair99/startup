import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ContactForm from "@/components/contact-form";
import { EmergencyContact } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Contacts() {
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: contacts = [], isLoading } = useQuery<EmergencyContact[]>({
    queryKey: ['/api/emergency-contacts'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/emergency-contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
      toast({
        title: "Contact Deleted",
        description: "Emergency contact has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingContact(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this emergency contact?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingContact(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-address-book text-blue-600 text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Emergency Contacts</h1>
                <p className="text-sm text-gray-600">{contacts.length}/3 contacts added</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        
        {/* Add Contact Button */}
        {contacts.length < 3 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full py-6 text-lg"
                    onClick={handleAdd}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Emergency Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                    </DialogTitle>
                  </DialogHeader>
                  <ContactForm 
                    contact={editingContact}
                    onSuccess={handleFormSuccess}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Contacts List */}
        <div className="space-y-4">
          {contacts.map((contact, index) => (
            <Card key={contact.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    contact.isPrimary ? 'bg-red-100' : 
                    index === 1 ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    <i className={`fas fa-user ${
                      contact.isPrimary ? 'text-red-600' :
                      index === 1 ? 'text-blue-600' : 'text-purple-600'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{contact.name}</h3>
                      {contact.isPrimary && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                    {contact.relationship && (
                      <p className="text-xs text-gray-500">{contact.relationship}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {contacts.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-address-book text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Emergency Contacts</h3>
              <p className="text-gray-600 mb-4">
                Add up to 3 emergency contacts who will be notified during an emergency.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAdd}>
                    <i className="fas fa-plus mr-2"></i>
                    Add Your First Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>Add Emergency Contact</DialogTitle>
                  </DialogHeader>
                  <ContactForm 
                    contact={null}
                    onSuccess={handleFormSuccess}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Full Contacts Notice */}
        {contacts.length >= 3 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Contacts Added</h3>
              <p className="text-gray-600">
                You have added the maximum of 3 emergency contacts. You can edit or remove existing contacts if needed.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
