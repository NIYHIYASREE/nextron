/**
 * PassPage.jsx — NEXTRON'2K26 Super Pass
 * Rich animated participant pass with download-as-image.
 * Logo from /logo.png, download via html2canvas CDN.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Clock, AlertTriangle,
  Download, RotateCcw, Share2, Loader2,
} from "lucide-react";
import { YEAR_LABELS, paymentLabel, paymentStatusClass } from "../utils/passUtils.js";
import { siteConfig } from "../config/siteConfig.js";
import { events as allEvents } from "../data/events.js";

/* ── load html2canvas from CDN once ────────────────────────── */
function loadHtml2Canvas() {
  return new Promise((resolve) => {
    if (window.html2canvas) return resolve(window.html2canvas);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload = () => resolve(window.html2canvas);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

export default function PassPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const passRef  = useRef(null);

  const [downloading, setDownloading] = useState(false);
  const [showShine,   setShowShine]   = useState(false);

  const participant = location.state?.participant;

  useEffect(() => {
    if (!participant) navigate("/register", { replace: true });
  }, [participant, navigate]);

  // Trigger shine animation after pass appears
  useEffect(() => {
    const t = setTimeout(() => setShowShine(true), 900);
    return () => clearTimeout(t);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!passRef.current) return;
    setDownloading(true);
    try {
      const h2c = await loadHtml2Canvas();
      if (!h2c) { window.print(); return; }

      // Temporarily disable effects that break html2canvas
      const card = passRef.current;
      card.classList.add("pp-card--export");

      const canvas = await h2c(card, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0b1a38",
        logging: false,
        onclone: (doc) => {
          // In the cloned doc, remove orbs/shine and fix gradient texts
          doc.querySelectorAll(".pp-orb, .pp-shine, .pp-corner").forEach(el => el.remove());
          // Fix -webkit-background-clip text (not supported in canvas)
          doc.querySelectorAll(".pp-brand-next").forEach(el => {
            el.style.webkitTextFillColor = "#67e8f9";
            el.style.webkitBackgroundClip = "unset";
            el.style.backgroundClip = "unset";
          });
          doc.querySelectorAll(".pp-brand-year").forEach(el => {
            el.style.webkitTextFillColor = "#a78bfa";
            el.style.webkitBackgroundClip = "unset";
          });
          doc.querySelectorAll(".pp-info-value--xl").forEach(el => {
            el.style.webkitTextFillColor = "#e8f4ff";
            el.style.webkitBackgroundClip = "unset";
          });
          doc.querySelectorAll(".pp-info-value--id").forEach(el => {
            el.style.webkitTextFillColor = "#a78bfa";
            el.style.webkitBackgroundClip = "unset";
          });
          doc.querySelectorAll(".pp-foot-brand").forEach(el => {
            el.style.webkitTextFillColor = "#67e8f9";
            el.style.webkitBackgroundClip = "unset";
          });
        },
      });

      card.classList.remove("pp-card--export");

      const link    = document.createElement("a");
      link.download = `NEXTRON26-PASS-${participant.passId}.png`;
      link.href     = canvas.toDataURL("image/png");
      link.click();
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  }, [participant]);

  if (!participant) return null;

  const { passId, fullName, collegeName, registerNumber,
          department, year, selectedEvents, payment } = participant;

  const isPaid    = payment.status === "PAID";
  const yearLabel = YEAR_LABELS[year] ?? year;

  const selectedEventNames = selectedEvents
    .map((id) => allEvents.find((e) => e.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="pp-page">

      {/* ── Status banner ──────────────────────────────────── */}
      <motion.div
        className={`pp-banner ${isPaid ? "pp-banner--paid" : "pp-banner--pending"}`}
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {isPaid
          ? <><CheckCircle2 size={20} /> Registration Confirmed — Your pass is ready!</>
          : <><Clock size={20} /> Registered! Pay ₹{siteConfig.registrationFeeOnspot} at the venue.</>
        }
      </motion.div>

      {/* ── Tip ────────────────────────────────────────────── */}
      <motion.div
        className="pp-tip"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <AlertTriangle size={15} />
        <span>
          Screenshot or download your pass. Pass ID: <strong>{passId}</strong>
        </span>
      </motion.div>

      {/* ════════════════════════════════════════════════════
          THE PASS CARD
      ════════════════════════════════════════════════════ */}
      <motion.div
        className="pp-card-wrap"
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pp-card" ref={passRef}>

          {/* Shine sweep */}
          <AnimatePresence>
            {showShine && (
              <motion.div
                className="pp-shine"
                initial={{ x: "-100%", opacity: 0.7 }}
                animate={{ x: "200%", opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          {/* Animated background orbs */}
          <div className="pp-orb pp-orb--1" />
          <div className="pp-orb pp-orb--2" />
          <div className="pp-orb pp-orb--3" />

          {/* ── TOP STRIP ───────────────────────────────────── */}
          <div className="pp-top-strip">
            <div className="pp-top-left">
              <img
                src="/logo.png"
                alt="UCET"
                className="pp-logo"
                crossOrigin="anonymous"
              />
              <div className="pp-college-block">
                <span className="pp-college-name">UNIVERSITY COLLEGE OF ENGINEERING</span>
                <span className="pp-college-sub">TINDIVANAM · ANNA UNIVERSITY</span>
              </div>
            </div>
            <div className="pp-top-right">
              <span className={`pp-status-chip ${isPaid ? "pp-status-chip--paid" : "pp-status-chip--pending"}`}>
                {isPaid ? "✓ PAID" : "⏳ PENDING"}
              </span>
            </div>
          </div>

          {/* ── HERO TITLE ──────────────────────────────────── */}
          <div className="pp-hero">
            <div className="pp-event-brand">
              <span className="pp-brand-next">NEXTRON</span>
              <span className="pp-brand-year">'2K26</span>
            </div>
            <div className="pp-event-tagline">
              INNOVATE &nbsp;·&nbsp; INSPIRE &nbsp;·&nbsp; IMPACT
            </div>
            <div className="pp-event-meta">
              <span>16 SEP 2026</span>
              <span className="pp-dot">◆</span>
              <span>MELPAKKAM, TAMIL NADU</span>
              <span className="pp-dot">◆</span>
              <span>DEPT. OF ECE</span>
            </div>
          </div>

          {/* ── DASHED SEPARATOR ────────────────────────────── */}
          <div className="pp-tear">
            <div className="pp-tear-circle pp-tear-circle--left" />
            <div className="pp-tear-line" />
            <div className="pp-tear-circle pp-tear-circle--right" />
          </div>

          {/* ── PASS TYPE BADGE ─────────────────────────────── */}
          <div className="pp-pass-badge-row">
            <span className="pp-pass-badge">PARTICIPANT PASS</span>
          </div>

          {/* ── INFO GRID ───────────────────────────────────── */}
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

          {/* ── EVENTS ──────────────────────────────────────── */}
          <div className="pp-events-row">
            <span className="pp-events-label">REGISTERED EVENTS</span>
            <div className="pp-events-chips">
              {selectedEventNames.map((name) => (
                <span key={name} className="pp-event-chip">{name}</span>
              ))}
            </div>
          </div>

          {/* ── PAYMENT STATUS ──────────────────────────────── */}
          <div className={`pp-payment-bar ${isPaid ? "pp-payment-bar--paid" : "pp-payment-bar--pending"}`}>
            <div className="pp-payment-left">
              <span className="pp-payment-label-text">PAYMENT STATUS</span>
              <span className="pp-payment-value-text">{paymentLabel(payment)}</span>
            </div>
            {payment.method === "ONLINE" && isPaid && (
              <div className="pp-payment-right">
                <span className="pp-payment-method">ONLINE · RAZORPAY</span>
                {payment.transactionId && (
                  <span className="pp-payment-txn">TXN: {payment.transactionId}</span>
                )}
              </div>
            )}
            {payment.method === "ON_SPOT" && (
              <div className="pp-payment-right">
                <span className="pp-payment-method">ON-SPOT PAYMENT</span>
              </div>
            )}
          </div>

          {/* ── BOTTOM FOOTER ───────────────────────────────── */}
          <div className="pp-foot">
            <span className="pp-foot-brand">NEXTRON'2K26</span>
            <span className="pp-foot-dept">Dept. of Electronics &amp; Communication Engineering</span>
            <span className="pp-foot-univ">University College of Engineering Tindivanam</span>
          </div>

          {/* Corner accent marks */}
          <div className="pp-corner pp-corner--tl" />
          <div className="pp-corner pp-corner--tr" />
          <div className="pp-corner pp-corner--bl" />
          <div className="pp-corner pp-corner--br" />

        </div>
      </motion.div>

      {/* ── Action buttons ──────────────────────────────────── */}
      <motion.div
        className="pp-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <button
          className="btn btn-primary btn-glow"
          type="button"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading
            ? <><Loader2 size={17} className="spin" /> Generating…</>
            : <><Download size={17} /> Download Pass</>}
        </button>

        {navigator.share && (
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigator.share({
              title: `NEXTRON'2K26 Pass — ${passId}`,
              text: `NEXTRON'2K26 Registration\nName: ${fullName}\nPass ID: ${passId}\nPayment: ${paymentLabel(payment)}`,
            })}
          >
            <Share2 size={17} /> Share
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

      <div className="pp-retrieve-tip">
        Lost your pass? &nbsp;
        <a href="/retrieve-pass" className="link-cyan">Retrieve it here</a>
        &nbsp; using your Pass ID and email.
      </div>

    </div>
  );
}
