import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmergencyContactSchema, insertEmergencyAlertSchema, insertAppSettingsSchema } from "@shared/schema";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Emergency Contacts Routes
  app.get("/api/emergency-contacts", async (req, res) => {
    try {
      const contacts = await storage.getEmergencyContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  app.get("/api/primary-contact", async (req, res) => {
    try {
      const primaryContact = await storage.getPrimaryEmergencyContact();
      res.json(primaryContact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch primary contact" });
    }
  });

  app.post("/api/emergency-contacts", async (req, res) => {
    try {
      const contactData = insertEmergencyContactSchema.parse(req.body);
      const contact = await storage.createEmergencyContact(contactData);
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create emergency contact" });
      }
    }
  });

  app.put("/api/emergency-contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contactData = insertEmergencyContactSchema.partial().parse(req.body);
      const contact = await storage.updateEmergencyContact(id, contactData);
      
      if (!contact) {
        res.status(404).json({ message: "Emergency contact not found" });
        return;
      }
      
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update emergency contact" });
      }
    }
  });

  app.delete("/api/emergency-contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEmergencyContact(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Emergency contact not found" });
        return;
      }
      
      res.json({ message: "Emergency contact deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete emergency contact" });
    }
  });

  // Emergency Alerts Routes
  app.get("/api/emergency-alerts", async (req, res) => {
    try {
      const alerts = await storage.getEmergencyAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency alerts" });
    }
  });

  app.post("/api/emergency-alerts", async (req, res) => {
    try {
      const alertData = insertEmergencyAlertSchema.parse(req.body);
      const alert = await storage.createEmergencyAlert(alertData);
      
      // Simulate SMS sending to emergency contacts
      const contacts = await storage.getEmergencyContacts();
      const contactsNotified = contacts.map(contact => contact.phone);
      
      await storage.updateEmergencyAlert(alert.id, { 
        contactsNotified: contactsNotified 
      });
      
      res.json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create emergency alert" });
      }
    }
  });

  app.put("/api/emergency-alerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alertData = insertEmergencyAlertSchema.partial().parse(req.body);
      const alert = await storage.updateEmergencyAlert(id, alertData);
      
      if (!alert) {
        res.status(404).json({ message: "Emergency alert not found" });
        return;
      }
      
      res.json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update emergency alert" });
      }
    }
  });

  // App Settings Routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAppSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch app settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settingsData = insertAppSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateAppSettings(settingsData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update app settings" });
      }
    }
  });

  // SMS Simulation Route
  app.post("/api/send-sms", async (req, res) => {
    try {
      const { phone, message } = req.body;
      
      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`📱 SMS Sent to ${phone}: ${message}`);
      
      res.json({ 
        success: true, 
        message: "SMS sent successfully",
        phone,
        sentAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send SMS" });
    }
  });

  // Emergency Trigger Route
  app.post("/api/emergency-trigger", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      
      // Get primary contact
      const primaryContact = await storage.getPrimaryEmergencyContact();
      
      if (!primaryContact) {
        return res.status(400).json({ message: "No primary contact configured" });
      }

      // Create emergency alert
      const alertData = {
        latitude: latitude || null,
        longitude: longitude || null,
        status: 'active' as const,
        contactsNotified: [primaryContact.phone],
      };
      
      const alert = await storage.createEmergencyAlert(alertData);
      
      // Send immediate SMS to primary contact
      const locationText = latitude && longitude 
        ? `https://maps.google.com/maps?q=${latitude},${longitude}`
        : 'Location unavailable';
      
      const message = `🚨 EMERGENCY ALERT: I need help! My current location: ${locationText}. Please contact me immediately or call emergency services.`;

      // Send SMS
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate SMS delay
      console.log(`🚨 EMERGENCY SMS to ${primaryContact.phone}: ${message}`);
      
      res.json({
        success: true,
        alert,
        primaryContact,
        smsSent: true,
        message: "Emergency alert sent to primary contact"
      });
    } catch (error) {
      console.error("Emergency trigger error:", error);
      res.status(500).json({ message: "Failed to trigger emergency alert" });
    }
  });

  // Project Download Routes
  app.get("/api/project-files", async (req, res) => {
    try {
      const projectRoot = path.resolve(".");
      const files: { path: string; size: number }[] = [];
      
      const scanDirectory = (dir: string, basePath: string = "") => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.join(basePath, entry.name);
          
          // Skip node_modules, .git, dist, and other irrelevant directories
          if (entry.isDirectory() && !['node_modules', '.git', 'dist', '.replit', '.cache'].includes(entry.name)) {
            scanDirectory(fullPath, relativePath);
          } else if (entry.isFile()) {
            const stats = fs.statSync(fullPath);
            files.push({
              path: relativePath,
              size: stats.size
            });
          }
        }
      };
      
      scanDirectory(projectRoot);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to scan project files" });
    }
  });

  app.get("/api/project-files/:path(*)", async (req, res) => {
    try {
      const filePath = decodeURIComponent(req.params.path);
      const fullPath = path.resolve(".", filePath);
      
      // Security check: ensure the file is within the project directory
      if (!fullPath.startsWith(path.resolve("."))) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
      
      if (!fs.existsSync(fullPath)) {
        res.status(404).json({ message: "File not found" });
        return;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      res.type('text/plain').send(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to read file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
