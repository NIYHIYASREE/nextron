/**
 * RobotTitle.jsx
 * NEXTRON'26 animated robot title.
 * Robot walks/runs/jumps across letters. Tap a letter to call it over.
 */

import { useEffect, useRef } from "react";

const LETTERS = ["N","E","X","T","R","O","N"];

function loadGsap() {
  return new Promise((resolve) => {
    if (window.gsap) return resolve(window.gsap);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    s.onload  = () => resolve(window.gsap);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

export default function RobotTitle() {
  const titleRef = useRef(null); // the <div> that holds BOTH letters AND robot
  const robotRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup   = () => {};

    loadGsap().then((gsap) => {
      if (cancelled || !gsap || !titleRef.current || !robotRef.current) return;

      const W = 40, H = 60;
      const container = titleRef.current;
      const el        = robotRef.current;
      const body      = el.querySelector(".rb-body");
      const ring      = el.querySelector(".rb-ring");
      const letterEls = Array.from(container.querySelectorAll(".rt-letter"));

      /* ── Recalculate letter positions relative to container ── */
      function getPoints() {
        const cr = container.getBoundingClientRect();
        return letterEls.map((l) => {
          const r = l.getBoundingClientRect();
          return {
            el:  l,
            cx:  r.left + r.width  / 2 - cr.left,
            top: r.top             - cr.top,
            bot: r.bottom          - cr.top,
          };
        });
      }

      let pts  = getPoints();
      const last = pts.length - 1;

      const footTarget = (i) => ({ x: pts[i].cx - W / 2, y: pts[i].bot - H });
      const topTarget  = (i) => ({ x: pts[i].cx - W / 2, y: pts[i].top      });

      const lightUp   = (i, on) => pts[i].el.classList.toggle("rt-lit", on);
      const guardOn   = (i) => {
        pts[i].el.classList.remove("rt-restore");
        pts[i].el.classList.add("rt-guard");
      };
      const guardOff  = (i) => {
        // delay so user can see the amber color before robot "fixes" it
        setTimeout(() => {
          pts[i].el.classList.add("rt-restore");
          pts[i].el.classList.remove("rt-guard");
          setTimeout(() => pts[i].el.classList.remove("rt-restore"), 1500);
        }, 600);
      };
      const setClass  = (cls)   => { body.className = "rb-body " + cls; };

      function squash(le, hard) {
        gsap.killTweensOf(le);
        gsap.timeline()
          .to(le, { y: hard?8:5, scaleY: hard?.80:.87, scaleX: hard?1.12:1.06, duration:.09, ease:"power1.out", transformOrigin:"50% 100%" })
          .to(le, { y:0, scaleY:1, scaleX:1, duration: hard?.5:.38, ease:"elastic.out(1,0.4)" });
      }
      function pushOff(le, dir) {
        gsap.killTweensOf(le);
        gsap.timeline()
          .to(le, { rotation:8*dir, x:2.5*dir, transformOrigin:"50% 100%", duration:.1, ease:"power1.out" })
          .to(le, { rotation:0, x:0, duration:.4, ease:"elastic.out(1,0.5)" });
      }
      function gripPull(le, dir) {
        gsap.killTweensOf(le);
        gsap.to(le, { rotation:-10*dir, y:-3, transformOrigin:"50% 0%", duration:.28, ease:"power1.out" });
      }
      function gripRelease(le) {
        gsap.killTweensOf(le);
        gsap.to(le, { rotation:0, y:0, duration:.45, ease:"elastic.out(1,0.45)" });
      }
      function bowAndSparkle() {
        gsap.timeline()
          .to(body, { rotation:16, duration:.32, ease:"power1.out" })
          .to(body, { rotation:-3, duration:.26, ease:"power1.inOut" })
          .to(body, { rotation:10, duration:.26, ease:"power1.inOut" })
          .to(body, { rotation:0,  duration:.36, ease:"power1.inOut" });
        gsap.timeline()
          .set(ring, { opacity:.9, scale:.4 })
          .to(ring,  { opacity:0, scale:1.6, duration:.7, ease:"power1.out" }, .1)
          .set(ring, { opacity:.9, scale:.4 }, .55)
          .to(ring,  { opacity:0, scale:1.6, duration:.7, ease:"power1.out" }, .65);
      }

      let current = 0;
      let gen     = 0;

      /* ── Place robot at first letter ── */
      const s0 = footTarget(0);
      gsap.set(el, { x: s0.x, y: s0.y, scaleX: 1 });
      setClass("walking");
      lightUp(0, true);

      function stepMove(from, to, action, myGen, onDone) {
        if (cancelled || myGen !== gen) return;
        const dir    = to >= from ? 1 : -1;
        const target = footTarget(to);

        gsap.set(el, { scaleX: dir });
        lightUp(from, false);
        pushOff(pts[from].el, dir);

        const tl = gsap.timeline({ onComplete: () => { if (myGen === gen) onDone(); } });

        if (action === "walk") {
          setClass("walking");
          tl.to(el, { x:target.x, y:target.y, duration:.9, ease:"none" });
          tl.call(squash, [pts[to].el, false]);
        } else if (action === "run") {
          setClass("running");
          tl.to(el, { x:target.x, y:target.y, duration:.4, ease:"none" });
          tl.call(squash, [pts[to].el, false]);
        } else if (action === "jump") {
          setClass("jumping");
          const apex = Math.min(footTarget(from).y, target.y) - 50;
          tl.to(el, { x:target.x, duration:.55, ease:"power1.inOut" }, "j");
          tl.to(el, { y:apex, duration:.275, ease:"power2.out", yoyo:true, repeat:1 }, "j");
          tl.call(squash, [pts[to].el, true]);
        } else if (action === "hang") {
          const upA = topTarget(from), upB = topTarget(to);
          setClass("jumping");
          tl.to(el, { x:upA.x, y:upA.y, duration:.35, ease:"power1.out" });
          tl.call(gripPull,    [pts[from].el, dir]);
          tl.call(setClass,    ["hanging"]);
          tl.to(el, { x:upB.x, y:upB.y, duration:.95, ease:"sine.inOut" });
          tl.call(gripRelease, [pts[from].el]);
          tl.call(gripPull,    [pts[to].el, dir]);
          tl.call(setClass,    ["walking"]);
          tl.to(el, { x:target.x, y:target.y, duration:.3, ease:"power1.in" });
          tl.call(gripRelease, [pts[to].el]);
          tl.call(squash,      [pts[to].el, false]);
        }
        lightUp(to, true);
      }

      const ACTIONS = ["walk","run","jump","hang"];

      function wanderStep(myGen) {
        if (cancelled || myGen !== gen) return;
        let dir = Math.random() < .5 ? -1 : 1;
        let nxt = current + dir;
        if (nxt < 0)    nxt = 1;
        if (nxt > last) nxt = last - 1;
        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        stepMove(current, nxt, action, myGen, () => {
          current = nxt;
          setTimeout(() => wanderStep(myGen), 150 + Math.random() * 450);
        });
      }

      function namasteThen(idx, myGen, after) {
        if (cancelled || myGen !== gen) return;
        setClass("namaste");
        bowAndSparkle();
        setTimeout(() => {
          if (cancelled || myGen !== gen) return;
          setClass("walking");
          after();
        }, 1450);
      }

      function protectLetter(idx) {
        gen++;
        const myGen = gen;
        gsap.killTweensOf(el);

        const target = footTarget(idx);
        const curX   = gsap.getProperty(el, "x");
        const dir    = target.x >= curX ? 1 : -1;
        const dist   = Math.hypot(target.x - curX, target.y - gsap.getProperty(el, "y"));
        const dur    = Math.min(1.0, Math.max(0.22, dist / 950));

        gsap.set(el, { scaleX: dir });
        setClass("running");
        guardOn(idx);

        gsap.timeline({
          onComplete: () => {
            if (cancelled || myGen !== gen) return;
            squash(pts[idx].el, true);
            lightUp(idx, true);
            namasteThen(idx, myGen, () => {
              guardOff(idx);
              current = idx;
              setTimeout(() => wanderStep(myGen), 250);
            });
          },
        }).to(el, { x:target.x, y:target.y, duration:dur, ease:"power2.out" });
      }

      letterEls.forEach((l, i) => {
        l.addEventListener("pointerdown", () => protectLetter(i));
      });

      const onResize = () => {
        pts = getPoints();
        const t = footTarget(current);
        gsap.set(el, { x: t.x, y: t.y });
      };
      window.addEventListener("resize", onResize);

      namasteThen(0, gen, () => wanderStep(gen));

      cleanup = () => {
        cancelled = true;
        window.removeEventListener("resize", onResize);
        gsap.killTweensOf(el);
        letterEls.forEach((l, i) => {
          l.removeEventListener("pointerdown", () => protectLetter(i));
        });
      };
    });

    return () => { cancelled = true; cleanup(); };
  }, []);

  return (
    <div className="rt-wrap" ref={titleRef}>

      {/* Robot — sibling of letters, positioned absolute inside rt-wrap */}
      <div className="rb-robot" ref={robotRef}>
        <div className="rb-body walking">
          <div className="rb-shadow" />
          <div className="rb-limb rb-leg rb-l" />
          <div className="rb-limb rb-leg rb-r" />
          <div className="rb-torso" />
          <div className="rb-limb rb-arm rb-l" />
          <div className="rb-limb rb-arm rb-r" />
          <div className="rb-head">
            <div className="rb-antenna" />
            <div className="rb-eye rb-l" />
            <div className="rb-eye rb-r" />
            <div className="rb-cheek rb-l" />
            <div className="rb-cheek rb-r" />
            <div className="rb-ring" />
          </div>
        </div>
      </div>

      {/* Title letters */}
      <div className="rt-title" role="heading" aria-level="1">
        {LETTERS.map((ch, i) => (
          <span key={i} className="rt-letter" data-path={i}>
            {ch}
            <span className="rt-underline" />
          </span>
        ))}
        <span className="rt-apos">&rsquo;</span>
        <span className="rt-year">26</span>
      </div>

    </div>
  );
}
