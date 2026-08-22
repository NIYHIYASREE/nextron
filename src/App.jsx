import Navbar from "./components/Navbar.jsx";
import RippleEffect from "./components/RippleEffect.jsx";
import Footer from "./components/Footer.jsx";
import MobileRegisterBar from "./components/MobileRegisterBar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <>
      <RippleEffect />
      <Navbar />
      <main id="main-content">
        <AppRoutes />
      </main>
      <Footer />
      <MobileRegisterBar />
    </>
  );
}
