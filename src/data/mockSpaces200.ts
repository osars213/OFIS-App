import { Space, SpaceCategory, PricingBasis, PricingPeriod, HostProfile, FloorPlanSeat } from '../types';

// Curated high quality workspace images
const WORKSPACE_IMAGES = [
  'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582657233895-0f37a3f150c0?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507207611509-ec012433ff52?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format&fit=crop&q=80',
];

const HOST_POOL: HostProfile[] = [
  {
    id: 'host-001',
    name: 'Funke Akindele-Cole',
    companyName: 'OFIS Premier Workspaces',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    isVerified: true,
    phone: '+234 803 987 6543',
    email: 'funke@creativespace.ng',
    responseRatePercent: 99,
    responseTimeMinutes: 5,
    totalSpaces: 28,
    rating: 4.95,
    superhost: true,
  },
  {
    id: 'host-002',
    name: 'Emeka Nwosu',
    companyName: 'Glasshouse Executive Hubs',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    isVerified: true,
    phone: '+234 802 111 2233',
    email: 'emeka@glasshouse.ng',
    responseRatePercent: 97,
    responseTimeMinutes: 10,
    totalSpaces: 24,
    rating: 4.92,
    superhost: true,
  },
  {
    id: 'host-003',
    name: 'Hadiza Mohammed',
    companyName: 'Savannah Capital Spaces',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    isVerified: true,
    phone: '+234 809 333 4455',
    email: 'hadiza@savannah.ng',
    responseRatePercent: 98,
    responseTimeMinutes: 8,
    totalSpaces: 20,
    rating: 4.88,
    superhost: true,
  },
  {
    id: 'host-004',
    name: 'Tunde Bakare',
    companyName: 'Silicon Lagoon Labs',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    isVerified: true,
    phone: '+234 805 777 8899',
    email: 'tunde@siliconlagoon.ng',
    responseRatePercent: 100,
    responseTimeMinutes: 4,
    totalSpaces: 35,
    rating: 4.97,
    superhost: true,
  },
  {
    id: 'host-005',
    name: 'Chioma Okeke',
    companyName: 'Eden Co-Work & Media',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    isVerified: true,
    phone: '+234 808 222 3344',
    email: 'chioma@edenworkspaces.ng',
    responseRatePercent: 96,
    responseTimeMinutes: 12,
    totalSpaces: 18,
    rating: 4.85,
    superhost: false,
  },
  {
    id: 'host-006',
    name: 'Kofi Mensah',
    companyName: 'Impact Hub Gold Coast',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    isVerified: true,
    phone: '+233 24 123 4567',
    email: 'kofi@impacthubaccra.com',
    responseRatePercent: 99,
    responseTimeMinutes: 6,
    totalSpaces: 15,
    rating: 4.93,
    superhost: true,
  },
  {
    id: 'host-007',
    name: 'Amina Wanjiku',
    companyName: 'Nairobi Tech Oasis',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
    isVerified: true,
    phone: '+254 712 345 678',
    email: 'amina@nairobitEchoasis.co.ke',
    responseRatePercent: 98,
    responseTimeMinutes: 7,
    totalSpaces: 16,
    rating: 4.91,
    superhost: true,
  },
  {
    id: 'host-008',
    name: 'Jean-Paul Mugisha',
    companyName: 'Kigali Innovation Hub',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    isVerified: true,
    phone: '+250 788 123 456',
    email: 'jp@kigalihub.rw',
    responseRatePercent: 100,
    responseTimeMinutes: 3,
    totalSpaces: 14,
    rating: 4.96,
    superhost: true,
  }
];

interface LocationTemplate {
  city: string;
  state: string;
  neighborhood: string;
  baseAddress: string;
  lat: number;
  lng: number;
  country: string;
}

const LOCATION_TEMPLATES: LocationTemplate[] = [
  // Lagos Neighborhoods (approx 90 listings)
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Victoria Island', baseAddress: 'Karimu Kotun Street, Victoria Island, Lagos', lat: 6.4281, lng: 3.4219, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Victoria Island', baseAddress: 'Ahmadu Bello Way, Victoria Island, Lagos', lat: 6.4255, lng: 3.4150, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Victoria Island', baseAddress: 'Adeola Odeku Street, Victoria Island, Lagos', lat: 6.4312, lng: 3.4285, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Ikoyi', baseAddress: 'Bourdillon Road, Ikoyi, Lagos', lat: 6.4474, lng: 3.4356, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Ikoyi', baseAddress: 'Glover Road, Old Ikoyi, Lagos', lat: 6.4520, lng: 3.4410, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Ikoyi', baseAddress: 'Kingsway Road (Alfred Rewane), Ikoyi, Lagos', lat: 6.4560, lng: 3.4490, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Lekki Phase 1', baseAddress: 'Admiralty Way, Lekki Phase 1, Lagos', lat: 6.4438, lng: 3.4735, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Lekki Phase 1', baseAddress: 'Fola Osibo Street, Lekki Phase 1, Lagos', lat: 6.4490, lng: 3.4810, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Lekki Phase 1', baseAddress: 'Freedom Way, Lekki Phase 1, Lagos', lat: 6.4380, lng: 3.4920, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Ikeja GRA', baseAddress: 'Joel Ogunnaike Street, Ikeja GRA, Lagos', lat: 6.5912, lng: 3.3541, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Ikeja GRA', baseAddress: 'Isaac John Street, Ikeja GRA, Lagos', lat: 6.5960, lng: 3.3590, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Yaba', baseAddress: 'Herbert Macaulay Way, Yaba, Lagos', lat: 6.5095, lng: 3.3792, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Yaba', baseAddress: 'Commercial Avenue, Sabo Yaba, Lagos', lat: 6.5140, lng: 3.3740, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Surulere', baseAddress: 'Adeniran Ogunsanya Street, Surulere, Lagos', lat: 6.4975, lng: 3.3582, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Maryland', baseAddress: 'Mobolaji Bank Anthony Way, Maryland, Lagos', lat: 6.5720, lng: 3.3680, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Marina', baseAddress: 'Broad Street, Marina Lagos Island, Lagos', lat: 6.4530, lng: 3.3910, country: 'Nigeria' },
  { city: 'Lagos', state: 'Lagos State', neighborhood: 'Gbagada', baseAddress: 'Gbagada Expressway, Phase 2, Lagos', lat: 6.5560, lng: 3.3850, country: 'Nigeria' },

  // Abuja Neighborhoods (approx 45 listings)
  { city: 'Abuja', state: 'Federal Capital Territory', neighborhood: 'Maitama', baseAddress: 'Aguiyi Ironsi Street, Maitama, Abuja', lat: 9.0882, lng: 7.4934, country: 'Nigeria' },
  { city: 'Abuja', state: 'Federal Capital Territory', neighborhood: 'Maitama', baseAddress: 'Gana Street, Maitama District, Abuja', lat: 9.0820, lng: 7.4990, country: 'Nigeria' },
  { city: 'Abuja', state: 'Federal Capital Territory', neighborhood: 'Wuse 2', baseAddress: 'Adetokunbo Ademola Crescent, Wuse 2, Abuja', lat: 9.0765, lng: 7.4682, country: 'Nigeria' },
  { city: 'Abuja', state: 'Federal Capital Territory', neighborhood: 'Wuse 2', baseAddress: 'Aminu Kano Crescent, Wuse 2, Abuja', lat: 9.0710, lng: 7.4750, country: 'Nigeria' },
  { city: 'Abuja', state: 'Federal Capital Territory', neighborhood: 'Central Business District', baseAddress: 'Constitution Avenue, CBD, Abuja', lat: 9.0550, lng: 7.4890, country: 'Nigeria' },
  { city: 'Abuja', state: 'Federal Capital Territory', neighborhood: 'Jabi', baseAddress: 'Alex Ekwueme Way, Jabi Lake, Abuja', lat: 9.0720, lng: 7.4240, country: 'Nigeria' },
  { city: 'Abuja', state: 'Federal Capital Territory', neighborhood: 'Garki II', baseAddress: 'Tafawa Balewa Way, Area 11 Garki, Abuja', lat: 9.0340, lng: 7.4890, country: 'Nigeria' },
  { city: 'Abuja', state: 'Federal Capital Territory', neighborhood: 'Guzape', baseAddress: 'Asokoro Extension, Guzape Hills, Abuja', lat: 9.0380, lng: 7.5250, country: 'Nigeria' },

  // Port Harcourt (approx 20 listings)
  { city: 'Port Harcourt', state: 'Rivers State', neighborhood: 'Old GRA', baseAddress: 'Forces Avenue, Old GRA, Port Harcourt', lat: 4.8156, lng: 7.0123, country: 'Nigeria' },
  { city: 'Port Harcourt', state: 'Rivers State', neighborhood: 'New GRA', baseAddress: 'Birabi Street, Phase 2 GRA, Port Harcourt', lat: 4.8210, lng: 7.0080, country: 'Nigeria' },
  { city: 'Port Harcourt', state: 'Rivers State', neighborhood: 'Trans Amadi', baseAddress: 'Trans Amadi Industrial Layout, Port Harcourt', lat: 4.8050, lng: 7.0340, country: 'Nigeria' },
  { city: 'Port Harcourt', state: 'Rivers State', neighborhood: 'Peter Odili Road', baseAddress: 'Peter Odili Commercial Corridor, Port Harcourt', lat: 4.7920, lng: 7.0420, country: 'Nigeria' },

  // Ibadan (approx 15 listings)
  { city: 'Ibadan', state: 'Oyo State', neighborhood: 'Bodija', baseAddress: 'Favos Junction, Old Bodija, Ibadan', lat: 7.4260, lng: 3.9050, country: 'Nigeria' },
  { city: 'Ibadan', state: 'Oyo State', neighborhood: 'Ring Road', baseAddress: 'Ring Road Commercial Complex, Ibadan', lat: 7.3780, lng: 3.8740, country: 'Nigeria' },
  { city: 'Ibadan', state: 'Oyo State', neighborhood: 'Jericho', baseAddress: 'Jericho GRA Executive Layout, Ibadan', lat: 7.3980, lng: 3.8690, country: 'Nigeria' },

  // Enugu (approx 10 listings)
  { city: 'Enugu', state: 'Enugu State', neighborhood: 'Independence Layout', baseAddress: 'Presidential Road, Independence Layout, Enugu', lat: 6.4470, lng: 7.5140, country: 'Nigeria' },
  { city: 'Enugu', state: 'Enugu State', neighborhood: 'New Haven', baseAddress: 'Chime Avenue, New Haven, Enugu', lat: 6.4410, lng: 7.5020, country: 'Nigeria' },

  // Accra, Ghana (approx 10 listings)
  { city: 'Accra', state: 'Greater Accra', neighborhood: 'Airport Residential', baseAddress: 'Liberation Road, Airport Residential Area, Accra', lat: 5.6050, lng: -0.1820, country: 'Ghana' },
  { city: 'Accra', state: 'Greater Accra', neighborhood: 'Osu', baseAddress: 'Oxford Street, Osu District, Accra', lat: 5.5560, lng: -0.1830, country: 'Ghana' },
  { city: 'Accra', state: 'Greater Accra', neighborhood: 'East Legon', baseAddress: 'Lagos Avenue, East Legon, Accra', lat: 5.6380, lng: -0.1550, country: 'Ghana' },

  // Nairobi, Kenya (approx 5 listings)
  { city: 'Nairobi', state: 'Nairobi County', neighborhood: 'Westlands', baseAddress: 'Mpaka Road, Westlands, Nairobi', lat: -1.2650, lng: 36.8040, country: 'Kenya' },
  { city: 'Nairobi', state: 'Nairobi County', neighborhood: 'Kilimani', baseAddress: 'Argwings Kodhek Road, Kilimani, Nairobi', lat: -1.2910, lng: 36.7860, country: 'Kenya' },

  // Kigali, Rwanda (approx 5 listings)
  { city: 'Kigali', state: 'Kigali City', neighborhood: 'Kimihurura', baseAddress: 'KG 674 Street, Kimihurura, Kigali', lat: -1.9540, lng: 30.0890, country: 'Rwanda' },
  { city: 'Kigali', state: 'Kigali City', neighborhood: 'Kacyiru', baseAddress: 'KG 7 Avenue, Kacyiru District, Kigali', lat: -1.9420, lng: 30.0750, country: 'Rwanda' },
];

interface SpaceArchetype {
  titlePrefix: string[];
  titleSuffix: string[];
  category: SpaceCategory;
  taglineTemplates: string[];
  descriptionTemplates: string[];
  pricingBasis: PricingBasis;
  pricingPeriod: PricingPeriod;
  baseHourly: number;
  baseDaily: number;
  baseMonthly?: number;
  baseSession?: number;
  sessionDurationHours?: number;
  capacityRange: [number, number];
  noiseLevel: 'Silent / Library' | 'Moderate / Focus Buzz' | 'Soundproofed Studio' | 'Collaborative';
  amenityPool: string[];
  tagsPool: string[];
  seatType: 'hot_desk' | 'dedicated_desk' | 'private_office' | 'meeting_room' | 'booth';
}

const ARCHETYPES: SpaceArchetype[] = [
  // 1. Coworking Desks & Pods
  {
    titlePrefix: ['The Hive', 'Ventures', 'Silicon Lagoon', 'Focus Labs', 'Impact Hub', 'NextGen', 'The Foundry', 'Pixel & Co', 'Zenith', 'Launchpad', 'Alpha Hub', 'Matrix', 'Synergy', 'The Collective', 'Catalyst'],
    titleSuffix: ['Coworking & Tech Hub', 'Collaborative Workspace', 'Focus Desk Lounge', 'Innovators Hub', 'Sprint Station', 'FlexiDesk Lab', 'Day Pass Sanctuary', 'Makerspace'],
    category: 'coworking',
    taglineTemplates: [
      '300Mbps fiber internet, solar backup & artisanal espresso bar',
      'Quiet focus environment with ergonomic Herman Miller seating and high-speed WiFi',
      'Dual generator redundancy, soundproof phone booths & vibrant tech community',
      '24/7 biometric access with uninterrupted solar hybrid power and high-speed internet',
    ],
    descriptionTemplates: [
      'Designed specifically for remote developers, tech founders, and digital nomads seeking guaranteed power, lightning internet, and deep focus.',
      'A serene, design-forward coworking environment with ergonomic seating, silent call pods, and unlimited barista-crafted coffee.',
      'Modern open-plan workspaces featuring high-speed Starlink & fiber redundancy, enterprise desks, and a thriving community of builders.',
    ],
    pricingBasis: 'person',
    pricingPeriod: 'hour',
    baseHourly: 2500,
    baseDaily: 15000,
    baseMonthly: 120000,
    capacityRange: [20, 80],
    noiseLevel: 'Moderate / Focus Buzz',
    amenityPool: [
      '24/7 Solar & Gen Power',
      '300Mbps High-Speed Internet',
      'Ergonomic Herman Miller Chairs',
      'Artisanal Coffee & Tea Bar',
      'Acoustic Phone Booths',
      'Secure Electronic Turnstiles',
      'Ethernet / Cat6 LAN Ports',
      'Free Secured Parking',
      'Locker Storage',
      'Outdoor Relaxation Terrace',
    ],
    tagsPool: ['High-Speed Internet', 'Solar Backed', 'Instant Book', '24/7 Access', 'Coffee Bar', 'Ergonomic'],
    seatType: 'hot_desk',
  },

  // 2. Executive Meeting Rooms & Boardrooms
  {
    titlePrefix: ['The Glasshouse', 'Apex', 'Crown', 'Summit', 'Stratum', 'Boardroom One', 'Executive', 'Pinnacle', 'Meridian', 'Vanguard', 'Horizon', 'Monarch'],
    titleSuffix: ['Executive Boardroom', 'Strategy Suite', '4K Video Conference Room', 'Client Pitch Salon', 'Director Meeting Hub', 'Lagoon View Boardroom'],
    category: 'meeting-room',
    taglineTemplates: [
      '85" Sony 4K presentation display, Polycom studio cam & acoustic soundproofing',
      'Executive boardroom with panoramic city views and white-glove hospitality',
      'Enterprise video conferencing setup with high-speed fiber & dual microphone arrays',
      'Soundproofed strategy room with digital smartboard and executive catering',
    ],
    descriptionTemplates: [
      'High-stakes presentation and client pitch boardroom outfitted with enterprise 4K video conferencing, motorized privacy blinds, and executive beverage service.',
      'Sleek executive meeting space engineered with acoustic wall dampening, high-speed fiber internet, and seamless wireless display casting.',
      'Prestigious boardroom setting ideal for director boards, investor discussions, and remote hybrid team workshops.',
    ],
    pricingBasis: 'space',
    pricingPeriod: 'hour',
    baseHourly: 16000,
    baseDaily: 95000,
    capacityRange: [8, 20],
    noiseLevel: 'Silent / Library',
    amenityPool: [
      '85-inch 4K Sony Presentation Display',
      'Polycom Studio 4K Conference Cam',
      'Dual Acoustic Microphone Array',
      'High-Speed Internet (500Mbps)',
      '100% Uninterrupted Power',
      'Wireless Screen Mirroring (AirPlay/Miracast)',
      'Executive Whiteboard & Digital Flipchart',
      'Complimentary Nespresso & Refreshments',
      'Motorized Acoustic Privacy Blinds',
      'Dedicated Hospitality Attendant',
    ],
    tagsPool: ['4K Display', 'Polycom AV', 'Boardroom', 'Silent Focus', 'Catering Available', 'Lagoon View'],
    seatType: 'meeting_room',
  },

  // 3. Private Offices & Team Headquarters
  {
    titlePrefix: ['HQ One', 'Sanctuary', 'Fortress', 'The Suite', 'Cornerstone', 'Ascent', 'Prime', 'Tower', 'Executive Loft', 'Valence', 'Nexus', 'Beacon'],
    titleSuffix: ['Private Team Suite', 'Executive Enclosed Office', 'Dedicated Scaleup Suite', 'Startup Headquarters', 'CEO Corner Office', 'Duplex Office Suite'],
    category: 'private-office',
    taglineTemplates: [
      'Lockable private team suite with 24/7 biometric access and dedicated gigabit LAN',
      'Turnkey private office for scaling tech teams with custom branding options',
      'Enclosed soundproofed executive office with private lounge and ensuite restroom',
      'Full-floor team office with dual generator backup and private breakout booth',
    ],
    descriptionTemplates: [
      'Fully furnished private office suite featuring biometric smart lock, dedicated gigabit network lines, executive desks, and daily concierge maintenance.',
      'Spacious turnkey office for teams of 4-16 professionals seeking enterprise privacy, unlimited power, and professional client reception.',
      'Designed for growing companies requiring dedicated branding, quiet acoustic isolation, and seamless workspace management.',
    ],
    pricingBasis: 'space',
    pricingPeriod: 'month',
    baseHourly: 25000,
    baseDaily: 140000,
    baseMonthly: 850000,
    capacityRange: [4, 18],
    noiseLevel: 'Silent / Library',
    amenityPool: [
      'Lockable Smart Biometric Access',
      'Dedicated Gigabit LAN & WiFi 6',
      'Dual Diesel Generator Backup',
      'Private Acoustic Phone Pod',
      'Daily Janitorial & Reception Service',
      'Executive Ergonomic Desks',
      'Company Signage Display',
      'Included Meeting Room Credits',
      'Ensuite Mini-Fridge & Barista Access',
      'CCTV & 24/7 Security Patrol',
    ],
    tagsPool: ['Private Suite', 'Monthly Plan', 'Gigabit Fiber', 'Lockable', 'Dedicated Reception', '24/7 Access'],
    seatType: 'private_office',
  },

  // 4. Training Rooms & Masterclass Labs
  {
    titlePrefix: ['Academia', 'SkillForge', 'Mastery', 'DevCampus', 'Lighthouse', 'The Arena', 'Knowledge Lab', 'CodeForge', 'Turing', 'Polymath'],
    titleSuffix: ['Tech Training Center', 'Developer Bootcamp Arena', 'Corporate Seminar Hall', 'Workshop & Masterclass Lab', 'Interactive Lecture Suite'],
    category: 'training-room',
    taglineTemplates: [
      'Dual high-lumen laser projectors, wireless mic systems & tiered classroom desks',
      'Equipped for tech hackathons, masterclasses, and corporate certification workshops',
      'Ultra-reliable power, 500Mbps WiFi capacity for 50 concurrent laptops & PA audio',
    ],
    descriptionTemplates: [
      'Purpose-built training facility with high-density power plugs at every desk, laser projection, omnidirectional wireless microphones, and breakout discussion nooks.',
      'High-capacity interactive learning space ideal for developer bootcamps, executive corporate training, and interactive workshops.',
      'Modern seminar hall with flexible furniture configurations (classroom, U-shape, or cluster) and full AV technician support.',
    ],
    pricingBasis: 'space',
    pricingPeriod: 'day',
    baseHourly: 20000,
    baseDaily: 120000,
    capacityRange: [25, 60],
    noiseLevel: 'Collaborative',
    amenityPool: [
      'Dual Laser HD Projectors & 120" Screen',
      'Wireless Lapel & Handheld Mic Array',
      'Power Strip at Every Seat',
      '500Mbps High-Capacity Concurrent WiFi',
      'Ceiling Surround Sound System',
      'Stage & Presenter Podium',
      'Magnetic Whiteboard Walls',
      'Coffee & Buffet Setup Area',
      'On-site AV Technician Support',
      'Breakout Discussion Zones',
    ],
    tagsPool: ['Training Hall', 'Laser Projector', 'PA System', 'High Capacity', 'Full Day Pass', 'Whiteboard'],
    seatType: 'hot_desk',
  },

  // 5. Event Spaces & Keynote Auditoriums
  {
    titlePrefix: ['The Forum', 'Grand Horizon', 'Atrium', 'Amphitheatre', 'Pulse', 'Oasis Terrace', 'The Pavilion', 'Skyline', 'Grand Ballroom', 'Terra'],
    titleSuffix: ['Tech Launch Auditorium', 'Rooftop Mixer Terrace', 'Keynote & Demo Hall', 'Community Event Arena', 'Corporate Gala Space'],
    category: 'event-space',
    taglineTemplates: [
      'State-of-the-art keynote stage, LED video wall, cinematic lighting & rooftop terrace',
      'Prime venue for tech product launches, venture demo days & corporate mixers',
      'Accommodates up to 200 guests with full staging, bar setup & live streaming AV',
    ],
    descriptionTemplates: [
      'Spectacular event venue featuring a wide LED backdrop, dynamic stage lighting, surround line-array audio, and outdoor cocktail deck for networking.',
      'Ideal for demo days, tech conferences, executive banquets, and hybrid international broadcasts with live streaming support.',
      'Vibrant open-architecture hall designed to inspire, featuring dramatic high ceilings, flexible layout zones, and professional sound engineering.',
    ],
    pricingBasis: 'space',
    pricingPeriod: 'day',
    baseHourly: 45000,
    baseDaily: 280000,
    capacityRange: [50, 200],
    noiseLevel: 'Collaborative',
    amenityPool: [
      'Wall-Mounted 4K LED Video Backdrop',
      'Stage Lighting & Follow Spots',
      'Pro Line-Array Sound & Mixers',
      'Live Streaming Broadcast Rig',
      'Cocktail Bar & Catering Prep Kitchen',
      'Green Room for Speakers',
      'Outdoor Rooftop Networking Deck',
      'VIP Dedicated Valet Parking',
      'Backup Heavy Duty Diesel Generator',
      'Event Security & Host Team',
    ],
    tagsPool: ['LED Video Wall', 'Rooftop Terrace', 'Stage & Sound', 'Event Venue', 'Live Stream', 'VIP Lounge'],
    seatType: 'hot_desk',
  },

  // 6. Studios (Podcast & Photography)
  {
    titlePrefix: ['SoundStage', 'Waveform', 'The Booth', 'Capture Lab', 'Echo', 'Vibe Studio', 'Cyclorama', 'Creator Hub', 'Broadcast One', 'Studio 24'],
    titleSuffix: ['Broadcast Podcast Studio', '4K Video & Cyclorama Studio', 'Creator Production Bay', 'Soundproof Recording Pod', 'Media Production Suite'],
    category: 'studio',
    taglineTemplates: [
      '4x Shure SM7B mics, Rodecaster Pro II, 4K Sony FX3 multi-cam & broadcast lighting',
      'Acoustic-treated sound room (-60dB floor) with 4K video recording and livestream rig',
      'Infinity white cyclorama wall with Godox continuous lights and backdrop system',
    ],
    descriptionTemplates: [
      'Broadcast-grade audio and video recording suite equipped with Shure microphones, Rodecaster audio desk, 4K cameras, and acoustic acoustic panels.',
      'Modern content creator studio optimized for podcasting, YouTube video shoots, livestreaming, and executive interview recordings.',
      'Professional photography and commercial video studio featuring infinity cyclorama wall, softboxes, boom mics, and dressing vanity.',
    ],
    pricingBasis: 'space',
    pricingPeriod: 'session',
    baseHourly: 12000,
    baseDaily: 80000,
    baseSession: 25000,
    sessionDurationHours: 2,
    capacityRange: [2, 8],
    noiseLevel: 'Soundproofed Studio',
    amenityPool: [
      '4x Shure SM7B Dynamic Vocal Mics',
      'Rodecaster Pro II Production Console',
      '3x Sony FX3 4K Multi-Camera Setup',
      'Aperture Pro Studio Lighting & Softboxes',
      'Soundproofed Acoustic Treatment (-60dB)',
      'Teleprompter & HDMI Multiview Monitor',
      'Ultra-Fast Gigabit File Offload Line',
      'On-site Audio Engineer (Optional)',
      'Cyclorama Infinity Wall',
      'Private Makeup & Dressing Vanity',
    ],
    tagsPool: ['Podcast Studio', 'Shure SM7B', 'Soundproof', '4K Cameras', 'Session Pass', 'Cyclorama'],
    seatType: 'booth',
  },

  // 7. Creative & Bespoke Spaces
  {
    titlePrefix: ['The Glass Box', 'Lagoon Breeze', 'Sky Loft', 'The Greenhouse', 'Atelier', 'EcoPod', 'The Terrace', 'Boutique Loft'],
    titleSuffix: ['Lagoonfront Creative Cabana', 'Rooftop Sun Deck & Lounge', 'Penthouse Focus Atelier', 'Garden Work Pod', 'Industrial Container Studio'],
    category: 'other',
    taglineTemplates: [
      'Waterfront breeze, lush garden surroundings & high-speed solar-backed WiFi',
      'Boutique penthouse creative lounge overlooking the city skyline with artisanal snacks',
      'Outdoor-indoor hybrid work oasis designed for brainstorming sessions and retreats',
    ],
    descriptionTemplates: [
      'An inspiring non-traditional workspace combining natural tranquility with modern enterprise connectivity, ergonomic seating, and fresh air.',
      'Charming creative haven featuring panoramic skyline vistas, comfortable lounge seating, and high-speed Starlink connectivity.',
      'Designed for offsite strategy sessions, team retreats, and creative design sprints in a refreshing architectural atmosphere.',
    ],
    pricingBasis: 'space',
    pricingPeriod: 'hour',
    baseHourly: 14000,
    baseDaily: 75000,
    capacityRange: [6, 25],
    noiseLevel: 'Moderate / Focus Buzz',
    amenityPool: [
      'Lagoon / Skyline Panoramic Views',
      'Lush Garden & Outdoor Seating',
      'High-Speed Solar Hybrid WiFi',
      'Artisanal Refreshments & Tea Bar',
      'Natural Sunlight Architecture',
      'Whiteboard & Flipcharts',
      'Bluetooth Sound System',
      'Secure On-site Parking',
      'Pet Friendly Work Zone',
      'Dedicated Concierge',
    ],
    tagsPool: ['Waterfront', 'Rooftop', 'Creative Loft', 'Garden Views', 'Pet Friendly', 'Retreat Space'],
    seatType: 'hot_desk',
  },
];

const POWER_TYPES = [
  'Heavy Duty Gen + Solar Hybrid',
  'Dual Diesel Generators',
  'Solar + Inverter',
  'Grid + Inverter Auto-Switch',
] as const;

const INTERNET_ISPS = [
  'MainOne Dedicated Fiber (Redundant)',
  'Liquid Intelligent Technologies',
  'Starlink High-Performance Business',
  'Spectranet Enterprise Fiber',
  'MTN 5G / Fiber Broadband',
  'Cobanet Dedicated Wireless Fiber',
  'Vodafone Enterprise Fiber',
  'Safaricom Dedicated Business',
];

function generateFloorPlan(seatType: string, basePrice: number): FloorPlanSeat[] {
  const seats: FloorPlanSeat[] = [];
  const count = 6;
  for (let i = 1; i <= count; i++) {
    const statuses: ('available' | 'occupied' | 'reserved')[] = ['available', 'available', 'available', 'occupied', 'reserved'];
    const status = statuses[i % statuses.length];
    const x = 15 + ((i - 1) % 3) * 32;
    const y = i <= 3 ? 30 : 65;
    seats.push({
      id: `seat-${i}`,
      label: `Workstation ${i.toString().padStart(2, '0')}`,
      type: seatType as any,
      status,
      pricePerHour: basePrice,
      x,
      y,
    });
  }
  return seats;
}

export function generate200MockSpaces(): Space[] {
  const spaces: Space[] = [];

  // Known legacy primary IDs to retain full backward compatibility with mock reviews and bookmarks
  const PRIMARY_IDS = [
    'space-vi-hive',
    'space-ikoyi-boardroom',
    'space-ikoyi-glass',
    'space-lekki-podcast',
    'space-yaba-incubator',
    'space-abuja-boardroom',
    'space-ikeja-office',
    'space-ph-hub',
    'space-ibadan-training',
    'space-enugu-creative',
  ];

  for (let i = 1; i <= 200; i++) {
    const archetypeIndex = (i - 1) % ARCHETYPES.length;
    const archetype = ARCHETYPES[archetypeIndex];

    const locIndex = (i - 1) % LOCATION_TEMPLATES.length;
    const loc = LOCATION_TEMPLATES[locIndex];

    const hostIndex = (i - 1) % HOST_POOL.length;
    const host = HOST_POOL[hostIndex];

    const prefix = archetype.titlePrefix[(i * 3) % archetype.titlePrefix.length];
    const suffix = archetype.titleSuffix[(i * 2) % archetype.titleSuffix.length];
    const title = `${prefix} ${suffix} - ${loc.neighborhood}`;

    const tagline = archetype.taglineTemplates[i % archetype.taglineTemplates.length];
    const description = `${archetype.descriptionTemplates[i % archetype.descriptionTemplates.length]} Located in prestigious ${loc.neighborhood}, ${loc.city}, offering guaranteed power and verified enterprise amenities.`;

    // Price variations (±15% based on location tier)
    const tierMultiplier = loc.city === 'Lagos' || loc.city === 'Abuja' ? 1.0 : 0.85;
    const hourlyRate = Math.round((archetype.baseHourly * (0.9 + ((i * 7) % 25) / 100) * tierMultiplier) / 500) * 500;
    const dailyRate = Math.round((archetype.baseDaily * (0.9 + ((i * 5) % 25) / 100) * tierMultiplier) / 1000) * 1000;
    const monthlyRate = archetype.baseMonthly ? Math.round((archetype.baseMonthly * (0.9 + ((i * 3) % 20) / 100) * tierMultiplier) / 5000) * 5000 : dailyRate * 18;
    const sessionRate = archetype.baseSession ? Math.round((archetype.baseSession * (0.95 + ((i * 4) % 15) / 100)) / 1000) * 1000 : undefined;

    // Pricing basis & period
    const basis = archetype.pricingBasis;
    const period = archetype.pricingPeriod;
    const activeRate = period === 'hour' ? hourlyRate : (period === 'day' ? dailyRate : (period === 'month' ? monthlyRate : (sessionRate || hourlyRate)));

    // Capacity
    const [minCap, maxCap] = archetype.capacityRange;
    const capacity = minCap + ((i * 11) % (maxCap - minCap + 1));

    // Power & Internet
    const powerType = POWER_TYPES[i % POWER_TYPES.length];
    const internetIsp = INTERNET_ISPS[i % INTERNET_ISPS.length];
    const internetSpeedMbps = [150, 250, 300, 500, 750, 1000][(i * 3) % 6];
    const powerUptime = 99.8 + ((i % 3) * 0.1);

    // Images
    const imgIndex1 = (i * 2) % WORKSPACE_IMAGES.length;
    const imgIndex2 = (i * 2 + 1) % WORKSPACE_IMAGES.length;
    const imgIndex3 = (i * 2 + 2) % WORKSPACE_IMAGES.length;
    const featuredImage = WORKSPACE_IMAGES[imgIndex1];
    const images = [WORKSPACE_IMAGES[imgIndex1], WORKSPACE_IMAGES[imgIndex2], WORKSPACE_IMAGES[imgIndex3]];

    // Amenities (pick 7-8 from pool)
    const amenities = archetype.amenityPool.slice(0, 8);

    // Ratings & Reviews
    const rating = Number((4.6 + ((i * 13) % 40) / 100).toFixed(1));
    const reviewsCount = 12 + ((i * 17) % 230);

    // Availability
    const availStatuses = ['available_now', 'available_now', 'available_today', 'opens_tomorrow'] as const;
    const availabilityStatus = availStatuses[i % availStatuses.length];
    const occupancies = ['low', 'busy', 'almost_full'] as const;
    const occupancyLevel = occupancies[i % occupancies.length];

    // Jittered Coordinates (distinct pin per listing within neighborhood)
    const latJitter = ((i % 17) - 8) * 0.0025;
    const lngJitter = (((i * 3) % 19) - 9) * 0.0025;

    // Floor plan
    const floorPlanSeats = generateFloorPlan(archetype.seatType, hourlyRate);

    const spaceId = i <= PRIMARY_IDS.length ? PRIMARY_IDS[i - 1] : `space-listing-${i.toString().padStart(3, '0')}`;

    spaces.push({
      id: spaceId,
      title,
      tagline,
      description,
      category: archetype.category,
      city: loc.city,
      state: loc.state,
      neighborhood: loc.neighborhood,
      address: `${10 + (i % 80)} ${loc.baseAddress}`,
      latitude: Number((loc.lat + latJitter).toFixed(6)),
      longitude: Number((loc.lng + lngJitter).toFixed(6)),
      pricePerHour: hourlyRate,
      pricePerDay: dailyRate,
      pricePerMonth: monthlyRate,
      pricePerSession: sessionRate,
      pricingBasis: basis,
      pricingPeriod: period,
      pricingModel: {
        basis,
        period,
        rate: activeRate,
        minimumQuantity: 1,
        sessionDurationHours: archetype.sessionDurationHours,
      },
      capacity,
      hasBackupPower: true,
      powerType,
      powerUptimeGuaranteePercent: Number(powerUptime.toFixed(1)),
      internetSpeedMbps,
      internetIsp,
      noiseLevel: archetype.noiseLevel,
      images,
      featuredImage,
      amenities,
      rating: Math.min(5.0, rating),
      reviewsCount,
      host,
      operatingHours: {
        open: i % 4 === 0 ? '00:00' : '07:00',
        close: i % 4 === 0 ? '23:59' : '22:00',
        days: i % 4 === 0 ? '24/7 Access Everyday' : 'Mon - Sat (Sun: 10:00 - 18:00)',
      },
      rules: [
        'Scan digital QR pass at security turnstile for entrance',
        'Use dedicated acoustic call booths for phone & video calls',
        'No smoking or external loud sound amplifiers',
      ],
      tags: [...archetype.tagsPool, loc.neighborhood, 'Verified Partner'],
      isVerified: true,
      verificationStatus: 'verified',
      isSuperhost: i % 3 === 0,
      instantBooking: true,
      freeCancellation: true,
      isActive: true,
      availabilityStatus,
      occupancyLevel,
      floorPlanSeats,
    });
  }

  return spaces;
}

export const MOCK_SPACES_200 = generate200MockSpaces();
