import * as Constant from "./Constant";

/**
 * Convert date string to 'YYYY-MM-DD'
 * @param dateObj
 */
export const dateFormatHelper = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Convert to USD amount
 * @param {*} amount 
 * @param {*} currency 
 * @returns 
 */
export const convertToUsd = (amount, currency) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
        return 0;
    }

    // if it is $
    if (currency === Constant.CURRENCY[0]) {
        return numericAmount;
    } else if (currency === Constant.CURRENCY[1]) {
        return numericAmount / Constant.KHR_TO_USD_RATE;
    }
    return 0;
};

/**
 * Calculate prev month 26 to current month 25 based on current month
 * @returns array
 */
export const calculateFromToDate = () => {
    const now = new Date();

    // calculate 26th of the previous month
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 26);

    // calculate 25th of the current month
    const end = new Date(now.getFullYear(), now.getMonth(), 25);

    // convert to Y-m-d format
    const stDate = dateFormatHelper(start);
    const enDate = dateFormatHelper(end);

    return [stDate, enDate];
};

/**
 * Get current month start and end date
 */
export const getCurrentMonthDateRange = () => {
    const today = new Date();
    const year = today.getFullYear();
    const monthIndex = today.getMonth();

    // get first date
    const start = new Date(year, monthIndex, 1);

    // get last date
    // By setting day to 0 of the *next* month, we get the last day of the *current* month.
    const end = new Date(year, monthIndex + 1, 0);

    // convert to Y-m-d format
    const stDate = dateFormatHelper(start);
    const enDate = dateFormatHelper(end);

    return [stDate, enDate];
}

/**
 * Get previous month start and end date
 */
export const getPreviousMonthDateRange = () => {
    const today = new Date();
    const year = today.getFullYear();
    const currentMonthIndex = today.getMonth();

    // get previous month index
    const prevMonthIndex = currentMonthIndex - 1;

    // get start date
    const start = new Date(year, prevMonthIndex, 1);

    // get end date
    // By setting day to 0 of the *current* month, we get the last day of the *previous* month.
    const end = new Date(year, currentMonthIndex, 0);

    // convert to Y-m-d format
    const stDate = dateFormatHelper(start);
    const enDate = dateFormatHelper(end);

    return [stDate, enDate];
}