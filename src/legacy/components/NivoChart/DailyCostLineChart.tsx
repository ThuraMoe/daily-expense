import { ResponsiveLine } from "@nivo/line";
import { customTheme } from "./CustomTheme";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import classes from "../../styles/common.module.css";

// Custom Tooltip Component
// This component will receive 'slice' as props from Nivo
const CustomSliceTooltip = ({ slice }) => {
	// We expect only one point in the slice for a single line chart
	const point = slice.points[0];
	if (!point) {
		return null; // Or render a loading/empty state
	}

	// Access the original data values using point.data.x and point.data.y
	// Nivo maps 'x' to 'date' and 'y' to 'total' based on your x="date" and y="total" props
	const date = point.data.xFormatted; // Nivo provides formatted x-value
	const totalCost = point.data.yFormatted; // Nivo provides formatted y-value

	// Determine horizontal positioning based on slice.x
	// If slice.x is on the left half of the chart (e.g., less than 50% of the chart width),
	// we want the tooltip to appear to the right of the slice.
	// Otherwise, we want it to appear to the left.
	// We'll use a heuristic here, as we don't have the exact chart width within this component.
	// Let's assume the chart's inner width is roughly 700-800px.
	// If slice.x is less than, say, 150px, position it to the right.
	// Otherwise, position it to the left (by translating it by its own width).
	const isFarLeft = slice.x < 50; // Arbitrary threshold for "far left"
	const isFarRight = slice.x > 100;

	// Position the tooltip relative to its current Nivo-managed position
	// If it's far left, don't translate (it will be positioned by Nivo at slice.x)
	// If it's not far left, translate left by 100% of its own width + a small offset
	let transform;
	if(isFarLeft && !isFarRight) {
		transform = 'translateX(140px)';
	} else if (!isFarLeft && isFarLeft) {
		transform = 'translateX(0px)';
	}
	const tooltipStyle = {
		background: customTheme.tooltip.container.background,
		color: customTheme.tooltip.container.color,
		fontSize: customTheme.tooltip.container.fontSize,
		border: '1px solid #ccc',
		padding: '0.75rem', // Tailwind p-3
		borderRadius: '0.375rem', // Tailwind rounded
		boxShadow: '0 2px 4px 0px #1c1c1c', // Tailwind shadow-md
		transform: `${transform}`,//'translateX(calc(-100% - 10px))',
		whiteSpace: 'nowrap', // Prevent text wrapping
		zIndex: 100, // Ensure it's on top of other elements
	};

	return (
		<div style={tooltipStyle}>
			<div>Date: {date}</div>
			<div>Cost: {totalCost}</div>
		</div>
	);
};

const DailyCostLineChart = ({ dailyExpenses }) => {

	const navigate = useNavigate();

	const [tickValues, setTickValues] = useState([]);

	useEffect(() => {
		// Only try to extract dates if dailyExpenses is not empty and has the expected structure
		if (dailyExpenses && dailyExpenses.length > 0 && dailyExpenses[0].data) {
			const uniqueDates = dailyExpenses[0].data.map(d => new Date(d.x));
			setTickValues(uniqueDates);
		} else {
			// If data is not available, reset tickValues or handle appropriately
			setTickValues([]);
		}
	}, [dailyExpenses]);

	// Handler for point click event
	const handlePointClick = (point) => {
		const clickDate = point.points[0].data.x;
		const date = dayjs(clickDate).format('YYYY-MM-DD');
		navigate(`/?date=${date}`);
	};

	return (
		<div className={classes["chart-container"]}>
			<div style={{ minWidth: "600px", height: "400px", overflow: "hidden !important" }}>
				<ResponsiveLine
					data={dailyExpenses}
					curve="cardinal"
					x="date"
					y="total"
					margin={{ top: 50, right: 60, bottom: 80, left: 70 }} // Adjust margins for labels
					xScale={{
						type: "time", // Important: specify 'time' for date data
						format: "%Y-%m-%d", // Format of your date strings in data.x
						precision: "day", // Granularity of your time data
					}}
					xFormat="time:%b %d, %Y" // How dates are displayed on the tooltip/axis
					yScale={{
						type: "linear",
						min: "auto",
						max: "auto",
						stacked: false,
						reverse: false,
					}}
					yFormat={(value) => `$${value.toFixed(2)}`}
					axisTop={null}
					axisRight={null}
					axisBottom={{
						format: "%b %d", // How dates are displayed on the bottom axis (e.g., "Jan 01")
						tickValues: tickValues, // Show a tick every 2 days for 10 days
						legend: "Date", // Label for the X-axis
						legendOffset: 45,
						legendPosition: "middle",
						tickRotation: -45, // Rotate labels for better readability
					}}
					axisLeft={{
						legend: "Total Cost ($)", // Label for the Y-axis
						legendOffset: -60,
						legendPosition: "middle",
					}}
					enablePoints={true} // Show points on the line
					pointSize={8}
					pointColor={["#ff5e00ff"]}
					pointBorderWidth={2}
					pointBorderColor={{ from: "serieColor" }}
					useMesh={true} // Enables interactive mesh for tooltips
					colors={["#ff8c00ff"]} //#ff8c00ff
					lineWidth={3}
					animate={true}
					motionConfig="gentle"
					// apply custom theme
					theme={customTheme}
					// add the shading under the line
					enableArea={true} // Enables the area fill
					areaOpacity={0.1} // Sets the opacity of the filled area (0 to 1)
					enableSlices="x" // Ensure slices are enabled for sliceTooltip to work
					sliceTooltip={CustomSliceTooltip} // Pass custom tooltip component here
					onClick={handlePointClick}
				/>
			</div>
		</div>
		
	);
};

export default DailyCostLineChart;
