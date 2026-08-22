import { siteConfig } from "../config/siteConfig.js";

export const openRegistrationForm = () => {
  window.open(siteConfig.registrationFormUrl, "_blank", "noopener,noreferrer");
};
