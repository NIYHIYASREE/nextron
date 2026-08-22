import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "../config/siteConfig.js";

export default function LocationSection() {
  return (
    <section className="location-section">
      <motion.div
        className="map-panel"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="map-grid" />
        <div className="map-pin-wrap">
          <motion.div
            className="map-pin-ring"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <MapPin size={32} />
          </motion.div>
        </div>
        <span className="map-label">UCE Tindivanam</span>
      </motion.div>

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
