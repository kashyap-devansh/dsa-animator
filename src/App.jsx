import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import LoadingScreen from "./components/LoadingScreen/LoadingScreen.jsx";
import NotesHub from "./Notes/NotesHub.jsx";
import NoteArticle from "./Notes/NoteArticle.jsx";
import Classroom from "./components/Classroom/Classroom.jsx";
import CommandPalette from "./components/CommandPalette/CommandPalette.jsx";
import TeachPage from "./Classroom/TeachPage.jsx";
import LessonCover from "./Classroom/LessonCover.jsx";
import ClassQuiz from "./Classroom/ClassQuiz.jsx";
import LessonBar from "./Classroom/LessonBar.jsx";

import Playground from "./Playground/PlaygroundHero/PlaygroundHero";
import Sorting from "./Playground/Algorithms/Sorting/Sorting";
import Searching from "./Playground/Algorithms/Searching/Searching.jsx";
import Hashing from "./Playground/Algorithms/Hashing/Hashing.jsx";
import ArrayStructure from "./Playground/Structures/Array/Array.jsx";
import LinkedList from "./Playground/Structures/LinkedList/LinkedList.jsx";
import Stack from "./Playground/Structures/Stack/Stack.jsx";
import Queue from "./Playground/Structures/Queue/Queue.jsx";
import BST from "./Playground/Structures/BST/BST.jsx";
import AVL from "./Playground/Structures/AVL/AVL.jsx";
import Recursion from "./Playground/Recursion/Recursion.jsx";

import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Marquee from "./components/Marquee/Marquee";
import Preview from "./components/Preview/Preview";
import Gallery from "./components/Gallery/Gallery";
import Manifesto from "./components/Manifesto/Manifesto";
import SlowMarquee from "./components/SlowMarquee/SlowMarquee";
import Notes from "./components/Notes/Notes";
import ClassroomSection from "./components/ClassroomSection/ClassroomSection";
import CTA from "./components/CTA/CTA";
import Footer from "./components/Footer/Footer";

// `classroom` adds the teaching dock (present mode, pen, laser, keyboard control).
function Page({ children, classroom = false }) {
  return (
    <>
      <Navbar />
      <main className="page-main">{children}</main>
      {classroom && <Classroom />}
      <Footer />
    </>
  );
}

const Lesson = ({ children }) => <Page classroom>{children}</Page>;

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
      <ClassroomSection />
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
      <Route path="/playground/sorting/:slug" element={<Lesson><Sorting /></Lesson>} />
      <Route path="/playground/searching/:slug" element={<Lesson><Searching /></Lesson>} />
      <Route path="/playground/hashing/:slug" element={<Lesson><Hashing /></Lesson>} />
      <Route path="/playground/array/:slug" element={<Lesson><ArrayStructure /></Lesson>} />
      <Route path="/playground/linkedList/:slug" element={<Lesson><LinkedList /></Lesson>} />
      <Route path="/playground/stack/:slug" element={<Lesson><Stack /></Lesson>} />
      <Route path="/playground/queue/:slug" element={<Lesson><Queue /></Lesson>} />
      <Route path="/playground/bst/:slug" element={<Lesson><BST /></Lesson>} />
      <Route path="/playground/avl/:slug" element={<Lesson><AVL /></Lesson>} />
      <Route path="/playground/recursion/:slug" element={<Lesson><Recursion /></Lesson>} />
      <Route path="/notes" element={<Page><NotesHub /></Page>} />
      <Route path="/notes/:slug" element={<Lesson><NoteArticle /></Lesson>} />
      <Route path="/classroom" element={<Page><TeachPage /></Page>} />
      <Route path="/lesson" element={<Lesson><LessonCover /></Lesson>} />
      <Route path="/quiz/:slug" element={<Lesson><ClassQuiz /></Lesson>} />

    </Routes>

    <LessonBar />
    <CommandPalette />
    <Analytics />
    </>
  );
}

export default App;
