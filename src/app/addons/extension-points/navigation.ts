import type { NavigationExtensionPoint, NavItemExtension } from "../types";

class NavigationExtensionPointImpl implements NavigationExtensionPoint {
  private items: NavItemExtension[] = [];

  registerNavItem(item: NavItemExtension): void {
    this.items.push(item);
  }

  getNavItems(section: "workspace" | "account"): NavItemExtension[] {
    return this.items
      .filter((item) => !item.section || item.section === section)
      .sort((a, b) => (a.order || 100) - (b.order || 100));
  }
}

export const navigationExtension = new NavigationExtensionPointImpl();
