import { Routes, Route } from "react-router-dom";

import Playground from "./Playground/PlaygroundHero/PlaygroundHero";
import Sorting from "./Playground/Algorithms/Sorting/Sorting";
import Searching from "./Playground/Algorithms/Searching/Searching.jsx";

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
          <Footer />
        </>
      } />
      <Route
        path="/playground/sorting/:slug"
        element={
          <>
            <Navbar />
            <Sorting />
            <Footer />
          </>
        }
      />
      <Route
        path="/playground/searching/:slug"
        element={
          <>
            <Navbar />
            <Searching />
            <Footer />
          </>
        }
      />
    </Routes>
  );
}

export default App;
