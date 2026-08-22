import { ArrowRight, CalendarDays, MapPin, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { siteConfig } from "../config/siteConfig.js";
import { openRegistrationForm } from "../utils/registration.js";
import Countdown from "./Countdown.jsx";

const CIRCUIT_PATHS = [
  "M 0 120 L 80 120 L 80 60 L 200 60",
  "M 300 0 L 300 80 L 380 80 L 380 160 L 500 160",
  "M 600 200 L 680 200 L 680 120 L 760 120",
  "M 100 300 L 100 240 L 220 240 L 220 180",
  "M 480 300 L 560 300 L 560 220 L 640 220 L 640 160",
  "M 20 400 L 120 400 L 120 340 L 280 340",
  "M 700 80 L 780 80 L 780 180 L 860 180 L 860 260",
];

const NODE_POSITIONS = [
  [80, 120], [80, 60], [300, 80], [380, 80], [380, 160],
  [680, 200], [680, 120], [100, 240], [220, 240], [220, 180],
  [560, 300], [560, 220], [640, 220], [780, 80], [780, 180],
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const metaVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
};
const metaItem = {
  hidden:  { opacity: 0, scale: 0.88, y: 10 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.4, ease: [0.22,1,0.36,1] } },
};

const actionVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } },
};
const actionItem = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22,1,0.36,1] } },
};

export default function Hero() {
  return (
    <section className="hero" id="home">
      {/* ── Background layer ── */}
      <div className="hero-visual" aria-hidden="true">
        <svg className="circuit-svg" viewBox="0 0 900 480" preserveAspectRatio="xMidYMid slice">
          {CIRCUIT_PATHS.map((d, i) => (
            <path key={i} d={d} className="circuit-path" style={{ animationDelay: `${i * 0.6}s` }} />
          ))}
          {NODE_POSITIONS.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="4" className="circuit-node" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </svg>
        <div className="circuit-grid" />
        <div className="energy-orbit orbit-one" />
        <div className="energy-orbit orbit-two" />
        <div className="energy-orbit orbit-three" />
        <div className="particle-field">
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} style={{ "--i": i }} />
          ))}
        </div>
        <div className="hero-blob hero-blob--cyan" />
        <div className="hero-blob hero-blob--magenta" />
      </div>

      {/* ── Content ── */}
      <div className="hero-content">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          {/* Chip */}
          <motion.span className="hero-chip" variants={itemVariants}>
            <Sparkles size={13} aria-hidden="true" />
            National Level Technical Symposium
          </motion.span>

          {/* Main title — largest text on mobile, must be fully visible */}
          <motion.h1
            className="hero-title"
            variants={itemVariants}
            aria-label={siteConfig.eventName}
          >
            {siteConfig.eventName}
          </motion.h1>

          {/* Subtitle */}
          <motion.p className="hero-subtitle" variants={itemVariants}>
            A NATIONAL LEVEL TECHNICAL SYMPOSIUM
          </motion.p>

          {/* Department */}
          <motion.p className="hero-dept" variants={itemVariants}>
            {siteConfig.department}
          </motion.p>

          {/* Venue */}
          <motion.p className="hero-copy" variants={itemVariants}>
            {siteConfig.venue} &nbsp;·&nbsp; {siteConfig.universityLine}
          </motion.p>
        </motion.div>

        {/* Meta badges — staggered pop-in */}
        <motion.div
          className="hero-meta"
          variants={metaVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: CalendarDays, label: siteConfig.eventDate },
            { icon: MapPin,       label: siteConfig.shortLocation },
            { icon: Zap,          label: `₹${siteConfig.registrationFee} Registration` },
          ].map(({ icon: Icon, label }) => (
            <motion.span key={label} variants={metaItem}>
              <Icon size={15} aria-hidden="true" /> {label}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="hero-actions"
          variants={actionVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            className="btn btn-primary btn-glow"
            type="button"
            onClick={openRegistrationForm}
            variants={actionItem}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Register Now <ArrowRight size={17} aria-hidden="true" />
          </motion.button>
          <motion.div variants={actionItem}>
            <Link className="btn btn-secondary" to="/events">
              Explore Events
            </Link>
          </motion.div>
          <motion.div variants={actionItem}>
            <Link className="btn btn-ghost" to="/location">
              Location
            </Link>
          </motion.div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Countdown />
        </motion.div>
      </div>
    </section>
  );
}
