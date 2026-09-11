import { motion } from "framer-motion";
import { X, Zap } from "lucide-react";
import { useState } from "react";

export default function SpecialOfferBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      className="special-offer-banner"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="offer-container">
        <div className="offer-content">
          <motion.div
            className="offer-icon"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap size={20} aria-hidden="true" />
          </motion.div>
          <div className="offer-text">
            <h3>⚡ 2-Day Special Offer ⚡</h3>
            <p>Register Now at Just <strong>₹150/Person</strong>!</p>
            <span className="offer-note">Offer valid for 2 days only</span>
          </div>
        </div>
        <motion.button
          className="offer-close"
          onClick={() => setIsVisible(false)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Close offer banner"
        >
          <X size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}
