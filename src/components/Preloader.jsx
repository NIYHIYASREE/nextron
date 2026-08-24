import { useEffect, useRef, useState } from "react";

/*
  OPTIMIZED PRELOADER
  ───────────────────
  Old: 28 setIntervals + 7 RAF loops → 28 React re-renders/sec → jank
  New: Pure CSS keyframe animations for ALL letter effects.
       Only ONE requestAnimationFrame for the progress bar number.
       Zero per-letter state. Zero setInterval. Zero layout thrash.

  Total duration: 2200ms display + 600ms exit = 2.8s (was 4.1s)
*/

const LETTERS = ["N","E","X","T","R","O","N"];
const LOAD_DURATION = 2200;
const EXIT_DURATION = 600;

/* Single RAF-driven progress bar — reads time, no setState flood */
function ProgressBar({ duration }) {
  const fillRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const pct = Math.min(100, ((now - start) / duration) * 100);
      if (fillRef.current) fillRef.current.style.width = pct + "%";
      if (glowRef.current) glowRef.current.style.left  = pct + "%";
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <div
      className="preloader-bar-track"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading"
    >
      <div className="preloader-bar-fill" ref={fillRef} />
      <div className="preloader-bar-glow" ref={glowRef} />
    </div>
  );
}

export default function Preloader({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), LOAD_DURATION);
    const t2 = setTimeout(onDone, LOAD_DURATION + EXIT_DURATION);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`preloader${exiting ? " preloader--exit" : ""}`} aria-label="Loading NEXTRON" aria-live="polite">

      {/* All decorative — pure CSS, no JS */}
      <div className="preloader-grid"                aria-hidden="true" />
      <div className="preloader-blob preloader-blob--cyan"   aria-hidden="true" />
      <div className="preloader-blob preloader-blob--violet" aria-hidden="true" />
      <div className="preloader-scanlines"           aria-hidden="true" />
      <span className="preloader-bracket preloader-bracket--tl" aria-hidden="true" />
      <span className="preloader-bracket preloader-bracket--tr" aria-hidden="true" />
      <span className="preloader-bracket preloader-bracket--bl" aria-hidden="true" />
      <span className="preloader-bracket preloader-bracket--br" aria-hidden="true" />
      <div className="preloader-ring preloader-ring--1" aria-hidden="true" />
      <div className="preloader-ring preloader-ring--2" aria-hidden="true" />
      <div className="preloader-ring preloader-ring--3" aria-hidden="true" />

      <div className="preloader-center">
        <p className="preloader-top-label">ECE DEPARTMENT PRESENTS</p>

        {/* Letters — all animation via CSS, zero JS state */}
        <div className="preloader-word" aria-label="NEXTRON">
          {LETTERS.map((char, i) => (
            <span
              key={i}
              className="preloader-letter"
              style={{ "--li": i }}
              aria-hidden="true"
            >
              {char}
            </span>
          ))}
        </div>
        {/* Visually hidden real text for screen readers */}
        <span className="sr-only">NEXTRON</span>

        <div className="preloader-year-tag" aria-hidden="true">'26</div>
        <p className="preloader-subtitle">NATIONAL LEVEL TECHNICAL SYMPOSIUM</p>
        <p className="preloader-college">University College of Engineering Tindivanam</p>

        <ProgressBar duration={LOAD_DURATION} />
        <p className="preloader-loading-text" aria-hidden="true">INITIALIZING</p>
      </div>
    </div>
  );
}
