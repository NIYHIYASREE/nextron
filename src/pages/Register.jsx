import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Hash, Building2, GraduationCap, Phone,
  Utensils, CheckSquare, CreditCard, MapPin, ArrowRight,
  ArrowLeft, Loader2, AlertCircle,
} from "lucide-react";
import { events } from "../data/events.js";
import { siteConfig } from "../config/siteConfig.js";
import { generatePassId } from "../utils/passUtils.js";
import { saveParticipant } from "../utils/firestoreParticipant.js";

/* ── Constants ───────────────────────────────────────────────── */
const STEPS = ["Details", "Events", "Payment"];

const DEPARTMENTS = [
  "ECE", "CSE", "IT", "EEE", "MECH", "CIVIL", "AI & DS", "AIDS", "Other",
];

const YEARS = [
  { value: "1", label: "I Year" },
  { value: "2", label: "II Year" },
  { value: "3", label: "III Year" },
  { value: "4", label: "IV Year" },
];

const FOOD_OPTS = ["Veg", "Non-Veg"];

const slideVariants = {
  enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.25 } }),
};

/* ── Helper ──────────────────────────────────────────────────── */
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s  = document.createElement("script");
    s.src    = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/* ── Component ───────────────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();

  /* Step state */
  const [step, setStep]       = useState(0);
  const [direction, setDir]   = useState(1);

  /* Form fields */
  const [form, setForm] = useState({
    fullName:       "",
    email:          "",
    registerNumber: "",
    department:     "",
    year:           "",
    collegeName:    "",
    phoneNumber:    "",
    foodPreference: "",
    selectedEvents: [],
  });

  /* UI state */
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  /* ── Field update ─────────────────────────────────────────── */
  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const toggleEvent = (id) => {
    setForm((p) => ({
      ...p,
      selectedEvents: p.selectedEvents.includes(id)
        ? p.selectedEvents.filter((x) => x !== id)
        : [...p.selectedEvents, id],
    }));
    setErrors((e) => ({ ...e, selectedEvents: "" }));
  };

  /* ── Validation ───────────────────────────────────────────── */
  const validateStep0 = () => {
    const e = {};
    if (!form.fullName.trim())       e.fullName       = "Full name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                      e.email          = "Valid email is required";
    if (!form.registerNumber.trim()) e.registerNumber = "Register number is required";
    if (!form.department)            e.department     = "Select your department";
    if (!form.year)                  e.year           = "Select your year";
    if (!form.collegeName.trim())    e.collegeName    = "College name is required";
    if (!/^\d{10}$/.test(form.phoneNumber))
                                      e.phoneNumber    = "Enter a valid 10-digit phone number";
    if (!form.foodPreference)        e.foodPreference = "Select food preference";
    return e;
  };

  const validateStep1 = () => {
    const e = {};
    if (form.selectedEvents.length === 0)
      e.selectedEvents = "Select at least one event";
    return e;
  };

  /* ── Navigation ───────────────────────────────────────────── */
  const goNext = () => {
    let e = {};
    if (step === 0) e = validateStep0();
    if (step === 1) e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setDir(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDir(-1);
    setStep((s) => s - 1);
  };

  /* ── Submit helpers ───────────────────────────────────────── */
  const buildParticipant = (paymentMethod, paymentStatus, transactionId = null) => ({
    passId:         generatePassId(),
    fullName:       form.fullName.trim().toUpperCase(),
    email:          form.email.trim().toLowerCase(),
    registerNumber: form.registerNumber.trim().toUpperCase(),
    department:     form.department,
    year:           form.year,
    collegeName:    form.collegeName.trim().toUpperCase(),
    phoneNumber:    form.phoneNumber.trim(),
    foodPreference: form.foodPreference,
    selectedEvents: form.selectedEvents,
    registrationFee: paymentMethod === "ONLINE"
      ? siteConfig.registrationFee
      : siteConfig.registrationFeeOnspot,
    payment: {
      method:        paymentMethod,
      status:        paymentStatus,
      transactionId: transactionId,
    },
    pass: {
      status:      "ACTIVE",
      sentToEmail: false,
    },
    checkIn: {
      status:      "NOT_CHECKED_IN",
      checkedInAt: null,
    },
  });

  /* ── Online payment via Razorpay ──────────────────────────── */
  const handleOnlinePayment = async () => {
    setApiError("");
    setLoading(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      setApiError("Payment gateway failed to load. Check your internet and try again.");
      setLoading(false);
      return;
    }

    const options = {
      key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount:      siteConfig.registrationFee * 100, // paise
      currency:    "INR",
      name:        "NEXTRON'26",
      description: "National Level Technical Symposium — Registration Fee",
      image:       "/clg_logo.png",
      prefill: {
        name:    form.fullName.trim(),
        email:   form.email.trim(),
        contact: form.phoneNumber.trim(),
      },
      theme: { color: "#67e8f9" },
      handler: async (response) => {
        // Payment success — save to Firestore and navigate to pass
        const participant = buildParticipant("ONLINE", "PAID", response.razorpay_payment_id);
        try {
          await saveParticipant(participant);
          navigate("/pass", { state: { participant }, replace: true });
        } catch (err) {
          setApiError("Payment succeeded but registration save failed. Note your payment ID: " + response.razorpay_payment_id + " and contact us.");
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (resp) => {
      setApiError("Payment failed: " + (resp.error?.description || "Unknown error"));
      setLoading(false);
    });
    rzp.open();
    setLoading(false);
  };

  /* ── On-spot payment ──────────────────────────────────────── */
  const handleOnSpot = async () => {
    setApiError("");
    setLoading(true);
    try {
      const participant = buildParticipant("ON_SPOT", "PENDING");
      await saveParticipant(participant);
      navigate("/pass", { state: { participant }, replace: true });
    } catch (err) {
      setApiError("Registration failed. Please try again or contact us.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="reg-page">
      {/* Header */}
      <div className="reg-header">
        <h1 className="reg-title">Register for {siteConfig.eventName}</h1>
        <p className="reg-subtitle">
          {siteConfig.eventDate} &nbsp;·&nbsp; {siteConfig.shortLocation}
        </p>

        {/* Step indicators */}
        <div className="reg-steps" aria-label="Registration steps">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`reg-step ${i === step ? "reg-step--active" : ""} ${i < step ? "reg-step--done" : ""}`}
            >
              <div className="reg-step-dot">{i < step ? "✓" : i + 1}</div>
              <span className="reg-step-label">{label}</span>
              {i < STEPS.length - 1 && <div className="reg-step-line" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="reg-body">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── Step 0: Personal Details ── */}
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="reg-card"
            >
              <h2 className="reg-card-title">Personal Details</h2>
              <div className="reg-form-grid">

                <Field label="Full Name" icon={User} error={errors.fullName}>
                  <input
                    type="text"
                    placeholder="e.g. Vinoth Kumar"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    className={errors.fullName ? "input-error" : ""}
                  />
                </Field>

                <Field label="Email Address" icon={Mail} error={errors.email}>
                  <input
                    type="email"
                    placeholder="vinoth@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={errors.email ? "input-error" : ""}
                  />
                </Field>

                <Field label="Register Number" icon={Hash} error={errors.registerNumber}>
                  <input
                    type="text"
                    placeholder="e.g. 311621104001"
                    value={form.registerNumber}
                    onChange={(e) => set("registerNumber", e.target.value)}
                    className={errors.registerNumber ? "input-error" : ""}
                  />
                </Field>

                <Field label="Department" icon={Building2} error={errors.department}>
                  <select
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                    className={errors.department ? "input-error" : ""}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Year" icon={GraduationCap} error={errors.year}>
                  <select
                    value={form.year}
                    onChange={(e) => set("year", e.target.value)}
                    className={errors.year ? "input-error" : ""}
                  >
                    <option value="">Select year</option>
                    {YEARS.map((y) => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="College Name" icon={Building2} error={errors.collegeName} wide>
                  <input
                    type="text"
                    placeholder="e.g. University College of Engineering Tindivanam"
                    value={form.collegeName}
                    onChange={(e) => set("collegeName", e.target.value)}
                    className={errors.collegeName ? "input-error" : ""}
                  />
                </Field>

                <Field label="Phone Number" icon={Phone} error={errors.phoneNumber}>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={form.phoneNumber}
                    onChange={(e) => set("phoneNumber", e.target.value.replace(/\D/g, ""))}
                    className={errors.phoneNumber ? "input-error" : ""}
                  />
                </Field>

                <Field label="Food Preference" icon={Utensils} error={errors.foodPreference}>
                  <div className="radio-group">
                    {FOOD_OPTS.map((opt) => (
                      <label key={opt} className={`radio-label ${form.foodPreference === opt ? "radio-label--active" : ""}`}>
                        <input
                          type="radio"
                          name="food"
                          value={opt}
                          checked={form.foodPreference === opt}
                          onChange={() => set("foodPreference", opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </Field>

              </div>

              <div className="reg-nav">
                <span />
                <button className="btn btn-primary" type="button" onClick={goNext}>
                  Next: Select Events <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Select Events ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="reg-card"
            >
              <h2 className="reg-card-title">Select Events</h2>
              <p className="reg-card-sub">Choose one or more events. Your single registration covers all selected events.</p>

              {errors.selectedEvents && (
                <div className="reg-field-error reg-field-error--banner">
                  <AlertCircle size={16} /> {errors.selectedEvents}
                </div>
              )}

              {["Technical", "Non-Technical"].map((cat) => (
                <div key={cat} className="event-select-group">
                  <h3 className={`event-select-cat ${cat === "Technical" ? "cat-tech" : "cat-ntech"}`}>
                    {cat}
                  </h3>
                  <div className="event-select-grid">
                    {events.filter((e) => e.category === cat).map((evt) => (
                      <label
                        key={evt.id}
                        className={`event-select-card ${form.selectedEvents.includes(evt.id) ? "event-select-card--on" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={form.selectedEvents.includes(evt.id)}
                          onChange={() => toggleEvent(evt.id)}
                        />
                        <span className="event-select-name">{evt.name}</span>
                        {evt.note && (
                          <span className="event-select-note">+₹100 team fee on-spot</span>
                        )}
                        <div className={`event-select-check ${form.selectedEvents.includes(evt.id) ? "event-select-check--on" : ""}`}>
                          <CheckSquare size={18} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="reg-nav">
                <button className="btn btn-secondary" type="button" onClick={goBack}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button className="btn btn-primary" type="button" onClick={goNext}>
                  Next: Payment <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="reg-card"
            >
              <h2 className="reg-card-title">Payment</h2>
              <p className="reg-card-sub">Choose how you want to pay your registration fee.</p>

              {/* Summary */}
              <div className="payment-summary">
                <div className="payment-summary-row">
                  <span>Registrant</span>
                  <strong>{form.fullName.trim().toUpperCase()}</strong>
                </div>
                <div className="payment-summary-row">
                  <span>Events selected</span>
                  <strong>{form.selectedEvents.length}</strong>
                </div>
                <div className="payment-summary-row payment-summary-row--highlight">
                  <span>Online fee</span>
                  <strong className="fee-amount">₹{siteConfig.registrationFee}</strong>
                </div>
                <div className="payment-summary-row">
                  <span>On-spot fee</span>
                  <strong>₹{siteConfig.registrationFeeOnspot}</strong>
                </div>
              </div>

              {apiError && (
                <div className="reg-api-error">
                  <AlertCircle size={16} /> {apiError}
                </div>
              )}

              {/* Payment options */}
              <div className="payment-options">

                {/* Online */}
                <div className="payment-option payment-option--online">
                  <div className="payment-option-header">
                    <CreditCard size={22} />
                    <div>
                      <strong>Pay Online Now</strong>
                      <span>₹{siteConfig.registrationFee} — UPI / Card / Net Banking</span>
                    </div>
                    <span className="payment-option-badge payment-option-badge--green">RECOMMENDED</span>
                  </div>
                  <ul className="payment-option-list">
                    <li>Instant pass generation</li>
                    <li>₹50 cheaper than on-spot</li>
                    <li>Secured via Razorpay</li>
                  </ul>
                  <button
                    className="btn btn-primary btn-glow btn-block"
                    type="button"
                    onClick={handleOnlinePayment}
                    disabled={loading}
                  >
                    {loading ? <><Loader2 size={18} className="spin" /> Processing…</> : <>Pay ₹{siteConfig.registrationFee} Online <ArrowRight size={18} /></>}
                  </button>
                </div>

                {/* On-spot */}
                <div className="payment-option payment-option--onspot">
                  <div className="payment-option-header">
                    <MapPin size={22} />
                    <div>
                      <strong>Pay On-Spot</strong>
                      <span>₹{siteConfig.registrationFeeOnspot} — Pay at venue on event day</span>
                    </div>
                  </div>
                  <ul className="payment-option-list">
                    <li>Register now, pay on {siteConfig.eventDate}</li>
                    <li>Pass shows PAYMENT PENDING</li>
                    <li>Admin marks PAID at venue</li>
                  </ul>
                  <button
                    className="btn btn-secondary btn-block"
                    type="button"
                    onClick={handleOnSpot}
                    disabled={loading}
                  >
                    {loading ? <><Loader2 size={18} className="spin" /> Saving…</> : <>Register &amp; Pay On-Spot <ArrowRight size={18} /></>}
                  </button>
                </div>

              </div>

              <div className="reg-nav">
                <button className="btn btn-ghost" type="button" onClick={goBack} disabled={loading}>
                  <ArrowLeft size={18} /> Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Field wrapper component ─────────────────────────────────── */
function Field({ label, icon: Icon, error, wide, children }) {
  return (
    <div className={`reg-field${wide ? " reg-field--wide" : ""}`}>
      <label className="reg-label">
        <Icon size={15} aria-hidden="true" />
        {label}
      </label>
      {children}
      {error && (
        <span className="reg-field-error">
          <AlertCircle size={13} /> {error}
        </span>
      )}
    </div>
  );
}
