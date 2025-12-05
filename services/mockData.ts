
// FIX: Changed Invitation to QaRibuRequest and added Premise to resolve type errors.
import type { ServiceProvider, CatalogueItem, Document, QaRibuRequest, Ticket, Gig, Event, SpecialBanner, InboxMessage, Premise } from '../types';

export const mockProviders: ServiceProvider[] = [
    {
        id: '1',
        name: 'John Doe',
        phone: '254712345678',
        whatsapp: '254712345678',
        service: 'Expert Electrician',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        coverImageUrl: 'https://images.unsplash.com/photo-1517994112540-009c477df7a0?q=80&w=800',
        rating: 4.8,
        distanceKm: 2.5,
        hourlyRate: 1500,
        rateType: 'per hour',
        currency: 'Ksh',
        isVerified: true,
        about: 'Certified electrician with 10+ years of experience in residential and commercial wiring. I handle everything from new installations to troubleshooting and repairs. Safety and quality are my top priorities.',
        works: [
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400',
            'https://images.unsplash.com/photo-1487813293616-a29f03b5a04a?q=80&w=400',
            'https://images.unsplash.com/photo-1581092921442-fd6f891b9896?q=80&w=400',
        ],
        skills: [
            { id: 'sk1', name: 'Wireman Grade I', iconUrl: 'https://picsum.photos/seed/skill1/100', isVerified: true, verifier: { type: 'institution', name: 'NITA', details: 'National Industrial Training Authority Certification for artisans.' } }
        ],
        skillProgress: [
            { skillName: 'Advanced Wiring', progress: 75 },
            { skillName: 'Safety Protocols', progress: 90 },
            { skillName: 'Solar Installation', progress: 40 }
        ],
        category: 'HOME',
        location: 'Kileleshwa, Nairobi',
        isOnline: true,
        accountType: 'individual',
        flagCount: 0,
        views: 125,
        cta: ['call', 'whatsapp'],
    },
    {
        id: '3',
        name: 'Nairobi Institute of Technology',
        phone: '254734567890',
        service: 'Technical & Vocational Training',
        avatarUrl: 'https://i.pravatar.cc/150?img=3',
        coverImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800',
        rating: 4.9,
        distanceKm: 8.2,
        hourlyRate: 120000,
        rateType: 'per task',
        currency: 'Ksh',
        isVerified: true,
        about: 'Leading institution for technical training. We offer diplomas and certifications in IT, Engineering, and Business to equip students with market-ready skills.',
        works: [],
        category: 'EDUCATION',
        location: 'Westlands, Nairobi',
        isOnline: true,
        accountType: 'organization',
        floor: '5th Floor',
        unit: 'Suite 501',
        flagCount: 0,
        views: 210,
        cta: ['call', 'catalogue'],
        coHosts: ['1'], // John Doe is a co-host
        premiseId: 'p1',
        role: 'TenantAdmin'
    },
    {
        id: 'sa1',
        name: 'Super Admin',
        phone: '254723119356',
        service: 'Platform Administrator',
        avatarUrl: 'https://i.pravatar.cc/150?img=10',
        coverImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800',
        rating: 5.0,
        distanceKm: 1.0,
        hourlyRate: 0,
        rateType: 'per task',
        currency: 'Ksh',
        isVerified: true,
        about: 'Super admin account for managing the platform.',
        works: [],
        category: 'Professional',
        location: 'Nairobi',
        isOnline: true,
        accountType: 'individual',
        role: 'BuildingManager',
        premiseId: 'p1',
        flagCount: 0,
        views: 1000,
        cta: ['call'],
    },
    {
        id: 'gateman1',
        name: 'Security Guard',
        phone: '254711111111',
        service: 'Security',
        avatarUrl: 'https://i.pravatar.cc/150?img=15',
        coverImageUrl: '',
        rating: 5.0,
        distanceKm: 0,
        hourlyRate: 0,
        rateType: 'per hour',
        currency: 'Ksh',
        isVerified: true,
        about: 'Premise Security',
        works: [],
        category: 'Professional',
        location: 'Gate House',
        isOnline: true,
        accountType: 'individual',
        role: 'Gateman',
        premiseId: 'p1',
        flagCount: 0,
        views: 0,
        cta: ['call']
    },
    {
        id: '6',
        name: 'Kevin "Speedy" Otieno',
        phone: '254767890123',
        service: 'Boda Boda Rider',
        avatarUrl: 'https://i.pravatar.cc/150?img=6',
        coverImageUrl: 'https://images.unsplash.com/photo-1620796363648-7553f7c97529?q=80&w=800',
        rating: 4.6,
        distanceKm: 0.8,
        hourlyRate: 300,
        rateType: 'per task',
        currency: 'Ksh',
        isVerified: true,
        about: 'Safe and fast boda boda transport around the CBD. I know all the shortcuts to get you there on time. Helmet provided!',
        works: [],
        category: 'TRANSPORT',
        location: 'CBD, Nairobi',
        isOnline: true,
        accountType: 'individual',
        flagCount: 0,
        views: 300,
        cta: ['call'],
    },
    {
        id: '7',
        name: 'Flash Courier',
        phone: '254778901234',
        service: 'City Courier',
        avatarUrl: 'https://i.pravatar.cc/150?img=7',
        coverImageUrl: 'https://images.unsplash.com/photo-1615904523321-f045c22a31d2?q=80&w=800',
        rating: 4.8,
        distanceKm: 5.0,
        hourlyRate: 500,
        rateType: 'per task',
        currency: 'Ksh',
        isVerified: true,
        about: 'Same-day parcel and document delivery service across Nairobi. Track your package in real-time.',
        works: [],
        category: 'TRANSPORT',
        location: 'Nairobi',
        isOnline: true,
        accountType: 'organization',
        floor: 'Ground Floor',
        unit: 'Shop G-04',
        flagCount: 0,
        views: 95,
        cta: ['call', 'whatsapp'],
        premiseId: 'p1',
        role: 'TenantAdmin'
    },
    {
        id: 'rest1',
        name: 'The Savory Fork',
        phone: '254711223344',
        service: 'Gourmet Restaurant',
        avatarUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=200',
        coverImageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=800',
        rating: 4.9,
        distanceKm: 1.2,
        hourlyRate: 1500, // Avg meal price
        rateType: 'per task',
        currency: 'Ksh',
        isVerified: true,
        about: 'A modern culinary experience serving fusion dishes inspired by local flavors. Perfect for dates, business meetings, and family dinners.',
        works: [],
        category: 'RESTAURANT',
        location: 'Kilimani, Nairobi',
        isOnline: true,
        accountType: 'organization',
        floor: '1st Floor',
        unit: 'A-101',
        flagCount: 0,
        views: 500,
        cta: ['call', 'menu'],
        premiseId: 'p1',
        role: 'TenantAdmin',
        bundles: [
            { id: 'b1', title: 'Morning Glory', description: 'Kickstart your day with energy.', items: ['Artisan Coffee', 'Avocado Toast', 'Fruit Bowl'], price: 850, originalPrice: 1100, availableTime: '07:00 - 10:00', imageUrl: 'https://images.unsplash.com/photo-1533089862017-5f8335585a30?q=80&w=600' },
            { id: 'b2', title: 'Power Lunch', description: 'Quick, delicious, and filling.', items: ['Grilled Chicken Salad', 'Iced Tea'], price: 1200, originalPrice: 1500, availableTime: '12:00 - 14:00', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600' },
            { id: 'b3', title: 'Lazy Brunch', description: 'For those slow, easy weekends.', items: ['Eggs Benedict', 'Mimosa', 'Pancakes'], price: 1800, originalPrice: 2200, availableTime: '10:00 - 14:00', imageUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=600' },
            { id: 'b4', title: 'Dinner Date', description: 'The perfect evening setup for two.', items: ['2x Steaks', 'Red Wine Bottle', 'Dessert Platter'], price: 4500, originalPrice: 5500, availableTime: '18:00 - 22:00', imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600' },
        ],
        menu: [
            { id: 'm1', name: 'Signature Burger', description: 'Double beef patty, cheddar cheese, caramelized onions, and our secret sauce.', price: 1200, category: 'Mains', images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=400'], relatedItemIds: ['m3', 'm4'] },
            { id: 'm2', name: 'Grilled Salmon', description: 'Fresh Atlantic salmon served with asparagus and lemon butter sauce.', price: 2200, category: 'Mains', images: ['https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=400'], relatedItemIds: ['m5'] },
            { id: 'm3', name: 'Truffle Fries', description: 'Crispy fries tossed in truffle oil and parmesan.', price: 600, category: 'Sides', images: ['https://images.unsplash.com/photo-1573080496987-8198cb147a71?q=80&w=400'], isVegetarian: true },
            { id: 'm4', name: 'Classic Mojito', description: 'White rum, sugar, lime juice, soda water, and mint.', price: 850, category: 'Drinks', images: ['https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400'] },
            { id: 'm5', name: 'Cheesecake', description: 'New York style cheesecake with berry compote.', price: 750, category: 'Desserts', images: ['https://images.unsplash.com/photo-1524351199678-941a58a3df26?q=80&w=400'], isVegetarian: true },
            { id: 'm6', name: 'Spicy Chicken Wings', description: '6pcs wings tossed in hot honey glaze.', price: 900, category: 'Starters', images: ['https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=400'], isSpicy: true, relatedItemIds: ['m4'] },
            { id: 'm7', name: 'Pasta Carbonara', description: 'Authentic Italian pasta with guanciale, egg yolk, and pecorino cheese.', price: 1400, category: 'Mains', images: ['https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=400'], relatedItemIds: ['m4'] },
            { id: 'm8', name: 'Avocado Toast', description: 'Sourdough bread topped with smashed avocado, poached egg, and chili flakes.', price: 850, category: 'Breakfast', images: ['https://images.unsplash.com/photo-1588137372308-15f75323ca8f?q=80&w=400'], isVegetarian: true },
            { id: 'm9', name: 'Full English Breakfast', description: 'Eggs, sausages, bacon, beans, mushrooms, and toast.', price: 1100, category: 'Breakfast', images: ['https://images.unsplash.com/photo-1533089862017-5f8335585a30?q=80&w=400'] },
        ],
        events: [
            {
                id: 'evt1',
                title: 'Sunset Happy Hour',
                description: 'Enjoy 50% off all cocktails and free bitings. Live jazz music starting at 7 PM.',
                imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=800',
                date: new Date().toISOString(),
                startTime: '18:00',
                endTime: '21:00',
                price: 500,
                totalSeats: 20,
                bookedSeats: 12
            }
        ]
    },
    // --- NEW DUMMY TENANTS ---
    {
        id: 't4',
        name: 'Alice Kamau',
        phone: '254722000001',
        service: 'Resident',
        avatarUrl: 'https://i.pravatar.cc/150?img=25',
        coverImageUrl: '',
        rating: 0,
        distanceKm: 0,
        hourlyRate: 0,
        rateType: 'per task',
        currency: 'Ksh',
        isVerified: true,
        about: 'Resident at The Business Hive.',
        works: [],
        category: 'PERSONAL',
        location: 'Nairobi',
        isOnline: false,
        accountType: 'individual',
        unit: '4B',
        floor: '4th Floor',
        premiseId: 'p1',
        role: 'TenantAdmin',
        flagCount: 0,
        views: 0,
        cta: [],
        unitDetails: {
            type: 'Residence',
            availabilityStatus: 'Available',
            doorNote: 'Please ring twice.',
        }
    },
    {
        id: 't5',
        name: 'Global Tech Solutions',
        phone: '254722000002',
        service: 'Software Development',
        avatarUrl: 'https://i.pravatar.cc/150?img=33',
        coverImageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800',
        rating: 4.5,
        distanceKm: 0,
        hourlyRate: 0,
        rateType: 'per task',
        currency: 'Ksh',
        isVerified: true,
        about: 'We build enterprise software solutions.',
        works: [],
        category: 'PROFESSIONAL',
        location: 'Nairobi',
        isOnline: true,
        accountType: 'organization',
        unit: 'Suite 205',
        floor: '2nd Floor',
        premiseId: 'p1',
        role: 'TenantAdmin',
        flagCount: 0,
        views: 150,
        cta: ['call', 'catalogue'],
        unitDetails: {
            type: 'Business',
            availabilityStatus: 'Available',
            operatingHours: '08:00 - 17:00'
        }
    }
];

// FIX: Add missing 'isVerified' property to all catalogue items.
export const mockCatalogueItems: CatalogueItem[] = [
    { id: 'cat1', providerId: '1', title: 'Full House Wiring Inspection', category: 'Professional Service', description: 'A complete safety inspection of your home\'s electrical wiring.', price: 'Ksh 4,500', imageUrls: ['https://images.unsplash.com/photo-1581092921442-fd6f891b9896?q=80&w=400'], duration: 'Approx. 2 hours', isVerified: true },
    { id: 'cat4', providerId: '7', title: 'Used iPhone 12 Pro', category: 'Product', description: 'Great condition, 128GB, unlocked. Comes with original box.', price: 'Ksh 75,000', imageUrls: ['https://images.unsplash.com/photo-1607936854259-c2b71bda8158?q=80&w=400'], isVerified: true },
    // Courses for institutions
    { id: 'course1', providerId: '3', title: 'Diploma in Web Development', category: 'Professional Service', description: 'A comprehensive 12-month course covering front-end and back-end technologies. Prepares you for a career as a full-stack developer.', price: 'Ksh 120,000', imageUrls: ['https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=400'], externalLink: 'https://example.edu/web-dev', duration: '12 Months', isVerified: true },
    { id: 'course2', providerId: '3', title: 'Certificate in Graphic Design', category: 'Professional Service', description: 'Learn the fundamentals of design, typography, and branding using industry-standard tools like Adobe Photoshop and Illustrator.', price: 'Ksh 65,000', imageUrls: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400'], externalLink: 'https://example.edu/graphic-design', duration: '6 Months', isVerified: true },
];

export const mockDocuments: Document[] = [
    { id: 'doc1', type: 'Invoice', number: 'INV-001', issuerName: 'John Doe', clientName: 'Alice', date: '2023-10-26T10:00:00Z', amount: 4500, currency: 'Ksh', paymentStatus: 'Paid' },
    {
        id: 'asset1', type: 'Receipt', number: 'ASSET-98765', issuerName: 'Carrefour', date: '2023-09-01T12:00:00Z', amount: 35000, currency: 'Ksh', paymentStatus: 'Paid', isAsset: true, ownerPhone: '254712345678',
        items: [{ description: 'Samsung 32" TV', quantity: 1, price: 35000, serial: 'SN-ABC123XYZ' }],
        productImages: ['https://images.unsplash.com/photo-1593784944633-c288b2a1f33f?q=80&w=400'],
        verificationStatus: 'Verified',
    }
];

// FIX: Renamed mockGuestPasses to mockQaRibuRequests and updated its structure to match the QaRibuRequest type.
export const mockQaRibuRequests: QaRibuRequest[] = [
    { 
        id: 'qrr1', 
        premiseId: 'p1', 
        premiseName: 'The Business Hive',
        tenantId: '3', 
        hostId: '1', 
        hostName: 'John Doe (co-host)', 
        visitorPhone: '254799887766', 
        visitorName: 'Visitor One', 
        visitorPurpose: 'Meeting',
        visitorAvatar: 'https://i.pravatar.cc/150?img=6', 
        createdAt: '2023-10-27T00:00:00Z', 
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'Approved', 
        requestType: 'Direct',
        premiseType: 'Commercial',
        accessCode: '123456'
    },
    { 
        id: 'qrr2', 
        premiseId: 'p1', 
        premiseName: 'The Business Hive',
        tenantId: '7', 
        hostId: '7', // Assuming self-hosted for now
        hostName: 'Flash Courier', 
        visitorPhone: '254788776655', 
        visitorName: 'Visitor Two', 
        visitorPurpose: 'Delivery',
        visitorAvatar: 'https://i.pravatar.cc/150?img=7', 
        createdAt: new Date().toISOString(), 
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'Pending', 
        requestType: 'Mediated',
        premiseType: 'Commercial'
    },
    { 
        id: 'qrr3', 
        premiseId: 'p1', 
        premiseName: 'The Business Hive',
        hostId: 'resident1', 
        hostName: 'Unit 4B', 
        visitorPhone: '254700000000', 
        visitorName: 'Family Guest', 
        visitorPurpose: 'Personal',
        visitorAvatar: 'https://i.pravatar.cc/150?img=20',
        createdAt: new Date().toISOString(), 
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'Approved', 
        requestType: 'Direct',
        premiseType: 'Residence',
        targetUnit: '4B',
        accessCode: '987654'
    },
];

export const mockTickets: Ticket[] = [];

export const mockGigs: Gig[] = [
    { id: 'gig1', providerId: '1', title: 'Fix Leaky Kitchen Sink', category: 'Plumbing', description: 'My kitchen sink has been dripping for a week. Need a plumber to fix it urgently.', budget: 1500, budgetType: 'fixed', currency: 'Ksh', location: 'Kilimani, Nairobi', imageUrl: 'https://images.unsplash.com/photo-1600585152220-029e78b1e354?q=80&w=400' },
    { id: 'gig2', providerId: '3', title: 'Office Relocation', category: 'Moving', description: 'We are moving our office of 10 people from Westlands to Upper Hill. Need a reliable moving company.', budget: 25000, budgetType: 'fixed', currency: 'Ksh', location: 'Westlands, Nairobi', imageUrl: 'https://images.unsplash.com/photo-1507207611509-ec012433ff52?q=80&w=400' },
];

export const mockEvents: Event[] = [];

export const mockCategories: string[] = ['HOME', 'TRANSPORT', 'PERSONAL', 'EVENT', 'EMERGENCY', 'Professional', 'EDUCATION'];

export const mockSpecialBanners: SpecialBanner[] = [
    {
        id: 'banner1',
        imageUrl: 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=800',
        targetLocation: 'Westlands',
    },
    {
        id: 'banner2',
        imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=800',
        targetService: 'Plumber',
        minRating: 4.5
    }
];
// FIX: Add mockPremises data and export it to resolve import error in api.ts
export const mockPremises: Premise[] = [
    {
      id: 'p1',
      name: 'The Business Hive',
      tagline: 'Where Innovation Meets Collaboration',
      logoUrl: 'https://i.imgur.com/I5MaTM3.png', // placeholder
      bannerImageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800',
      about: 'The Business Hive is a premier commercial building offering state-of-the-art office and retail spaces. Located in the heart of the city, we provide a dynamic environment for businesses to thrive.',
      amenities: ['24/7 Security', 'High-Speed Internet', 'Ample Parking', 'Backup Generator', 'Rooftop Cafe', 'Conference Rooms'],
      contactEmail: 'leasing@businesshive.co.ke',
      contactPhone: '254712345678',
      vacancies: [
        { 
            id: 'vac1',
            unitNumber: '501',
            type: 'Office', 
            floor: '5th', 
            size: '3,000 sqft', 
            status: 'Vacant', 
            configuration: 'Open Plan Office' 
        },
        { 
            id: 'vac2',
            unitNumber: 'G05',
            type: 'Retail', 
            floor: 'Ground', 
            size: '1,200 sqft', 
            status: 'Vacant', 
            configuration: 'Corner Shop',
            description: 'Coming Soon'
        },
      ],
      buildingManagerId: 'sa1', // Super Admin
      tenants: ['3', '7', 'rest1', 't4', 't5'], // Updated with dummy tenants
      verificationStatus: 'Verified', // Added field
      floors: 10,
      unitCodeScheme: 'Suite 101-1005',
      caretakerName: 'James Mwangi',
      caretakerPhone: '254722000000',
      caretakerEmail: 'james@businesshive.co.ke'
    }
];
export const mockInboxMessages: InboxMessage[] = [];