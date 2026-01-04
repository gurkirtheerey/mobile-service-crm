// Core data types for Mobile Service CRM

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  geocode?: GeoLocation;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  preferredContactMethod: 'sms' | 'email' | 'phone';
}

export interface Client {
  id: string;
  contactInfo: ContactInfo;
  serviceAddress: Address;
  billingAddress?: Address;
  assignedZone: string;
  customFields: Record<string, unknown>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Zone {
  id: string;
  name: string;
  assignedDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  serviceArea: {
    type: 'radius' | 'polygon';
    center: GeoLocation;
    radiusMiles: number;
  };
  capacity: {
    maxAppointmentsPerDay: number;
    averageServiceDurationMinutes: number;
    travelTimeBufferMinutes: number;
  };
  color: string; // For UI display
  teamAssignment?: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  clientId: string;
  client?: Client; // Populated when needed
  serviceId: string;
  service?: Service; // Populated when needed
  scheduledStart: string;
  scheduledEnd: string;
  assignedTechnician?: string;
  status: AppointmentStatus;
  zone: string;
  weatherFlagged: boolean;
  notes?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingModifier {
  type: string;
  options: {
    label: string;
    multiplier: number;
  }[];
}

export interface ServiceAddOn {
  id: string;
  name: string;
  price: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  basePrice: number;
  pricingModifiers?: PricingModifier[];
  addOns?: ServiceAddOn[];
  weatherDependent: boolean;
  active: boolean;
}

export interface BusinessConfig {
  id: string;
  name: string;
  serviceType: string;
  serviceArea: string;
  zones: Zone[];
  serviceCatalog: Service[];
  customFieldDefinitions: CustomFieldDefinition[];
  featuresEnabled: {
    zoneScheduling: boolean;
    paymentProcessing: boolean;
    smsNotifications: boolean;
    weatherAlerts: boolean;
    photoDocumentation: boolean;
    recurringAppointments: boolean;
    teamManagement: boolean;
    secureVault: boolean;
    inventoryTracking: boolean;
    customerPortal: boolean;
  };
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'date' | 'group';
  label: string;
  description?: string;
  required?: boolean;
  options?: string[]; // For select type
  fields?: CustomFieldDefinition[]; // For group type
}

// Dashboard stats
export interface DashboardStats {
  totalClients: number;
  todayAppointments: number;
  weekRevenue: number;
  completionRate: number;
}
