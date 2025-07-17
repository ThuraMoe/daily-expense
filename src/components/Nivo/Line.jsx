import { ResponsiveLine } from "@nivo/line";

const Line = ({ data }) => {
	// Define your custom theme object
	const myCustomTheme = {
		axis: {
			domain: {
				line: {
					stroke: "#777777", // Example: make axis lines gray
					strokeWidth: 1,
				},
			},
			ticks: {
				line: {
					stroke: "#777777", // Example: make tick marks gray
					strokeWidth: 1,
				},
				text: {
					fill: "#cfc20bff", // Example: make axis labels darker
					fontSize: 11,
				},
			},
			legend: {
				text: {
					fill: "red", // Example: make legend text red
					fontSize: 14,
				},
			},
		},
		grid: {
			line: {
				stroke: "#0e0d0dff", // Example: light gray grid lines
			},
		},
		// You can customize many other aspects like legends, labels, tooltips etc.
		// Refer to Nivo documentation for the full theme structure:
		// https://nivo.rocks/guides/theming/
	};

	const myTheme = {
		background: "#212529",
		text: {
			fontSize: 11,
			fill: "#333333",
			outlineWidth: 0,
			outlineColor: "#ffffff",
		},
		axis: {
			domain: {
				line: {
					stroke: "#5e5c5cff", //"#777777",
					strokeWidth: 1,
				},
			},
			legend: {
				text: {
					fontSize: 12,
					fill: "#ffffffff",
					outlineWidth: 1,
					outlineColor: "#141414ff",
				},
			},
			ticks: {
				line: {
					stroke: "#404040",
					strokeWidth: 1,
				},
				text: {
					fontSize: 11,
					fill: "#9ca1a1ff",
					outlineWidth: 0,
					outlineColor: "#bb1111",
				},
			},
		},
		grid: {
			line: {
				stroke: "#2c2929ff",
				strokeWidth: 1,
			},
		},
		legends: {
			title: {
				text: {
					fontSize: 11,
					fill: "#f87800ff",
					outlineWidth: 2,
					outlineColor: "#ada8a8ff",
				},
			},
			text: {
				fontSize: 12,
				fill: "#333333",
				outlineWidth: 2,
				outlineColor: "#845252",
			},
			ticks: {
				line: {},
				text: {
					fontSize: 10,
					fill: "#333333",
					outlineWidth: 0,
					outlineColor: "#ffffff",
				},
			},
		},
		annotations: {
			text: {
				fontSize: 16,
				fill: "#333333",
				outlineWidth: 2,
				outlineColor: "#ffffff",
				outlineOpacity: 1,
			},
			link: {
				stroke: "#000000",
				strokeWidth: 1,
				outlineWidth: 1,
				outlineColor: "#ffffff",
				outlineOpacity: 1,
			},
			outline: {
				stroke: "#000000",
				strokeWidth: 6,
				outlineWidth: 8,
				outlineColor: "#ffffff",
				outlineOpacity: 1,
			},
			symbol: {
				fill: "#000000",
				outlineWidth: 2,
				outlineColor: "#ffffff",
				outlineOpacity: 1,
			},
		},
		tooltip: {
			wrapper: {},
			container: {
				background: "#ffffff",
				color: "#590d0d",
				fontSize: 15,
			},
			basic: {},
			chip: {},
			table: {},
			tableCell: {},
			tableCellValue: {},
		},
	};

	return (
		<div style={{ width: "800px", height: "400px" }}>
			{/* <ResponsiveLine 
				data={data}
				curve="natural"
                theme={myTheme}
                colors={{ datum: 'color' }}
				margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
				yScale={{
					type: "linear",
					min: "auto",
					max: "auto",
					stacked: true,
					reverse: false,
				}}
				axisBottom={{ legend: "transportation", legendOffset: 36 }}
				axisLeft={{ legend: "count", legendOffset: -40 }}
				pointSize={10}
				pointColor={{ theme: "background" }}
				pointBorderWidth={2}
				pointBorderColor={{ from: "seriesColor" }}
				pointLabelYOffset={-12}
				enableTouchCrosshair={true}
				useMesh={true}
				legends={[
					{
						anchor: "bottom-right",
						direction: "column",
						translateX: 100,
						itemWidth: 80,
						itemHeight: 22,
						symbolShape: "circle",
					},
				]}
			/> */}

			<ResponsiveLine
				data={data}
                theme={myTheme}
                curve="cardinal"
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
				yFormat=" >-.2f" // Format for Y-axis values (e.g., "$123.45")
				axisTop={null}
				axisRight={null}
				axisBottom={{
					format: "%b %d", // How dates are displayed on the bottom axis (e.g., "Jan 01")
					tickValues: "every 1 days", // Show a tick every 2 days for 10 days
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
				pointColor={{ from: "serieColor" }}
				pointBorderWidth={2}
				pointBorderColor={{ from: "serieColor" }}
				useMesh={true} // Enables interactive mesh for tooltips
				colors={["#ff8c00ff"]} 
				lineWidth={2}
				animate={true}
				motionConfig="gentle"
			/>
		</div>
	);
};

export default Line;
