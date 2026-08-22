import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { siteConfig } from "../config/siteConfig.js";
import { openRegistrationForm } from "../utils/registration.js";
import logoImg from "../assets/images/logo.png";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Events", to: "/events" },
  { label: "Faculty", to: "/faculty" },
  { label: "Committee", to: "/committee" },
  { label: "Location", to: "/location" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <nav className="navbar" aria-label="Primary navigation">
        <Link className="brand" to="/">
          <span className="brand-mark brand-mark--logo">
            <img src={logoImg} alt={`${siteConfig.eventName} logo`} className="brand-logo-img" />
          </span>
          <span>
            <strong>{siteConfig.eventName}</strong>
            <small>ECE · Tindivanam</small>
          </span>
        </Link>

        {/* Desktop nav — always visible via CSS; mobile nav — toggled via data-open */}
        <div className="nav-links" data-open={open} aria-hidden={!open ? undefined : undefined}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "active" : undefined)}>
              {item.label}
            </NavLink>
          ))}
          <button className="nav-register" type="button" onClick={openRegistrationForm}>
            Register
          </button>
        </div>

        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>
    </header>
  );
}
