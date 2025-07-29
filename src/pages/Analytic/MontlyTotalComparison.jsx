import { useEffect, useState } from "react";
import compareStyle from "../../styles/comparison.module.css";

const MonthlyTotalComparison = ({currentMonthTotal, prevMonthTotal}) => {
    // comparison data with prev month
    const [formattedAbsDiff, setFormattedAbsDiff] = useState(0);
    const [formattedPercentage, setFormattedPercentage] = useState(0);
    const [trendClass, setTrendClass] = useState('');
    const [trendIcon, setTrendIcon] = useState('');
    const [trendText, setTrendText] = useState('');


    useEffect(() => {
        const monthlySpending = () => {
            const diff = currentMonthTotal - prevMonthTotal;
            const absDiff = Math.abs(diff);
            const percentageChange = (absDiff / prevMonthTotal) * 100;

            const formattedAbsDiff = absDiff.toFixed(2);
            setFormattedAbsDiff(formattedAbsDiff);
            const formattedPercentage = percentageChange.toFixed(1);
            setFormattedPercentage(formattedPercentage);

            // Determine trend and corresponding classes/text
            let trendClass = '';
            let trendIcon = '';
            let trendText = '';

            if (diff < 0) { // Current month is LESS than previous month (good for spending)
                trendClass = compareStyle['positive-trend'];
                trendIcon = '↓'; // Down arrow indicates a decrease in spending
                trendText = 'less than last month';
            } else if (diff > 0) { // Current month is MORE than previous month (bad for spending)
                trendClass = compareStyle['negative-trend'];
                trendIcon = '↑'; // Up arrow indicates an increase in spending
                trendText = 'more than last month';
            } else { // No change
                trendClass = ''; // No specific trend color
                trendIcon = '–'; // Dash or neutral icon
                trendText = 'the same as last month';
            }
            setTrendClass(trendClass);
            setTrendIcon(trendIcon);
            setTrendText(trendText);
        }
        monthlySpending();
    }, [currentMonthTotal, prevMonthTotal]);

    

    return (
        <div className={compareStyle["monthly-summary-card"]}>
            <div className={compareStyle["header"]}>
                <div className={compareStyle["title"]}>This Month's Spending</div>
                <div className={compareStyle["value"]}>${currentMonthTotal.toFixed(2)}</div>
            </div>
            <div className={compareStyle["comparison-details"]}>
                <span className={`${compareStyle["change-icon"]} ${trendClass}`}>
                    {trendIcon}
                </span>
                <span className={`${compareStyle["change-amount"]} ${trendClass}`}>
                    ${formattedAbsDiff}
                </span>
                <span className={`${compareStyle["change-percentage"]} ${trendClass}`}>
                    (${formattedPercentage}%)
                </span>
                <span className={compareStyle["comparison-text"]}>
                    {trendText} (${prevMonthTotal})
                </span>
            </div>
        </div>
    )
}

export default MonthlyTotalComparison;