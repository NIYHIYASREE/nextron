import { UserRound } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function FacultyCard({ person }) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.article
      className="faculty-card"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="avatar"
        aria-hidden={person.image && !imageError ? "true" : "false"}
        whileHover={{ scale: 1.06 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {person.image && !imageError ? (
          <img src={person.image} alt="" loading="lazy" onError={() => setImageError(true)} />
        ) : (
          <UserRound size={28} aria-hidden="true" />
        )}
      </motion.div>
      <div>
        <h3>{person.name}</h3>
        <p className="role">{person.role}</p>
        {person.designation && <p className="designation">{person.designation}</p>}
        {person.qualification && <p>{person.qualification}</p>}
        {person.specialization && <small>{person.specialization}</small>}
      </div>
    </motion.article>
  );
}
