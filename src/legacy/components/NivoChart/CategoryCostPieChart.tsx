import { ResponsivePie } from '@nivo/pie'
import { customTheme } from './CustomTheme';
import { useEffect, useState } from 'react';

const CategoryCostPieChart = ({data}) => {

    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        // Ensure data is an array before reducing
        if (!Array.isArray(data) || data.length === 0) {
            console.log('Data is empty or not an array. Setting totalAmount to 0.');
            setTotalAmount(0); // Explicitly set to 0 if data is empty or invalid
            return; // Exit early
        }

        // Calculate the total value from your data
        const total = data.reduce((sum, item) => {
            // Ensure item.value is a valid number
            const value = parseFloat(item.value);
            if (isNaN(value)) {
                console.warn(`Invalid value encountered: ${item.value}. Skipping.`);
                return sum;
            }
            return sum + value;
        }, 0);

        console.log('Calculated new total:', total);
        // Only update state if the total has actually changed
        // This is a micro-optimization and generally not strictly necessary
        // as React handles re-renders efficiently, but it can make logs cleaner.
        if (totalAmount !== total) {
            setTotalAmount(total);
        }

    }, [data, totalAmount]);

    // Custom layer component
    const CenteredMetric = ({ centerX, centerY }) => {

        // Use a safe fallback for formatting in case totalAmount isn't a number
        const formattedTotal = typeof totalAmount === 'number'
            ? totalAmount.toFixed(2).toLocaleString()
            : '0.00'; // Default if totalAmount is not a number
            
        return (
            <text
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                    fontSize: '14px', // Adjust font size as needed
                    fontWeight: 'bold',
                    fill: '#ffffffff', // Adjust color as needed
                }}
            >
                {/* First line: "Total Amount" */}
                <tspan
                    x={centerX}
                    y={centerY - 20} // Adjust this value to move "Total Amount" up
                    style={{ fontSize: '16px', fontWeight: 'normal' }}
                >
                    All spendings
                </tspan>
                {/* Second line: the actual total */}
                <tspan
                    x={centerX}
                    y={centerY + 15} // Adjust this value to move the amount down
                    style={{ fontSize: '18px', fontWeight: 'bold' }} // Style for the amount
                >
                    ${formattedTotal.toLocaleString()}
                </tspan>
            </text>
        );
    };

    return (
		<div style={{ minWidth: 0, height: "400px", overflow: "hidden" }}>
            <ResponsivePie
                data={data}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.7}
                padAngle={1}
                cornerRadius={2}
                activeOuterRadiusOffset={8}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#ff9100ff"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                arcLabel={e=>`$${e.value}`}
                enableArcLabels={false}
                enableArcLinkLabels={false}
                theme={customTheme}
                // Add the custom layer here
                layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends', CenteredMetric]}
                /* legends={[
                    {
                        anchor: 'bottom',
                        direction: 'row',
                        translateY: 56,
                        itemWidth: 100,
                        itemHeight: 18,
                        symbolShape: 'circle'
                    }
                ]} */
            />
        </div>
    )
}

export default CategoryCostPieChart;