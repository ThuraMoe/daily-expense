import type { LucideIcon } from "lucide-react";
import {
  Cookie,
  Film,
  HeartPulse,
  Home,
  Motorbike,
  Plane,
  Receipt,
  ShoppingBasket,
  Sparkles,
  Tag,
  UsersRound,
  Soup,
  Coffee,
} from "lucide-react";

export interface CategoryMeta {
  /** Hex color used for icons, inline styles, and chart palettes. */
  color: string;
  /** Lucide icon component — render at the size needed by the caller. */
  Icon: LucideIcon;
}

const CATEGORY_CONFIG: Record<string, CategoryMeta> = {
  "Groceries":     { color: "#8b5cf6", Icon: ShoppingBasket },
  "Dining Out":    { color: "#f97316", Icon: Soup },
  "Snacks":        { color: "#facc15", Icon: Cookie },
  "Drink":         { color: "#3b82f6", Icon: Coffee },
  "Transport":     { color: "#22c55e", Icon: Motorbike },
  "Entertainment": { color: "#ec4899", Icon: Film },
  "Bill":          { color: "#ef4444", Icon: Receipt },
  "Personal Care": { color: "#14b8a6", Icon: Sparkles },
  "Healthcare":    { color: "#10b981", Icon: HeartPulse },
  "Family":        { color: "#6366f1", Icon: Home },
  "Friends":       { color: "#f43f5e", Icon: UsersRound },
  "Trip":          { color: "#06b6d4", Icon: Plane },
  "Others":        { color: "#9ca3af", Icon: Tag },
};

const FALLBACK: CategoryMeta = { color: "#9ca3af", Icon: Tag };

/**
 * getCategoryMeta
 *
 * Returns the color and icon for a given category name.
 * Falls back to a neutral gray Tag icon for unknown categories.
 *
 * @param {string} category - Category name from CategoryList.ts.
 * @returns {CategoryMeta} Object with hex color and LucideIcon component.
 */
export function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_CONFIG[category] ?? FALLBACK;
}

/**
 * getCategoryColor
 *
 * Returns the hex color string for a category. Suitable for inline styles
 * and chart palette arrays (e.g. Nivo).
 *
 * @param {string} category - Category name.
 * @returns {string} Hex color string.
 */
export function getCategoryColor(category: string): string {
  return getCategoryMeta(category).color;
}

/**
 * getCategoryIcon
 *
 * Returns the LucideIcon component for a category.
 * Render it at the size required by the caller: <Icon size={14} />.
 *
 * @param {string} category - Category name.
 * @returns {LucideIcon} Lucide icon component.
 */
export function getCategoryIcon(category: string): LucideIcon {
  return getCategoryMeta(category).Icon;
}

export { CATEGORY_CONFIG };
