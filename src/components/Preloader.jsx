import { useEffect, useRef, useState } from "react";

/* ── Per-letter config ─────────────────────────────────────────
   Each letter cycles through its own font/color/weight sequence
   at its own speed, giving every character a unique "living" feel.
──────────────────────────────────────────────────────────────── */
const FONTS = [
  "'Orbitron', sans-serif",
  "'Audiowide', sans-serif",
  "'Bebas Neue', cursive",
  "'Russo One', sans-serif",
  "'Righteous', cursive",
];

const COLORS = [
  "#67e8f9", // cyan
  "#a78bfa", // violet
  "#ff4fd8", // magenta
  "#38bdf8", // sky blue
  "#5eead4", // teal
  "#f0abfc", // pink-purple
  "#ffffff",  // white flash
];

const WEIGHTS = [400, 700, 900];

// Each letter gets a slightly different cycle speed (ms)
const LETTER_SPEEDS = [110, 140, 95, 160, 120, 105, 150];

const LETTERS = "NEXTRON".split("");

function useCycler(values, intervalMs) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * values.length));
  const ref = useRef(null);
  useEffect(() => {
    ref.current = setInterval(
      () => setIdx((i) => (i + 1) % values.length),
      intervalMs
    );
    return () => clearInterval(ref.current);
  }, [values.length, intervalMs]);
  return values[idx];
}

/* Each individual letter has its own cycling state */
function AnimLetter({ char, speed, colorOffset, fontOffset, weightOffset }) {
  const allColors = [...COLORS.slice(colorOffset), ...COLORS.slice(0, colorOffset)];
  const allFonts  = [...FONTS.slice(fontOffset),   ...FONTS.slice(0, fontOffset)];

  const color      = useCycler(allColors, speed);
  const font       = useCycler(allFonts,  speed + 60);
  const fontWeight = useCycler(WEIGHTS,   speed + 40);

  // Subtle per-letter transform: slight Y bob and scale pulse
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), speed * 2);
    return () => clearInterval(t);
  }, [speed]);

  const yShift  = Math.sin((tick + colorOffset) * 0.7) * 6;
  const scaleV  = 1 + Math.sin((tick + fontOffset) * 0.5) * 0.06;
  const rotateV = Math.sin((tick + weightOffset) * 0.4) * 2;

  const glowColor = color;

  return (
    <span
      className="preloader-letter"
      style={{
        fontFamily:  font,
        fontWeight,
        color,
        transform:   `translateY(${yShift}px) scale(${scaleV}) rotate(${rotateV}deg)`,
        textShadow: [
          `0 0 12px ${glowColor}`,
          `0 0 30px ${glowColor}`,
          `0 0 60px ${glowColor}88`,
          `0 0 100px ${glowColor}44`,
        ].join(", "),
        transition: "color 0.15s ease, text-shadow 0.15s ease",
      }}
    >
      {char}
    </span>
  );
}

/* Progress bar that fills over `duration` ms */
function ProgressBar({ duration }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const elapsed = now - start;
      setPct(Math.min(100, (elapsed / duration) * 100));
      if (elapsed < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);
  return (
    <div className="preloader-bar-track" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="preloader-bar-fill" style={{ width: `${pct}%` }} />
      <div className="preloader-bar-glow" style={{ left: `${pct}%` }} />
    </div>
  );
}

/* Scanline sweep overlay — purely decorative */
function ScanLines() {
  return <div className="preloader-scanlines" aria-hidden="true" />;
}

/* Corner bracket decorations */
function Brackets() {
  return (
    <>
      <span className="preloader-bracket preloader-bracket--tl" aria-hidden="true" />
      <span className="preloader-bracket preloader-bracket--tr" aria-hidden="true" />
      <span className="preloader-bracket preloader-bracket--bl" aria-hidden="true" />
      <span className="preloader-bracket preloader-bracket--br" aria-hidden="true" />
    </>
  );
}

/* ── Main Preloader ─────────────────────────────────────────── */
const LOAD_DURATION = 3200; // ms before exit starts

export default function Preloader({ onDone }) {
  const [phase, setPhase] = useState("enter"); // enter | hold | exit

  useEffect(() => {
    // enter animation ~600ms, then hold, then exit
    const holdTimer = setTimeout(() => setPhase("exit"), LOAD_DURATION);
    return () => clearTimeout(holdTimer);
  }, []);

  useEffect(() => {
    if (phase === "exit") {
      // wait for exit animation to finish, then call onDone
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
  }, [phase, onDone]);

  return (
    <div
      className={`preloader preloader--${phase}`}
      aria-label="Loading NEXTRON"
      aria-live="polite"
    >
      {/* Tech grid background */}
      <div className="preloader-grid" aria-hidden="true" />

      {/* Radial glow blobs */}
      <div className="preloader-blob preloader-blob--cyan"  aria-hidden="true" />
      <div className="preloader-blob preloader-blob--violet" aria-hidden="true" />

      {/* Scan lines */}
      <ScanLines />

      {/* Corner brackets */}
      <Brackets />

      {/* Center content */}
      <div className="preloader-center">

        {/* Top label */}
        <p className="preloader-top-label">ECE DEPARTMENT PRESENTS</p>

        {/* The main NEXTRON word */}
        <div className="preloader-word" aria-label="NEXTRON">
          {LETTERS.map((char, i) => (
            <AnimLetter
              key={i}
              char={char}
              speed={LETTER_SPEEDS[i]}
              colorOffset={i % COLORS.length}
              fontOffset={i  % FONTS.length}
              weightOffset={i}
            />
          ))}
        </div>

        {/* Apostrophe + year tag */}
        <div className="preloader-year-tag">'26</div>

        {/* Subtitle */}
        <p className="preloader-subtitle">NATIONAL LEVEL TECHNICAL SYMPOSIUM</p>

        {/* College name */}
        <p className="preloader-college">
          University College of Engineering Tindivanam
        </p>

        {/* Progress bar */}
        <ProgressBar duration={LOAD_DURATION} />

        {/* Loading text */}
        <p className="preloader-loading-text">INITIALIZING</p>
      </div>

      {/* Orbit rings */}
      <div className="preloader-ring preloader-ring--1" aria-hidden="true" />
      <div className="preloader-ring preloader-ring--2" aria-hidden="true" />
      <div className="preloader-ring preloader-ring--3" aria-hidden="true" />
    </div>
  );
}
