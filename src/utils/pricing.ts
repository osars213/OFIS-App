import { Space, SpaceCategory, PricingBasis, PricingPeriod, BookingPriceBreakdown } from '../types';

/**
 * Returns a human-friendly label for any space category.
 */
export function getCategoryLabel(cat?: string | null): string {
  const normalized = normalizeCategory(cat);
  switch (normalized) {
    case 'meeting-room':
      return 'Meeting Room';
    case 'private-office':
      return 'Private Office';
    case 'training-room':
      return 'Training Room';
    case 'event-space':
      return 'Event Space';
    case 'studio':
      return 'Studio';
    case 'other':
      return 'Flexible Space';
    case 'coworking':
    default:
      return 'Coworking Desk';
  }
}
export function normalizeCategory(cat?: string | null): SpaceCategory {
  if (!cat) return 'coworking';
  const c = cat.toLowerCase().trim();
  if (c === 'meeting' || c === 'meeting-room' || c === 'meeting_room' || c === 'boardroom') {
    return 'meeting-room';
  }
  if (c === 'private_office' || c === 'private-office' || c === 'office' || c === 'executive_suite') {
    return 'private-office';
  }
  if (c === 'training' || c === 'training-room' || c === 'training_room' || c === 'workshop') {
    return 'training-room';
  }
  if (c === 'event' || c === 'event-space' || c === 'event_space' || c === 'hall') {
    return 'event-space';
  }
  if (c === 'studio' || c === 'podcast' || c === 'photography' || c === 'photo_studio' || c === 'media') {
    return 'studio';
  }
  if (c === 'other' || c === 'creative' || c === 'rooftop') {
    return 'other';
  }
  return 'coworking';
}

export interface SpacePricingInfo {
  basis: PricingBasis;
  period: PricingPeriod;
  rate: number;
  rateDisplay: string;
  unitLabel: string;
  basisLabel: string;
  fullBadge: string;
  isPerPerson: boolean;
  isMonthly: boolean;
  isDaily: boolean;
  isHourly: boolean;
  isSession: boolean;
  sessionDurationHours?: number;
}

export function formatPriceNGN(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₦0';
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

export function getDefaultRateForPeriod(period: PricingPeriod, category?: string): number {
  const norm = normalizeCategory(category);
  if (norm === 'coworking') {
    if (period === 'day') return 18000;
    if (period === 'month') return 150000;
    if (period === 'session') return 15000;
    return 3500; // hour
  }
  if (norm === 'meeting-room') {
    if (period === 'day') return 90000;
    if (period === 'month') return 800000;
    if (period === 'session') return 40000;
    return 15000; // hour
  }
  if (norm === 'private-office') {
    if (period === 'month') return 350000;
    if (period === 'day') return 45000;
    if (period === 'session') return 30000;
    return 8000; // hour
  }
  if (norm === 'training-room') {
    if (period === 'day') return 85000;
    if (period === 'month') return 950000;
    if (period === 'session') return 50000;
    return 25000; // hour
  }
  if (norm === 'event-space') {
    if (period === 'day') return 250000;
    if (period === 'month') return 2500000;
    if (period === 'session') return 150000;
    return 45000; // hour
  }
  if (norm === 'studio') {
    if (period === 'session') return 35000;
    if (period === 'day') return 120000;
    if (period === 'month') return 600000;
    return 20000; // hour
  }
  // Generic defaults
  if (period === 'day') return 25000;
  if (period === 'month') return 250000;
  if (period === 'session') return 30000;
  return 5000; // hour
}

/**
 * Determines the effective pricing model for a space with 100% backward compatibility.
 */
export function getSpacePricing(space?: Space | null): SpacePricingInfo {
  if (!space) {
    return {
      basis: 'person',
      period: 'hour',
      rate: 3500,
      rateDisplay: '₦3,500',
      unitLabel: 'hr',
      basisLabel: 'person',
      fullBadge: '₦3,500 / person / hr',
      isPerPerson: true,
      isMonthly: false,
      isDaily: false,
      isHourly: true,
      isSession: false,
    };
  }

  const cat = normalizeCategory(space.category);

  // 1. Explicit model check
  if (space.pricingModel) {
    const basis = space.pricingModel.basis || space.pricingBasis || 'person';
    const period = space.pricingModel.period || space.pricingPeriod || 'hour';
    const rawRate = space.pricingModel.rate || space.pricePerHour;
    const rate = rawRate && rawRate > 0 ? rawRate : getDefaultRateForPeriod(period, cat);
    return buildPricingInfo(basis, period, rate, space.pricingModel.sessionDurationHours, cat);
  }

  // 2. Explicit direct attributes
  if (space.pricingBasis && space.pricingPeriod) {
    let rate = space.pricePerHour;
    if (space.pricingPeriod === 'month' && space.pricePerMonth) {
      rate = space.pricePerMonth;
    } else if (space.pricingPeriod === 'day' && space.pricePerDay) {
      rate = space.pricePerDay;
    } else if (space.pricingPeriod === 'session' && space.pricePerSession) {
      rate = space.pricePerSession;
    }
    const finalRate = rate && rate > 0 ? rate : getDefaultRateForPeriod(space.pricingPeriod, cat);
    return buildPricingInfo(space.pricingBasis, space.pricingPeriod, finalRate, undefined, cat);
  }

  // 3. Fallback inference based on category & price attributes
  if (space.pricePerMonth && space.pricePerMonth > 0 && (cat === 'private-office' || !space.pricePerHour)) {
    return buildPricingInfo('space', 'month', space.pricePerMonth, undefined, cat);
  }

  if (cat === 'coworking') {
    return buildPricingInfo('person', 'hour', space.pricePerHour || 3500, undefined, cat);
  }

  if (cat === 'meeting-room') {
    return buildPricingInfo('space', 'hour', space.pricePerHour || 15000, undefined, cat);
  }

  if (cat === 'private-office') {
    if (space.pricePerMonth && space.pricePerMonth > 0) {
      return buildPricingInfo('space', 'month', space.pricePerMonth, undefined, cat);
    }
    return buildPricingInfo('space', 'day', space.pricePerDay || (space.pricePerHour ? space.pricePerHour * 8 : 45000), undefined, cat);
  }

  if (cat === 'training-room') {
    if (space.pricingBasis === 'person') {
      return buildPricingInfo('person', space.pricingPeriod || 'day', space.pricePerDay || 12000, undefined, cat);
    }
    return buildPricingInfo('space', 'hour', space.pricePerHour || 25000, undefined, cat);
  }

  if (cat === 'event-space') {
    if (space.pricePerDay && space.pricePerDay > ((space.pricePerHour || 0) * 6)) {
      return buildPricingInfo('space', 'day', space.pricePerDay, undefined, cat);
    }
    return buildPricingInfo('space', 'hour', space.pricePerHour || 45000, undefined, cat);
  }

  if (cat === 'studio') {
    if (space.pricePerSession && space.pricePerSession > 0) {
      return buildPricingInfo('space', 'session', space.pricePerSession, undefined, cat);
    }
    return buildPricingInfo('space', 'hour', space.pricePerHour || 20000, undefined, cat);
  }

  // Default fallback:
  return buildPricingInfo('space', 'hour', space.pricePerHour || 5000, undefined, cat);
}

function buildPricingInfo(basis: PricingBasis, period: PricingPeriod, rate?: number | null, sessionDurationHours?: number, category?: string): SpacePricingInfo {
  let safeRate = typeof rate === 'number' && !isNaN(rate) && rate > 0 ? rate : getDefaultRateForPeriod(period, category);
  const formattedRate = `₦${safeRate.toLocaleString('en-NG')}`;
  
  let unitLabel = 'hr';
  if (period === 'day') unitLabel = 'day';
  if (period === 'month') unitLabel = 'mo';
  if (period === 'session') unitLabel = 'session';

  const basisLabel = basis === 'person' ? 'person' : basis === 'space' ? 'room' : 'session';

  let fullBadge = '';
  if (basis === 'person') {
    fullBadge = `${formattedRate} / person / ${unitLabel}`;
  } else if (basis === 'space') {
    if (period === 'month') {
      fullBadge = `${formattedRate} / month`;
    } else if (period === 'day') {
      fullBadge = `${formattedRate} / day`;
    } else {
      fullBadge = `${formattedRate} / room / ${unitLabel}`;
    }
  } else {
    fullBadge = `${formattedRate} / session`;
  }

  return {
    basis,
    period,
    rate,
    rateDisplay: formattedRate,
    unitLabel,
    basisLabel,
    fullBadge,
    isPerPerson: basis === 'person',
    isMonthly: period === 'month',
    isDaily: period === 'day',
    isHourly: period === 'hour',
    isSession: period === 'session',
    sessionDurationHours: sessionDurationHours || (period === 'session' ? 2 : undefined),
  };
}

export interface BookingPriceParams {
  quantity?: number;
  durationHours?: number;
  days?: number;
  months?: number;
  sessions?: number;
  guests?: number;
  selectedPeriod?: PricingPeriod;
  customRate?: number;
  promoCode?: string;
  isWeekend?: boolean;
}

/**
 * Centralized booking total calculator.
 *
 * Rules:
 * - PER PERSON + PER HOUR: rate * guests * durationHours (e.g. ₦5,000 × 6 people × 2 hours = ₦60,000)
 * - PER SPACE + PER HOUR: rate * durationHours (e.g. ₦20,000 × 2 hours = ₦40,000; guest count does NOT multiply!)
 * - PER PERSON + PER DAY: rate * guests * days (e.g. ₦7,500 × 6 people × 1 day = ₦45,000)
 * - PER SPACE + PER DAY: rate * days (e.g. ₦30,000 × 1 day = ₦30,000; guests DO NOT multiply)
 * - PER MONTH: rate * months (e.g. ₦200,000 × 1 month = ₦200,000)
 * - PER SESSION: rate * sessions (or rate * guests * sessions if per person)
 */
export function calculateBookingPrice(space: Space, params: BookingPriceParams): BookingPriceBreakdown {
  const pricing = getSpacePricing(space);
  const basis = pricing.basis;
  const period = params.selectedPeriod || pricing.period;
  
  let baseRate = params.customRate || pricing.rate;
  
  // Apply weekend modifier if applicable
  if (params.isWeekend && space.pricingRules?.weekendMarkupPercent) {
    baseRate = Math.round(baseRate * (1 + space.pricingRules.weekendMarkupPercent / 100));
  } else if (params.isWeekend && space.pricingRules?.weekendMultiplier) {
    baseRate = Math.round(baseRate * space.pricingRules.weekendMultiplier);
  }

  const guests = Math.max(1, params.guests || 1);
  let quantity = 1;
  let unitWord = 'hr';

  if (period === 'hour') {
    quantity = Math.max(1, params.durationHours || 1);
    unitWord = quantity === 1 ? 'hr' : 'hrs';
  } else if (period === 'day') {
    quantity = Math.max(1, params.days || 1);
    unitWord = quantity === 1 ? 'day' : 'days';
  } else if (period === 'month') {
    quantity = Math.max(1, params.months || 1);
    unitWord = quantity === 1 ? 'month' : 'months';
  } else if (period === 'session') {
    quantity = Math.max(1, params.sessions || 1);
    unitWord = quantity === 1 ? 'session' : 'sessions';
  }

  let subtotal = 0;
  let guestMultiplierApplied = false;
  let rateDescription = '';

  const safeBaseRate = Math.round(baseRate || 0);
  const formattedBaseRate = `₦${safeBaseRate.toLocaleString('en-NG')}`;

  if (basis === 'person') {
    guestMultiplierApplied = true;
    subtotal = safeBaseRate * guests * quantity;
    const guestLabel = guests === 1 ? '1 guest' : `${guests} guests`;
    rateDescription = `${guestLabel} × ${quantity} ${unitWord} @ ${formattedBaseRate}/person/${period === 'hour' ? 'hr' : period}`;
  } else {
    // basis === 'space' or 'session'
    guestMultiplierApplied = false;
    subtotal = safeBaseRate * quantity;
    if (period === 'hour') {
      rateDescription = `${quantity} ${unitWord} @ ${formattedBaseRate}/room/hr`;
    } else if (period === 'day') {
      rateDescription = `${quantity} ${unitWord} @ ${formattedBaseRate}/day`;
    } else if (period === 'month') {
      rateDescription = `${quantity} ${unitWord} @ ${formattedBaseRate}/month`;
    } else {
      rateDescription = `${quantity} ${unitWord} @ ${formattedBaseRate}/session`;
    }
  }

  // Promotional or duration discounts
  let discountAmount = 0;
  if (space.pricingRules?.promotionalDiscountPercent) {
    discountAmount = Math.round(subtotal * (space.pricingRules.promotionalDiscountPercent / 100));
  } else if (period === 'day' && quantity >= 7 && space.pricingRules?.dailyDiscountPercent) {
    discountAmount = Math.round(subtotal * (space.pricingRules.dailyDiscountPercent / 100));
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  return {
    baseRate,
    basis,
    period,
    quantity,
    guests,
    guestMultiplierApplied,
    subtotal,
    discountAmount,
    totalAmount,
    rateDescription,
    summaryLabel: pricing.fullBadge,
  };
}

/**
 * Formats a space's rate into a clean, modern label.
 */
export function formatSpaceRate(space?: Space | null, options?: { showBasis?: boolean }): string {
  const p = getSpacePricing(space);
  if (options?.showBasis === false) {
    return `${p.rateDisplay}/${p.unitLabel}`;
  }
  return p.fullBadge;
}

export interface CategoryMetadataItem {
  id: SpaceCategory;
  label: string;
  shortLabel: string;
  tagline: string;
  iconName: string;
  badge: string;
  typicalPeriod: PricingPeriod;
  typicalBasis: PricingBasis;
  description: string;
  filterAmenities: { id: string; label: string; icon?: string }[];
}

export const CATEGORY_DEFINITIONS: Record<string, CategoryMetadataItem> = {
  coworking: {
    id: 'coworking',
    label: 'Coworking Desks & Pods',
    shortLabel: 'Coworking',
    tagline: 'High-speed desks, ergonomic seating, and instant passes for individuals & teams',
    iconName: 'Laptop',
    badge: 'Per Person / Hour or Day',
    typicalPeriod: 'hour',
    typicalBasis: 'person',
    description: 'Hot desks, dedicated stations, phone booths, and quiet focus lounges.',
    filterAmenities: [
      { id: 'ergonomic_chair', label: 'Herman Miller / Ergonomic' },
      { id: 'phone_booth', label: 'Soundproof Phone Booth' },
      { id: 'coffee_bar', label: 'Artisan Espresso Bar' },
      { id: 'locker', label: 'Personal Lockers' },
      { id: '24_7_access', label: '24/7 Keycard Access' },
    ],
  },
  'meeting-room': {
    id: 'meeting-room',
    label: 'Meeting & Boardrooms',
    shortLabel: 'Meeting Rooms',
    tagline: 'Executive conference rooms with 4K video displays, Polycom systems & whiteboard rigs',
    iconName: 'Users',
    badge: 'Per Room / Hour',
    typicalPeriod: 'hour',
    typicalBasis: 'space',
    description: 'Boardrooms and collaborative huddle spaces equipped for presentations & client pitches.',
    filterAmenities: [
      { id: '4k_display', label: '4K Presentation Display' },
      { id: 'video_conf', label: 'Polycom / Zoom Rooms Rig' },
      { id: 'whiteboard', label: 'Magnetic Glass Whiteboard' },
      { id: 'catering', label: 'Catering & Coffee Service' },
      { id: 'soundproof', label: 'Acoustic Soundproofing' },
    ],
  },
  'private-office': {
    id: 'private-office',
    label: 'Private Suites & Offices',
    shortLabel: 'Private Offices',
    tagline: 'Fully furnished, lockable team suites with dedicated meeting space and mail handling',
    iconName: 'Briefcase',
    badge: 'Per Space / Month or Day',
    typicalPeriod: 'month',
    typicalBasis: 'space',
    description: 'Enclosed, brandable office suites for teams of 2 to 50 members.',
    filterAmenities: [
      { id: 'lockable_suite', label: 'Lockable Private Office' },
      { id: '24_7_access', label: '24/7 Building Access' },
      { id: 'dedicated_meeting', label: 'Dedicated Meeting Room' },
      { id: 'mail_handling', label: 'Business Address & Mail' },
      { id: 'custom_branding', label: 'Custom Wall Branding' },
    ],
  },
  'training-room': {
    id: 'training-room',
    label: 'Training Rooms & Workshops',
    shortLabel: 'Training Rooms',
    tagline: 'Classroom-style layouts with dual projectors, PA wireless mics and modular desks',
    iconName: 'GraduationCap',
    badge: 'Per Person / Day or Per Space / Hour',
    typicalPeriod: 'day',
    typicalBasis: 'space',
    description: 'High-capacity lecture and workshop spaces configured for masterclasses, bootcamps & exams.',
    filterAmenities: [
      { id: 'dual_projector', label: 'Dual Projector / Screens' },
      { id: 'wireless_mic', label: 'Wireless PA Microphones' },
      { id: 'modular_desks', label: 'Modular Classroom Tables' },
      { id: 'breakout_area', label: 'Breakout Session Zone' },
      { id: 'high_capacity', label: '50+ Seat Capacity' },
    ],
  },
  'event-space': {
    id: 'event-space',
    label: 'Event Spaces & Halls',
    shortLabel: 'Event Spaces',
    tagline: 'Auditoriums and tech halls with stage lighting, concert sound and reception foyers',
    iconName: 'Sparkles',
    badge: 'Per Space / Day or Hour',
    typicalPeriod: 'day',
    typicalBasis: 'space',
    description: 'Venues for product launches, tech hackathons, demo days, and industry summits.',
    filterAmenities: [
      { id: 'stage_podium', label: 'Raised Stage & Podium' },
      { id: 'pro_audio', label: 'Concert PA & Sound Desk' },
      { id: 'stage_lighting', label: 'Dimmable Stage Lighting' },
      { id: 'catering_prep', label: 'Catering Prep Kitchen' },
      { id: 'valet_parking', label: 'Dedicated Valet / Parking' },
    ],
  },
  studio: {
    id: 'studio',
    label: 'Studios (Podcast, Photo & Film)',
    shortLabel: 'Creative Studios',
    tagline: 'Acoustically tuned studios with Shure SM7B mics, 4K multi-cam rigs and cyclorama walls',
    iconName: 'Camera',
    badge: 'Per Session or Per Hour',
    typicalPeriod: 'session',
    typicalBasis: 'space',
    description: 'Production spaces for podcasts, video recording, live streams, and commercial photo shoots.',
    filterAmenities: [
      { id: 'soundproof_studio', label: 'Studio Soundproofing (-50dB)' },
      { id: 'shure_sm7b', label: 'Shure SM7B Broadcast Mics' },
      { id: '4k_cameras', label: 'Blackmagic / Sony 4K Cams' },
      { id: 'cyclorama_wall', label: 'Infinity Cyclorama Wall' },
      { id: 'aputure_lights', label: 'Aputure Continuous Lights' },
      { id: 'green_room', label: 'Dressing & Makeup Vanity' },
    ],
  },
  other: {
    id: 'other',
    label: 'Unconventional & Creative Spaces',
    shortLabel: 'Creative Spaces',
    tagline: 'Rooftop lounges, garden work-pods, and bespoke production lofts',
    iconName: 'Building',
    badge: 'Flexible Space Rates',
    typicalPeriod: 'session',
    typicalBasis: 'space',
    description: 'Unique architectural spaces, outdoor terraces, and design hubs across Nigeria.',
    filterAmenities: [
      { id: 'rooftop_terrace', label: 'Rooftop City View' },
      { id: 'outdoor_garden', label: 'Garden Work Gazebo' },
      { id: 'dedicated_generator', label: '100% Dedicated Generator' },
      { id: 'private_security', label: '24/7 Gated Security' },
    ],
  },
};
