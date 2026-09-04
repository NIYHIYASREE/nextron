import { Award, Building2, CalendarDays, GraduationCap, MapPin, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import RegistrationCTA from "../components/RegistrationCTA.jsx";
import { siteConfig } from "../config/siteConfig.js";
import { symposiumHighlights } from "../data/symposium.js";

const stats = [
  { icon: CalendarDays, label: "Event Date", value: "16 Sep 2026" },
  { icon: Users, label: "Events", value: "5+" },
  { icon: Award, label: "Fee", value: "₹200 Online / ₹250 Onspot" },
  { icon: MapPin, label: "Location", value: "Tindivanam" },
];

export default function About() {
  return (
    <div className="page-shell">
      <SectionHeading eyebrow="About" title="NEXTRON'26" align="center">
        A national-level technical symposium bringing together the brightest minds in engineering,
        technology, and innovation.
      </SectionHeading>

      {/* Stat strip */}
      <div className="about-stats">
        {stats.map(({ icon: Icon, label, value }) => (
          <motion.div
            key={label}
            className="about-stat"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Icon size={22} aria-hidden="true" />
            <strong>{value}</strong>
            <span>{label}</span>
          </motion.div>
        ))}
      </div>

      {/* Main feature */}
      <section className="about-feature">
        <div className="about-device" aria-hidden="true">
          <Sparkles size={48} />
          <span className="about-device-date">16 · 09 · 2026</span>
        </div>
        <div className="about-body">
          <span className="eyebrow">The Symposium</span>
          <h2>Join us on September 16, 2026</h2>
          <p>
            {siteConfig.eventName} is organized by the Department of Electronics and Communication Engineering,
            University College of Engineering Tindivanam — a constituent college of Anna University Chennai.
          </p>
          <p>
            Designed as a full-day competition and celebration, the event covers technical events built around
            engineering depth and non-technical events focused on entertainment and talent.
          </p>
          <div className="highlight-grid compact">
            {symposiumHighlights.map((item) => (
              <div className="highlight-tile" key={item}>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institution cards */}
      <div className="about-institution-grid">
        <motion.article
          className="institution-card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <Building2 size={26} aria-hidden="true" />
          <h3>University College of Engineering Tindivanam</h3>
          <p>A constituent college of Anna University Chennai, located at Melpakkam Village, Villupuram District, Tamil Nadu – 604 001.</p>
        </motion.article>
        <motion.article
          className="institution-card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <GraduationCap size={26} aria-hidden="true" />
          <h3>Department of ECE</h3>
          <p>The Department of Electronics and Communication Engineering organizes NEXTRON'26 to foster technical excellence, research, and student leadership.</p>
        </motion.article>
      </div>

      <RegistrationCTA compact />
    </div>
  );
}
