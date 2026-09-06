export type SupportedCurrency =
  | 'NGN'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'KES'
  | 'GHS'
  | 'ZAR'
  | 'AED'
  | 'INR'
  | 'AUD'
  | 'JPY';

export interface CurrencyMetadata {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  flag: string;
  rateToNgn: number; // 1 Currency unit = X NGN
  formatPrefix: string;
  formatSuffix: string;
  decimals: number;
}

export const CURRENCY_RATES: Record<SupportedCurrency, CurrencyMetadata> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    flag: '🇳🇬',
    rateToNgn: 1,
    formatPrefix: '₦',
    formatSuffix: '',
    decimals: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rateToNgn: 1550, // 1 USD = 1,550 NGN
    formatPrefix: '$',
    formatSuffix: '',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rateToNgn: 1680,
    formatPrefix: '€',
    formatSuffix: '',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rateToNgn: 1980,
    formatPrefix: '£',
    formatSuffix: '',
    decimals: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    rateToNgn: 1120,
    formatPrefix: 'CA$',
    formatSuffix: '',
    decimals: 2,
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    flag: '🇰🇪',
    rateToNgn: 12,
    formatPrefix: 'KSh ',
    formatSuffix: '',
    decimals: 0,
  },
  GHS: {
    code: 'GHS',
    symbol: 'GH₵',
    name: 'Ghanaian Cedi',
    flag: '🇬🇭',
    rateToNgn: 105,
    formatPrefix: 'GH₵',
    formatSuffix: '',
    decimals: 2,
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    flag: '🇿🇦',
    rateToNgn: 85,
    formatPrefix: 'R ',
    formatSuffix: '',
    decimals: 2,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    rateToNgn: 422,
    formatPrefix: 'AED ',
    formatSuffix: '',
    decimals: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    rateToNgn: 18.5,
    formatPrefix: '₹',
    formatSuffix: '',
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    rateToNgn: 1010,
    formatPrefix: 'A$',
    formatSuffix: '',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    rateToNgn: 10.3,
    formatPrefix: '¥',
    formatSuffix: '',
    decimals: 0,
  },
};

export interface IpDetectionResult {
  detectedCurrency: SupportedCurrency;
  detectedCountry: string;
  detectedCountryCode: string;
  detectedFlag: string;
  isVpnOrProxy?: boolean;
  ipAddress?: string;
}

const STORAGE_CURRENCY_KEY = 'ofis_selected_currency';
const STORAGE_IP_INFO_KEY = 'ofis_detected_ip_info';
const STORAGE_MANUAL_OVERRIDE_KEY = 'ofis_currency_manual_override';

export function mapCountryCodeToCurrency(countryCode: string): {
  currency: SupportedCurrency;
  country: string;
  flag: string;
} {
  const code = (countryCode || '').toUpperCase().trim();

  // Nigeria
  if (code === 'NG') {
    return { currency: 'NGN', country: 'Nigeria', flag: '🇳🇬' };
  }

  // Ghana
  if (code === 'GH') {
    return { currency: 'GHS', country: 'Ghana', flag: '🇬🇭' };
  }

  // Kenya
  if (code === 'KE') {
    return { currency: 'KES', country: 'Kenya', flag: '🇰🇪' };
  }

  // South Africa
  if (code === 'ZA') {
    return { currency: 'ZAR', country: 'South Africa', flag: '🇿🇦' };
  }

  // United Kingdom
  if (['GB', 'UK', 'IM', 'JE', 'GG'].includes(code)) {
    return { currency: 'GBP', country: 'United Kingdom', flag: '🇬🇧' };
  }

  // Eurozone
  const eurozone = [
    'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI',
    'GR', 'CY', 'EE', 'LV', 'LT', 'LU', 'MT', 'SK', 'SI', 'HR'
  ];
  if (eurozone.includes(code)) {
    return { currency: 'EUR', country: 'European Union', flag: '🇪🇺' };
  }

  // Canada
  if (code === 'CA') {
    return { currency: 'CAD', country: 'Canada', flag: '🇨🇦' };
  }

  // United Arab Emirates
  if (code === 'AE') {
    return { currency: 'AED', country: 'United Arab Emirates', flag: '🇦🇪' };
  }

  // India
  if (code === 'IN') {
    return { currency: 'INR', country: 'India', flag: '🇮🇳' };
  }

  // Australia & New Zealand
  if (['AU', 'NZ'].includes(code)) {
    return { currency: 'AUD', country: 'Australia', flag: '🇦🇺' };
  }

  // Japan
  if (code === 'JP') {
    return { currency: 'JPY', country: 'Japan', flag: '🇯🇵' };
  }

  // United States & Global Default
  if (code === 'US') {
    return { currency: 'USD', country: 'United States', flag: '🇺🇸' };
  }

  return { currency: 'USD', country: 'Global / International', flag: '🇺🇸' };
}

export const currencyService = {
  /**
   * Fast synchronous fallback detecting currency via cached IP or browser timezone/locale heuristics.
   */
  detectCurrencyFromIp(): IpDetectionResult {
    try {
      // 1. Check if we have previously resolved and cached IP info
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(STORAGE_IP_INFO_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.detectedCurrency && CURRENCY_RATES[parsed.detectedCurrency as SupportedCurrency]) {
            return parsed;
          }
        }
      }

      // 2. Timezone / Locale heuristics fallback
      const timeZone = typeof Intl !== 'undefined' ? (Intl.DateTimeFormat().resolvedOptions().timeZone || '') : '';
      const language = typeof navigator !== 'undefined' ? (navigator.language || '').toLowerCase() : '';

      if (timeZone.includes('Lagos') || timeZone.includes('Nigeria') || language.includes('en-ng') || language.includes('yo') || language.includes('ha') || language.includes('ig')) {
        return {
          detectedCurrency: 'NGN',
          detectedCountry: 'Nigeria',
          detectedCountryCode: 'NG',
          detectedFlag: '🇳🇬',
          ipAddress: 'Auto-detected (Lagos, Nigeria)',
        };
      }

      if (timeZone.includes('Accra') || language.includes('en-gh')) {
        return {
          detectedCurrency: 'GHS',
          detectedCountry: 'Ghana',
          detectedCountryCode: 'GH',
          detectedFlag: '🇬🇭',
          ipAddress: 'Auto-detected (Accra, Ghana)',
        };
      }

      if (timeZone.includes('Nairobi') || language.includes('en-ke') || language.includes('sw')) {
        return {
          detectedCurrency: 'KES',
          detectedCountry: 'Kenya',
          detectedCountryCode: 'KE',
          detectedFlag: '🇰🇪',
          ipAddress: 'Auto-detected (Nairobi, Kenya)',
        };
      }

      if (timeZone.includes('Johannesburg') || language.includes('en-za') || language.includes('af')) {
        return {
          detectedCurrency: 'ZAR',
          detectedCountry: 'South Africa',
          detectedCountryCode: 'ZA',
          detectedFlag: '🇿🇦',
          ipAddress: 'Auto-detected (Johannesburg, South Africa)',
        };
      }

      if (timeZone.includes('London') || language.includes('en-gb')) {
        return {
          detectedCurrency: 'GBP',
          detectedCountry: 'United Kingdom',
          detectedCountryCode: 'GB',
          detectedFlag: '🇬🇧',
          ipAddress: 'Auto-detected (London, UK)',
        };
      }

      if (
        timeZone.includes('Paris') ||
        timeZone.includes('Berlin') ||
        timeZone.includes('Amsterdam') ||
        timeZone.includes('Rome') ||
        timeZone.includes('Madrid') ||
        language.includes('de-') ||
        language.includes('fr-') ||
        language.includes('es-es') ||
        language.includes('it-') ||
        language.includes('nl-')
      ) {
        return {
          detectedCurrency: 'EUR',
          detectedCountry: 'European Union',
          detectedCountryCode: 'EU',
          detectedFlag: '🇪🇺',
          ipAddress: 'Auto-detected (European Union)',
        };
      }

      if (timeZone.includes('Toronto') || timeZone.includes('Vancouver') || language.includes('en-ca') || language.includes('fr-ca')) {
        return {
          detectedCurrency: 'CAD',
          detectedCountry: 'Canada',
          detectedCountryCode: 'CA',
          detectedFlag: '🇨🇦',
          ipAddress: 'Auto-detected (Canada)',
        };
      }

      if (timeZone.includes('Dubai') || timeZone.includes('Muscat') || language.includes('ar-ae')) {
        return {
          detectedCurrency: 'AED',
          detectedCountry: 'United Arab Emirates',
          detectedCountryCode: 'AE',
          detectedFlag: '🇦🇪',
          ipAddress: 'Auto-detected (UAE)',
        };
      }

      if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || language.includes('en-in') || language.includes('hi')) {
        return {
          detectedCurrency: 'INR',
          detectedCountry: 'India',
          detectedCountryCode: 'IN',
          detectedFlag: '🇮🇳',
          ipAddress: 'Auto-detected (India)',
        };
      }

      if (timeZone.includes('Sydney') || timeZone.includes('Melbourne') || timeZone.includes('Auckland') || language.includes('en-au') || language.includes('en-nz')) {
        return {
          detectedCurrency: 'AUD',
          detectedCountry: 'Australia',
          detectedCountryCode: 'AU',
          detectedFlag: '🇦🇺',
          ipAddress: 'Auto-detected (Australia)',
        };
      }

      if (timeZone.includes('Tokyo') || language.includes('ja')) {
        return {
          detectedCurrency: 'JPY',
          detectedCountry: 'Japan',
          detectedCountryCode: 'JP',
          detectedFlag: '🇯🇵',
          ipAddress: 'Auto-detected (Japan)',
        };
      }

      // Default Global detection -> USD ($ Dollar)
      return {
        detectedCurrency: 'USD',
        detectedCountry: 'United States & Global',
        detectedCountryCode: 'US',
        detectedFlag: '🇺🇸',
        ipAddress: 'Auto-detected (Global)',
      };
    } catch {
      return {
        detectedCurrency: 'USD',
        detectedCountry: 'Global',
        detectedCountryCode: 'US',
        detectedFlag: '🇺🇸',
        ipAddress: 'Auto-detected (Global)',
      };
    }
  },

  /**
   * Performs an authoritative async IP and Country lookup with multi-tier network fallbacks.
   */
  async detectCurrencyAsync(): Promise<IpDetectionResult> {
    // 1. Try server endpoint first (/api/ip-info)
    try {
      const serverRes = await fetch('/api/ip-info', {
        headers: { Accept: 'application/json' },
      });
      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data && data.detectedCountryCode) {
          const mapping = mapCountryCodeToCurrency(data.detectedCountryCode);
          const result: IpDetectionResult = {
            detectedCurrency: mapping.currency,
            detectedCountry: data.detectedCountry || mapping.country,
            detectedCountryCode: data.detectedCountryCode,
            detectedFlag: mapping.flag,
            ipAddress: data.ipAddress || 'Auto-detected via IP',
          };
          currencyService.cacheIpDetection(result);
          return result;
        }
      }
    } catch {
      // Continue to client direct fallbacks
    }

    // 2. Client-side fast geo provider fallback (ipwho.is)
    try {
      const res = await fetch('https://ipwho.is/', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success !== false && data.country_code) {
          const mapping = mapCountryCodeToCurrency(data.country_code);
          const result: IpDetectionResult = {
            detectedCurrency: mapping.currency,
            detectedCountry: data.country || mapping.country,
            detectedCountryCode: data.country_code,
            detectedFlag: data.flag?.emoji || mapping.flag,
            ipAddress: data.ip || 'Auto-detected via IP',
          };
          currencyService.cacheIpDetection(result);
          return result;
        }
      }
    } catch {
      // Continue to secondary fallback
    }

    // 3. Secondary fast country API (api.country.is)
    try {
      const res = await fetch('https://api.country.is/', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.country) {
          const mapping = mapCountryCodeToCurrency(data.country);
          const result: IpDetectionResult = {
            detectedCurrency: mapping.currency,
            detectedCountry: mapping.country,
            detectedCountryCode: data.country,
            detectedFlag: mapping.flag,
            ipAddress: data.ip || 'Auto-detected via IP',
          };
          currencyService.cacheIpDetection(result);
          return result;
        }
      }
    } catch {
      // Fallback to local heuristics
    }

    // 4. Return local timezone/locale detection result
    const local = currencyService.detectCurrencyFromIp();
    currencyService.cacheIpDetection(local);
    return local;
  },

  cacheIpDetection(info: IpDetectionResult): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_IP_INFO_KEY, JSON.stringify(info));
      }
    } catch {}
  },

  /**
   * Check if the user has explicitly overridden the currency manually.
   */
  hasManualOverride(): boolean {
    try {
      return localStorage.getItem(STORAGE_MANUAL_OVERRIDE_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setManualOverride(enabled: boolean): void {
    try {
      if (enabled) {
        localStorage.setItem(STORAGE_MANUAL_OVERRIDE_KEY, 'true');
      } else {
        localStorage.removeItem(STORAGE_MANUAL_OVERRIDE_KEY);
      }
    } catch {}
  },

  getInitialCurrency(): SupportedCurrency {
    try {
      // If manual override was explicitly set by the user, return saved currency
      if (currencyService.hasManualOverride()) {
        const saved = localStorage.getItem(STORAGE_CURRENCY_KEY) as SupportedCurrency;
        if (saved && CURRENCY_RATES[saved]) {
          return saved;
        }
      }
      // Otherwise, return IP-detected currency by default!
      return currencyService.detectCurrencyFromIp().detectedCurrency;
    } catch {
      return 'USD';
    }
  },

  setSavedCurrency(curr: SupportedCurrency): void {
    try {
      localStorage.setItem(STORAGE_CURRENCY_KEY, curr);
    } catch {}
  },

  resetToAutoDetectedCurrency(): SupportedCurrency {
    try {
      currencyService.setManualOverride(false);
      localStorage.removeItem(STORAGE_CURRENCY_KEY);
      return currencyService.detectCurrencyFromIp().detectedCurrency;
    } catch {
      return 'USD';
    }
  },

  /**
   * Convert an amount in NGN to the target currency.
   */
  convertFromNgn(amountNgn: number, targetCurrency: SupportedCurrency): number {
    const validAmount = typeof amountNgn === 'number' && !isNaN(amountNgn) ? amountNgn : 0;
    const meta = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES.NGN;
    if (meta.rateToNgn === 1) return validAmount;
    return validAmount / meta.rateToNgn;
  },

  /**
   * Convert an amount from another currency back to NGN.
   */
  convertToNgn(amount: number, fromCurrency: SupportedCurrency): number {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    const meta = CURRENCY_RATES[fromCurrency] || CURRENCY_RATES.NGN;
    return Math.round(validAmount * meta.rateToNgn);
  },

  /**
   * Formats a given NGN amount into the user's active currency string.
   */
  format(
    amountNgn?: number | null,
    targetCurrency: SupportedCurrency = 'NGN',
    options?: { perHour?: boolean; perDay?: boolean; perMonth?: boolean; showCode?: boolean }
  ): string {
    const validAmount = typeof amountNgn === 'number' && !isNaN(amountNgn) ? amountNgn : 0;
    const meta = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES.NGN;
    const converted = currencyService.convertFromNgn(validAmount, targetCurrency);

    let numberStr = '';
    if (meta.decimals === 0 || converted >= 1000) {
      numberStr = Math.round(converted).toLocaleString('en-US');
    } else {
      numberStr = converted.toLocaleString('en-US', {
        minimumFractionDigits: meta.decimals,
        maximumFractionDigits: meta.decimals,
      });
    }

    let output = `${meta.formatPrefix}${numberStr}${meta.formatSuffix}`;
    if (options?.showCode && targetCurrency !== 'NGN') {
      output += ` ${meta.code}`;
    }

    if (options?.perHour) output += '/hr';
    if (options?.perDay) output += '/day';
    if (options?.perMonth) output += '/mo';

    return output;
  },
};
