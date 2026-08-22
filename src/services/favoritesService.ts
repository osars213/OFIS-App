import { storageService } from './storageService';

const SAVED_KEY = 'saved_spaces';

export const favoritesService = {
  getSavedSpaceIds(): string[] {
    return storageService.getItem<string[]>(SAVED_KEY, ['space_1', 'space_3']);
  },

  isSaved(spaceId: string): boolean {
    const saved = this.getSavedSpaceIds();
    return saved.includes(spaceId);
  },

  toggleFavorite(spaceId: string): boolean {
    const saved = this.getSavedSpaceIds();
    let updated: string[];
    let isNowSaved = false;
    
    if (saved.includes(spaceId)) {
      updated = saved.filter(id => id !== spaceId);
      isNowSaved = false;
    } else {
      updated = [...saved, spaceId];
      isNowSaved = true;
    }
    
    storageService.setItem(SAVED_KEY, updated);
    return isNowSaved;
  },

  toggleSave(spaceId: string): string[] {
    const saved = this.getSavedSpaceIds();
    let updated: string[];
    if (saved.includes(spaceId)) {
      updated = saved.filter(id => id !== spaceId);
    } else {
      updated = [...saved, spaceId];
    }
    storageService.setItem(SAVED_KEY, updated);
    return updated;
  }
};
