import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "../config/siteConfig.js";

const getTimeState = () => {
  const now = Date.now();
  const start = new Date(siteConfig.eventStartIso).getTime();
  const end = new Date(siteConfig.eventEndIso).getTime();

  if (now >= end) return { status: "ended", parts: null };
  if (now >= start) return { status: "live", parts: null };

  const diff = start - now;
  return {
    status: "upcoming",
    parts: {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    },
  };
};

export default function Countdown() {
  const [timeState, setTimeState] = useState(getTimeState);
  const labels = useMemo(() => ["days", "hours", "minutes", "seconds"], []);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeState(getTimeState()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (timeState.status === "live") {
    return <div className="countdown countdown-message">NEXTRON'26 IS LIVE</div>;
  }

  if (timeState.status === "ended") {
    return <div className="countdown countdown-message">THANK YOU FOR BEING PART OF NEXTRON'26</div>;
  }

  return (
    <div className="countdown" aria-label={`Countdown to ${siteConfig.eventName}`}>
      {labels.map((label) => (
        <div className="countdown-box" key={label}>
          <strong>{String(timeState.parts[label]).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
