import { ArrowRight, CalendarDays, ExternalLink, MapPin, Rocket, Trophy, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { siteConfig } from "../config/siteConfig.js";
import { openRegistrationForm } from "../utils/registration.js";
import Countdown from "./Countdown.jsx";

/* ── Animation variants ─────────────────────────────────────── */
const fade = (delay = 0) => ({
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] } },
});

const WHY_CARDS = [
  { icon: Rocket,  title: "Tech Meets Creativity", desc: "Where ideas take flight" },
  { icon: Users,   title: "Network & Collaborate", desc: "Connect with bright minds" },
  { icon: Trophy,  title: "Compete & Win",          desc: "Showcase your talent & win big" },
  { icon: Zap,     title: "Learn & Grow",           desc: "Gain insights from experts" },
];

export default function Hero() {
  return (
    <section className="hero2" id="home">

      {/* ── Background ── */}
      <div className="hero2-bg" aria-hidden="true">
        {/* Deep space gradient */}
        <div className="hero2-bg-base" />
        {/* City silhouette */}
        <div className="hero2-city" />
        {/* Glow blobs */}
        <div className="hero2-glow hero2-glow--left"  />
        <div className="hero2-glow hero2-glow--right" />
        {/* Grid overlay */}
        <div className="hero2-grid" />
        {/* Particles */}
        <div className="hero2-particles">
          {Array.from({ length: 22 }).map((_, i) => (
            <span key={i} className="hero2-particle" style={{ "--pi": i }} />
          ))}
        </div>
      </div>

      {/* ── Content wrapper ── */}
      <div className="hero2-content">

        {/* College name */}
        <motion.h2
          className="hero2-college"
          variants={fade(0.05)}
          initial="hidden"
          animate="visible"
        >
          <span className="hero2-college-line">UNIVERSITY COLLEGE OF</span>
          <span className="hero2-college-line">ENGINEERING TINDIVANAM</span>
        </motion.h2>

        {/* Chip */}
        <motion.span
          className="hero2-chip"
          variants={fade(0.15)}
          initial="hidden"
          animate="visible"
        >
          <Zap size={12} aria-hidden="true" />
          NATIONAL LEVEL TECHNICAL SYMPOSIUM
        </motion.span>

        {/* Main title */}
        <motion.h1
          className="hero2-title"
          variants={fade(0.22)}
          initial="hidden"
          animate="visible"
          aria-label={siteConfig.eventName}
        >
          <span className="hero2-title-next">NEXTRON</span>
          <span className="hero2-title-year">'26</span>
        </motion.h1>

        {/* Tagline pill */}
        <motion.div
          className="hero2-tagline-pill"
          variants={fade(0.32)}
          initial="hidden"
          animate="visible"
        >
          INNOVATE &nbsp;•&nbsp; INSPIRE &nbsp;•&nbsp; IMPACT
        </motion.div>

        {/* Subtitle lines */}
        <motion.p className="hero2-subtitle" variants={fade(0.38)} initial="hidden" animate="visible">
          A NATIONAL LEVEL TECHNICAL SYMPOSIUM
        </motion.p>
        <motion.p className="hero2-dept" variants={fade(0.44)} initial="hidden" animate="visible">
          DEPARTMENT OF ELECTRONICS &amp; COMMUNICATION ENGINEERING
        </motion.p>
        <motion.p className="hero2-univ" variants={fade(0.48)} initial="hidden" animate="visible">
          A CONSTITUENT COLLEGE OF ANNA UNIVERSITY CHENNAI
        </motion.p>

        {/* Info row */}
        <motion.div className="hero2-info-row" variants={fade(0.54)} initial="hidden" animate="visible">
          <div className="hero2-info-card">
            <CalendarDays size={20} aria-hidden="true" />
            <div>
              <strong>22<br />SEPTEMBER</strong>
              <span>2026</span>
            </div>
          </div>
          <div className="hero2-info-card">
            <MapPin size={20} aria-hidden="true" />
            <div>
              <strong>MELPAKKAM</strong>
              <span>TAMIL NADU</span>
            </div>
          </div>
          <div className="hero2-info-card">
            <Zap size={20} aria-hidden="true" />
            <div>
              <strong>₹200 / ₹250</strong>
              <span>ONLINE / ON-SPOT</span>
            </div>
          </div>
        </motion.div>

        {/* Register Now — full width */}
        <motion.button
          className="hero2-register-btn"
          type="button"
          onClick={openRegistrationForm}
          variants={fade(0.62)}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          REGISTER NOW
          <ArrowRight size={20} aria-hidden="true" />
        </motion.button>

        {/* Secondary buttons row */}
        <motion.div className="hero2-secondary-row" variants={fade(0.68)} initial="hidden" animate="visible">
          <Link className="hero2-sec-btn" to="/events">
            <CalendarDays size={16} aria-hidden="true" />
            EXPLORE EVENTS
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link className="hero2-sec-btn" to="/location">
            <MapPin size={16} aria-hidden="true" />
            LOCATION
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </motion.div>

        {/* Countdown */}
        <motion.div className="hero2-countdown-section" variants={fade(0.74)} initial="hidden" animate="visible">
          <div className="hero2-countdown-label">
            <span className="hero2-label-line" />
            THE COUNTDOWN BEGINS
            <span className="hero2-label-line" />
          </div>
          <Countdown />
        </motion.div>

        {/* Why NEXTRON cards */}
        <motion.div className="hero2-why-section" variants={fade(0.82)} initial="hidden" animate="visible">
          <div className="hero2-countdown-label">
            <span className="hero2-label-line" />
            WHY NEXTRON?
            <span className="hero2-label-line" />
          </div>
          <div className="hero2-why-grid">
            {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
              <div className="hero2-why-card" key={title}>
                <div className="hero2-why-icon">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <strong className="hero2-why-title">{title}</strong>
                <p className="hero2-why-desc">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
