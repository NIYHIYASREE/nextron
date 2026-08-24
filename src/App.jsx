import { useState, useCallback, lazy, Suspense } from "react";
import Preloader from "./components/Preloader.jsx";

/*
  Navbar, Footer, RippleEffect, MobileRegisterBar and AppRoutes are
  all lazy-loaded so the initial JS bundle only contains the Preloader.
  The main site chunks are fetched in parallel WHILE the preloader runs,
  so they're ready the moment the preloader exits — zero wait time.
*/
const Navbar            = lazy(() => import("./components/Navbar.jsx"));
const Footer            = lazy(() => import("./components/Footer.jsx"));
const RippleEffect      = lazy(() => import("./components/RippleEffect.jsx"));
const MobileRegisterBar = lazy(() => import("./components/MobileRegisterBar.jsx"));
const AppRoutes         = lazy(() => import("./routes/AppRoutes.jsx"));

/* Silent fallback — no spinner, no flash */
const Nil = () => null;

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  const handlePreloaderDone = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  return (
    <>
      {!preloaderDone && <Preloader onDone={handlePreloaderDone} />}

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
