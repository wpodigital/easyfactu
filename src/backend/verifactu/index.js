"use strict";
/**
 * VeriFactu Module - Invoice Registration System for AEAT
 *
 * This module provides functionality to:
 * - Generate XML messages for invoice registration (Alta) and cancellation (Anulacion)
 * - Calculate SHA-256 hash (Huella) for invoice chaining
 * - Validate XML against XSD schemas
 * - Parse AEAT validation responses
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./types"), exports);
__exportStar(require("./xmlBuilder"), exports);
__exportStar(require("./hashCalculator"), exports);
__exportStar(require("./validator"), exports);
__exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map