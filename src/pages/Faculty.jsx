import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import FacultyCard from "../components/FacultyCard.jsx";
import { facultyGroups } from "../data/faculty.js";

export default function Faculty() {
  return (
    <div className="page-shell">
      <SectionHeading eyebrow="Faculty" title="Department faculty and staff" align="center">
        The Department of Electronics and Communication Engineering, UCE Tindivanam.
        Faculty photographs can be added as local WebP assets.
      </SectionHeading>

      {facultyGroups.map((group, gi) => (
        <section className="faculty-group" key={group.title}>
          <motion.h2
            className="faculty-group-title"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: gi * 0.05 }}
          >
            {group.title}
          </motion.h2>
          <div className={`faculty-grid${group.people.length <= 2 ? " faculty-grid--lead" : ""}`}>
            {group.people.map((person, pi) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.38, delay: pi * 0.06 }}
              >
                <FacultyCard person={person} />
              </motion.div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
