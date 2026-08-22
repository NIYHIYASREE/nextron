# NEXTRON'26 — NATIONAL LEVEL TECHNICAL SYMPOSIUM

## Complete Static React Website Development Prompt

Build a **premium, futuristic, highly interactive, mobile-first static React website** for:

**NEXTRON'26 — A NATIONAL LEVEL TECHNICAL SYMPOSIUM**

organized by the

**Department of Electronics and Communication Engineering**

**University College of Engineering Tindivanam**

A Constituent College of Anna University Chennai

---

# 1. IMPORTANT ARCHITECTURE DECISION

This is a **STATIC WEBSITE ONLY**.

Do NOT create or use:

* Node.js backend
* Express
* MongoDB
* MongoDB Atlas
* JWT authentication
* Admin portal
* Coordinator portal
* Student login
* REST API
* Backend database
* Payment backend
* Server-side authentication

Use only:

* React
* Vite
* React Router
* JavaScript
* CSS
* Framer Motion if useful
* Lightweight icon library such as Lucide React

The website will be deployed as a static application.

Possible deployment:

* Render Static Site
* Vercel
* Netlify
* GitHub Pages

---

# 2. REGISTRATION SYSTEM

Registration is handled completely through **Google Forms**.

The website itself must NOT store student registration information.

Official registration form:

https://docs.google.com/forms/d/e/1FAIpQLScUDw_F3YwuvSqBLB6w0QzO7xRyE0rsRh3-mDD350ihvsos3Q/viewform

IMPORTANT:

Use the `/viewform` URL for users.

Do NOT use the `/formResponse` endpoint directly.

Do NOT attempt to submit Google Forms programmatically.

Do NOT collect student information inside React.

When a user clicks:

**REGISTER NOW**

open the Google Form in a new browser tab.

---

# 3. CENTRAL CONFIGURATION

Create:

src/config/siteConfig.js

Put all configurable information in one place.

Example:

```js
export const siteConfig = {
  eventName: "NEXTRON'26",
  eventFullName: "NEXTRON'26 — A National Level Technical Symposium",

  eventDate: "18 September 2026",

  registrationFormUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLScUDw_F3YwuvSqBLB6w0QzO7xRyE0rsRh3-mDD350ihvsos3Q/viewform",

  registrationFee: 250,

  venue: "University College of Engineering Tindivanam",

  address:
    "Melpakkam Village, Villupuram District, Tamil Nadu – 604 001",

  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=University+College+of+Engineering,+Tindivanam,+Melpakkam,+Tamil+Nadu+604307",
};
```

Every Register Now button throughout the website must use:

`siteConfig.registrationFormUrl`

Do not duplicate the URL in multiple files.

---

# 4. EVENT INFORMATION

## UNIVERSITY COLLEGE OF ENGINEERING TINDIVANAM

A Constituent College of Anna University Chennai

Melpakkam Village, Villupuram District – 604 001

## DEPARTMENT

Department of Electronics and Communication Engineering

## EVENT

# NEXTRON'26

### A NATIONAL LEVEL TECHNICAL SYMPOSIUM

## DATE

**18 September 2026**

## LOCATION

University College of Engineering Tindivanam

Melpakkam, Tamil Nadu

---

# 5. HOMEPAGE

Create a visually spectacular homepage.

The first screen should immediately communicate:

NEXTRON'26

A NATIONAL LEVEL TECHNICAL SYMPOSIUM

Department of Electronics and Communication Engineering

University College of Engineering Tindivanam

18 SEPTEMBER 2026

Buttons:

### REGISTER NOW

### EXPLORE EVENTS

### LOCATION

The main Register Now button must open the Google Form.

---

# 6. DESIGN DIRECTION

The website must NOT look like:

* a basic college website
* a Bootstrap template
* a Google Form
* a simple portfolio
* a generic event template

It should feel like a **premium technology symposium website**.

Design inspiration:

* futuristic technology
* electronics
* circuit boards
* digital systems
* innovation
* youth
* competition
* energy
* cyber/futuristic interfaces
* water/light interaction

Suggested palette:

* Deep navy
* Near-black
* Electric blue
* Cyan
* Violet
* Purple
* Magenta accents
* White typography

Use gradients carefully.

Maintain excellent readability.

---

# 7. HERO ANIMATION

Create a rich animated hero background.

Possible effects:

* animated gradient mesh
* glowing circuit paths
* moving particles
* digital grid
* glowing nodes
* floating light particles
* animated SVG lines
* subtle waves
* futuristic energy flows

The animation should be continuous but subtle.

Do NOT make the background overpower the text.

---

# 8. WATER RIPPLE TOUCH EFFECT

This is a major visual requirement.

The entire website should have a subtle **water ripple interaction**.

When a user touches the screen:

A ripple should appear exactly at the touch location.

It should feel like:

**touching the surface of water.**

Example:

User taps screen.

↓

Circular ripple starts at the touch point.

↓

Ripple expands outward.

↓

Multiple subtle rings appear.

↓

The effect fades smoothly.

Use pointer events so it works for:

* Android touch
* mobile touch
* mouse click
* trackpad

The effect should feel premium and natural.

Avoid excessive DOM creation.

Prefer performant CSS/canvas/requestAnimationFrame techniques where appropriate.

The ripple should NOT make the website slow.

Respect:

`prefers-reduced-motion`

If the user has reduced motion enabled, reduce or disable the effect.

---

# 9. GLOBAL INTERACTIONS

Add subtle interactions throughout the site.

Examples:

Buttons:

* hover glow
* tap scale
* ripple

Cards:

* slight lift
* glowing border
* soft shadow
* hover movement

Sections:

* fade in
* slide up
* staggered animation

Navigation:

* smooth active indicator

Do not overanimate everything.

Animation should communicate quality, not create distraction.

---

# 10. MOBILE-FIRST REQUIREMENT

This is extremely important.

The website will primarily be used on Android phones.

Design FIRST for:

360px

375px

390px

412px

430px

Then optimize for:

* tablets
* laptops
* desktops

Do NOT build desktop first and simply shrink it.

---

# 11. MOBILE NAVIGATION

Desktop navigation:

* Logo
* Home
* About
* Events
* Faculty
* Committee
* Location
* Register

Mobile navigation:

Use either:

* clean hamburger menu

or

* modern mobile bottom navigation

Register Now should remain highly accessible.

Consider a fixed mobile CTA:

**REGISTER NOW**

at the bottom of the screen.

Make sure it does not cover important content.

---

# 12. REGISTRATION FLOW

The website should make registration extremely simple.

User journey:

OPEN WEBSITE

↓

Understand NEXTRON'26

↓

Explore events

↓

Click REGISTER NOW

↓

Google Form opens

↓

Student completes registration

↓

Student follows payment instructions

No website account is required.

No website login is required.

---

# 13. GOOGLE FORM INFORMATION

The Google Form collects:

## Personal Information

Email

Full Name *

Register Number *

Department *

Year *

* I YEAR
* II YEAR
* III YEAR
* IV YEAR

College Name *

Phone Number *

E-Mail ID *

Food

* Veg
* Non-Veg

## EVENT REGISTRATION

Students can select multiple events.

### Technical Events

* Paper Presentation
* Project Presentation
* Technical Quiz

### Non-Technical Events

* Free Fire
* Dance
* Treasure Hunt
* Cine Event

---

# 14. REGISTRATION FEE

Registration fee:

# ₹250

Clearly communicate:

**₹250 registration fee**

The participant can register for the available symposium events according to the event rules.

The payment process itself is handled outside the React website.

Do NOT build payment processing.

Do NOT collect:

* card details
* CVV
* UPI PIN
* banking password
* sensitive payment credentials

If a payment QR code is later required, create a reusable static payment section where the organizers can replace the QR image.

---

# 15. EVENTS

Create a beautiful events section.

Separate:

# TECHNICAL EVENTS

and

# NON-TECHNICAL EVENTS

---

# 16. TECHNICAL EVENTS

## PAPER PRESENTATION

Coordinators:

Dhinesh

Nithya Sree

Create:

* event card
* description
* rules section
* coordinator information
* Register Now button

---

## TECHNICAL QUIZ

Coordinators:

Gautham

Bushra

Create:

* event card
* description
* rules section
* coordinator information
* Register Now button

---

## PROJECT PRESENTATION

Coordinators:

Ezhilarasan

Visaha

Create:

* event card
* description
* rules section
* coordinator information
* Register Now button

---

# 17. NON-TECHNICAL EVENTS

## FREE FIRE

Coordinators:

Poovarasan

Abinaya

---

## DANCE

Coordinators:

Mageshwareen

Jenifa

---

## TREASURE HUNT

Coordinators:

Dharshan

Punitha

---

## CINE EVENT

Coordinators:

Ashwin Raj

Janani

---

# 18. EVENT DATA ARCHITECTURE

Do not hardcode event content into every component.

Create:

src/data/events.js

Example:

```js
export const events = [
  {
    id: "paper-presentation",
    name: "Paper Presentation",
    category: "Technical",
    coordinators: ["Dhinesh", "Nithya Sree"],
    description: "...",
    rules: [],
  },
];
```

Use this reusable data to generate:

* Event cards
* Event pages
* Event navigation
* Event details
* Coordinator information

---

# 19. EVENT DETAIL PAGES

Create routes:

/events/paper-presentation

/events/project-presentation

/events/technical-quiz

/events/free-fire

/events/dance

/events/treasure-hunt

/events/cine-event

Each page should contain:

* Event name
* Category
* Description
* Rules
* Coordinators
* Registration information
* Register Now button

The Register Now button must open the Google Form.

---

# 20. FREE FIRE RULES

Display these clearly.

## FREE FIRE RULES

* Team size: 4 members
* Each member should register separately
* Registration fee: ₹100 per team on spot
* Mode: Clash Squad
* All participants must follow the event coordinator's instructions
* Any form of cheating will result in disqualification
* No grenade
* No rooftop
* Decision of the event coordinators will be final

IMPORTANT:

Clearly distinguish:

**₹250 symposium registration fee**

from:

**₹100 Free Fire team fee payable on spot**

Do not accidentally represent the Free Fire ₹100 as part of the website's ₹250 online registration.

---

# 21. EVENT CARD DESIGN

Every event card should contain:

* Event icon
* Event name
* Category badge
* Short description
* Coordinators
* View Details
* Register Now

Interaction:

Desktop:

Hover → lift + glow

Mobile:

Tap → subtle scale + ripple

Selected/focused state should be visually clear.

---

# 22. FACULTY SECTION

Create a premium faculty section on the homepage.

## DEAN

### Dr. Prof. Arularasan R.

Professor & Dean

B.E., M.Tech., Ph.D.

---

## HEAD OF THE DEPARTMENT

### Dr. R. Gopinath

Head of the Department

B.E., M.Tech., Ph.D.

---

# ASSOCIATE PROFESSORS

### Dr. D. Rajkumar

Associate Professor

B.E., M.E., Ph.D.

### Mr. K. R. Venkatesh

Associate Professor

B.E., M.E.

Environmental Engineering, Wastewater Treatment

---

# ASSISTANT PROFESSORS

### Dr. M. Anbarasan

Assistant Professor (Sl. Gr.)

B.E., M.E., Ph.D.

Machining and optimisation

### Dr. K. R. Leelavathy

Assistant Professor (Sr. Gr.)

B.E., M.E., Ph.D.

### Mrs. J. Attchaya

Assistant Professor

M.E.

Structural Engineering

### Ms. S. Kashini

Assistant Professor

M.E.

Structural Engineering

---

# NON-TEACHING STAFF

### Mr. A. Senthilvelan

Technical Assistant (Sl.Gr)

### Mrs. M. Geetha

Laboratory Assistant (Sl.Gr)

### Mr. K. Subramanian

Laboratory Assistant (Sl.Gr)

### Mr. S. NaveenKumar

Peon Cum Fitter

---

# 23. FACULTY IMAGES

Do NOT invent faculty photographs.

Create support for local image assets.

Example:

src/assets/faculty/dean.webp

src/assets/faculty/hod.webp

src/assets/faculty/rajkumar.webp

If the actual image does not exist:

Show a professional placeholder/avatar.

Never use AI-generated images as real faculty photographs.

The card layout must remain correct even if images are missing.

---

# 24. COMMITTEE SECTION

Create an attractive organizing committee section.

## STUDENT COORDINATORS

Priyaranjan

Nandhini

---

## TECHNICAL EVENTS COMMITTEE

### Paper Presentation

Dhinesh

Nithya Sree

### Technical Quiz

Gautham

Bushra

### Project Presentation

Ezhilarasan

Visaha

---

## NON-TECHNICAL EVENTS COMMITTEE

### Free Fire

Poovarasan

Abinaya

### Dance

Mageshwareen

Jenifa

### Treasure Hunt

Dharshan

Punitha

### Cine Event

Ashwin Raj

Janani

---

## REGISTRATION AND RECEPTION

Bala Sundaram

Seetha

---

## DECORATION

Nandha Kumar

Anusuya

---

## HOSPITALITY

Arjun

Krithika

---

## FOOD

Parama Sivam

Vedha Sree

---

## COMPARING, CERTIFICATE AND PRIZE DISTRIBUTION

Ajay

Amith

Jenifa

---

## EDITING AND SOCIAL MEDIA

Sriram

Afreen

---

## WEBSITE

Karthick Raja

Nithya Sree

---

## DESIGNING

Pradeep

Visaha

---

## SPONSOR

Priyaranjan

Santra Veenus

---

# 25. COMMITTEE DATA

Create:

src/data/committees.js

Do not hardcode committee information in multiple components.

Create reusable CommitteeCard components.

Mobile design:

Do NOT use a large table.

Use:

* cards
* expandable sections
* coordinator names
* category badges

---

# 26. COUNTDOWN

Add a countdown to:

**18 September 2026**

Display:

Days

Hours

Minutes

Seconds

After the event begins:

# NEXTRON'26 IS LIVE

After the event ends:

# THANK YOU FOR BEING PART OF NEXTRON'26

The countdown should automatically update.

Use the correct local date/time.

---

# 27. ABOUT NEXTRON

Create an About section.

Content:

NEXTRON'26 is a national-level technical symposium organized by the Department of Electronics and Communication Engineering, University College of Engineering Tindivanam.

Join us on September 18, 2026 for a day of:

* technical challenges
* innovation
* creativity
* competition
* knowledge sharing
* networking
* entertainment

Make this section visually engaging rather than a plain paragraph.

---

# 28. LOCATION SECTION

Create a premium location section.

## UNIVERSITY COLLEGE OF ENGINEERING TINDIVANAM

Melpakkam Village

Villupuram District

Tamil Nadu

604 001

Google Maps:

https://www.google.com/maps/search/?api=1&query=University+College+of+Engineering,+Tindivanam,+Melpakkam,+Tamil+Nadu+604307

Include:

* map preview or lightweight map embed
* address
* location icon
* Open in Google Maps button

The Open in Google Maps button should open the provided URL in a new tab.

Do not require a Google Maps API key unless absolutely necessary.

---

# 29. SOCIAL MEDIA

Create a social media section.

For now, use placeholders if actual links are not provided.

Do NOT invent social media accounts.

Make social URLs configurable through:

src/config/siteConfig.js

---

# 30. CONTACT SECTION

Create a Contact section.

Only use actual contact details provided by the organizers.

If phone/email information is unavailable:

Use placeholders in configuration.

Do NOT invent contact information.

---

# 31. FOOTER

Footer should contain:

NEXTRON'26

Department of Electronics and Communication Engineering

University College of Engineering Tindivanam

18 September 2026

Quick Links:

Home

About

Events

Faculty

Committee

Location

Register

Social Media

---

# 32. ROUTES

Create these pages:

/

/about

/events

/events/:slug

/faculty

/committee

/location

/contact

/register

Use React Router.

The `/register` page should be a dedicated registration landing page that contains:

* ₹250 registration fee
* Registration instructions
* Event categories
* Google Form button
* Important notes

The final Register button opens the Google Form.

---

# 33. REGISTER PAGE

Create a high-conversion registration page.

Hero:

# REGISTER FOR NEXTRON'26

### ₹250 Registration Fee

Then explain:

1. Click Register Now
2. Complete the Google Form
3. Select your events
4. Follow the payment instructions
5. Complete your registration

Primary button:

# REGISTER NOW →

Secondary button:

# VIEW EVENTS

The primary button opens:

https://docs.google.com/forms/d/e/1FAIpQLScUDw_F3YwuvSqBLB6w0QzO7xRyE0rsRh3-mDD350ihvsos3Q/viewform

---

# 34. GOOGLE FORM LINK BEHAVIOR

Create a reusable function:

```js
export const openRegistrationForm = () => {
  window.open(
    siteConfig.registrationFormUrl,
    "_blank",
    "noopener,noreferrer"
  );
};
```

All Register Now buttons should use this function or the centralized URL.

Never duplicate registration logic.

---

# 35. RESPONSIVE DESIGN

Test thoroughly at:

360 × 800

375 × 812

390 × 844

412 × 915

430 × 932

768 × 1024

1024 × 768

1366 × 768

1920 × 1080

There must be:

NO horizontal scrolling.

NO clipped buttons.

NO overlapping cards.

NO unreadable text.

NO broken animations.

---

# 36. MOBILE UX

Make buttons at least approximately 44px touch-friendly.

Forms are external, so focus on making navigation easy.

Use:

* large CTA buttons
* readable typography
* compact cards
* sticky Register button
* smooth scrolling
* touch ripple
* mobile menu
* simple navigation

The website should be usable with one hand on an Android phone.

---

# 37. PERFORMANCE

Optimize heavily.

Use:

* lazy-loaded images
* WebP/AVIF
* compressed assets
* lazy routes
* code splitting
* CSS animations
* requestAnimationFrame only when required

Avoid:

* huge videos
* enormous background images
* unnecessary JavaScript loops
* hundreds of particles
* excessive blur filters
* heavy WebGL unless absolutely necessary

The site should remain smooth on mid-range Android phones.

---

# 38. ACCESSIBILITY

Implement:

* semantic HTML
* proper heading hierarchy
* alt text
* keyboard navigation
* visible focus states
* accessible buttons
* good contrast
* reduced-motion support

Support:

`prefers-reduced-motion`

---

# 39. SEO

Add:

Title:

NEXTRON'26 | National Level Technical Symposium | UCE Tindivanam

Description:

NEXTRON'26 is a national-level technical symposium organized by the Department of Electronics and Communication Engineering, University College of Engineering Tindivanam.

Add:

* favicon
* Open Graph metadata
* social preview metadata
* semantic HTML

---

# 40. PROJECT STRUCTURE

Use a clean architecture.

```text
src/
│
├── assets/
│   ├── faculty/
│   ├── events/
│   └── images/
│
├── components/
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── EventCard.jsx
│   ├── FacultyCard.jsx
│   ├── CommitteeCard.jsx
│   ├── Countdown.jsx
│   ├── RippleEffect.jsx
│   ├── LocationSection.jsx
│   ├── RegistrationCTA.jsx
│   └── Footer.jsx
│
├── config/
│   └── siteConfig.js
│
├── data/
│   ├── events.js
│   ├── faculty.js
│   ├── committees.js
│   └── symposium.js
│
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Events.jsx
│   ├── EventDetails.jsx
│   ├── Faculty.jsx
│   ├── Committee.jsx
│   ├── Location.jsx
│   ├── Contact.jsx
│   └── Register.jsx
│
├── routes/
│   └── AppRoutes.jsx
│
├── hooks/
│
├── utils/
│
├── styles/
│
├── App.jsx
└── main.jsx
```

Adapt this to the existing project if a project already exists.

Do not unnecessarily destroy working code.

---

# 41. NO BACKEND

Again, this is critical.

Do NOT add:

```text
server/
backend/
controllers/
models/
routes/api/
MongoDB/
Express/
JWT/
```

The application must remain a static React application.

---

# 42. NO ADMIN OR COORDINATOR LOGIN

There is currently:

NO admin portal.

NO coordinator portal.

NO student account.

NO authentication.

Registration data is managed through:

**Google Forms + Google Sheets**

The website only provides the user interface and redirects students to the Google Form.

---

# 43. NO PAYMENT PROCESSING

Do NOT implement Razorpay, Cashfree, Stripe, or any payment SDK at this stage.

The website should only display the registration fee and payment instructions if needed.

The actual payment workflow will be handled externally by the organizers.

Keep the architecture open so a payment gateway can be added in the future if required.

---

# 44. CONFIGURABLE CONTENT

Make these easy to change:

* Event name
* Event date
* Registration URL
* Registration fee
* Venue
* Maps URL
* Contact details
* Social links
* Faculty images
* Event images
* Event descriptions
* Event rules

Do this through local data/configuration files rather than scattering values across JSX.

---

# 45. FINAL VISUAL EXPERIENCE

The website should feel like:

# NEXTRON'26

**The future of technology meets competition.**

When someone opens the website:

1. They should immediately recognize NEXTRON'26.
2. They should see the event date.
3. They should understand that it is a national-level symposium.
4. They should see technical and non-technical events.
5. They should feel the futuristic ECE visual identity.
6. The touch interaction should feel like water.
7. They should easily reach the registration form.
8. The website should feel excellent on Android.

---

# 46. QUALITY BAR

Do not settle for a basic implementation.

The final website must have:

* polished typography
* premium spacing
* excellent mobile layout
* smooth animations
* touch interactions
* water ripple effect
* futuristic background
* event cards
* faculty presentation
* committee presentation
* countdown
* location
* registration CTA
* Google Form integration
* responsive navigation
* SEO
* accessibility
* fast performance

It should look like a **professionally designed national-level symposium website**, not a student CRUD project.

---

# 47. DEVELOPMENT PROCESS

Before coding:

1. Inspect the existing project.
2. Identify the current framework and structure.
3. Reuse useful existing components.
4. Remove unnecessary backend/database dependencies if present.
5. Establish the central configuration.
6. Establish event/faculty/committee data.
7. Build the mobile-first design system.
8. Build the homepage.
9. Build events.
10. Build event detail pages.
11. Build faculty.
12. Build committees.
13. Build registration page.
14. Add Google Form integration.
15. Add location.
16. Add countdown.
17. Add animations.
18. Add water ripple touch effect.
19. Optimize mobile performance.
20. Test all routes and links.

---

# 48. FINAL REGISTRATION URL

Use this exact URL for all registration CTAs:

https://docs.google.com/forms/d/e/1FAIpQLScUDw_F3YwuvSqBLB6w0QzO7xRyE0rsRh3-mDD350ihvsos3Q/viewform

Do NOT use:

`/formResponse`

Use:

`/viewform`

---

# FINAL INSTRUCTION

Build the complete **NEXTRON'26 static React website** now.

Priorities:

**1. Mobile UX**

**2. Visual quality**

**3. Performance**

**4. Smooth touch interaction**

**5. Easy Google Form registration**

**6. Accessibility**

**7. SEO**

The website must be production-ready as a static React application and must not require a backend or database.
