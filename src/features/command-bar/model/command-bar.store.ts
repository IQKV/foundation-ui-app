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
  /** Page-level actions registered by the active route. */
  actions: CommandBarAction[];

  show: () => void;
  hide: () => void;
  openSpotlight: () => void;
  closeSpotlight: () => void;
  setActions: (actions: CommandBarAction[]) => void;
  clearActions: () => void;
}

export const useCommandBarStore = create<CommandBarState>((set) => ({
  isVisible: true,
  isSpotlightOpen: false,
  actions: [],

  show: () => set({ isVisible: true }),
  hide: () => set({ isVisible: false }),
  openSpotlight: () => set({ isSpotlightOpen: true }),
  closeSpotlight: () => set({ isSpotlightOpen: false }),
  setActions: (actions) => set({ actions }),
  clearActions: () => set({ actions: [] }),
}));
