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
const KHR_TO_USD_RATE = 4000;
export const convertToUsd = (amount, currency) => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            return 0;
        }

        if (currency === "usd") {
            return numericAmount;
        } else if (currency === "khr") {
            return numericAmount / KHR_TO_USD_RATE;
        }
        return 0;
    };