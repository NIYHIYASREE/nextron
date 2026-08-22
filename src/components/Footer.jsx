import { Instagram, Linkedin, Link as LinkIcon, Youtube } from "lucide-react";
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
  ["Committee", "/committee"],
  ["Location", "/location"],
  ["Contact", "/contact"],
  ["Register", "/register"],
];

const socialIcons = { instagram: Instagram, linkedin: Linkedin, youtube: Youtube };

export default function Footer() {
  const socialEntries = Object.entries(siteConfig.social).filter(([, url]) => url);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
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
              {socialEntries.map(([key, url]) => {
                const Icon = socialIcons[key] || LinkIcon;
                return (
                  <a key={key} href={url} target="_blank" rel="noreferrer" aria-label={key}>
                    <Icon size={18} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          <p className="footer-nav-label">Quick Links</p>
          <div className="footer-links">
            {quickLinks.map(([label, to]) => (
              <Link key={to} to={to}>{label}</Link>
            ))}
          </div>
        </nav>

        <div className="footer-register">
          <p className="footer-nav-label">Registration</p>
          <p>₹{siteConfig.registrationFee} symposium fee</p>
          <button type="button" className="btn btn-primary" onClick={openRegistrationForm}>
            Register Now
          </button>
        </div>
      </div>

      {/* College building image */}
      <div className="footer-clg-image-wrap">
        <img
          src={clgFrontImage}
          alt="University College of Engineering Tindivanam campus"
          className="footer-clg-image"
        />
        <div className="footer-clg-overlay">
          <span>{siteConfig.venue}</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{siteConfig.eventName} &nbsp;·&nbsp; {siteConfig.universityLine} &nbsp;·&nbsp; {siteConfig.eventDate}</p>
      </div>
    </footer>
  );
}
