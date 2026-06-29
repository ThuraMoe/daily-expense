import { getCategoryMeta } from "@/utils/CategoryConfig";
import MaskedAmount from "@/components/MaskedAmount";

interface CategoryBreakdownProps {
  byCategory: Record<string, number>;
}

/**
 * CategoryBreakdown
 *
 * Displays active expenses grouped by category as labelled chips, sorted by
 * amount descending. Returns null when there are no category entries.
 *
 * @param {CategoryBreakdownProps} props
 */
const CategoryBreakdown = ({ byCategory }: CategoryBreakdownProps) => {
  const entries = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  if (entries.length === 0) return null;

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="rounded-2xl bg-muted px-4 py-4">
      <p className="mb-3 text-xs font-medium text-muted-foreground">By Category</p>
      <div className="flex flex-wrap gap-2">
        {entries.map(([cat, amount]) => {
          const { color, Icon } = getCategoryMeta(cat);
          return (
            <div
              key={cat}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <Icon size={12} />
              <span>{cat}</span>
              <MaskedAmount className="font-semibold">${fmt(amount)}</MaskedAmount>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
