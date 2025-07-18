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
