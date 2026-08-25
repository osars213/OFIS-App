import { Space, LiveAvailabilityStatus, OccupancyLevel, NextAvailableSlot } from '../types';

export interface SpaceAvailabilityInfo {
  status: LiveAvailabilityStatus;
  statusLabel: string;
  isAvailable: boolean; // true if available_now or available_today
  isAvailableNow: boolean; // true only if available_now
  nextSlot?: NextAvailableSlot;
  occupancyLabel?: string;
  occupancyLevel?: OccupancyLevel;
  confidenceBadges: string[];
}

/**
 * Returns complete availability, occupancy, and booking confidence metadata for a space.
 * Gracefully defaults or calculates values without extra network requests.
 */
export function getSpaceAvailability(space: Space): SpaceAvailabilityInfo {
  if (!space) {
    return {
      status: 'available_now',
      statusLabel: 'Available Now',
      isAvailable: true,
      isAvailableNow: true,
      confidenceBadges: ['Instant Confirmation', 'Verified Host', 'Free Cancellation'],
    };
  }

  // 1. Determine Live Availability Status
  let status: LiveAvailabilityStatus = space.availabilityStatus || 'available_now';
  let nextSlot: NextAvailableSlot | undefined = space.nextAvailableSlot;

  // Fallback heuristic if not explicitly set
  if (!space.availabilityStatus) {
    if (space.floorPlanSeats && space.floorPlanSeats.length > 0) {
      const availableSeats = space.floorPlanSeats.filter(s => s.status === 'available');
      if (availableSeats.length === 0) {
        status = 'fully_booked_today';
      } else {
        status = 'available_now';
      }
    } else {
      status = 'available_now';
    }
  }

  // Next slot assignment for unavailable or later-today states
  if (status === 'available_today' && !nextSlot) {
    nextSlot = { label: 'Today • 14:00', date: 'Today', time: '14:00' };
  } else if (status === 'fully_booked_today' && !nextSlot) {
    nextSlot = { label: 'Tomorrow • 09:00', date: 'Tomorrow', time: '09:00' };
  } else if (status === 'opens_tomorrow' && !nextSlot) {
    nextSlot = { 
      label: `Tomorrow • ${space.operatingHours?.open || '08:30'}`, 
      date: 'Tomorrow', 
      time: space.operatingHours?.open || '08:30' 
    };
  }

  let statusLabel = 'Available Now';
  if (status === 'available_today') {
    statusLabel = 'Available Today';
  } else if (status === 'fully_booked_today') {
    statusLabel = 'Fully Booked Today';
  } else if (status === 'opens_tomorrow') {
    statusLabel = 'Opens Tomorrow';
  }

  // 2. Real-Time Occupancy Indicator
  // STRICT CONSTRAINT: Do not invent occupancy data if none exists. Gracefully hide this indicator until live data becomes available.
  let occupancyLevel: OccupancyLevel | undefined = space.occupancyLevel;
  if (!occupancyLevel && space.floorPlanSeats && space.floorPlanSeats.length > 0) {
    const total = space.floorPlanSeats.length;
    const occupiedOrReserved = space.floorPlanSeats.filter(s => s.status === 'occupied' || s.status === 'reserved').length;
    const ratio = occupiedOrReserved / total;
    if (ratio >= 0.75) {
      occupancyLevel = 'almost_full';
    } else if (ratio >= 0.35) {
      occupancyLevel = 'busy';
    } else {
      occupancyLevel = 'low';
    }
  }

  let occupancyLabel: string | undefined;
  if (occupancyLevel === 'low') {
    occupancyLabel = 'Low Demand';
  } else if (occupancyLevel === 'busy') {
    occupancyLabel = 'Busy';
  } else if (occupancyLevel === 'almost_full') {
    occupancyLabel = 'Almost Full';
  }

  // 3. Booking Confidence Reassurance Metadata
  const confidenceBadges: string[] = [];
  
  if (space.instantBooking !== false) {
    confidenceBadges.push('Instant Confirmation');
  }
  
  if (space.host?.isVerified || space.isVerified) {
    confidenceBadges.push('Verified Host');
  }
  
  if (space.freeCancellation !== false) {
    confidenceBadges.push('Free Cancellation');
  }
  
  if (space.host?.responseTimeMinutes && space.host.responseTimeMinutes <= 15) {
    confidenceBadges.push(`Responds in ${space.host.responseTimeMinutes}m`);
  } else if (space.host?.responseRatePercent && space.host.responseRatePercent >= 95) {
    confidenceBadges.push('Responds Quickly');
  }

  return {
    status,
    statusLabel,
    isAvailable: status === 'available_now' || status === 'available_today',
    isAvailableNow: status === 'available_now',
    nextSlot,
    occupancyLabel,
    occupancyLevel,
    confidenceBadges: confidenceBadges.slice(0, 3), // concise reassurance
  };
}
