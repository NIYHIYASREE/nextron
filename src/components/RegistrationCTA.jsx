import { ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { siteConfig } from "../config/siteConfig.js";
import { openRegistrationForm } from "../utils/registration.js";

export default function RegistrationCTA({ compact = false }) {
  return (
    <motion.section
      className={`registration-cta ${compact ? "registration-cta--compact" : ""}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <span className="eyebrow">Registration Open</span>
        <h2>Register for {siteConfig.eventName}</h2>
        <p>
          ₹{siteConfig.registrationFee} symposium registration. Complete your details and event
          selections through the official Google Form.
        </p>
      </div>
      <div className="cta-actions">
        <motion.button
          className="btn btn-primary btn-glow"
          type="button"
          onClick={openRegistrationForm}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          Register Now <ExternalLink size={17} aria-hidden="true" />
        </motion.button>
        <Link className="btn btn-ghost" to="/events">
          View Events <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </motion.section>
  );
}
