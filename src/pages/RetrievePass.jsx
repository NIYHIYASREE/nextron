/**
 * RetrievePass.jsx
 * Lets a participant look up their pass by Pass ID + email.
 * Useful if they forgot to screenshot.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { getParticipant } from "../utils/firestoreParticipant.js";
import { generateQRDataUrl, YEAR_LABELS, paymentLabel, paymentStatusClass } from "../utils/passUtils.js";
import { events as allEvents } from "../data/events.js";
import { siteConfig } from "../config/siteConfig.js";
import { Calendar, MapPin } from "lucide-react";

export default function RetrievePass() {
  const [passId, setPassId]       = useState("");
  const [email,  setEmail]        = useState("");
  const [loading, setLoading]     = useState(false);
  const [error,   setError]       = useState("");
  const [found,   setFound]       = useState(null);
  const [qrUrl,   setQrUrl]       = useState("");

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
        generateQRDataUrl(participant.passId).then(setQrUrl);
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
          <PassDisplay participant={found} qrUrl={qrUrl} />
        </motion.div>
      )}
    </div>
  );
}

/* Inline pass card (same structure as PassPage) */
function PassDisplay({ participant, qrUrl }) {
  const { passId, fullName, collegeName, registerNumber, department,
          year, selectedEvents, payment } = participant;

  const yearLabel          = YEAR_LABELS[year] ?? year;
  const selectedEventNames = selectedEvents
    .map((id) => allEvents.find((e) => e.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="pass-card">
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

      <div className="pass-body">
        <div className="pass-info">
          <div className="pass-row"><span className="pass-label">Name</span><span className="pass-value pass-value--name">{fullName}</span></div>
          <div className="pass-row"><span className="pass-label">Pass ID</span><span className="pass-value pass-value--id">{passId}</span></div>
          <div className="pass-row"><span className="pass-label">College</span><span className="pass-value">{collegeName}</span></div>
          <div className="pass-row"><span className="pass-label">Reg. No</span><span className="pass-value">{registerNumber}</span></div>
          <div className="pass-row"><span className="pass-label">Department</span><span className="pass-value">{department}</span></div>
          <div className="pass-row"><span className="pass-label">Year</span><span className="pass-value">{yearLabel}</span></div>
          <div className="pass-divider pass-divider--light" />
          <div className="pass-events-section">
            <span className="pass-label">Events</span>
            <ul className="pass-events-list">
              {selectedEventNames.map((name) => <li key={name}>{name}</li>)}
            </ul>
          </div>
          <div className="pass-divider pass-divider--light" />
          <div className={`pass-payment-status ${paymentStatusClass(payment)}`}>
            <span className="pass-payment-label">PAYMENT STATUS</span>
            <span className="pass-payment-value">{paymentLabel(payment)}</span>
          </div>
        </div>
        <div className="pass-qr-col">
          {qrUrl
            ? <img src={qrUrl} alt={`QR for ${passId}`} className="pass-qr" />
            : <div className="pass-qr-placeholder">Loading QR…</div>}
          <p className="pass-qr-label">Scan at entry</p>
        </div>
      </div>

      <div className="pass-foot">
        <div className="pass-foot-item"><Calendar size={14} /> {siteConfig.eventDate}</div>
        <div className="pass-foot-item"><MapPin size={14} /> {siteConfig.shortLocation}</div>
        <div className="pass-foot-brand">NEXTRON'2K26</div>
      </div>
    </div>
  );
}
