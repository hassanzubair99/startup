import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  relationship: text("relationship"),
  isPrimary: boolean("is_primary").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyAlerts = pgTable("emergency_alerts", {
  id: serial("id").primaryKey(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  timestamp: timestamp("timestamp").defaultNow(),
  audioRecordingPath: text("audio_recording_path"),
  status: text("status").default("active"), // active, cancelled, resolved
  contactsNotified: text("contacts_notified").array(),
});

export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  shakeDetectionEnabled: boolean("shake_detection_enabled").default(true),
  audioRecordingEnabled: boolean("audio_recording_enabled").default(true),
  flashlightEnabled: boolean("flashlight_enabled").default(true),
  sirenEnabled: boolean("siren_enabled").default(true),
  emergencyMessage: text("emergency_message").default("Emergency! I need help. My location:"),
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({
  id: true,
  createdAt: true,
}).extend({
  phone: z.string().regex(
    /^\+[1-9]\d{1,14}$/,
    "Phone number must be in E.164 international format (e.g., +92123456789)"
  ),
});

export const insertEmergencyAlertSchema = createInsertSchema(emergencyAlerts).omit({
  id: true,
  timestamp: true,
});

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({
  id: true,
});

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;
export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
