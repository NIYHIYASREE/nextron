/**
 * passUtils.js
 * Helpers for generating Pass IDs and QR code data URLs.
 */

import QRCode from "qrcode";

/**
 * Generate a unique Pass ID like NXT26-A7K92P
 * Uses crypto.randomUUID fallback for older browsers.
 */
export function generatePassId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous I,O,1,0
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `NXT26-${suffix}`;
}

/**
 * Generate a QR code data URL (PNG base64) from a string.
 * @param {string} text — the pass ID or any string to encode
 * @returns {Promise<string>} base64 data URL
 */
export async function generateQRDataUrl(text) {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",
    type: "image/png",
    width: 220,
    margin: 2,
    color: {
      dark:  "#000000",
      light: "#ffffff",
    },
  });
}

/**
 * Format year display
 */
export const YEAR_LABELS = {
  "1": "I YEAR",
  "2": "II YEAR",
  "3": "III YEAR",
  "4": "IV YEAR",
};

/**
 * Payment status badge helper
 */
export function paymentLabel(payment) {
  if (payment.status === "PAID") {
    return payment.method === "ONLINE"
      ? "✅ PAID (ONLINE)"
      : "✅ PAID (ON-SPOT)";
  }
  return "⏳ PAYMENT PENDING (ON-SPOT)";
}

export function paymentStatusClass(payment) {
  return payment.status === "PAID" ? "pass-paid" : "pass-pending";
}
