import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import CommitteeCard from "../components/CommitteeCard.jsx";
import { committees } from "../data/committees.js";

/* Group committees by category */
const grouped = committees.reduce((acc, c) => {
  const group = c.category || "Core Committee";
  if (!acc[group]) acc[group] = [];
  acc[group].push(c);
  return acc;
}, {});

// Desired group order
const GROUP_ORDER = [
  "Core Committee",
  "Technical Events Committee",
  "Non-Technical Events Committee",
];

const sortedGroups = [
  ...GROUP_ORDER.filter((g) => grouped[g]),
  ...Object.keys(grouped).filter((g) => !GROUP_ORDER.includes(g)),
];

export default function Committee() {
  return (
    <div className="page-shell">
      <SectionHeading eyebrow="Committee" title="Organizing committee" align="center">
        Student teams powering every aspect of NEXTRON'26 — from events and hospitality to social media and design.
      </SectionHeading>

      {sortedGroups.map((group, gi) => (
        <section className="committee-group" key={group}>
          <motion.h2
            className="committee-group-title"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: gi * 0.05 }}
          >
            {group}
          </motion.h2>
          <div className="committee-grid">
            {grouped[group].map((committee, ci) => (
              <motion.div
                key={`${committee.category || "core"}-${committee.title}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.38, delay: ci * 0.05 }}
              >
                <CommitteeCard committee={committee} />
              </motion.div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
