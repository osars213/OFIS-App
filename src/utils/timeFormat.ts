/**
 * Utilities for formatting time in 12-hour (AM/PM) and 24-hour formats
 */

export function convertTimeTo12Hour(timeStr?: string | null): string {
  if (!timeStr) return '';
  if (timeStr === 'any') return 'Any Time';
  
  // Clean up whitespace
  const trimmed = timeStr.trim();

  // If it already has AM/PM, normalize it
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${period}`;
  }

  // Handle standard HH:mm (24h)
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    let hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${period}`;
  }

  return trimmed;
}

export function convertTimeTo24Hour(timeStr?: string | null): string {
  if (!timeStr) return '';
  if (timeStr === 'any') return 'any';

  const trimmed = timeStr.trim();

  // Handle 12-hour AM/PM formats e.g. "8:00 AM", "08:00 AM", "2:00 PM"
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const isPM = ampmMatch[3].toUpperCase() === 'PM';

    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  // Handle standard 24h format e.g. "8:00" -> "08:00"
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  return trimmed;
}

export function formatTimeDisplay(timeStr?: string | null, format: '12h' | '24h' = '12h'): string {
  if (!timeStr) return '';
  if (timeStr === 'any') return 'Any Time';
  return format === '12h' ? convertTimeTo12Hour(timeStr) : convertTimeTo24Hour(timeStr);
}
