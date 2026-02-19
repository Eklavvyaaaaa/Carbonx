/**
 * Standard precision for Carbon Credits (6 decimals).
 * 1 Credit = 1,000,000 Base Units (Micro-Credits)
 */
export const DECIMALS = 6;
export const SCALING_FACTOR = Math.pow(10, DECIMALS);

/**
 * Converts base units (uint64 from contract) to display string.
 * @param {number|bigint} baseUnits - The raw value from the contract.
 * @param {number} precision - Number of decimal places to show.
 * @returns {string} Formatted number with decimals.
 */
export const formatCredits = (baseUnits, precision = 2) => {
    if (!baseUnits) return '0';
    const val = Number(baseUnits) / SCALING_FACTOR;
    return val.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: precision,
    });
};

/**
 * Converts user input (string/number) to base units for the contract.
 * @param {string|number} displayValue - The value entered by the user (e.g. "0.1").
 * @returns {bigint} The value in base units (e.g. 100000).
 */
export const parseCredits = (displayValue) => {
    if (!displayValue) return 0n;
    // Prevent floating point errors by parsing manually or using a library if needed.
    // Simple approach: multiply by factor.
    const val = Number(displayValue);
    if (isNaN(val) || val < 0) return 0n;
    return BigInt(Math.round(val * SCALING_FACTOR));
};
