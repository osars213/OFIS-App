// Local storage persistence helper with error fallback
export const storage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`ofis_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`[storage] Error reading ${key}`, e);
      return fallback;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(`ofis_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn(`[storage] Error writing ${key}`, e);
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(`ofis_${key}`);
    } catch (e) {
      console.warn(`[storage] Error removing ${key}`, e);
    }
  }
};
