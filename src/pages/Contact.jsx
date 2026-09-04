import { ExternalLink, Instagram, Linkedin, Mail, MessageCircle, Phone, Share2, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import RegistrationCTA from "../components/RegistrationCTA.jsx";
import { siteConfig } from "../config/siteConfig.js";

const socialMeta = {
  instagram: { icon: Instagram, label: "Instagram" },
  linkedin:  { icon: Linkedin,  label: "LinkedIn"  },
  youtube:   { icon: Youtube,   label: "YouTube"   },
};

export default function Contact() {
  const socialEntries = Object.entries(siteConfig.social).filter(([, url]) => url);

  return (
    <div className="page-shell">
      <SectionHeading eyebrow="Contact" title="Get in touch" align="center">
        Contact details and social links will be updated by the organizers. All information here is
        pulled from the central site configuration.
      </SectionHeading>

      <div className="contact-grid">
        <motion.article
          className="contact-card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="contact-card-icon">
            <Mail size={22} aria-hidden="true" />
          </div>
          <h2>Email</h2>
          <p>
            {siteConfig.contact.email.includes("example")
              ? "Official email will be updated by the organizers."
              : siteConfig.contact.email}
          </p>
          {!siteConfig.contact.email.includes("example") && (
            <a href={`mailto:${siteConfig.contact.email}`} className="contact-link">
              Send Email <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </motion.article>

        <motion.article
          className="contact-card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="contact-card-icon">
            <Phone size={22} aria-hidden="true" />
          </div>
          <h2>Phone</h2>
          <p>A. Priyaranjan: 9789791974</p>
          <p>S. Pradeep: 6385513884</p>
        </motion.article>

        <motion.article
          className="contact-card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <div className="contact-card-icon">
            <Share2 size={22} aria-hidden="true" />
          </div>
          <h2>Social Media</h2>
          {socialEntries.length > 0 ? (
            <div className="social-link-list">
              {socialEntries.map(([key, url]) => {
                const meta = socialMeta[key] || { icon: ExternalLink, label: key };
                const Icon = meta.icon;
                return (
                  <a key={key} href={url} target="_blank" rel="noreferrer" className="social-pill">
                    <Icon size={16} aria-hidden="true" />
                    {meta.label}
                  </a>
                );
              })}
            </div>
          ) : (
            <p>Official social links will be updated by the organizers.</p>
          )}
        </motion.article>
      </div>

      {/* Staff coordinator */}
      <motion.section
        className="contact-message-card"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <Mail size={26} aria-hidden="true" />
        <div>
          <h2>Staff Coordinator</h2>
          <p><strong>Dr. S. Suvitha</strong></p>
          <p>M.E., Ph.D., Assistant Professor</p>
          <p>University College of Engineering, Tindivanam</p>
        </div>
      </motion.section>

      {/* Student coordinators */}
      <motion.section
        className="contact-message-card"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <MessageCircle size={26} aria-hidden="true" />
        <div>
          <h2>Student Coordinators</h2>
          <p>A. Priyaranjan: 9789791974</p>
          <p>S. Pradeep: 6385513884</p>
          <p style={{ marginTop: "8px" }}>
            For queries about events, registration, or participation, reach out to the student coordinators
            or contact the event coordinator for the relevant event.
          </p>
        </div>
      </motion.section>

      <RegistrationCTA compact />
    </div>
  );
}
