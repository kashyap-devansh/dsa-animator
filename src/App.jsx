import { Routes, Route } from "react-router-dom";

import Playground from "./Pages/Playground/Playground";

import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Marquee from "./components/Marquee/Marquee";
import Preview from "./components/Preview/Preview";
import Gallery from "./components/Gallery/Gallery";
import Manifesto from "./components/Manifesto/Manifesto";
import SlowMarquee from "./components/SlowMarquee/SlowMarquee";
import Notes from "./components/Notes/Notes";
import CTA from "./components/CTA/CTA";
import Footer from "./components/Footer/Footer";

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Marquee />
      <Preview />
      <Gallery />
      <Manifesto />
      <SlowMarquee />
      <Notes />
      <CTA />
      <Footer />
    </>
  );
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/playground" element={
        <>
          <Navbar />
          <Playground />
        </>
      } />
    </Routes>
  );
}

export default App;
