import { create } from "zustand";
import type { ComponentType } from "react";

export interface CommandBarAction {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number }>;
  onClick: () => void;
}

interface CommandBarState {
  /** Whether the floating bar is rendered. Default true. */
  isVisible: boolean;
  /** Whether the Ctrl+K spotlight modal is open. */
  isSpotlightOpen: boolean;
  /** Page-level actions shown inside the spotlight modal under "Create". */
  spotlightActions: CommandBarAction[];

  show: () => void;
  hide: () => void;
  openSpotlight: () => void;
  closeSpotlight: () => void;
  setSpotlightActions: (actions: CommandBarAction[]) => void;
  clearSpotlightActions: () => void;
}

export const useCommandBarStore = create<CommandBarState>((set) => ({
  isVisible: true,
  isSpotlightOpen: false,
  spotlightActions: [],

  show: () => set({ isVisible: true }),
  hide: () => set({ isVisible: false }),
  openSpotlight: () => set({ isSpotlightOpen: true }),
  closeSpotlight: () => set({ isSpotlightOpen: false }),
  setSpotlightActions: (actions) => set({ spotlightActions: actions }),
  clearSpotlightActions: () => set({ spotlightActions: [] }),
}));
