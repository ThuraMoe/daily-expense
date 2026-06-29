import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@/context/ThemeContext";

interface DailyLineChartProps {
  /** All expenses for the selected month (active and inactive). */
  expenses: Array<{ date: string; amount: number; active?: boolean; currency: string }>;
  /** YYYY-MM string for the selected month. */
  month: string;
}

/**
 * DailyLineChart
 *
 * Renders a Nivo line chart showing total $ spending per calendar day for the
 * selected month. Only rendered when at least one day has spending. Colours
 * adapt to the current light/dark theme.
 *
 * @param {DailyLineChartProps} props
 */
const DailyLineChart = ({ expenses, month }: DailyLineChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [year, m] = month.split("-").map(Number);
  const daysInMonth = new Date(year, m, 0).getDate();

  // Sum active $ amounts per day (1-based).
  const dailyTotals: Record<number, number> = {};
  for (const e of expenses) {
    if (e.active === false || e.currency !== "$") continue;
    const day = Number(e.date.split("-")[2]);
    dailyTotals[day] = (dailyTotals[day] ?? 0) + Number(e.amount);
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const hasAny = days.some((d) => (dailyTotals[d] ?? 0) > 0);

  if (!hasAny) return null;

  const chartData = [
    {
      id: "spending",
      data: days.map((day) => ({ x: day, y: dailyTotals[day] ?? 0 })),
    },
  ];

  const lineColor = isDark ? "#818cf8" : "#6366f1";
  const mutedText = isDark ? "#6b7280" : "#9ca3af";
  const gridLine = isDark ? "#1f2937" : "#f3f4f6";
  const tooltipBg = isDark ? "#111827" : "#ffffff";
  const tooltipText = isDark ? "#f9fafb" : "#111827";
  const tooltipMuted = isDark ? "#9ca3af" : "#6b7280";

  const nivoTheme = {
    axis: {
      ticks: {
        text: { fill: mutedText, fontSize: 10 },
      },
      domain: { line: { stroke: "transparent" } },
    },
    grid: {
      line: { stroke: gridLine, strokeWidth: 1 },
    },
    crosshair: {
      line: { stroke: mutedText, strokeWidth: 1, strokeOpacity: 0.5 },
    },
  };

  return (
    <div className="rounded-2xl bg-muted px-4 py-4">
      <p className="mb-1 text-xs font-medium text-muted-foreground">Daily Spending</p>
      <div className="h-44">
        <ResponsiveLine
          data={chartData}
          theme={nivoTheme}
          margin={{ top: 12, right: 16, bottom: 28, left: 48 }}
          xScale={{ type: "linear", min: 1, max: daysInMonth }}
          yScale={{ type: "linear", min: 0, max: "auto", nice: true }}
          curve="monotoneX"
          colors={[lineColor]}
          lineWidth={2}
          enableArea={true}
          areaBaselineValue={0}
          areaOpacity={isDark ? 0.18 : 0.1}
          enablePoints={false}
          enableGridX={false}
          gridYValues={4}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 8,
            tickValues: [1, 5, 10, 15, 20, 25, daysInMonth],
            format: (v) => String(v),
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 8,
            tickValues: 4,
            format: (v) =>
              Number(v) >= 1000
                ? `$${(Number(v) / 1000).toFixed(1)}k`
                : `$${v}`,
          }}
          enableCrosshair={true}
          crosshairType="x"
          useMesh={true}
          tooltip={({ point }) => (
            <div
              style={{
                background: tooltipBg,
                color: tooltipText,
                border: `1px solid ${gridLine}`,
              }}
              className="rounded-xl px-3 py-2 text-xs shadow-lg"
            >
              <p style={{ color: tooltipMuted }} className="mb-0.5">
                Day {String(point.data.x)}
              </p>
              <p className="font-semibold">
                $
                {Number(point.data.y).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default DailyLineChart;
