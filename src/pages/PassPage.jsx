/**
 * PassPage.jsx
 * Shows the generated participant pass after successful registration.
 * Like a movie ticket — participant screenshots this page.
 * No email delivery. Pass is shown once; retrievable by Pass ID.
 */

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download, Share2, RotateCcw, CheckCircle2,
  AlertTriangle, Clock, MapPin, Calendar,
} from "lucide-react";
import { generateQRDataUrl, YEAR_LABELS, paymentLabel, paymentStatusClass } from "../utils/passUtils.js";
import { siteConfig } from "../config/siteConfig.js";
import { events as allEvents } from "../data/events.js";

export default function PassPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const passRef   = useRef(null);
  const [qrUrl, setQrUrl] = useState("");

  const participant = location.state?.participant;

  // Redirect to register if no participant data
  useEffect(() => {
    if (!participant) navigate("/register", { replace: true });
  }, [participant, navigate]);

  // Generate QR code from Pass ID
  useEffect(() => {
    if (!participant?.passId) return;
    generateQRDataUrl(participant.passId).then(setQrUrl);
  }, [participant?.passId]);

  if (!participant) return null;

  const { passId, fullName, collegeName, registerNumber, department,
          year, selectedEvents, payment } = participant;

  const isPaid    = payment.status === "PAID";
  const isOnline  = payment.method === "ONLINE";
  const yearLabel = YEAR_LABELS[year] ?? year;

  const selectedEventNames = selectedEvents
    .map((id) => allEvents.find((e) => e.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="pass-page">

      {/* ── Success banner ─────────────────────────────────── */}
      <motion.div
        className={`pass-banner ${isPaid ? "pass-banner--paid" : "pass-banner--pending"}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isPaid
          ? <><CheckCircle2 size={22} /> Registration Confirmed! Your pass is ready.</>
          : <><Clock size={22} /> Registered! Pay ₹{siteConfig.registrationFeeOnspot} at the venue on event day.</>
        }
      </motion.div>

      {/* ── Screenshot tip ─────────────────────────────────── */}
      <motion.div
        className="pass-tip"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AlertTriangle size={16} />
        <span>
          <strong>Take a screenshot</strong> of your pass now — it won't be emailed.
          Note your Pass ID: <strong>{passId}</strong> to retrieve it later.
        </span>
      </motion.div>

      {/* ── The Pass ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="pass-card" ref={passRef}>

          {/* Pass header */}
          <div className="pass-head">
            <img src="/clg_logo.png" alt="UCET Logo" className="pass-logo" />
            <div className="pass-head-text">
              <div className="pass-event-name">NEXTRON'2K26</div>
              <div className="pass-event-sub">A NATIONAL LEVEL TECHNICAL SYMPOSIUM</div>
              <div className="pass-dept">Dept. of ECE · UCET, Tindivanam</div>
            </div>
          </div>

          <div className="pass-divider" />

          <div className="pass-badge-row">
            <span className="pass-badge">PARTICIPANT PASS</span>
          </div>

          {/* Pass body — info + QR */}
          <div className="pass-body">
            <div className="pass-info">

              <div className="pass-row">
                <span className="pass-label">Name</span>
                <span className="pass-value pass-value--name">{fullName}</span>
              </div>
              <div className="pass-row">
                <span className="pass-label">Pass ID</span>
                <span className="pass-value pass-value--id">{passId}</span>
              </div>
              <div className="pass-row">
                <span className="pass-label">College</span>
                <span className="pass-value">{collegeName}</span>
              </div>
              <div className="pass-row">
                <span className="pass-label">Reg. No</span>
                <span className="pass-value">{registerNumber}</span>
              </div>
              <div className="pass-row">
                <span className="pass-label">Department</span>
                <span className="pass-value">{department}</span>
              </div>
              <div className="pass-row">
                <span className="pass-label">Year</span>
                <span className="pass-value">{yearLabel}</span>
              </div>

              <div className="pass-divider pass-divider--light" />

              <div className="pass-events-section">
                <span className="pass-label">Events</span>
                <ul className="pass-events-list">
                  {selectedEventNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>

              <div className="pass-divider pass-divider--light" />

              {/* Payment status — the key badge */}
              <div className={`pass-payment-status ${paymentStatusClass(payment)}`}>
                <span className="pass-payment-label">PAYMENT STATUS</span>
                <span className="pass-payment-value">{paymentLabel(payment)}</span>
                {payment.transactionId && (
                  <span className="pass-txn">TXN: {payment.transactionId}</span>
                )}
              </div>

            </div>

            {/* QR code side */}
            <div className="pass-qr-col">
              {qrUrl
                ? <img src={qrUrl} alt={`QR for ${passId}`} className="pass-qr" />
                : <div className="pass-qr-placeholder">Generating QR…</div>
              }
              <p className="pass-qr-label">Scan at entry</p>
            </div>
          </div>

          {/* Pass footer */}
          <div className="pass-foot">
            <div className="pass-foot-item">
              <Calendar size={14} /> {siteConfig.eventDate}
            </div>
            <div className="pass-foot-item">
              <MapPin size={14} /> {siteConfig.shortLocation}
            </div>
            <div className="pass-foot-brand">NEXTRON'2K26</div>
          </div>

        </div>
      </motion.div>

      {/* ── Actions ─────────────────────────────────────────── */}
      <motion.div
        className="pass-actions"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <button
          className="btn btn-secondary"
          onClick={() => window.print()}
          type="button"
        >
          <Download size={17} /> Save / Print Pass
        </button>
        {navigator.share && (
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() =>
              navigator.share({
                title: `NEXTRON'2K26 Pass — ${passId}`,
                text: `My NEXTRON'26 pass: ${passId}\nName: ${fullName}\nPayment: ${paymentLabel(payment)}`,
              })
            }
          >
            <Share2 size={17} /> Share Pass ID
          </button>
        )}
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => navigate("/register", { replace: true })}
        >
          <RotateCcw size={17} /> Register Another
        </button>
      </motion.div>

      {/* ── Retrieve pass tip ────────────────────────────────── */}
      <div className="pass-retrieve-tip">
        Lost your screenshot? Go to{" "}
        <a href="/retrieve-pass" className="link-cyan">Retrieve Pass</a>{" "}
        and enter your Pass ID or email.
      </div>

    </div>
  );
}
