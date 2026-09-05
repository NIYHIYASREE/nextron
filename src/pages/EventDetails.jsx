import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import RegistrationCTA from "../components/RegistrationCTA.jsx";
import ScrollReveal from "../components/ScrollReveal.jsx";
import { getEventById } from "../data/events.js";
import { siteConfig } from "../config/siteConfig.js";
import { openRegistrationForm } from "../utils/registration.js";

const EASE = [0.22, 1, 0.36, 1];

export default function EventDetails() {
  const { slug } = useParams();
  const event = getEventById(slug);

  if (!event) {
    return (
      <div className="page-shell">
        <ScrollReveal scale>
          <section className="not-found-panel">
            <h1>Event not found</h1>
            <p>The event you requested is not available in the NEXTRON event list.</p>
            <Link className="btn btn-primary" to="/events">
              View Events
            </Link>
          </section>
        </ScrollReveal>
      </div>
    );
  }

  const Icon = Icons[event.icon] || Icons.Sparkles;

  return (
    <div className="page-shell">
      <article className="event-detail">

        {/* ── Hero ── */}
        <motion.div
          className="event-detail-hero"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <motion.span
            className={`badge ${event.category === "Technical" ? "badge-blue" : "badge-pink"}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15, ease: EASE }}
          >
            {event.category}
          </motion.span>

          <motion.div
            className="event-detail-icon"
            initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: EASE }}
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            <Icon size={36} aria-hidden="true" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: EASE }}
          >
            {event.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35, ease: EASE }}
          >
            {event.description}
          </motion.p>

          <motion.button
            className="btn btn-primary"
            type="button"
            onClick={openRegistrationForm}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.44, ease: EASE }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Register Now
          </motion.button>
        </motion.div>

        {/* ── Detail grid ── */}
        <div className="detail-grid">

          {/* Rules */}
          <ScrollReveal as="section" direction="left" delay={0.05}>
            <h2>Rules</h2>
            <ul className="rule-list">
              {event.rules.map((rule, i) => (
                <motion.li
                  key={rule}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.06, ease: EASE }}
                >
                  {rule}
                </motion.li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Aside */}
          <ScrollReveal as="aside" className="detail-side" direction="right" delay={0.1}>
            <motion.div
              className="fee-note"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
            >
              <strong>Symposium Registration</strong>
              <p>Rs. {siteConfig.registrationFee} online · Rs. {siteConfig.registrationFeeOnspot} on-spot.</p>
              {event.note && <p className="event-special-note">{event.note}</p>}
            </motion.div>
          </ScrollReveal>

        </div>
      </article>

      <RegistrationCTA compact />
    </div>
  );
}
