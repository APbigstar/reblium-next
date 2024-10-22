import { create } from "zustand";

type SelectedMenuItemStore = {
  items: {
    hair?: string; // Add hair item
    wardrobe?: string; // Add wardrobe item
  };
  setHair: (hair: string) => void; // New method to set hair
  setWardrobe: (wardrobe: string) => void; // New method to set wardrobe
};

export const useSelectedMenuItemStore = create<SelectedMenuItemStore>((set) => ({
  items: {},
  setHair: (hair) => set((state) => ({ items: { ...state.items, hair } })), // Update hair
  setWardrobe: (wardrobe) => set((state) => ({ items: { ...state.items, wardrobe } })), // Update wardrobe
}));
