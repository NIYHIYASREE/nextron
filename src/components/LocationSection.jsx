import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "../config/siteConfig.js";

export default function LocationSection() {
  return (
    <section className="location-section">

      {/* ── Real Google Maps embed ── */}
      <motion.div
        className="map-panel map-panel--real"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <iframe
          title="University College of Engineering Tindivanam — Google Maps"
          src="https://maps.google.com/maps?q=12.2625577,79.6568653&z=17&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </motion.div>

      {/* ── Address copy ── */}
      <motion.div
        className="location-copy"
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="eyebrow">Venue</span>
        <h2>{siteConfig.venue}</h2>
        <p className="location-address">
          Melpakkam Village<br />
          Villupuram District<br />
          Tamil Nadu – 604 001
        </p>
        <p className="location-sub">{siteConfig.universityLine}</p>
        <motion.a
          className="btn btn-primary btn-glow"
          href={siteConfig.mapsUrl}
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Navigation size={16} aria-hidden="true" />
          Open in Google Maps
          <ExternalLink size={14} aria-hidden="true" />
        </motion.a>
      </motion.div>
    </section>
  );
}
