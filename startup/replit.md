# SafeGuard - Women Safety App

## Overview

SafeGuard is a comprehensive women's safety application built as a Progressive Web App (PWA) with emergency SOS features, location tracking, and emergency contact management. The application provides immediate help capabilities through shake detection, audio recording, flashlight activation, and automated emergency contact notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **Middleware**: Express middleware for request logging and error handling

### Mobile-First Design
- **PWA Features**: Service worker ready, mobile-optimized viewport
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces
- **Device APIs**: Geolocation, Device Motion, Media (microphone), and Web Audio APIs

## Key Components

### Emergency System
- **SOS Button**: Large, prominent button for immediate emergency activation
- **Shake Detection**: Uses Device Motion API to detect shake gestures for hands-free activation
- **Audio Recording**: Automatic audio recording during emergencies using Web Audio API
- **Location Tracking**: Real-time GPS coordinate capture and sharing
- **Emergency Alerts**: Automated SMS-like notifications to emergency contacts

### Contact Management
- **Emergency Contacts**: CRUD operations for managing emergency contact list
- **Contact Validation**: Phone number validation and relationship tracking
- **Primary Contact**: Designation of primary emergency contact for priority notifications

### Settings & Configuration
- **Feature Toggles**: Enable/disable shake detection, audio recording, flashlight, and siren
- **Custom Messages**: Configurable emergency message templates
- **Accessibility**: High contrast emergency colors and large touch targets

### User Interface
- **Bottom Navigation**: Fixed navigation for Home, Contacts, and Settings
- **Status Cards**: Real-time system status indicators
- **Emergency Modal**: Full-screen emergency interface during active alerts
- **Form Components**: Reusable form components with validation

## Data Flow

### Emergency Activation Flow
1. User triggers SOS (button press, shake detection, or manual activation)
2. System captures current GPS location
3. Audio recording begins automatically (if enabled)
4. Emergency alert record created in database
5. SMS notifications sent to all emergency contacts
6. Visual and audio feedback provided to user
7. Emergency services can be contacted if needed

### Contact Management Flow
1. User adds/edits emergency contacts through form interface
2. Data validated on client-side using Zod schemas
3. API request sent to server with contact information
4. Server validates and stores contact in database
5. Client state updated via React Query cache invalidation

### Settings Synchronization
1. User modifies app settings through toggle switches
2. Settings immediately sent to server for persistence
3. Local state updated for instant UI feedback
4. Settings applied to emergency system components

## External Dependencies

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Provider**: Configured for Neon Database (serverless PostgreSQL)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Uses connection pooling via Neon serverless driver

### UI Libraries
- **Radix UI**: Comprehensive set of accessible React components
- **shadcn/ui**: Pre-styled component system built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **Font Awesome**: Additional icons for emergency and navigation elements

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **ESLint**: Code quality and consistency
- **Vite Plugins**: Runtime error overlay and development enhancements
- **Path Aliases**: Simplified imports using @ and @shared prefixes

### Browser APIs
- **Geolocation API**: GPS coordinate access
- **Device Motion API**: Shake detection on mobile devices
- **Media Devices API**: Microphone access for audio recording
- **Web Audio API**: Siren sound generation and audio processing

## Deployment Strategy

### Build Process
- **Client Build**: Vite builds React app to `dist/public` directory
- **Server Build**: ESBuild bundles Express server to `dist/index.js`
- **Type Checking**: TypeScript compilation verification before deployment

### Environment Configuration
- **Development**: Hot module replacement with Vite dev server
- **Production**: Static file serving with Express for SPA routing
- **Database**: Environment variable-based connection to PostgreSQL
- **Replit Integration**: Special handling for Replit development environment

### Progressive Web App
- **Manifest**: PWA configuration for mobile installation
- **Service Worker**: Prepared for offline functionality
- **Mobile Optimization**: Apple touch icon and status bar styling
- **Theme Colors**: Emergency red primary color for brand recognition

### Security Considerations
- **Input Validation**: Zod schemas on both client and server
- **CORS**: Configured for secure cross-origin requests
- **Rate Limiting**: Prepared for API rate limiting implementation
- **Data Privacy**: Local storage of emergency contacts with secure transmission

## Recent Changes

### January 14, 2025 - Enhanced Emergency Features & E.164 Phone Support
- **Primary Contact System**: Added dedicated primary emergency contact management
- **Immediate SMS + Auto-Call**: Emergency triggers now send SMS and automatically call primary contact
- **E.164 Phone Validation**: Enforced international E.164 phone number format (e.g., +92123456789)
- **Emergency API**: Created `/api/emergency-trigger` endpoint for immediate emergency response
- **Primary Contact API**: Added `/api/primary-contact` endpoint for primary contact management
- **Enhanced Emergency Modal**: Shows real-time SMS and calling status during emergencies
- **Primary Contact Card**: Added prominent primary contact display on home screen
- **Auto-Call Integration**: Automatically initiates phone call after SMS via tel: links
- **Automatic Location Tracking**: Location updates every 30 minutes in background with real-time countdown
- **Project Download Feature**: Added full project download capability with ZIP file generation
- **Location Tracking Status**: Real-time display of tracking status and next update countdown
- **Improved User Experience**: Better status indicators and emergency workflow feedback
- **Type Safety**: Fixed TypeScript issues in storage layer for better code reliability