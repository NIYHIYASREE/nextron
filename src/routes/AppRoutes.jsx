import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home.jsx";
import About from "../pages/About.jsx";
import Events from "../pages/Events.jsx";
import EventDetails from "../pages/EventDetails.jsx";
import Faculty from "../pages/Faculty.jsx";
import Committee from "../pages/Committee.jsx";
import Location from "../pages/Location.jsx";
import Contact from "../pages/Contact.jsx";
import Register from "../pages/Register.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:slug" element={<EventDetails />} />
      <Route path="/faculty" element={<Faculty />} />
      <Route path="/committee" element={<Committee />} />
      <Route path="/location" element={<Location />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
