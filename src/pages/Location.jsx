import SectionHeading from "../components/SectionHeading.jsx";
import LocationSection from "../components/LocationSection.jsx";
import RegistrationCTA from "../components/RegistrationCTA.jsx";

export default function Location() {
  return (
    <div className="page-shell">
      <SectionHeading eyebrow="Location" title="Reach University College of Engineering Tindivanam">
        Open the campus location directly in Google Maps. No API key is required.
      </SectionHeading>
      <LocationSection />
      <RegistrationCTA compact />
    </div>
  );
}
