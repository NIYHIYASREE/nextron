import { motion } from "framer-motion";

/*
  ScrollReveal — reusable scroll-triggered animation wrapper.

  Props:
  - children      : content to animate
  - delay         : stagger delay in seconds (default 0)
  - direction     : "up" | "down" | "left" | "right" (default "up")
  - distance      : px offset for initial position (default 24)
  - duration      : animation duration in seconds (default 0.5)
  - scale         : whether to also animate scale (default false)
  - className     : forwarded to the wrapper div
  - margin        : viewport margin before triggering (default "-60px")
  - as            : element type to render (default "div")
*/

const EASE = [0.22, 1, 0.36, 1];

function getInitial(direction, distance, scale) {
  const axis = { up: { y: distance }, down: { y: -distance }, left: { x: distance }, right: { x: -distance } };
  return { opacity: 0, ...(axis[direction] || { y: distance }), ...(scale ? { scale: 0.96 } : {}) };
}

function getAnimate(direction, scale) {
  const axis = { up: { y: 0 }, down: { y: 0 }, left: { x: 0 }, right: { x: 0 } };
  return { opacity: 1, ...(axis[direction] || { y: 0 }), ...(scale ? { scale: 1 } : {}) };
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 0.5,
  scale = false,
  className,
  margin = "-60px",
  as: Tag = "div",
}) {
  const MotionTag = motion[Tag] || motion.div;

  return (
    <MotionTag
      className={className}
      initial={getInitial(direction, distance, scale)}
      whileInView={getAnimate(direction, scale)}
      viewport={{ once: true, margin }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}
