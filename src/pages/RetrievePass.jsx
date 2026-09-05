/**
 * RetrievePass.jsx
 * Lets a participant look up their pass by Pass ID + email.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, AlertCircle, Calendar, MapPin } from "lucide-react";
import { getParticipant } from "../utils/firestoreParticipant.js";
import { YEAR_LABELS, paymentLabel, paymentStatusClass } from "../utils/passUtils.js";
import { events as allEvents } from "../data/events.js";
import { siteConfig } from "../config/siteConfig.js";

export default function RetrievePass() {
  const [passId,  setPassId]  = useState("");
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [found,   setFound]   = useState(null);

  const handleSearch = async () => {
    setError("");
    setFound(null);
    const pid = passId.trim().toUpperCase();
    const em  = email.trim().toLowerCase();
    if (!pid) { setError("Enter your Pass ID"); return; }
    if (!em)  { setError("Enter your registered email"); return; }

    setLoading(true);
    try {
      const participant = await getParticipant(pid);
      if (!participant) {
        setError("Pass not found. Check your Pass ID and try again.");
      } else if (participant.email !== em) {
        setError("Email does not match the registered email for this pass.");
      } else {
        setFound(participant);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pass-page">
      <div className="retrieve-header">
        <h1>Retrieve Your Pass</h1>
        <p>Enter your Pass ID and registered email to view your pass again.</p>
      </div>

      <div className="retrieve-form">
        <div className="reg-field">
          <label className="reg-label">Pass ID</label>
          <input
            type="text"
            placeholder="e.g. NXT26-A7K92P"
            value={passId}
            onChange={(e) => setPassId(e.target.value.toUpperCase())}
          />
        </div>
        <div className="reg-field">
          <label className="reg-label">Registered Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && (
          <div className="reg-api-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <button
          className="btn btn-primary btn-glow"
          type="button"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading
            ? <><Loader2 size={18} className="spin" /> Searching…</>
            : <><Search size={18} /> Find My Pass</>}
        </button>
      </div>

      {found && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PassDisplay participant={found} />
        </motion.div>
      )}
    </div>
  );
}

function PassDisplay({ participant }) {
  const { passId, fullName, collegeName, registerNumber, department,
          year, selectedEvents, payment } = participant;

  const yearLabel          = YEAR_LABELS[year] ?? year;
  const selectedEventNames = selectedEvents
    .map((id) => allEvents.find((e) => e.id === id)?.name)
    .filter(Boolean);

  const isPaid = payment.status === "PAID";

  return (
    <div className="pp-card">
      <div className="pp-orb pp-orb--1" />
      <div className="pp-orb pp-orb--2" />
      <div className="pp-corner pp-corner--tl" />
      <div className="pp-corner pp-corner--tr" />
      <div className="pp-corner pp-corner--bl" />
      <div className="pp-corner pp-corner--br" />

      <div className="pp-top-strip">
        <div className="pp-top-left">
          <img src="/logo.png" alt="UCET" className="pp-logo" crossOrigin="anonymous" />
          <div className="pp-college-block">
            <span className="pp-college-name">UNIVERSITY COLLEGE OF ENGINEERING</span>
            <span className="pp-college-sub">TINDIVANAM · ANNA UNIVERSITY</span>
          </div>
        </div>
        <span className={`pp-status-chip ${isPaid ? "pp-status-chip--paid" : "pp-status-chip--pending"}`}>
          {isPaid ? "✓ PAID" : "⏳ PENDING"}
        </span>
      </div>

      <div className="pp-hero">
        <div className="pp-event-brand">
          <span className="pp-brand-next">NEXTRON</span>
          <span className="pp-brand-year">'2K26</span>
        </div>
        <div className="pp-event-tagline">INNOVATE &nbsp;·&nbsp; INSPIRE &nbsp;·&nbsp; IMPACT</div>
        <div className="pp-event-meta">
          <span>16 SEP 2026</span><span className="pp-dot">◆</span>
          <span>MELPAKKAM, TAMIL NADU</span><span className="pp-dot">◆</span>
          <span>DEPT. OF ECE</span>
        </div>
      </div>

      <div className="pp-tear">
        <div className="pp-tear-circle pp-tear-circle--left" />
        <div className="pp-tear-line" />
        <div className="pp-tear-circle pp-tear-circle--right" />
      </div>

      <div className="pp-pass-badge-row">
        <span className="pp-pass-badge">PARTICIPANT PASS</span>
      </div>

      <div className="pp-info-grid">
        <div className="pp-info-block pp-info-block--name">
          <span className="pp-info-label">PARTICIPANT NAME</span>
          <span className="pp-info-value pp-info-value--xl">{fullName}</span>
        </div>
        <div className="pp-info-block">
          <span className="pp-info-label">PASS ID</span>
          <span className="pp-info-value pp-info-value--id">{passId}</span>
        </div>
        <div className="pp-info-block">
          <span className="pp-info-label">REGISTER NO.</span>
          <span className="pp-info-value">{registerNumber}</span>
        </div>
        <div className="pp-info-block">
          <span className="pp-info-label">DEPARTMENT</span>
          <span className="pp-info-value">{department}</span>
        </div>
        <div className="pp-info-block">
          <span className="pp-info-label">YEAR</span>
          <span className="pp-info-value">{yearLabel}</span>
        </div>
        <div className="pp-info-block pp-info-block--college">
          <span className="pp-info-label">COLLEGE</span>
          <span className="pp-info-value">{collegeName}</span>
        </div>
      </div>

      <div className="pp-events-row">
        <span className="pp-events-label">REGISTERED EVENTS</span>
        <div className="pp-events-chips">
          {selectedEventNames.map((name) => (
            <span key={name} className="pp-event-chip">{name}</span>
          ))}
        </div>
      </div>

      <div className={`pp-payment-bar ${isPaid ? "pp-payment-bar--paid" : "pp-payment-bar--pending"}`}>
        <div className="pp-payment-left">
          <span className="pp-payment-label-text">PAYMENT STATUS</span>
          <span className="pp-payment-value-text">{paymentLabel(payment)}</span>
        </div>
        <div className="pp-payment-right">
          <span className="pp-payment-method">{payment.method === "ONLINE" ? "ONLINE · RAZORPAY" : "ON-SPOT PAYMENT"}</span>
        </div>
      </div>

      <div className="pp-foot">
        <span className="pp-foot-brand">NEXTRON'2K26</span>
        <span className="pp-foot-dept">Dept. of Electronics &amp; Communication Engineering</span>
        <span className="pp-foot-univ">University College of Engineering Tindivanam</span>
      </div>
    </div>
  );
}
