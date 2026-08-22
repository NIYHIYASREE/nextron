import { useState, useCallback } from "react";
import Navbar from "./components/Navbar.jsx";
import RippleEffect from "./components/RippleEffect.jsx";
import Footer from "./components/Footer.jsx";
import MobileRegisterBar from "./components/MobileRegisterBar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import Preloader from "./components/Preloader.jsx";

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  const handlePreloaderDone = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  return (
    <>
      {/* Preloader sits above everything; unmounts once done */}
      {!preloaderDone && <Preloader onDone={handlePreloaderDone} />}

      {/* Main site — rendered underneath, revealed when preloader exits */}
      <div
        className={`app-shell${preloaderDone ? " app-shell--visible" : ""}`}
        aria-hidden={!preloaderDone}
      >
        <RippleEffect />
        <Navbar />
        <main id="main-content">
          <AppRoutes />
        </main>
        <Footer />
        <MobileRegisterBar />
      </div>
    </>
  );
}
