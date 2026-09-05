/**
 * NEXTRON'2K26 — Firebase Cloud Functions
 * Sends a beautiful HTML pass confirmation email via Gmail
 * when a new participant registers (Firestore onCreate trigger).
 *
 * Gmail credentials stored in Firebase Functions config / Secret Manager.
 * Set before deploying:
 *   firebase functions:secrets:set GMAIL_USER
 *   firebase functions:secrets:set GMAIL_APP_PASSWORD
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret }      = require("firebase-functions/params");
const admin                 = require("firebase-admin");
const nodemailer            = require("nodemailer");

admin.initializeApp();

const GMAIL_USER         = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

/* ── Year label helper ──────────────────────────────────────── */
const YEAR_LABELS = {
  "1": "I Year",
  "2": "II Year",
  "3": "III Year",
  "4": "IV Year",
};

/* ── Payment label helper ───────────────────────────────────── */
function getPaymentLabel(payment) {
  if (payment.status === "PAID") {
    return payment.method === "ONLINE" ? "✅ PAID (Online)" : "✅ PAID (On-Spot)";
  }
  return "⏳ PAYMENT PENDING (Pay at venue)";
}

/* ── Build the HTML email ───────────────────────────────────── */
function buildEmailHtml(data) {
  const {
    passId, fullName, collegeName, registerNumber,
    department, year, selectedEvents, payment, foodPreference,
  } = data;

  const yearLabel    = YEAR_LABELS[year] || year;
  const isPaid       = payment.status === "PAID";
  const paymentLabel = getPaymentLabel(payment);
  const eventsHtml   = (selectedEvents || [])
    .map((id) => {
      const name = id
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return `<span style="display:inline-block;background:rgba(103,232,249,0.12);border:1px solid rgba(103,232,249,0.35);color:#67e8f9;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;margin:3px 4px 3px 0;letter-spacing:0.5px;">${name}</span>`;
    })
    .join("");

  const pendingBlock = !isPaid
    ? `<div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.3);border-radius:10px;padding:16px 20px;margin:20px 0;font-size:13px;color:#f8fbff;line-height:1.8;">
        <strong style="color:#fbbf24;">⚠ Payment Pending</strong><br>
        Your registration is confirmed but payment is due at the venue.<br>
        Please pay <strong>₹250</strong> at the registration counter when you arrive on
        <strong>16 September 2026</strong>.<br>
        Show this email or your <strong style="color:#a78bfa;">${passId}</strong> at the desk.
       </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>NEXTRON'2K26 — Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#050814;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#050814;">

  <!-- ═══ HEADER ═══ -->
  <div style="background:linear-gradient(135deg,#0b1a38 0%,#130b28 100%);padding:36px 32px 28px;text-align:center;border-bottom:1px solid rgba(103,232,249,0.25);">
    <div style="font-size:30px;font-weight:900;color:#67e8f9;letter-spacing:5px;margin-bottom:4px;">NEXTRON'2K26</div>
    <div style="font-size:10px;color:rgba(148,200,255,0.55);letter-spacing:4px;text-transform:uppercase;">National Level Technical Symposium</div>
    <div style="font-size:10px;color:rgba(148,200,255,0.4);letter-spacing:2px;margin-top:4px;">Dept. of ECE · University College of Engineering Tindivanam</div>
  </div>

  <!-- ═══ GREETING ═══ -->
  <div style="padding:36px 32px 0;">
    <div style="font-size:22px;font-weight:800;color:#f8fbff;margin-bottom:14px;">
      Hey ${fullName.split(" ")[0]} 👋
    </div>
    <p style="font-size:15px;color:rgba(200,220,255,0.82);line-height:1.85;margin:0 0 24px;">
      You're officially part of <strong style="color:#67e8f9;">NEXTRON'2K26</strong>! 🎉<br><br>
      Thank you for registering for our National Level Technical Symposium.
      We are incredibly excited to welcome you on <strong style="color:#f8fbff;">16 September 2026</strong>
      at the University College of Engineering Tindivanam, Melpakkam.<br><br>
      Your participant pass details are below. Please save this email and
      carry your <strong style="color:#a78bfa;">Pass ID</strong> on the event day.
    </p>
  </div>

  <!-- ═══ PASS CARD ═══ -->
  <div style="padding:0 24px;">
    <div style="background:linear-gradient(135deg,#0d1f40 0%,#13082a 100%);border:1.5px solid rgba(103,232,249,0.4);border-radius:18px;overflow:hidden;">

      <!-- Pass header -->
      <div style="background:rgba(103,232,249,0.06);padding:18px 24px;border-bottom:1px dashed rgba(103,232,249,0.2);text-align:center;">
        <div style="font-size:9px;font-weight:700;letter-spacing:5px;color:rgba(103,232,249,0.6);text-transform:uppercase;margin-bottom:6px;">✦ Participant Pass ✦</div>
        <div style="font-size:24px;font-weight:900;color:#67e8f9;letter-spacing:3px;">NEXTRON'2K26</div>
        <div style="font-size:9px;color:rgba(148,200,255,0.5);letter-spacing:3px;text-transform:uppercase;margin-top:3px;">Innovate · Inspire · Impact</div>
      </div>

      <!-- Pass body -->
      <div style="padding:20px 24px;">

        <!-- Name row -->
        <div style="margin-bottom:16px;">
          <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(148,200,255,0.45);text-transform:uppercase;margin-bottom:4px;">Participant Name</div>
          <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">${fullName}</div>
        </div>

        <!-- Pass ID -->
        <div style="background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.35);border-radius:10px;padding:12px 16px;margin-bottom:16px;">
          <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(167,139,250,0.6);text-transform:uppercase;margin-bottom:5px;">Pass ID</div>
          <div style="font-size:22px;font-weight:900;color:#a78bfa;letter-spacing:3px;">${passId}</div>
        </div>

        <!-- Info grid -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px;">
          <tr>
            <td style="padding:8px 8px 8px 0;border-bottom:1px solid rgba(103,232,249,0.07);vertical-align:top;width:50%;">
              <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:rgba(148,200,255,0.4);text-transform:uppercase;margin-bottom:3px;">Register No.</div>
              <div style="font-size:13px;font-weight:600;color:#e8f4ff;">${registerNumber}</div>
            </td>
            <td style="padding:8px 0 8px 8px;border-bottom:1px solid rgba(103,232,249,0.07);vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:rgba(148,200,255,0.4);text-transform:uppercase;margin-bottom:3px;">Department</div>
              <div style="font-size:13px;font-weight:600;color:#e8f4ff;">${department}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 8px 8px 0;border-bottom:1px solid rgba(103,232,249,0.07);vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:rgba(148,200,255,0.4);text-transform:uppercase;margin-bottom:3px;">Year</div>
              <div style="font-size:13px;font-weight:600;color:#e8f4ff;">${yearLabel}</div>
            </td>
            <td style="padding:8px 0 8px 8px;border-bottom:1px solid rgba(103,232,249,0.07);vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:rgba(148,200,255,0.4);text-transform:uppercase;margin-bottom:3px;">Food Preference</div>
              <div style="font-size:13px;font-weight:600;color:#e8f4ff;">${foodPreference}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px 0;vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:rgba(148,200,255,0.4);text-transform:uppercase;margin-bottom:3px;">College</div>
              <div style="font-size:13px;font-weight:600;color:#e8f4ff;">${collegeName}</div>
            </td>
          </tr>
        </table>

        <!-- Events -->
        <div style="margin-bottom:16px;">
          <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(148,200,255,0.45);text-transform:uppercase;margin-bottom:8px;">Registered Events</div>
          <div>${eventsHtml}</div>
        </div>

        <!-- Payment status -->
        <div style="background:${isPaid ? "rgba(94,234,212,0.1)" : "rgba(251,191,36,0.08)"};border:1px solid ${isPaid ? "rgba(94,234,212,0.4)" : "rgba(251,191,36,0.35)"};border-radius:10px;padding:12px 16px;">
          <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(148,200,255,0.45);text-transform:uppercase;margin-bottom:5px;">Payment Status</div>
          <div style="font-size:15px;font-weight:800;color:${isPaid ? "#5eead4" : "#fbbf24"};">${paymentLabel}</div>
          ${payment.transactionId ? `<div style="font-size:10px;color:rgba(148,200,255,0.4);margin-top:4px;font-family:monospace;">TXN: ${payment.transactionId}</div>` : ""}
        </div>
      </div>

      <!-- Pass footer -->
      <div style="background:rgba(5,8,20,0.5);padding:12px 24px;border-top:1px solid rgba(103,232,249,0.12);text-align:center;">
        <span style="font-size:10px;color:rgba(148,200,255,0.35);letter-spacing:1px;">📅 16 SEP 2026</span>
        <span style="color:rgba(103,232,249,0.3);margin:0 10px;">◆</span>
        <span style="font-size:10px;color:rgba(148,200,255,0.35);letter-spacing:1px;">📍 MELPAKKAM, TAMIL NADU</span>
      </div>
    </div>
  </div>

  <!-- ═══ PENDING NOTE ═══ -->
  ${pendingBlock ? `<div style="padding:0 24px;">${pendingBlock}</div>` : ""}

  <!-- ═══ VENUE INFO ═══ -->
  <div style="padding:24px 32px 0;">
    <div style="background:rgba(103,232,249,0.04);border:1px solid rgba(103,232,249,0.15);border-radius:12px;padding:18px 22px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:4px;color:rgba(103,232,249,0.5);text-transform:uppercase;margin-bottom:10px;">📍 Venue & Date</div>
      <div style="font-size:15px;font-weight:700;color:#f8fbff;margin-bottom:4px;">University College of Engineering Tindivanam</div>
      <div style="font-size:12px;color:rgba(148,200,255,0.55);margin-bottom:4px;">Melpakkam Village, Villupuram District, Tamil Nadu — 604 001</div>
      <div style="font-size:12px;color:rgba(148,200,255,0.55);">📅 16 September 2026 &nbsp;·&nbsp; 9:00 AM onwards</div>
    </div>
  </div>

  <!-- ═══ IMPORTANT NOTES ═══ -->
  <div style="padding:20px 32px 0;">
    <div style="background:rgba(167,139,250,0.05);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:16px 20px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:4px;color:rgba(167,139,250,0.6);text-transform:uppercase;margin-bottom:10px;">📌 Important Notes</div>
      <ul style="margin:0;padding-left:18px;color:rgba(200,220,255,0.7);font-size:13px;line-height:2;">
        <li>Carry a valid college ID card and this Pass ID on event day</li>
        <li>Report to the registration desk at least 30 minutes before your event</li>
        <li>Esports participants: ₹100 team fee payable on-spot (separate from symposium fee)</li>
        <li>Contact us for any queries: <a href="mailto:ucetnextron@gmail.com" style="color:#67e8f9;">ucetnextron@gmail.com</a></li>
      </ul>
    </div>
  </div>

  <!-- ═══ THANK YOU ═══ -->
  <div style="padding:36px 32px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:#67e8f9;letter-spacing:3px;margin-bottom:10px;">See You on Sep 16! 🚀</div>
    <p style="font-size:14px;color:rgba(148,200,255,0.65);line-height:1.9;margin:0 0 24px;">
      Thank you for being part of NEXTRON'2K26.<br>
      We're building something incredible and you're a part of it.<br>
      Stay tuned on Instagram for schedule updates and announcements.
    </p>
    <a href="https://www.instagram.com/nextron_2k26" style="display:inline-block;background:linear-gradient(135deg,rgba(103,232,249,0.15),rgba(167,139,250,0.15));border:1px solid rgba(103,232,249,0.35);color:#67e8f9;padding:10px 24px;border-radius:25px;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:1px;margin-bottom:8px;">
      📸 Follow @nextron_2k26
    </a>
  </div>

  <!-- ═══ FOOTER ═══ -->
  <div style="background:rgba(5,8,20,0.9);padding:20px 32px;border-top:1px solid rgba(103,232,249,0.1);text-align:center;">
    <div style="font-size:11px;color:rgba(148,200,255,0.3);line-height:2;">
      NEXTRON'2K26 · Dept. of Electronics &amp; Communication Engineering<br>
      University College of Engineering Tindivanam · A Constituent College of Anna University Chennai<br>
      <br>
      This is an automated confirmation. For queries:
      <a href="mailto:ucetnextron@gmail.com" style="color:#67e8f9;text-decoration:none;">ucetnextron@gmail.com</a>
    </div>
  </div>

</div>
</body>
</html>`;
}

/* ── Cloud Function ─────────────────────────────────────────── */
exports.sendPassEmail = onDocumentCreated(
  {
    document: "participants/{passId}",
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
    region: "asia-south1",
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const { email, fullName, passId } = data;
    if (!email) {
      console.error("No email on participant document", passId);
      return;
    }

    // Create Gmail transporter using App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER.value(),
        pass: GMAIL_APP_PASSWORD.value(),
      },
    });

    const mailOptions = {
      from:    `"NEXTRON'2K26" <${GMAIL_USER.value()}>`,
      to:      email,
      subject: `✅ NEXTRON'2K26 — Registration Confirmed | Pass ID: ${passId}`,
      html:    buildEmailHtml(data),
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Pass email sent to ${email} for passId ${passId}`);

      // Update Firestore to mark email as sent
      await event.data.ref.update({ "pass.sentToEmail": true });
    } catch (err) {
      console.error(`❌ Failed to send email to ${email}:`, err.message);
    }
  }
);
