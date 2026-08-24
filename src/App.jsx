import { useState, useCallback, lazy, Suspense } from "react";
import Preloader from "./components/Preloader.jsx";

/*
  Lazy-loaded so FluidCanvas WebGL bundle is a separate chunk —
  it downloads in parallel during the preloader, not blocking first paint.
*/
const FluidCanvas       = lazy(() => import("./components/FluidCanvas.jsx"));
const Navbar            = lazy(() => import("./components/Navbar.jsx"));
const Footer            = lazy(() => import("./components/Footer.jsx"));
const RippleEffect      = lazy(() => import("./components/RippleEffect.jsx"));
const MobileRegisterBar = lazy(() => import("./components/MobileRegisterBar.jsx"));
const AppRoutes         = lazy(() => import("./routes/AppRoutes.jsx"));

const Nil = () => null;

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  const handlePreloaderDone = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  return (
    <>
      {!preloaderDone && <Preloader onDone={handlePreloaderDone} />}

      {/*
        FluidCanvas sits OUTSIDE app-shell so it is not affected by
        the app-shell opacity/scale transition and renders immediately
        behind the preloader exit animation too.
        z-index: -1 keeps it below all content.
      */}
      <Suspense fallback={<Nil />}>
        <FluidCanvas />
      </Suspense>

      <div
        className={`app-shell${preloaderDone ? " app-shell--visible" : ""}`}
        aria-hidden={!preloaderDone}
      >
        <Suspense fallback={<Nil />}>
          <RippleEffect />
          <Navbar />
          <main id="main-content">
            <AppRoutes />
          </main>
          <Footer />
          <MobileRegisterBar />
        </Suspense>
      </div>
    </>
  );
}
