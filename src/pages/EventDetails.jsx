import * as Icons from "lucide-react";
import { Link, useParams } from "react-router-dom";
import RegistrationCTA from "../components/RegistrationCTA.jsx";
import { getEventById } from "../data/events.js";
import { siteConfig } from "../config/siteConfig.js";
import { openRegistrationForm } from "../utils/registration.js";

export default function EventDetails() {
  const { slug } = useParams();
  const event = getEventById(slug);

  if (!event) {
    return (
      <div className="page-shell">
        <section className="not-found-panel">
          <h1>Event not found</h1>
          <p>The event you requested is not available in the NEXTRON event list.</p>
          <Link className="btn btn-primary" to="/events">
            View Events
          </Link>
        </section>
      </div>
    );
  }

  const Icon = Icons[event.icon] || Icons.Sparkles;

  return (
    <div className="page-shell">
      <article className="event-detail">
        <div className="event-detail-hero">
          <span className={`badge ${event.category === "Technical" ? "badge-blue" : "badge-pink"}`}>
            {event.category}
          </span>
          <div className="event-detail-icon">
            <Icon size={36} aria-hidden="true" />
          </div>
          <h1>{event.name}</h1>
          <p>{event.description}</p>
          <button className="btn btn-primary" type="button" onClick={openRegistrationForm}>
            Register Now
          </button>
        </div>

        <div className="detail-grid">
          <section>
            <h2>Rules</h2>
            <ul className="rule-list">
              {event.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
          <aside className="detail-side">
            <h2>Coordinators</h2>
            <div className="coordinator-list large">
              {event.coordinators.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
            <div className="fee-note">
              <strong>Symposium Registration</strong>
              <p>Rs. {siteConfig.registrationFee} through official registration instructions.</p>
              {event.note && <p className="event-special-note">{event.note}</p>}
            </div>
          </aside>
        </div>
      </article>
      <RegistrationCTA compact />
    </div>
  );
}
