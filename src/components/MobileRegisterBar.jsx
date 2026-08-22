import { ExternalLink } from "lucide-react";
import { openRegistrationForm } from "../utils/registration.js";

export default function MobileRegisterBar() {
  return (
    <div className="mobile-register-bar">
      <button type="button" onClick={openRegistrationForm}>
        Register Now <ExternalLink size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
