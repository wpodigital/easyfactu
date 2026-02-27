/**
 * Utility functions for VeriFactu
 */
/**
 * Format a number for XML/hash calculation, removing trailing zeros after decimal point
 * According to AEAT VeriFactu specifications
 *
 * Examples:
 * - 21.00 -> "21"
 * - 150.50 -> "150.5"
 * - 31.61 -> "31.61"
 *
 * @param value - The number to format
 * @returns Formatted string without trailing zeros, or empty string if undefined
 */
export declare function formatNumberForVeriFactu(value: number | undefined): string;
//# sourceMappingURL=utils.d.ts.map