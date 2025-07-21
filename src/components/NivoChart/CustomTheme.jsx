export const customTheme = {
    background: "#212529", // Chart background color - already set to dark

    text: {
        fontSize: 11,
        fill: "#E0E0E0", // Changed: Lighter text for general text
        outlineWidth: 0,
        outlineColor: "transparent", // Keep outline transparent if not needed
    },
    axis: {
        domain: {
            line: {
                stroke: "#7F8C8D", // Changed: Lighter gray for axis lines
                strokeWidth: 1,
            },
        },
        legend: {
            text: {
                fontSize: 12,
                fill: "#ECF0F1", // Changed: Lighter text for axis legends
                outlineWidth: 0, // Usually no outline for axis legends
                outlineColor: "transparent",
            },
        },
        ticks: {
            line: {
                stroke: "#7F8C8D", // Changed: Lighter gray for tick lines
                strokeWidth: 1,
            },
            text: {
                fontSize: 11,
                fill: "#BDC3C7", // Changed: Lighter text for axis tick labels
                outlineWidth: 0,
                outlineColor: "transparent",
            },
        },
    },
    grid: {
        line: {
            stroke: "#34495E", // Changed: Noticeably lighter than background for visibility
            strokeWidth: 1,
        },
    },
    legends: {
        title: {
            text: {
                fontSize: 11,
                fill: "#F39C12", // Changed: Orange, stands out on dark
                outlineWidth: 0, // Usually no outline for legend titles
                outlineColor: "transparent",
            },
        },
        text: {
            fontSize: 12,
            fill: "#ECF0F1", // Changed: Lighter text for legend items
            outlineWidth: 0, // Usually no outline for legend item text
            outlineColor: "transparent",
        },
        ticks: {
            line: {}, // No line for legend ticks by default
            text: {
                fontSize: 10,
                fill: "#ECF0F1", // Changed: Lighter text for legend ticks
                outlineWidth: 0,
                outlineColor: "transparent",
            },
        },
    },
    annotations: {
        text: {
            fontSize: 16,
            fill: "#ECF0F1", // Changed: Lighter text for annotations
            outlineWidth: 2,
            outlineColor: "#212529", // Outline should contrast with text and background
            outlineOpacity: 1,
        },
        link: {
            stroke: "#BDC3C7", // Changed: Lighter stroke for annotation links
            strokeWidth: 1,
            outlineWidth: 1,
            outlineColor: "#212529",
            outlineOpacity: 1,
        },
        outline: {
            stroke: "#BDC3C7", // Changed: Lighter stroke for annotation outline
            strokeWidth: 6,
            outlineWidth: 8,
            outlineColor: "#212529",
            outlineOpacity: 1,
        },
        symbol: {
            fill: "#BDC3C7", // Changed: Lighter fill for annotation symbols
            outlineWidth: 2,
            outlineColor: "#212529",
            outlineOpacity: 1,
        },
    },
    tooltip: {
        wrapper: {},
        container: {
            background: "#ffffff", // Tooltip background remains white for readability
            color: "#2C3E50", // Changed: Darker text for tooltip content on white background
            fontSize: 12,
        },
        basic: {},
        chip: {},
        table: {},
        tableCell: {},
        tableCellValue: {},
    },
};