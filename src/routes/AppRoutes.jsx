import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

/*
  All pages are lazy-loaded so they are NOT included in the initial
  bundle. Each page becomes its own chunk — browsers only download
  the page the user actually visits.
*/
const Home             = lazy(() => import("../pages/Home.jsx"));
const About            = lazy(() => import("../pages/About.jsx"));
const Events           = lazy(() => import("../pages/Events.jsx"));
const EventDetails     = lazy(() => import("../pages/EventDetails.jsx"));
const Faculty          = lazy(() => import("../pages/Faculty.jsx"));
const Committee        = lazy(() => import("../pages/Committee.jsx"));
const Location         = lazy(() => import("../pages/Location.jsx"));
const Contact          = lazy(() => import("../pages/Contact.jsx"));
const Register         = lazy(() => import("../pages/Register.jsx"));
const PassPage         = lazy(() => import("../pages/PassPage.jsx"));
const RetrievePass     = lazy(() => import("../pages/RetrievePass.jsx"));
const AdminDashboard   = lazy(() => import("../pages/AdminDashboard.jsx"));

/* Minimal fallback — invisible, no layout shift */
function PageFallback() {
  return <div style={{ minHeight: "60vh" }} aria-hidden="true" />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/about"          element={<About />} />
        <Route path="/events"         element={<Events />} />
        <Route path="/events/:slug"   element={<EventDetails />} />
        <Route path="/faculty"        element={<Faculty />} />
        <Route path="/committee"      element={<Committee />} />
        <Route path="/location"       element={<Location />} />
        <Route path="/contact"        element={<Contact />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/pass"           element={<PassPage />} />
        <Route path="/retrieve-pass"  element={<RetrievePass />} />
        <Route path="/admin"          element={<AdminDashboard />} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
