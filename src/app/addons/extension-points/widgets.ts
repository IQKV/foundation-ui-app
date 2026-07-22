import type { WidgetExtension, WidgetExtensionPoint } from "../types";

class WidgetExtensionPointImpl implements WidgetExtensionPoint {
  private widgets: WidgetExtension[] = [];

  registerWidget(widget: WidgetExtension): void {
    this.widgets.push(widget);
  }

  getWidgets(location: "dashboard"): WidgetExtension[] {
    return this.widgets
      .filter((w) => w.location === location)
      .sort((a, b) => (a.order || 100) - (b.order || 100));
  }
}

export const widgetExtension = new WidgetExtensionPointImpl();
