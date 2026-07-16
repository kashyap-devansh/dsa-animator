import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

import LoadingScreen from "./components/LoadingScreen/LoadingScreen.jsx";

import Playground from "./Playground/PlaygroundHero/PlaygroundHero";
import Sorting from "./Playground/Algorithms/Sorting/Sorting";
import Searching from "./Playground/Algorithms/Searching/Searching.jsx";
import LinkedList from "./Playground/Structures/LinkedList/LinkedList.jsx";

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
  const [loading, setLoading] = useState(!sessionStorage.getItem("loaderShown"));

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

      {loading && (
        <LoadingScreen onComplete={() => {
          setLoading(false)
          sessionStorage.setItem("loaderShown", "true");
        }} />
      )}
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
      <Route
        path="/playground/linkedList/:slug"
        element={
          <>
            <Navbar />
            <LinkedList />
            <Footer />
          </>
        }
      />

    </Routes>
  );
}

export default App;
