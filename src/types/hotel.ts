export type DestinationSlug = 'all' | 'lake-como' | 'paris' | 'kyoto' | 'st-moritz';

export type SuiteCategory = 'all' | 'penthouse' | 'pavilion' | 'grand-suite' | 'alpine';

export type ViewRoute =
  | 'home'
  | 'suites'
  | 'experiences'
  | 'suite-detail'
  | 'booking'
  | 'reservations';

export interface Property {
  id: Exclude<DestinationSlug, 'all'>;
  name: string;
  city: string;
  country: string;
  regionLabel: string;
  tagline: string;
  description: string;
  architecturalNote: string;
  suiteCount: number;
  diningHighlight: string;
  wellnessHighlight: string;
  checkInTime: string;
  checkOutTime: string;
  startingRate: number;
  heroImage: string;
  coordinates: string;
}

export interface RatePlan {
  id: 'flexible' | 'sanctuary' | 'culinary';
  name: string;
  summary: string;
  inclusions: string[];
  multiplier: number;
  cancellationPolicy: string;
}

export interface Suite {
  id: string;
  propertyId: Exclude<DestinationSlug, 'all'>;
  propertyName: string;
  destinationCity: string;
  destinationCountry: string;
  name: string;
  category: Exclude<SuiteCategory, 'all'>;
  categoryLabel: string;
  areaSqm: number;
  maxAdults: number;
  maxChildren: number;
  bedConfiguration: string;
  viewDescription: string;
  nightlyRate: number;
  image: string;
  secondaryImage: string;
  summary: string;
  architecturalDetails: string;
  amenities: string[];
  inclusions: string[];
  availableCount: number;
}

export interface StayEnhancement {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  pricingUnit: 'per-stay' | 'per-night';
  category: 'Transfer' | 'Culinary' | 'Wellness' | 'Privilege';
}

export interface ExperienceItem {
  id: string;
  propertyId: Exclude<DestinationSlug, 'all'>;
  propertyName: string;
  destinationCity: string;
  title: string;
  duration: string;
  groupSize: string;
  pricePerGuest: number;
  image: string;
  summary: string;
  highlights: string[];
}

export interface SearchCriteria {
  destination: DestinationSlug;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export interface GuestDetails {
  fullName: string;
  email: string;
  phone: string;
  arrivalWindow: string;
  pillowPreference: string;
  roomTemperature: string;
  specialNotes: string;
  cardHolder: string;
  cardLastFour: string;
}

export interface ConciergeRequest {
  id: string;
  type: 'Chauffeur' | 'Dining' | 'Thermal Spa' | 'In-Suite';
  note: string;
  requestedTime: string;
  status: 'Confirmed' | 'Arranged by Butler';
}

export interface Reservation {
  id: string;
  confirmationCode: string;
  suiteId: string;
  suiteName: string;
  propertyId: Exclude<DestinationSlug, 'all'>;
  propertyName: string;
  destinationCity: string;
  destinationCountry: string;
  suiteImage: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  ratePlanName: string;
  nightlyRateApplied: number;
  enhancements: { id: string; title: string; amount: number }[];
  taxesAndFees: number;
  totalAmount: number;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
  guest: GuestDetails;
  conciergeRequests: ConciergeRequest[];
}

export interface BookingDraft {
  suite: Suite;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  ratePlanId: RatePlan['id'];
  enhancementIds: string[];
}
