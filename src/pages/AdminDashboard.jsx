/**
 * AdminDashboard.jsx
 * Password-protected admin panel for NEXTRON'26 organizers.
 *
 * Features:
 * - Search by name / phone / register number / pass ID / email
 * - List all registrations
 * - Mark on-spot payment as PAID
 * - QR scanner for check-in (uses device camera)
 * - Pass detail modal
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, RefreshCw, CheckCircle2, Clock, Loader2,
  X, ShieldAlert, LogOut, QrCode, Users, IndianRupee,
  CameraOff, Camera,
} from "lucide-react";
import {
  searchParticipants,
  getAllParticipants,
  markOnSpotPaid,
  markCheckIn,
  getParticipant,
} from "../utils/firestoreParticipant.js";
import { YEAR_LABELS, paymentLabel, paymentStatusClass, generateQRDataUrl } from "../utils/passUtils.js";
import { events as allEvents } from "../data/events.js";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "nextron26admin";

/* ═══════════════════════════════════════════════════════════════
   Root — Login gate
═══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);

  if (!authed) return <AdminLogin onAuth={() => setAuthed(true)} />;
  return <AdminPanel onLogout={() => setAuthed(false)} />;
}

/* ─── Login ─────────────────────────────────────────────────── */
function AdminLogin({ onAuth }) {
  const [pw, setPw]         = useState("");
  const [error, setError]   = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      onAuth();
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="admin-login-page">
      <motion.form
        className="admin-login-card"
        onSubmit={submit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ShieldAlert size={38} className="admin-shield" />
        <h1>Admin Access</h1>
        <p>NEXTRON'2K26 Organiser Dashboard</p>
        <input
          type="password"
          placeholder="Admin password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(""); }}
          autoFocus
        />
        {error && <div className="admin-login-error">{error}</div>}
        <button className="btn btn-primary btn-block" type="submit">
          Enter Dashboard
        </button>
      </motion.form>
    </div>
  );
}

/* ─── Main panel ─────────────────────────────────────────────── */
function AdminPanel({ onLogout }) {
  const [tab, setTab]             = useState("list");   // "list" | "search" | "scanner"
  const [participants, setPartic] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searchTerm, setTerm]     = useState("");
  const [selected, setSelected]   = useState(null);    // for detail modal
  const [stats, setStats]         = useState({ total: 0, paid: 0, pending: 0 });

  /* Load all on mount */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllParticipants(200);
      setPartic(data);
      setStats({
        total:   data.length,
        paid:    data.filter((p) => p.payment.status === "PAID").length,
        pending: data.filter((p) => p.payment.status === "PENDING").length,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* Search */
  const handleSearch = async () => {
    if (!searchTerm.trim()) { loadAll(); return; }
    setLoading(true);
    try {
      const res = await searchParticipants(searchTerm);
      setPartic(res);
    } finally {
      setLoading(false);
    }
  };

  /* Mark paid */
  const handleMarkPaid = async (passId) => {
    await markOnSpotPaid(passId);
    setPartic((prev) =>
      prev.map((p) =>
        p.passId === passId
          ? { ...p, payment: { ...p.payment, status: "PAID" } }
          : p
      )
    );
    if (selected?.passId === passId)
      setSelected((p) => ({ ...p, payment: { ...p.payment, status: "PAID" } }));
    setStats((s) => ({ ...s, paid: s.paid + 1, pending: s.pending - 1 }));
  };

  /* Check-in */
  const handleCheckIn = async (passId) => {
    await markCheckIn(passId);
    setPartic((prev) =>
      prev.map((p) =>
        p.passId === passId
          ? { ...p, checkIn: { ...p.checkIn, status: "CHECKED_IN" } }
          : p
      )
    );
    if (selected?.passId === passId)
      setSelected((p) => ({ ...p, checkIn: { ...p.checkIn, status: "CHECKED_IN" } }));
  };

  return (
    <div className="admin-page">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">NEXTRON'2K26 Admin</h1>
          <p className="admin-sub">Organiser Dashboard</p>
        </div>
        <button className="btn btn-ghost" onClick={onLogout} type="button">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      <div className="admin-stats">
        <StatCard icon={Users}        label="Total Registrations" value={stats.total} color="cyan"   />
        <StatCard icon={CheckCircle2} label="Paid"                value={stats.paid}  color="green"  />
        <StatCard icon={Clock}        label="Pending"             value={stats.pending} color="amber" />
      </div>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="admin-tabs">
        {[
          { id: "list",    label: "All Registrations" },
          { id: "search",  label: "Search" },
          { id: "scanner", label: "QR Scanner" },
        ].map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? "admin-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────── */}
      {tab === "list" && (
        <div className="admin-section">
          <div className="admin-section-header">
            <span>{loading ? "Loading…" : `${participants.length} records`}</span>
            <button className="btn btn-ghost btn-sm" onClick={loadAll} disabled={loading} type="button">
              <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
            </button>
          </div>
          <ParticipantTable
            rows={participants}
            loading={loading}
            onSelect={setSelected}
            onMarkPaid={handleMarkPaid}
            onCheckIn={handleCheckIn}
          />
        </div>
      )}

      {tab === "search" && (
        <div className="admin-section">
          <div className="admin-search-row">
            <input
              type="text"
              placeholder="Pass ID / Phone / Reg No / Email"
              value={searchTerm}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading} type="button">
              {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
              Search
            </button>
          </div>
          <ParticipantTable
            rows={participants}
            loading={loading}
            onSelect={setSelected}
            onMarkPaid={handleMarkPaid}
            onCheckIn={handleCheckIn}
          />
        </div>
      )}

      {tab === "scanner" && (
        <QRScanner
          onFound={async (passId) => {
            const p = await getParticipant(passId);
            if (p) setSelected(p);
          }}
        />
      )}

      {/* ── Detail modal ──────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <ParticipantModal
            participant={selected}
            onClose={() => setSelected(null)}
            onMarkPaid={handleMarkPaid}
            onCheckIn={handleCheckIn}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`admin-stat-card admin-stat-card--${color}`}>
      <Icon size={22} />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

/* ─── Table ──────────────────────────────────────────────────── */
function ParticipantTable({ rows, loading, onSelect, onMarkPaid, onCheckIn }) {
  if (loading) return <div className="admin-loading"><Loader2 size={26} className="spin" /> Loading…</div>;
  if (!rows.length) return <div className="admin-empty">No registrations found.</div>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Pass ID</th>
            <th>Name</th>
            <th>College</th>
            <th>Dept / Year</th>
            <th>Events</th>
            <th>Payment</th>
            <th>Check-In</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.passId} onClick={() => onSelect(p)} className="admin-table-row">
              <td className="pass-id-cell">{p.passId}</td>
              <td>{p.fullName}</td>
              <td className="college-cell">{p.collegeName}</td>
              <td>{p.department} / {YEAR_LABELS[p.year] ?? p.year}</td>
              <td>{p.selectedEvents.length} event(s)</td>
              <td>
                <span className={`admin-badge ${p.payment.status === "PAID" ? "admin-badge--paid" : "admin-badge--pending"}`}>
                  {p.payment.status === "PAID" ? "PAID" : "PENDING"}
                  {p.payment.method === "ONLINE" ? " (Online)" : " (On-Spot)"}
                </span>
              </td>
              <td>
                <span className={`admin-badge ${p.checkIn?.status === "CHECKED_IN" ? "admin-badge--checkin" : "admin-badge--notcheckin"}`}>
                  {p.checkIn?.status === "CHECKED_IN" ? "CHECKED IN" : "NOT IN"}
                </span>
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <div className="admin-action-btns">
                  {p.payment.status === "PENDING" && (
                    <button
                      className="btn btn-xs btn-success"
                      onClick={() => onMarkPaid(p.passId)}
                      type="button"
                    >
                      <IndianRupee size={12} /> Mark Paid
                    </button>
                  )}
                  {p.checkIn?.status !== "CHECKED_IN" && (
                    <button
                      className="btn btn-xs btn-info"
                      onClick={() => onCheckIn(p.passId)}
                      type="button"
                    >
                      <CheckCircle2 size={12} /> Check In
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Participant detail modal ───────────────────────────────── */
function ParticipantModal({ participant, onClose, onMarkPaid, onCheckIn }) {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    generateQRDataUrl(participant.passId).then(setQrUrl);
  }, [participant.passId]);

  const eventNames = participant.selectedEvents
    .map((id) => allEvents.find((e) => e.id === id)?.name)
    .filter(Boolean);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-card"
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{participant.fullName}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-info-grid">
            <InfoRow label="Pass ID"     value={participant.passId} highlight />
            <InfoRow label="Email"       value={participant.email} />
            <InfoRow label="Phone"       value={participant.phoneNumber} />
            <InfoRow label="College"     value={participant.collegeName} />
            <InfoRow label="Reg. No"     value={participant.registerNumber} />
            <InfoRow label="Dept / Year" value={`${participant.department} / ${YEAR_LABELS[participant.year] ?? participant.year}`} />
            <InfoRow label="Food"        value={participant.foodPreference} />
            <InfoRow
              label="Events"
              value={eventNames.join(", ")}
            />
            <InfoRow
              label="Payment"
              value={paymentLabel(participant.payment)}
              className={paymentStatusClass(participant.payment)}
            />
            {participant.payment.transactionId && (
              <InfoRow label="Txn ID" value={participant.payment.transactionId} />
            )}
            <InfoRow
              label="Check-In"
              value={participant.checkIn?.status === "CHECKED_IN" ? "CHECKED IN ✅" : "NOT CHECKED IN"}
            />
          </div>

          {qrUrl && (
            <div className="modal-qr">
              <img src={qrUrl} alt="QR Code" />
            </div>
          )}
        </div>

        <div className="modal-footer">
          {participant.payment.status === "PENDING" && (
            <button
              className="btn btn-success"
              onClick={() => onMarkPaid(participant.passId)}
              type="button"
            >
              <IndianRupee size={16} /> Mark On-Spot PAID
            </button>
          )}
          {participant.checkIn?.status !== "CHECKED_IN" && (
            <button
              className="btn btn-info"
              onClick={() => onCheckIn(participant.passId)}
              type="button"
            >
              <CheckCircle2 size={16} /> Mark Checked In
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ label, value, highlight, className }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className={`info-value ${highlight ? "info-value--highlight" : ""} ${className || ""}`}>
        {value}
      </span>
    </div>
  );
}

/* ─── QR Scanner ──────────────────────────────────────────────
   Uses the browser's BarcodeDetector API (Chrome 83+, Edge 83+,
   Android Chrome). Falls back to a text-input for iOS/Firefox.
──────────────────────────────────────────────────────────────── */
function QRScanner({ onFound }) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const timerRef   = useRef(null);
  const [running,  setRunning]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState("");
  const [manualId, setManualId] = useState("");
  const hasBarcodeApi = typeof window !== "undefined" && "BarcodeDetector" in window;

  const startCamera = async () => {
    setError("");
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current       = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setRunning(true);
      scanLoop();
    } catch {
      setError("Camera access denied or not available. Use manual entry below.");
    }
  };

  const stopCamera = useCallback(() => {
    clearTimeout(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRunning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const scanLoop = () => {
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    const scan = async () => {
      if (!videoRef.current) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes.length > 0) {
          const val = codes[0].rawValue.trim().toUpperCase();
          if (val.startsWith("NXT26-")) {
            stopCamera();
            setResult(val);
            onFound(val);
            return;
          }
        }
      } catch { /* ignore */ }
      timerRef.current = setTimeout(scan, 500);
    };
    scan();
  };

  const handleManual = () => {
    const id = manualId.trim().toUpperCase();
    if (!id.startsWith("NXT26-")) {
      setError("Invalid pass ID format. Should be NXT26-XXXXXX");
      return;
    }
    setResult(id);
    onFound(id);
  };

  return (
    <div className="scanner-section">
      <h2 className="scanner-title">
        <QrCode size={22} /> QR Code Scanner
      </h2>
      <p className="scanner-sub">Scan a participant's pass QR code to check them in.</p>

      {hasBarcodeApi ? (
        <>
          <div className="scanner-video-wrap">
            <video ref={videoRef} className="scanner-video" muted playsInline />
            {!running && !result && (
              <div className="scanner-overlay">
                <Camera size={40} />
                <span>Camera not started</span>
              </div>
            )}
            {result && (
              <div className="scanner-success-overlay">
                <CheckCircle2 size={40} />
                <span>Scanned: {result}</span>
              </div>
            )}
          </div>
          <div className="scanner-controls">
            {!running
              ? <button className="btn btn-primary" onClick={startCamera} type="button"><Camera size={16} /> Start Camera</button>
              : <button className="btn btn-secondary" onClick={stopCamera} type="button"><CameraOff size={16} /> Stop Camera</button>}
            {result && (
              <button className="btn btn-ghost" onClick={() => { setResult(null); startCamera(); }} type="button">
                <RefreshCw size={16} /> Scan Another
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="scanner-no-api">
          <CameraOff size={30} />
          <p>QR scanning not supported on this browser. Use manual entry.</p>
        </div>
      )}

      {error && <div className="reg-api-error"><X size={14} /> {error}</div>}

      {/* Manual fallback */}
      <div className="scanner-manual">
        <h3>Manual Entry</h3>
        <div className="admin-search-row">
          <input
            type="text"
            placeholder="NXT26-XXXXXX"
            value={manualId}
            onChange={(e) => setManualId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleManual()}
          />
          <button className="btn btn-primary" onClick={handleManual} type="button">
            <Search size={16} /> Look Up
          </button>
        </div>
      </div>
    </div>
  );
}
