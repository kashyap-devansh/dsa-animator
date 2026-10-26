import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import LoadingScreen from "./components/LoadingScreen/LoadingScreen.jsx";
import NotesSection from "./components/NotesSection/NotesSection.jsx";

import Playground from "./Playground/PlaygroundHero/PlaygroundHero";
import Sorting from "./Playground/Algorithms/Sorting/Sorting";
import Searching from "./Playground/Algorithms/Searching/Searching.jsx";
import LinkedList from "./Playground/Structures/LinkedList/LinkedList.jsx";
import Stack from "./Playground/Structures/Stack/Stack.jsx";
import Queue from "./Playground/Structures/Queue/Queue.jsx";
import Recursion from "./Playground/Recursion/Recursion.jsx";

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

function Page({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

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
    <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/playground" element={<Page><Playground /></Page>} />
      <Route path="/playground/sorting/:slug" element={<Page><Sorting /></Page>} />
      <Route path="/playground/searching/:slug" element={<Page><Searching /></Page>} />
      <Route path="/playground/linkedList/:slug" element={<Page><LinkedList /></Page>} />
      <Route path="/playground/stack/:slug" element={<Page><Stack /></Page>} />
      <Route path="/playground/queue/:slug" element={<Page><Queue /></Page>} />
      <Route path="/playground/recursion/:slug" element={<Page><Recursion /></Page>} />
      <Route path="/notes" element={<Page><NotesSection /></Page>} />

    </Routes>

    <Analytics />
    </>
  );
}

export default App;
