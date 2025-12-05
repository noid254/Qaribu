
// FIX: Add Page type definition to resolve import error in BottomNav.tsx
export type Page = 'home' | 'explore' | 'orders' | 'profile' | 'contacts';

export interface Member {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  distanceKm: number;
  hourlyRate: number;
  rateType: 'per hour' | 'per day' | 'per task' | 'per month' | 'per piece work' | 'per km' | 'per sqm' | 'per cbm' | 'per appearance';
  phone: string;
  whatsapp?: string;
  isOnline: boolean;
}

export interface Skill {
  id: string;
  name:string;
  iconUrl: string;
  isVerified: boolean;
  verifier: {
    type: 'institution' | 'mentor';
    name: string;
    details: string;
    verifierId?: string; // Optional: Link to another ServiceProvider profile
  };
}

// New Premise interface based on spec
export interface Premise {
  id: string; // PID
  name: string;
  tagline: string;
  logoUrl: string;
  bannerImageUrl: string;
  about: string;
  address?: string; // Added address field
  // Kenyan Market Details
  county?: string;
  town?: string;
  lrNumber?: string; // Land Registration / Plot No
  type?: 'Residential' | 'Commercial' | 'Mixed';
  totalUnits?: number;
  floors?: number;
  unitCodeScheme?: string; // e.g. "A1-A10"
  
  amenities: string[]; // e.g. "Borehole", "CCTV", "Lifts", "Backup Generator"
  
  // Management Details
  caretakerName?: string;
  caretakerPhone?: string;
  caretakerEmail?: string;
  
  contactEmail: string;
  contactPhone: string;
  vacancies: UnitKey[]; // Replaced inline object with UnitKey for consistency
  buildingManagerId: string; // UID of manager
  tenants: string[]; // Array of Tenant IDs (TIDs)
  verificationStatus: 'Pending' | 'Verified' | 'Rejected'; // Approval workflow
  
  noticeBoard?: {
      id: string;
      title: string;
      content: string;
      date: string;
      type: 'Info' | 'Alert' | 'Promo';
  }[];
}

// Helper type for Managing Keys & Vacancies
export interface UnitKey {
    id: string; // Unique ID for the key/unit
    unitNumber: string; // Door No
    floor: string;
    type: 'Residential' | 'Commercial' | 'Gate' | 'Warehouse' | 'Shop' | 'Office' | 'Retail' | 'Apartment';
    configuration: string; // Nature of space e.g. "2 Bedroom", "Executive Suite"
    size?: string; // Estimated Square Footage e.g. "2500 sqft"
    status: 'Occupied' | 'Vacant';
    
    // Occupied Data
    tenantId?: string; 
    tenantName?: string; 
    
    // Listing/Vacancy Data
    rentAmount?: number;
    rentPeriod?: 'Monthly' | 'Quarterly' | 'Yearly';
    description?: string;
    amenities?: string[]; 
    images?: string[]; // URLs
    price?: string; // Legacy string field support if needed
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  relatedItemIds?: string[]; // For upsells (e.g., Fries ID for a Burger)
}

export interface MenuBundle {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  availableTime: string; // e.g., "08:00 - 11:00"
  items: string[]; // Array of Item Names included
}

export interface RestaurantEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string; // ISO Date string
  startTime: string;
  endTime: string;
  price: number; // Reservation fee or drink price
  totalSeats: number;
  bookedSeats: number;
}

export interface UnitDetails {
  type: 'Business' | 'Residence';
  operatingHours?: string; // "09:00 - 17:00"
  availabilityStatus: 'Available' | 'Busy' | 'Closed' | 'Do Not Disturb';
  doorNote?: string;
  doorNoteHistory?: string[]; // Recent door notes for quick selection
}

export interface SetupData {
  role: 'TenantAdmin' | 'Gateman' | 'Staff';
  premiseId: string;
  unitId?: string;
  adminId?: string; // For linking co-hosts
}

export interface ServiceProvider {
  id: string; // UID or TID
  name: string;
  phone: string;
  whatsapp?: string;
  service: string;
  avatarUrl: string;
  coverImageUrl: string;
  catalogueBannerUrl?: string;
  rating: number;
  distanceKm: number;
  hourlyRate: number;
  rateType: 'per hour' | 'per day' | 'per task' | 'per month' | 'per piece work' | 'per km' | 'per sqm' | 'per cbm' | 'per appearance';
  currency: string;
  isVerified: boolean;
  about: string;
  works: string[];
  skills?: Skill[];
  skillProgress?: { skillName: string; progress: number; }[];
  category: string;
  location: string;
  isOnline: boolean;
  
  // NEW/UPDATED fields
  accountType: 'individual' | 'organization'; // organization = Tenant
  role?: 'BuildingManager' | 'TenantAdmin' | 'Staff' | 'Gateman'; // Added Gateman
  tenantId?: string; // TID, if individual is Staff or TenantAdmin
  premiseId?: string; // PID, if organization is a Tenant or individual is BuildingManager/Gateman
  coHosts?: string[]; // Array of UIDs for co-hosts who can manage requests

  // For Tenants (accountType: 'organization')
  tenantAdminId?: string; // UID of admin
  staffIds?: string[]; // UIDs of staff members
  floor?: string; // Floor number in the premise
  unit?: string; // Unit/Door number in the premise
  unitDetails?: UnitDetails; // Host configuration for the unit

  // Identity
  govIdUrl?: string;
  govIdNumber?: string;

  referralCode?: string;
  usedReferralCode?: string;

  flagCount: number;
  views: number;
  cta: ('call' | 'whatsapp' | 'book' | 'catalogue' | 'join' | 'menu')[];
  profileType?: 'individual' | 'group';
  members?: Member[];
  leaders?: {
    chairperson: string;
    secretary: string;
    treasurer: string;
  };
  joinRequests?: {
    userId: string;
    userName: string;
    userPhone: string;
    status: 'pending' | 'approved' | 'rejected';
    approvals: string[];
    rejections: string[];
  }[];
  linkedAssetId?: string;
  menu?: MenuItem[]; // For restaurants
  bundles?: MenuBundle[]; // For restaurants
  events?: RestaurantEvent[]; // For restaurants
}


export interface Gig {
  id: string;
  providerId: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  budgetType: 'fixed' | 'per hour' | 'per day';
  currency: string;
  location: string;
  imageUrl: string;
}

export interface Event {
    id: string;
    name: string;
    date: string; // Keep as ISO string for sorting/parsing
    location: string;
    description: string;
    coverImageUrl: string;
    createdBy: string; // This can be the organizer's name
    category: 'Music' | 'Food' | 'Sport' | 'Conference' | 'Party' | 'Wedding' | 'Community' | 'Arts' | 'Business' | 'Fashion' | 'Gaming';
    price: number;
    originalPrice?: number;
    currency: string;
    ticketType: 'single' | 'multiple';
    distanceKm: number;
    organizer: {
        name: string;
        avatarUrl: string;
    };
    attendees: {
        avatarUrl: string;
    }[];
    teaserVideoUrl?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  userName: string;
  qrCodeData: string;
  gate: string;
  eventCoverUrl: string;
}

export type CatalogueCategory = 'For Rent' | 'For Sale' | 'Product' | 'Service' | 'Professional Service';

export interface CatalogueItem {
  id: string;
  providerId: string;
  title: string;
  category: CatalogueCategory;
  description: string;
  price: string;
  imageUrls: string[];
  externalLink?: string;
  duration?: string;
  discountInfo?: string;
  verifiedAssetId?: string; // Link to a verified asset in the Document DB
  serialNumber?: string;
  isVerified: boolean;
}

export interface SpecialBanner {
  id: string;
  imageUrl: string;
  targetCategory?: string;
  targetLocation?: string;
  minRating?: number;
  targetService?: string;
  isOnlineTarget?: boolean;
  isVerifiedTarget?: boolean;
  targetReferralCode?: string;
  startDate?: string;
  endDate?: string;
}

export interface HeroBanner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  providerId: string; // ID of the ServiceProvider to open
}

// FIX: Moved CurrentPage type here from App.tsx to be globally accessible.
export type CurrentPage = 'home' | 'nikosoko' | 'services' | 'myplaces' | 'qaribu' | 'journey' | 'invoices' | 'invoiceGenerator' | 'quoteGenerator' | 'receiptGenerator' | 'brandKit' | 'myDocuments' | 'scanDocument' | 'profile' | 'tukosoko' | 'mycontacts' | 'mycatalogue' | 'settings' | 'admin' | 'gigs' | 'createGig' | 'addService' | 'messages' | 'assetRegistry' | 'registerAsset' | 'ownershipCheck' | 'documentDetail' | 'createPost' | 'createProductPost' | 'mytoolkit' | 'workshopSetup' | 'login' | 'qrScan' | 'premiseLanding' | 'manage_order' | 'hostSetup' | 'doorProfile';

export type DocumentType = 'Invoice' | 'Quote' | 'Receipt';

export interface DocumentItem {
  description: string;
  quantity: number;
  price: number;
  serial?: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  number: string;
  issuerName: string; // 'from' renamed
  clientName?: string; // New: for invoices/quotes
  date: string;
  amount: number;
  currency: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue' | 'Draft'; // 'status' renamed

  // Fields for assets
  items?: DocumentItem[];
  scannedImageUrl?: string;
  verificationStatus?: 'Unverified' | 'Pending' | 'Verified' | 'Rejected';
  isAsset?: boolean;
  ownerPhone?: string;
  productImages?: string[];
  specifications?: string;
  pendingOwnerPhone?: string;

  // New detailed asset fields
  assetType?: 'Vehicle' | 'Tool' | 'Electronics' | 'Other';
  registrationNumber?: string;
  model?: string;
  yearOfManufacture?: string;
  logbookImageUrl?: string;
}

export interface QaRibuRequest {
  id: string;
  accessCode?: string; // 6 digit invite code
  premiseId: string;
  premiseName?: string; // For easier display
  tenantId?: string;
  hostId: string;
  hostName: string;
  targetUnit?: string; // For manual unit entry
  visitorName: string;
  visitorPhone: string;
  visitorId?: string; // For Universal Access ID linking
  visitorAvatar?: string;
  visitorPurpose?: string;
  vehicleReg?: string;
  createdAt?: string;
  expiresAt?: string;
  status: 'Pending' | 'Approved' | 'CheckedIn' | 'Expired' | 'Killed' | 'Denied'; // Extended statuses
  requestType?: 'Direct' | 'Mediated';
  premiseType?: 'Commercial' | 'Residence' | 'Mixed';
}

export interface BusinessAssets {
  name: string;
  address: string;
  logo: string | null;
}

export interface OrderData {
  customer: {
    name: string;
    phone: string;
    location: string;
  };
  restaurantName: string;
  items: {
    name: string;
    qty: number;
    price: number;
  }[];
  total: number;
  date: string;
}

export interface InboxMessage {
    id: number;
    sender: 'user' | 'team';
    text: string;
    timestamp: string;
}