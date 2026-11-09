// Pawelium 2.0 — Core Domain Types for Full-Stack Pet Marketplace

export type AnimalSpecies = 'dog' | 'cat';
export type SizeCategory = 'petit' | 'moyen' | 'grand';
export type Sex = 'male' | 'femelle';
export type AnimalStatus = 'AVAILABLE' | 'HELD' | 'SOLD' | 'UNAVAILABLE' | 'ARCHIVED';

export interface AnimalImage {
  id: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
  order?: number;
}

export interface AnimalDocument {
  id: string;
  title: string;
  type: 'VACCINATION' | 'HEALTH_CERTIFICATE' | 'PEDIGREE' | 'PASSPORT';
  fileUrl: string;
  issuedAt?: string;
  verified: boolean;
}

export interface VaccinationRecord {
  disease: string;
  date: string;
  nextDueDate: string;
  veterinarian: string;
}

export interface AnimalRecord {
  id: string;
  slug: string;
  species: AnimalSpecies;
  name: string;
  breedSlug: string;
  breedName: string;
  breedNameEn: string;
  category: SizeCategory;
  sex: Sex;
  age: string;
  ageMonths: number;
  dateOfBirth: string;
  location: string;
  country: string;
  priceCents: number; // Integer EUR cents (e.g. 140000 = 1400 EUR)
  originalPriceCents: number; // e.g. 215000 = 2150 EUR
  currency: 'EUR';
  status: AnimalStatus;
  pedigree: boolean;
  microchip: boolean;
  video?: string;
  vaccinations: VaccinationRecord[];
  description: string;
  descriptionEn: string;
  temperament: string[];
  temperamentEn: string[];
  size: SizeCategory;
  color: string;
  weight: string;
  fatherLineage?: string;
  motherLineage?: string;
  images: AnimalImage[];
  documents: AnimalDocument[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  holdExpiresAt?: string | null;
  heldByOrderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'RESERVED'
  | 'DOCUMENTATION_REVIEW'
  | 'PREPARING'
  | 'TRANSPORT_SCHEDULED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'DISPUTED';

export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
export type PaymentProvider = 'GENIUSPAY' | 'STRIPE';

export interface OrderItem {
  id: string;
  animalId: string;
  animalName: string;
  animalBreed: string;
  animalSlug: string;
  animalImageUrl: string;
  priceCents: number;
}

export interface OrderRecord {
  id: string;
  orderReference: string; // e.g. "PWL-2026-98124"
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  deliveryCountry: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode: string;
  deliveryNotes?: string;
  
  // Authoritative server-side pricing in EUR cents
  subtotalCents: number;
  transportCents: number;
  taxCents: number;
  totalCents: number;
  currency: 'EUR';

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingToken: string; // Secret tracking access token

  items: OrderItem[];
  statusHistory: Array<{
    id: string;
    status: OrderStatus;
    note?: string;
    actor: string;
    createdAt: string;
  }>;

  payment?: {
    id: string;
    provider: PaymentProvider;
    providerPaymentId?: string;
    checkoutUrl?: string;
    amountCents: number;
    currency: 'EUR';
    status: PaymentStatus;
    paymentMethod: string;
    updatedAt: string;
  };

  delivery?: {
    carrierName: string;
    trackingNumber?: string;
    status: string;
    estimatedDeliveryDate?: string;
    pickupDate?: string;
    deliveredDate?: string;
    notes?: string;
  };

  createdAt: string;
  updatedAt: string;
}

export type TicketCategory =
  | 'PAYMENT'
  | 'RESERVATION'
  | 'ANIMAL_DOCUMENTATION'
  | 'HEALTH_INFORMATION'
  | 'TRANSPORT_AND_DELIVERY'
  | 'CANCELLATION'
  | 'REFUND'
  | 'GENERAL_INQUIRY';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'WAITING_FOR_ADMIN' | 'RESOLVED' | 'CLOSED';

export interface TicketMessage {
  id: string;
  senderType: 'CUSTOMER' | 'ADMIN';
  senderName: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface SupportTicketRecord {
  id: string;
  ticketReference: string; // e.g. "TCK-84920"
  customerEmail: string;
  customerName: string;
  orderReference?: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  secureToken: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminMetrics {
  totalAnimals: number;
  availableAnimals: number;
  heldAnimals: number;
  soldAnimals: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalRevenueCents: number;
  openTickets: number;
  recentOrders: OrderRecord[];
}
