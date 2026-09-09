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
        Reach out to the student coordinators for any queries about events, registration, or participation.
      </SectionHeading>

      <div className="contact-grid">

        {/* Email */}
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
          <p>{siteConfig.contact.email}</p>
          <a href={`mailto:${siteConfig.contact.email}`} className="contact-link">
            Send Email <ExternalLink size={14} aria-hidden="true" />
          </a>
        </motion.article>

        {/* Phone */}
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
          <p>
            <strong>A. Priyaranjan</strong><br />
            <a href="tel:+919789791974" className="contact-link">+91 97897 91974</a>
          </p>
          <p style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--muted)" }}>
            If Priyaranjan can't be reached:<br />
            <strong>Vignesh J.V</strong> —{" "}
            <a href="tel:+918667489800" className="contact-link">+91 86674 89800</a><br />
            <strong>S. Pradeep</strong> —{" "}
            <a href="tel:+916385513884" className="contact-link">+91 63855 13884</a>
          </p>
        </motion.article>

        {/* Social */}
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
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        <MessageCircle size={26} aria-hidden="true" />
        <div>
          <h2>Student Coordinators</h2>
          <p>
            <strong>Priyaranjan  A</strong> — <a href="tel:+919789791974" style={{ color: "var(--cyan)" }}>+91 97897 91974</a>
            
            <br/>
          </p>
          <p style={{ marginTop: "10px" }}>
            <strong>Vignesh J.V</strong> — <a href="tel:+918667489800" style={{ color: "var(--cyan)" }}>+91 86674 89800</a>
            <br />
           
          </p>
<p style={{ marginTop: "10px" }}>
            <strong>Venkateswarn  J</strong> — <a href="tel:+916385513884" style={{ color: "var(--cyan)" }}>+91 63741 56056</a>
            <br />
            
          </p>

          <p style={{ marginTop: "10px" }}>
            <strong>Pradeep S</strong> — <a href="tel:+916385513884" style={{ color: "var(--cyan)" }}>+91 63855 13884</a>
            <br />
            
          </p>
        </div>
      </motion.section>

      <RegistrationCTA compact />
    </div>
  );
}
