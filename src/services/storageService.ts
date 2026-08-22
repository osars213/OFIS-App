export const storageService = {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`ofis_${key}`);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Error reading localStorage key ofis_${key}:`, e);
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`ofis_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error setting localStorage key ofis_${key}:`, e);
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(`ofis_${key}`);
    } catch (e) {
      console.warn(`Error removing localStorage key ofis_${key}:`, e);
    }
  }
};
