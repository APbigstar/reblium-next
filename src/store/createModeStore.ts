import { create } from "zustand";

type CreateModeStore = {
  isCreateMode: boolean;
  setCreateMode: (isCreateMode: boolean) => void;
};

export const useCreateModeStore = create<CreateModeStore>((set) => ({
  isCreateMode: false,
  setCreateMode: (isCreateMode) => set({ isCreateMode }),
}));
