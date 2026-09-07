import { Instagram, Linkedin, Link as LinkIcon, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { siteConfig } from "../config/siteConfig.js";
import { openRegistrationForm } from "../utils/registration.js";

const clgFrontImage = "/clg_front_image.png";
const logoImg = "/logo.png";

const quickLinks = [
  ["Home", "/"],
  ["About", "/about"],
  ["Events", "/events"],
  ["Faculty", "/faculty"],
  ["Location", "/location"],
  ["Contact", "/contact"],
  ["Register", "/register"],
];

const socialIcons = { instagram: Instagram, linkedin: Linkedin, youtube: Youtube };

const EASE = [0.22, 1, 0.36, 1];

export default function Footer() {
  const socialEntries = Object.entries(siteConfig.social).filter(([, url]) => url);

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand column */}
        <motion.div
          className="footer-brand"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <div className="footer-logo">
            <span className="brand-mark brand-mark--logo">
              <img src={logoImg} alt={`${siteConfig.eventName} logo`} className="brand-logo-img" />
            </span>
            <div>
              <strong>{siteConfig.eventName}</strong>
              <small>{siteConfig.department}</small>
            </div>
          </div>
          <p>{siteConfig.venue}</p>
          <p>{siteConfig.address}</p>
          <p className="footer-date">{siteConfig.eventDate}</p>
          {socialEntries.length > 0 && (
            <div className="footer-social">
              {socialEntries.map(([key, url], i) => {
                const Icon = socialIcons[key] || LinkIcon;
                return (
                  <motion.a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={key}
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.07, ease: EASE }}
                    whileHover={{ scale: 1.18, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </motion.a>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick links */}
        <motion.nav
          className="footer-nav"
          aria-label="Footer navigation"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
        >
          <p className="footer-nav-label">Quick Links</p>
          <div className="footer-links">
            {quickLinks.map(([label, to], i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}
              >
                <Link to={to}>{label}</Link>
              </motion.div>
            ))}
          </div>
        </motion.nav>

        {/* Registration column */}
        <motion.div
          className="footer-register"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
        >
          <p className="footer-nav-label">Registration</p>
          <p>₹{siteConfig.registrationFee} symposium fee</p>
          <motion.button
            type="button"
            className="btn btn-primary"
            onClick={openRegistrationForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Register Now
          </motion.button>
        </motion.div>

      </div>

      {/* College building image */}
      <motion.div
        className="footer-clg-image-wrap"
        initial={{ opacity: 0, scale: 1.04 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <img
          src={clgFrontImage}
          alt="University College of Engineering Tindivanam campus"
          className="footer-clg-image"
        />
        <div className="footer-clg-overlay">
          <span>{siteConfig.venue}</span>
        </div>
      </motion.div>

      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <p>{siteConfig.eventName} &nbsp;·&nbsp; {siteConfig.universityLine} &nbsp;·&nbsp; {siteConfig.eventDate}</p>
        <p className="footer-designed-by">Website designed by <strong>Nithiyasree</strong> — ECE</p>
      </motion.div>
    </footer>
  );
}
