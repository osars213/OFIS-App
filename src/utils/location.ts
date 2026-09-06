/**
 * Robust Location Extraction & Formatting Utilities for OFIS
 *
 * Provides structured normalization, parsing, and query matching
 * for space locations, cities, states, neighborhoods, and coordinates.
 */

import { Space } from '../types';

export interface StructuredLocation {
  city: string;
  state: string;
  neighborhood: string;
  address: string;
  fullAddress: string;
  hasCoordinates: boolean;
  latitude?: number;
  longitude?: number;
}

/**
 * Normalizes any text query or location string by trimming, lowercasing,
 * and collapsing multiple spaces.
 */
export function normalizeLocationText(text?: string | null): string {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Extracts a structured location object from any Space record, guaranteeing
 * clean fallbacks for null/undefined fields without inventing fictitious data.
 */
export function extractStructuredLocation(space?: Partial<Space> | null): StructuredLocation {
  if (!space) {
    return {
      city: '',
      state: '',
      neighborhood: '',
      address: '',
      fullAddress: '',
      hasCoordinates: false,
    };
  }

  const city = (space.city || '').trim();
  const state = (space.state || '').trim();
  const neighborhood = (space.neighborhood || '').trim();
  const address = (space.address || '').trim();

  const parts: string[] = [];
  if (address) parts.push(address);
  if (neighborhood && !address.toLowerCase().includes(neighborhood.toLowerCase())) {
    parts.push(neighborhood);
  }
  if (city && !address.toLowerCase().includes(city.toLowerCase())) {
    parts.push(city);
  }
  if (state && !address.toLowerCase().includes(state.toLowerCase()) && state !== city) {
    parts.push(state);
  }

  const fullAddress = parts.join(', ') || address || `${neighborhood ? `${neighborhood}, ` : ''}${city}`;

  const hasCoordinates =
    typeof space.latitude === 'number' &&
    !isNaN(space.latitude) &&
    typeof space.longitude === 'number' &&
    !isNaN(space.longitude) &&
    (space.latitude !== 0 || space.longitude !== 0);

  return {
    city,
    state,
    neighborhood,
    address,
    fullAddress,
    hasCoordinates,
    latitude: hasCoordinates ? space.latitude : undefined,
    longitude: hasCoordinates ? space.longitude : undefined,
  };
}

/**
 * Formats a clean, readable short location label for cards and list items.
 * Example: "Victoria Island, Lagos" or "Maitama, Abuja"
 */
export function formatLocationShort(space?: Partial<Space> | null): string {
  if (!space) return 'Location on request';
  const neighborhood = (space.neighborhood || '').trim();
  const city = (space.city || '').trim();

  if (neighborhood && city) {
    if (neighborhood.toLowerCase() === city.toLowerCase()) return city;
    return `${neighborhood}, ${city}`;
  }
  if (neighborhood) return neighborhood;
  if (city) return city;
  if (space.address) return space.address;
  return 'Location on request';
}

/**
 * Formats a full address string for detail views and navigation directions.
 */
export function formatLocationFull(space?: Partial<Space> | null): string {
  if (!space) return 'Address available upon booking';
  const loc = extractStructuredLocation(space);
  return loc.fullAddress || loc.address || formatLocationShort(space) || 'Address available upon booking';
}

/**
 * Performs flexible location and keyword matching across space attributes:
 * - Address
 * - Neighborhood
 * - City
 * - State
 * - Title
 * - Tags
 * - Description
 */
export function matchesLocationOrQuery(space: Space, rawQuery: string): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;

  const q = normalizeLocationText(rawQuery);
  const terms = q.split(' ').filter(t => t.length > 0);

  const spaceCity = normalizeLocationText(space.city);
  const spaceNeighborhood = normalizeLocationText(space.neighborhood);
  const spaceState = normalizeLocationText(space.state);
  const spaceAddress = normalizeLocationText(space.address);
  const spaceTitle = normalizeLocationText(space.title);
  const spaceDesc = normalizeLocationText(space.description);
  const spaceTags = (space.tags || []).map(t => normalizeLocationText(t));

  const allSearchable = [
    spaceCity,
    spaceNeighborhood,
    spaceState,
    spaceAddress,
    spaceTitle,
    spaceDesc,
    ...spaceTags,
  ].join(' ');

  // Every token in query must match somewhere in searchable text
  return terms.every(term => allSearchable.includes(term));
}

/**
 * Extracts unique available cities from an array of spaces dynamically.
 */
export function getUniqueCitiesFromSpaces(spaces: Space[]): string[] {
  const citySet = new Set<string>();
  spaces.forEach(s => {
    if (s.city && s.city.trim()) {
      citySet.add(s.city.trim());
    }
  });
  return Array.from(citySet).sort((a, b) => a.localeCompare(b));
}

/**
 * Extracts unique available neighborhoods from an array of spaces dynamically,
 * optionally filtered by a specific city.
 */
export function getUniqueNeighborhoodsFromSpaces(spaces: Space[], cityFilter?: string): string[] {
  const nSet = new Set<string>();
  const normalizedCity = cityFilter && cityFilter !== 'All Cities' ? normalizeLocationText(cityFilter) : null;

  spaces.forEach(s => {
    if (!s.neighborhood || !s.neighborhood.trim()) return;
    if (normalizedCity) {
      if (normalizeLocationText(s.city) === normalizedCity) {
        nSet.add(s.neighborhood.trim());
      }
    } else {
      nSet.add(s.neighborhood.trim());
    }
  });

  return Array.from(nSet).sort((a, b) => a.localeCompare(b));
}
