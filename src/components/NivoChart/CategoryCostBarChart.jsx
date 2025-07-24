import { ResponsiveBar } from '@nivo/bar';
import { customTheme } from './CustomTheme';
import classes from "../../styles/common.module.css";

// Custom Tooltip Component for Bar Chart
const CustomBarTooltip = ({ value, indexValue }) => {
  return (
    <div
      className="bg-white p-2 rounded shadow-md"
      style={{
        background: customTheme.tooltip.container.background,
        color: customTheme.tooltip.container.color,
        fontSize: customTheme.tooltip.container.fontSize,
        border: '1px solid #ccc',
        whiteSpace: 'nowrap',
      }}
    >
      <div><span className="font-bold">Category:</span> {indexValue}</div>
      <div><span className="font-bold">Total Cost:</span> ${value.toFixed(2)}</div>
    </div>
  );
};

const CategoryCostBarChart = ({ categoryExpense }) => {

  const handleBarClick = (point) => {
    console.log(point);
  }

  return (
    <div className={classes["chart-container"]}>
      <div style={{ minWidth: "600px", height: "400px", overflow: "hidden" }}>
        <ResponsiveBar
            data={categoryExpense}
            keys={['totalCost']} // <--- Key(s) for the bar values
            indexBy="categoryName" // <--- Field for categories (Y-axis in horizontal layout)
            layout="horizontal" // <--- Set to horizontal layout
            margin={{ top: 50, right: 130, bottom: 50, left: 100 }} // Adjusted left margin for long labels
            padding={0.25}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            // colors={"#ff8c00ff"}
            colors={{ datum: 'data.color' }} // Use the 'color' field from your data for bar colors
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Total Cost ($)', // X-axis legend for horizontal layout
                legendPosition: 'middle',
                legendOffset: 32,
                format: (value) => `$${value.toFixed(0)}` // Format for bottom axis ticks
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Category', // Y-axis legend for horizontal layout
                legendPosition: 'middle',
                legendOffset: -80, // Adjusted offset for y-axis legend
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
            // labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            enableGridX={true} // Show horizontal grid lines
            enableGridY={false} // Hide vertical grid lines
            animate={true}
            motionConfig="gentle"
            theme={customTheme} // Apply your custom theme
            // Tooltip customization
            tooltip={CustomBarTooltip} // Use custom tooltip component
            onClick={handleBarClick}
            /* legends={[
                {
                    dataFrom: 'keys', // Legend data comes from the 'keys' prop
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 18,
                    effects: [
                    {
                        on: 'hover',
                        style: {
                        itemOpacity: 1,
                        },
                    },
                    ],
                },
            ]} */
        />
      </div>
    </div>
  )
}

export default CategoryCostBarChart;