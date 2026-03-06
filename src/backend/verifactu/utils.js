"use strict";
/**
 * Utility functions for VeriFactu
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumberForVeriFactu = formatNumberForVeriFactu;
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
function formatNumberForVeriFactu(value) {
    if (value === undefined)
        return '';
    // Format with 2 decimal places, then remove trailing zeros
    const formatted = value.toFixed(2);
    return formatted.replace(/\.?0+$/, '');
}
//# sourceMappingURL=utils.js.map