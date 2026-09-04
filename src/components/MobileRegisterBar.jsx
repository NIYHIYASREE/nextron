import { ArrowRight } from "lucide-react";
import { openRegistrationForm } from "../utils/registration.js";

export default function MobileRegisterBar() {
  return (
    <div className="mobile-bar">
      <div className="mobile-bar-text">
        <span className="mobile-bar-top">BE A PART OF THE FUTURE.</span>
        <span className="mobile-bar-bottom">
          BE A PART OF <span className="mobile-bar-highlight">NEXTRON'26</span>
        </span>
      </div>
      <button
        type="button"
        className="mobile-bar-btn"
        onClick={openRegistrationForm}
        aria-label="Register for NEXTRON'26"
      >
        REGISTER NOW
        <ArrowRight size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
