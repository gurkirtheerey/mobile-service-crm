import type { Client, Zone, Appointment, Service, DashboardStats } from '@/types';

// Helper to get dates relative to today
const today = new Date();
const formatDate = (date: Date) => date.toISOString();

const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d;
};

const setTime = (date: Date, hours: number, minutes: number = 0) => {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// Zones
export const zones: Zone[] = [
  {
    id: 'zone_north',
    name: 'North District',
    assignedDays: [1, 3], // Monday, Wednesday
    serviceArea: {
      type: 'radius',
      center: { lat: 38.62, lng: -121.30 },
      radiusMiles: 6,
    },
    capacity: {
      maxAppointmentsPerDay: 6,
      averageServiceDurationMinutes: 90,
      travelTimeBufferMinutes: 15,
    },
    color: '#3B82F6', // blue
  },
  {
    id: 'zone_south',
    name: 'South District',
    assignedDays: [2, 4], // Tuesday, Thursday
    serviceArea: {
      type: 'radius',
      center: { lat: 38.52, lng: -121.49 },
      radiusMiles: 6,
    },
    capacity: {
      maxAppointmentsPerDay: 6,
      averageServiceDurationMinutes: 90,
      travelTimeBufferMinutes: 15,
    },
    color: '#10B981', // green
  },
  {
    id: 'zone_east',
    name: 'East District',
    assignedDays: [1, 4], // Monday, Thursday
    serviceArea: {
      type: 'radius',
      center: { lat: 38.58, lng: -121.40 },
      radiusMiles: 5,
    },
    capacity: {
      maxAppointmentsPerDay: 5,
      averageServiceDurationMinutes: 90,
      travelTimeBufferMinutes: 15,
    },
    color: '#F59E0B', // amber
  },
  {
    id: 'zone_west',
    name: 'West District',
    assignedDays: [2, 5], // Tuesday, Friday
    serviceArea: {
      type: 'radius',
      center: { lat: 38.58, lng: -121.55 },
      radiusMiles: 6,
    },
    capacity: {
      maxAppointmentsPerDay: 6,
      averageServiceDurationMinutes: 90,
      travelTimeBufferMinutes: 15,
    },
    color: '#8B5CF6', // purple
  },
  {
    id: 'zone_central',
    name: 'Central District',
    assignedDays: [3, 5], // Wednesday, Friday
    serviceArea: {
      type: 'radius',
      center: { lat: 38.58, lng: -121.49 },
      radiusMiles: 4,
    },
    capacity: {
      maxAppointmentsPerDay: 8,
      averageServiceDurationMinutes: 90,
      travelTimeBufferMinutes: 10,
    },
    color: '#EF4444', // red
  },
];

// Services
export const services: Service[] = [
  {
    id: 'svc_basic',
    name: 'Basic Service',
    description: 'Standard service package',
    durationMinutes: 60,
    basePrice: 75,
    weatherDependent: false,
    active: true,
  },
  {
    id: 'svc_standard',
    name: 'Standard Service',
    description: 'Comprehensive service with additional care',
    durationMinutes: 90,
    basePrice: 125,
    weatherDependent: false,
    active: true,
  },
  {
    id: 'svc_premium',
    name: 'Premium Service',
    description: 'Full premium treatment with all extras',
    durationMinutes: 120,
    basePrice: 200,
    weatherDependent: true,
    active: true,
  },
  {
    id: 'svc_maintenance',
    name: 'Maintenance Visit',
    description: 'Quick maintenance check and touch-up',
    durationMinutes: 30,
    basePrice: 45,
    weatherDependent: false,
    active: true,
  },
];

// Clients
export const clients: Client[] = [
  {
    id: 'CLT-2024-0001',
    contactInfo: {
      name: 'Sarah Johnson',
      phone: '+1-916-555-0101',
      email: 'sarah.johnson@email.com',
      preferredContactMethod: 'sms',
    },
    serviceAddress: {
      street: '1234 Oak Street',
      city: 'Sacramento',
      state: 'CA',
      zip: '95819',
      geocode: { lat: 38.5816, lng: -121.4944 },
    },
    assignedZone: 'zone_central',
    customFields: {},
    notes: 'Prefers morning appointments',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'CLT-2024-0002',
    contactInfo: {
      name: 'Michael Chen',
      phone: '+1-916-555-0102',
      email: 'mchen@email.com',
      preferredContactMethod: 'email',
    },
    serviceAddress: {
      street: '5678 Maple Avenue',
      city: 'Roseville',
      state: 'CA',
      zip: '95661',
      geocode: { lat: 38.7521, lng: -121.2880 },
    },
    assignedZone: 'zone_north',
    customFields: {},
    createdAt: '2024-02-10T10:30:00Z',
    updatedAt: '2024-02-10T10:30:00Z',
  },
  {
    id: 'CLT-2024-0003',
    contactInfo: {
      name: 'Emily Rodriguez',
      phone: '+1-916-555-0103',
      email: 'emily.r@email.com',
      preferredContactMethod: 'sms',
    },
    serviceAddress: {
      street: '910 Pine Lane',
      city: 'Elk Grove',
      state: 'CA',
      zip: '95624',
      geocode: { lat: 38.4088, lng: -121.3716 },
    },
    assignedZone: 'zone_south',
    customFields: {},
    notes: 'Gate code: 4521',
    createdAt: '2024-03-05T14:00:00Z',
    updatedAt: '2024-03-05T14:00:00Z',
  },
  {
    id: 'CLT-2024-0004',
    contactInfo: {
      name: 'David Thompson',
      phone: '+1-916-555-0104',
      email: 'dthompson@email.com',
      preferredContactMethod: 'phone',
    },
    serviceAddress: {
      street: '2345 Cedar Drive',
      city: 'Folsom',
      state: 'CA',
      zip: '95630',
      geocode: { lat: 38.6780, lng: -121.1761 },
    },
    assignedZone: 'zone_east',
    customFields: {},
    createdAt: '2024-03-20T09:15:00Z',
    updatedAt: '2024-03-20T09:15:00Z',
  },
  {
    id: 'CLT-2024-0005',
    contactInfo: {
      name: 'Lisa Martinez',
      phone: '+1-916-555-0105',
      email: 'lisa.m@email.com',
      preferredContactMethod: 'sms',
    },
    serviceAddress: {
      street: '789 Birch Court',
      city: 'West Sacramento',
      state: 'CA',
      zip: '95691',
      geocode: { lat: 38.5804, lng: -121.5302 },
    },
    assignedZone: 'zone_west',
    customFields: {},
    notes: 'Has two dogs - will be outside during service',
    createdAt: '2024-04-12T11:45:00Z',
    updatedAt: '2024-04-12T11:45:00Z',
  },
  {
    id: 'CLT-2024-0006',
    contactInfo: {
      name: 'James Wilson',
      phone: '+1-916-555-0106',
      email: 'jwilson@email.com',
      preferredContactMethod: 'email',
    },
    serviceAddress: {
      street: '456 Elm Street',
      city: 'Sacramento',
      state: 'CA',
      zip: '95816',
      geocode: { lat: 38.5696, lng: -121.4684 },
    },
    assignedZone: 'zone_central',
    customFields: {},
    createdAt: '2024-05-01T16:00:00Z',
    updatedAt: '2024-05-01T16:00:00Z',
  },
];

// Appointments
export const appointments: Appointment[] = [
  {
    id: 'APT-2024-0001',
    clientId: 'CLT-2024-0001',
    client: clients[0],
    serviceId: 'svc_standard',
    service: services[1],
    scheduledStart: formatDate(setTime(today, 9, 0)),
    scheduledEnd: formatDate(setTime(today, 10, 30)),
    status: 'scheduled',
    zone: 'zone_central',
    weatherFlagged: false,
    totalPrice: 125,
    createdAt: formatDate(addDays(-7)),
    updatedAt: formatDate(addDays(-7)),
  },
  {
    id: 'APT-2024-0002',
    clientId: 'CLT-2024-0002',
    client: clients[1],
    serviceId: 'svc_premium',
    service: services[2],
    scheduledStart: formatDate(setTime(today, 11, 0)),
    scheduledEnd: formatDate(setTime(today, 13, 0)),
    status: 'confirmed',
    zone: 'zone_north',
    weatherFlagged: false,
    totalPrice: 200,
    createdAt: formatDate(addDays(-5)),
    updatedAt: formatDate(addDays(-5)),
  },
  {
    id: 'APT-2024-0003',
    clientId: 'CLT-2024-0003',
    client: clients[2],
    serviceId: 'svc_basic',
    service: services[0],
    scheduledStart: formatDate(setTime(today, 14, 0)),
    scheduledEnd: formatDate(setTime(today, 15, 0)),
    status: 'scheduled',
    zone: 'zone_south',
    weatherFlagged: false,
    totalPrice: 75,
    createdAt: formatDate(addDays(-3)),
    updatedAt: formatDate(addDays(-3)),
  },
  {
    id: 'APT-2024-0004',
    clientId: 'CLT-2024-0004',
    client: clients[3],
    serviceId: 'svc_standard',
    service: services[1],
    scheduledStart: formatDate(setTime(addDays(1), 9, 30)),
    scheduledEnd: formatDate(setTime(addDays(1), 11, 0)),
    status: 'scheduled',
    zone: 'zone_east',
    weatherFlagged: false,
    totalPrice: 125,
    createdAt: formatDate(addDays(-2)),
    updatedAt: formatDate(addDays(-2)),
  },
  {
    id: 'APT-2024-0005',
    clientId: 'CLT-2024-0005',
    client: clients[4],
    serviceId: 'svc_premium',
    service: services[2],
    scheduledStart: formatDate(setTime(addDays(1), 13, 0)),
    scheduledEnd: formatDate(setTime(addDays(1), 15, 0)),
    status: 'confirmed',
    zone: 'zone_west',
    weatherFlagged: true,
    notes: 'Weather alert: possible rain',
    totalPrice: 200,
    createdAt: formatDate(addDays(-1)),
    updatedAt: formatDate(addDays(-1)),
  },
  {
    id: 'APT-2024-0006',
    clientId: 'CLT-2024-0006',
    client: clients[5],
    serviceId: 'svc_maintenance',
    service: services[3],
    scheduledStart: formatDate(setTime(addDays(2), 10, 0)),
    scheduledEnd: formatDate(setTime(addDays(2), 10, 30)),
    status: 'scheduled',
    zone: 'zone_central',
    weatherFlagged: false,
    totalPrice: 45,
    createdAt: formatDate(addDays(-1)),
    updatedAt: formatDate(addDays(-1)),
  },
  {
    id: 'APT-2024-0007',
    clientId: 'CLT-2024-0001',
    client: clients[0],
    serviceId: 'svc_basic',
    service: services[0],
    scheduledStart: formatDate(setTime(addDays(-1), 9, 0)),
    scheduledEnd: formatDate(setTime(addDays(-1), 10, 0)),
    status: 'completed',
    zone: 'zone_central',
    weatherFlagged: false,
    totalPrice: 75,
    createdAt: formatDate(addDays(-8)),
    updatedAt: formatDate(addDays(-1)),
  },
  {
    id: 'APT-2024-0008',
    clientId: 'CLT-2024-0002',
    client: clients[1],
    serviceId: 'svc_standard',
    service: services[1],
    scheduledStart: formatDate(setTime(addDays(-2), 14, 0)),
    scheduledEnd: formatDate(setTime(addDays(-2), 15, 30)),
    status: 'completed',
    zone: 'zone_north',
    weatherFlagged: false,
    totalPrice: 125,
    createdAt: formatDate(addDays(-10)),
    updatedAt: formatDate(addDays(-2)),
  },
  {
    id: 'APT-2024-0009',
    clientId: 'CLT-2024-0003',
    client: clients[2],
    serviceId: 'svc_premium',
    service: services[2],
    scheduledStart: formatDate(setTime(addDays(-3), 11, 0)),
    scheduledEnd: formatDate(setTime(addDays(-3), 13, 0)),
    status: 'completed',
    zone: 'zone_south',
    weatherFlagged: false,
    totalPrice: 200,
    createdAt: formatDate(addDays(-12)),
    updatedAt: formatDate(addDays(-3)),
  },
  {
    id: 'APT-2024-0010',
    clientId: 'CLT-2024-0004',
    client: clients[3],
    serviceId: 'svc_basic',
    service: services[0],
    scheduledStart: formatDate(setTime(addDays(-4), 15, 0)),
    scheduledEnd: formatDate(setTime(addDays(-4), 16, 0)),
    status: 'cancelled',
    zone: 'zone_east',
    weatherFlagged: false,
    notes: 'Client cancelled - reschedule requested',
    totalPrice: 75,
    createdAt: formatDate(addDays(-14)),
    updatedAt: formatDate(addDays(-4)),
  },
];

// Dashboard stats
export const dashboardStats: DashboardStats = {
  totalClients: clients.length,
  todayAppointments: appointments.filter(
    (apt) =>
      new Date(apt.scheduledStart).toDateString() === today.toDateString() &&
      apt.status !== 'cancelled'
  ).length,
  weekRevenue: appointments
    .filter(
      (apt) =>
        apt.status === 'completed' &&
        new Date(apt.scheduledStart) >= addDays(-7)
    )
    .reduce((sum, apt) => sum + apt.totalPrice, 0),
  completionRate: 92,
};

// Helper functions
export function getClientById(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function getAppointmentsByClientId(clientId: string): Appointment[] {
  return appointments.filter((apt) => apt.clientId === clientId);
}

export function getAppointmentsByDate(date: Date): Appointment[] {
  return appointments.filter(
    (apt) =>
      new Date(apt.scheduledStart).toDateString() === date.toDateString()
  );
}

export function getZoneById(id: string): Zone | undefined {
  return zones.find((z) => z.id === id);
}

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getTodayAppointments(): Appointment[] {
  return getAppointmentsByDate(today);
}
