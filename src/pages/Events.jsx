import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import EventCard from "../components/EventCard.jsx";
import RegistrationCTA from "../components/RegistrationCTA.jsx";
import { eventCategories, events } from "../data/events.js";

const ALL = "All";
const filters = [ALL, ...eventCategories];

export default function Events() {
  const [active, setActive] = useState(ALL);

  const filtered = active === ALL ? events : events.filter((e) => e.category === active);

  return (
    <div className="page-shell">
      <SectionHeading eyebrow="Events" title="Choose your NEXTRON challenge" align="center">
        Register once through the symposium form, then select your events according to the event rules.
      </SectionHeading>

      {/* Category filter tabs */}
      <div className="filter-tabs" role="tablist" aria-label="Event category filter">
        {filters.map((filter) => (
          <button
            key={filter}
            role="tab"
            aria-selected={active === filter}
            className={`filter-tab${active === filter ? " filter-tab--active" : ""}`}
            type="button"
            onClick={() => setActive(filter)}
          >
            {filter}
            <span className="filter-tab-count">
              {filter === ALL ? events.length : events.filter((e) => e.category === filter).length}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="event-grid"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {filtered.map((event, index) => (
            <EventCard event={event} index={index} key={event.id} />
          ))}
        </motion.div>
      </AnimatePresence>

      <RegistrationCTA compact />
    </div>
  );
}
