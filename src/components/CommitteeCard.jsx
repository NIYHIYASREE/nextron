import { UsersRound } from "lucide-react";
import { motion } from "framer-motion";

export default function CommitteeCard({ committee }) {
  return (
    <motion.article
      className="committee-card"
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
    >
      <div className="committee-card-head">
        <UsersRound size={20} aria-hidden="true" />
        <div>
          {committee.category && <span>{committee.category}</span>}
          <h3>{committee.title}</h3>
        </div>
      </div>
      <div className="member-list">
        {committee.members.map((member, i) => (
          <motion.span
            key={member}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            {member}
          </motion.span>
        ))}
      </div>
    </motion.article>
  );
}
