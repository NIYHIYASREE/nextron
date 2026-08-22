import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { openRegistrationForm } from "../utils/registration.js";

const cardVariants = {
  hidden:  { opacity: 0, y: 22 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: Math.min(i * 0.07, 0.28), ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function EventCard({ event, index = 0 }) {
  const Icon = Icons[event.icon] || Icons.Sparkles;

  return (
    <motion.article
      className="event-card"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <div className="event-card-top">
        <motion.span
          className="event-icon"
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon size={24} aria-hidden="true" />
        </motion.span>
        <span className={`badge ${event.category === "Technical" ? "badge-blue" : "badge-pink"}`}>
          {event.category}
        </span>
      </div>
      <h3>{event.name}</h3>
      <p>{event.shortDescription}</p>
      <div className="coordinator-list" aria-label={`${event.name} coordinators`}>
        {event.coordinators.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </div>
      <div className="card-actions">
        <Link className="text-link" to={`/events/${event.id}`}>
          View Details
        </Link>
        <motion.button
          type="button"
          onClick={openRegistrationForm}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
        >
          Register Now
        </motion.button>
      </div>
    </motion.article>
  );
}
