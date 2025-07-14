import { 
  emergencyContacts, 
  emergencyAlerts, 
  appSettings,
  type EmergencyContact, 
  type InsertEmergencyContact,
  type EmergencyAlert,
  type InsertEmergencyAlert,
  type AppSettings,
  type InsertAppSettings
} from "@shared/schema";

export interface IStorage {
  // Emergency Contacts
  getEmergencyContacts(): Promise<EmergencyContact[]>;
  getEmergencyContact(id: number): Promise<EmergencyContact | undefined>;
  getPrimaryEmergencyContact(): Promise<EmergencyContact | undefined>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: number, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined>;
  deleteEmergencyContact(id: number): Promise<boolean>;
  
  // Emergency Alerts
  getEmergencyAlerts(): Promise<EmergencyAlert[]>;
  createEmergencyAlert(alert: InsertEmergencyAlert): Promise<EmergencyAlert>;
  updateEmergencyAlert(id: number, alert: Partial<InsertEmergencyAlert>): Promise<EmergencyAlert | undefined>;
  
  // App Settings
  getAppSettings(): Promise<AppSettings>;
  updateAppSettings(settings: Partial<InsertAppSettings>): Promise<AppSettings>;
}

export class MemStorage implements IStorage {
  private contacts: Map<number, EmergencyContact>;
  private alerts: Map<number, EmergencyAlert>;
  private settings: AppSettings;
  private currentContactId: number;
  private currentAlertId: number;

  constructor() {
    this.contacts = new Map();
    this.alerts = new Map();
    this.currentContactId = 1;
    this.currentAlertId = 1;
    
    // Initialize with default settings
    this.settings = {
      id: 1,
      shakeDetectionEnabled: true,
      audioRecordingEnabled: true,
      flashlightEnabled: true,
      sirenEnabled: true,
      emergencyMessage: "Emergency! I need help. My location:",
    };

    // Initialize with sample emergency contacts
    this.initializeDefaultContacts();
  }

  private initializeDefaultContacts() {
    const defaultContacts: InsertEmergencyContact[] = [
      {
        name: "Primary Contact",
        phone: "+923001234567",
        relationship: "Family",
        isPrimary: true,
        isActive: true,
      },
      {
        name: "Secondary Contact", 
        phone: "+919876543210",
        relationship: "Friend",
        isPrimary: false,
        isActive: true,
      },
      {
        name: "Third Contact",
        phone: "+15553456789", 
        relationship: "Emergency",
        isPrimary: false,
        isActive: true,
      }
    ];

    defaultContacts.forEach(contact => {
      this.createEmergencyContact(contact);
    });
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return Array.from(this.contacts.values()).filter(contact => contact.isActive);
  }

  async getEmergencyContact(id: number): Promise<EmergencyContact | undefined> {
    return this.contacts.get(id);
  }

  async getPrimaryEmergencyContact(): Promise<EmergencyContact | undefined> {
    return Array.from(this.contacts.values()).find(contact => contact.isPrimary && contact.isActive);
  }

  async createEmergencyContact(contactData: InsertEmergencyContact): Promise<EmergencyContact> {
    const id = this.currentContactId++;
    const contact: EmergencyContact = {
      ...contactData,
      id,
      createdAt: new Date(),
      relationship: contactData.relationship || null,
      isPrimary: contactData.isPrimary || false,
      isActive: contactData.isActive !== undefined ? contactData.isActive : true,
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateEmergencyContact(id: number, contactData: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined> {
    const existingContact = this.contacts.get(id);
    if (!existingContact) return undefined;
    
    const updatedContact: EmergencyContact = {
      ...existingContact,
      ...contactData,
    };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteEmergencyContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  async getEmergencyAlerts(): Promise<EmergencyAlert[]> {
    return Array.from(this.alerts.values());
  }

  async createEmergencyAlert(alertData: InsertEmergencyAlert): Promise<EmergencyAlert> {
    const id = this.currentAlertId++;
    const alert: EmergencyAlert = {
      ...alertData,
      id,
      timestamp: new Date(),
      status: alertData.status || "active",
      latitude: alertData.latitude || null,
      longitude: alertData.longitude || null,
      audioRecordingPath: alertData.audioRecordingPath || null,
      contactsNotified: alertData.contactsNotified || null,
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateEmergencyAlert(id: number, alertData: Partial<InsertEmergencyAlert>): Promise<EmergencyAlert | undefined> {
    const existingAlert = this.alerts.get(id);
    if (!existingAlert) return undefined;
    
    const updatedAlert: EmergencyAlert = {
      ...existingAlert,
      ...alertData,
    };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async getAppSettings(): Promise<AppSettings> {
    return this.settings;
  }

  async updateAppSettings(settingsData: Partial<InsertAppSettings>): Promise<AppSettings> {
    this.settings = {
      ...this.settings,
      ...settingsData,
    };
    return this.settings;
  }
}

export const storage = new MemStorage();
