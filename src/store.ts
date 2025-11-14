import { create } from "zustand";
import type { BoxState } from "./types";

export const useBox = create<{
  boxes: BoxState[];
  setBoxes: (boxes: BoxState[]) => void;
}>((set) => ({
  boxes: [],
  setBoxes: (boxes) => set({ boxes }),
}));
