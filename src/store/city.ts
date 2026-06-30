import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CityState {
  selectedCity: string | null;
  isModalOpen: boolean;
  setCity: (city: string) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      selectedCity: null,
      isModalOpen: false,
      setCity: (city: string) => set({ selectedCity: city, isModalOpen: false }),
      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),
    }),
    {
      name: "city-storage",
      partialize: (state) => ({ selectedCity: state.selectedCity }),
    }
  )
);
