import { ArrowRight, CheckCircle2, ExternalLink, Info, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import { events } from "../data/events.js";
import { registrationSteps } from "../data/symposium.js";
import { siteConfig } from "../config/siteConfig.js";
import { openRegistrationForm } from "../utils/registration.js";

export default function Register() {
  const techEvents = events.filter((e) => e.category === "Technical");
  const nonTechEvents = events.filter((e) => e.category === "Non-Technical");

  return (
    <div className="page-shell">
      {/* Hero */}
      <motion.section
        className="register-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="eyebrow">Registration Open</span>
        <h1>Register for {siteConfig.eventName}</h1>
        <p className="fee-display">₹{siteConfig.registrationFee} Symposium Registration Fee</p>
        <p className="registration-close-note">
          🗓 Registration closes on <strong>{siteConfig.registrationCloseDate}</strong>
        </p>
        <p>
          Registration is handled entirely through the official Google Form. The website does not store
          student data, process payments, or require login.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-glow btn-large" type="button" onClick={openRegistrationForm}>
            Register Now <ExternalLink size={18} aria-hidden="true" />
          </button>
          <Link className="btn btn-secondary" to="/events">
            View Events <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </motion.section>

      {/* Steps + notes */}
      <div className="registration-layout">
        <div>
          <SectionHeading eyebrow="How to Register" title="Five simple steps" />
          <ol className="step-list">
            {registrationSteps.map((step, i) => (
              <motion.li
                key={step}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
              >
                <CheckCircle2 size={20} aria-hidden="true" />
                <span>{step}</span>
              </motion.li>
            ))}
          </ol>
        </div>
        <aside className="registration-note">
          <ShieldCheck size={28} aria-hidden="true" />
          <h2>Important Notes</h2>
          <ul className="note-list">
            <li>Do not share card details, CVV, UPI PIN, or banking credentials on this website.</li>
            <li>Payment instructions will be provided within the Google Form.</li>
            <li>
              <span className="note-highlight">Free Fire</span> has a separate <strong>₹100 team fee</strong> payable
              on-spot — this is distinct from the ₹{siteConfig.registrationFee} symposium registration fee.
            </li>
            <li>Multiple events can be selected in a single registration.</li>
          </ul>
        </aside>
      </div>

      {/* Available events */}
      <section className="register-events-section">
        <SectionHeading eyebrow="Available Events" title="What you can register for" />
        <div className="register-events-grid">
          <div>
            <h3 className="events-category-label events-category-label--tech">Technical Events</h3>
            <div className="mini-event-list">
              {techEvents.map((event) => (
                <Link to={`/events/${event.id}`} key={event.id}>
                  <span>{event.name}</span>
                  <small className="badge badge-blue">{event.category}</small>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="events-category-label events-category-label--ntech">Non-Technical Events</h3>
            <div className="mini-event-list">
              {nonTechEvents.map((event) => (
                <Link to={`/events/${event.id}`} key={event.id}>
                  <span>{event.name}</span>
                  <small className="badge badge-pink">{event.category}</small>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <motion.section
        className="register-final-cta"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Info size={22} aria-hidden="true" />
        <p>Ready to join NEXTRON'26? Click below to open the official registration form in a new tab.</p>
        <button className="btn btn-primary btn-glow" type="button" onClick={openRegistrationForm}>
          Open Registration Form <ExternalLink size={18} aria-hidden="true" />
        </button>
      </motion.section>
    </div>
  );
}
