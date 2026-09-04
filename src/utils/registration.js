/**
 * registration.js
 * Navigation helper used by every "Register Now" button.
 * Now navigates to the internal pass-based registration page
 * instead of the old Google Form.
 */
export const openRegistrationForm = () => {
  window.location.href = "/register";
};
