import { Link } from "react-router-dom";
import { CircuitBoard, Cpu, RadioTower, Waves } from "lucide-react";
import Hero from "../components/Hero.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import EventCard from "../components/EventCard.jsx";
import FacultyCard from "../components/FacultyCard.jsx";
import CommitteeCard from "../components/CommitteeCard.jsx";
import LocationSection from "../components/LocationSection.jsx";
import RegistrationCTA from "../components/RegistrationCTA.jsx";
import { events } from "../data/events.js";
import { facultyGroups } from "../data/faculty.js";
import { committees } from "../data/committees.js";
import { symposiumHighlights } from "../data/symposium.js";
import { siteConfig } from "../config/siteConfig.js";

export default function Home() {
  const leadFaculty = facultyGroups.slice(0, 2).flatMap((group) => group.people);

  return (
    <>
      <Hero />

      <section className="section about-band" id="about">
        <SectionHeading eyebrow="About Nextron" title="The future of technology meets competition.">
          {siteConfig.eventName} brings technical challenges, creative events, and student energy into one focused
          symposium experience.
        </SectionHeading>
        <div className="highlight-grid">
          {symposiumHighlights.map((item, index) => (
            <div className="highlight-tile" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section signal-section">
        <div className="signal-card">
          <CircuitBoard size={28} aria-hidden="true" />
          <h3>ECE Identity</h3>
          <p>Circuit-inspired visuals, digital motion, and competition-first event flow.</p>
        </div>
        <div className="signal-card">
          <Cpu size={28} aria-hidden="true" />
          <h3>Technical Core</h3>
          <p>Paper, project, and quiz events built around engineering clarity and innovation.</p>
        </div>
        <div className="signal-card">
          <Waves size={28} aria-hidden="true" />
          <h3>Touch Ripple</h3>
          <p>A global water-like pointer interaction tuned for mobile screens and reduced motion.</p>
        </div>
        <div className="signal-card">
          <RadioTower size={28} aria-hidden="true" />
          <h3>Static Ready</h3>
          <p>No backend, accounts, or payment SDK. Registration opens through Google Forms.</p>
        </div>
      </section>

      <section className="section" id="events">
        <SectionHeading eyebrow="Events" title="Technical and non-technical competitions">
          Explore the complete NEXTRON event lineup, then register through the official form.
        </SectionHeading>
        <div className="event-grid">
          {events.slice(0, 6).map((event, index) => (
            <EventCard event={event} index={index} key={event.id} />
          ))}
        </div>
        <div className="section-link-row">
          <Link className="btn btn-secondary" to="/events">
            View All Events
          </Link>
        </div>
      </section>

      <section className="section" id="faculty">
        <SectionHeading eyebrow="Faculty" title="Guided by the department leadership">
          Faculty information uses local image support with professional placeholders when real photographs are not
          available.
        </SectionHeading>
        <div className="faculty-grid faculty-grid--lead">
          {leadFaculty.map((person) => (
            <FacultyCard person={person} key={person.name} />
          ))}
        </div>
      </section>

      <section className="section" id="committee">
        <SectionHeading eyebrow="Committee" title="Student teams powering NEXTRON'26" />
        <div className="committee-grid committee-grid--preview">
          {committees.slice(0, 6).map((committee) => (
            <CommitteeCard committee={committee} key={`${committee.category || "core"}-${committee.title}`} />
          ))}
        </div>
        <div className="section-link-row">
          <Link className="btn btn-secondary" to="/committee">
            View Committee
          </Link>
        </div>
      </section>

      <section className="section" id="location">
        <LocationSection />
      </section>

      <section className="section">
        <RegistrationCTA />
      </section>
    </>
  );
}
