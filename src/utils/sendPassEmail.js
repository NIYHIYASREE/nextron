/**
 * sendPassEmail.js
 * Sends the NEXTRON'2K26 registration confirmation email via EmailJS.
 * Triggered after successful registration (online or on-spot).
 */

import emailjs from "@emailjs/browser";
import { YEAR_LABELS, paymentLabel } from "./passUtils.js";
import { events as allEvents } from "../data/events.js";

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Send pass confirmation email to participant.
 * @param {object} participant — full participant object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendPassEmail(participant) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("EmailJS not configured — skipping email.");
    return { success: false, error: "EmailJS not configured" };
  }

  const {
    passId, fullName, email, collegeName,
    registerNumber, department, year,
    selectedEvents, payment,
  } = participant;

  const isPaid    = payment.status === "PAID";
  const yearLabel = YEAR_LABELS[year] ?? year;

  // Build events list as plain text (EmailJS templates don't render HTML in all clients)
  const eventNames = selectedEvents
    .map((id) => allEvents.find((e) => e.id === id)?.name)
    .filter(Boolean);

  const eventsList = eventNames.map((n) => `• ${n}`).join("\n");

  // Pending note — only for on-spot unpaid
  const pendingNote = !isPaid
    ? `⚠ Payment Pending — Please pay ₹250 at the registration desk when you arrive at the venue on 16 September 2026. Show this email or your Pass ID at the counter.`
    : "";

  const templateParams = {
    to_email:        email,
    to_name:         fullName,
    pass_id:         passId,
    college_name:    collegeName,
    register_number: registerNumber,
    department:      department,
    year:            yearLabel,
    events_list:     eventsList,
    payment_status:  paymentLabel(participant.payment),
    pending_note:    pendingNote,
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return { success: true };
  } catch (err) {
    console.error("EmailJS send failed:", err);
    return { success: false, error: err?.text || err?.message || "Unknown error" };
  }
}
