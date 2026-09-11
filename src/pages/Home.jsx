import { Link } from "react-router-dom";
import { CircuitBoard, Cpu, RadioTower, Waves } from "lucide-react";
import { motion } from "framer-motion";
import Hero from "../components/Hero.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import EventCard from "../components/EventCard.jsx";
import FacultyCard from "../components/FacultyCard.jsx";
import LocationSection from "../components/LocationSection.jsx";
import RegistrationCTA from "../components/RegistrationCTA.jsx";
import ScrollReveal from "../components/ScrollReveal.jsx";
import SpecialOfferBanner from "../components/SpecialOfferBanner.jsx";
import { events } from "../data/events.js";
import { facultyGroups } from "../data/faculty.js";
import { symposiumHighlights } from "../data/symposium.js";
import { siteConfig } from "../config/siteConfig.js";

const EASE = [0.22, 1, 0.36, 1];

const SIGNAL_CARDS = [
  { icon: CircuitBoard, title: "ECE Identity",    desc: "Circuit-inspired visuals, digital motion, and competition-first event flow." },
  { icon: Cpu,          title: "Technical Core",  desc: "Paper, project, and quiz events built around engineering clarity and innovation." },
  { icon: Waves,        title: "Touch Ripple",    desc: "A global water-like pointer interaction tuned for mobile screens and reduced motion." },
  { icon: RadioTower,   title: "Static Ready",    desc: "No backend, accounts, or payment SDK. Registration opens through Google Forms." },
];

export default function Home() {
  const allFaculty = facultyGroups.flatMap((group) => group.people);

  return (
    <>
      <SpecialOfferBanner />
      <Hero />

      {/* ── About band ── */}
      <section className="section about-band" id="about">
        <SectionHeading eyebrow="About Nextron" title="The future of technology meets competition.">
          {siteConfig.eventName} brings technical challenges, creative events, and student energy into one focused
          symposium experience.
        </SectionHeading>
        <div className="highlight-grid">
          {symposiumHighlights.map((item, index) => (
            <motion.div
              className="highlight-tile"
              key={item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: index * 0.07, ease: EASE }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Signal cards ── */}
      <section className="section signal-section">
        {SIGNAL_CARDS.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            className="signal-card"
            key={title}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.48, delay: i * 0.09, ease: EASE }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <motion.span
              whileHover={{ rotate: 12, scale: 1.15 }}
              transition={{ type: "spring", stiffness: 280 }}
              style={{ display: "inline-block" }}
            >
              <Icon size={28} aria-hidden="true" />
            </motion.span>
            <h3>{title}</h3>
            <p>{desc}</p>
          </motion.div>
        ))}
      </section>

      {/* ── Events ── */}
      <section className="section" id="events">
        <SectionHeading eyebrow="Events" title="Technical and non-technical competitions">
          Explore the complete NEXTRON event lineup, then register through the official form.
        </SectionHeading>
        <div className="event-grid">
          {events.slice(0, 6).map((event, index) => (
            <EventCard event={event} index={index} key={event.id} />
          ))}
        </div>
        <ScrollReveal className="section-link-row" delay={0.1}>
          <Link className="btn btn-secondary" to="/events">
            View All Events
          </Link>
        </ScrollReveal>
      </section>

      {/* ── Faculty ── */}
      <section className="section" id="faculty">
        <SectionHeading eyebrow="Faculty" title="Guided by the department leadership">
          Meet the faculty of the Department of Electronics and Communication Engineering, UCE Tindivanam.
        </SectionHeading>
        <div className="faculty-grid faculty-grid--lead">
          {allFaculty.map((person) => (
            <FacultyCard person={person} key={person.name} />
          ))}
        </div>
      </section>

      {/* ── Location ── */}
      <section className="section" id="location">
        <LocationSection />
      </section>

      {/* ── CTA ── */}
      <section className="section">
        <RegistrationCTA />
      </section>
    </>
  );
}
