import { useEffect, useRef } from "react";

export default function RippleEffect() {
  const layerRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return undefined;

    const layer = layerRef.current;
    if (!layer) return undefined;

    const onPointerDown = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const ripple = document.createElement("span");
      ripple.className = "water-ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      layer.appendChild(ripple);

      window.setTimeout(() => {
        ripple.remove();
      }, 1100);
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return <div className="ripple-layer" ref={layerRef} aria-hidden="true" />;
}
