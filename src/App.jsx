import { Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import { CourseShell, PageShell } from "./shell/AppShell.jsx";
import { FIRST_LESSON } from "./course/course.js";
import ProgressPage from "./pages/ProgressPage.jsx";

import NotesHub from "./Notes/NotesHub.jsx";
import NoteArticle from "./Notes/NoteArticle.jsx";
import Classroom from "./components/Classroom/Classroom.jsx";
import CommandPalette from "./components/CommandPalette/CommandPalette.jsx";
import TeachPage from "./Classroom/TeachPage.jsx";
import LessonCover from "./Classroom/LessonCover.jsx";
import ClassQuiz from "./Classroom/ClassQuiz.jsx";
import LessonBar from "./Classroom/LessonBar.jsx";

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

import { useState } from "react";
import TopNav from "./shell/TopNav";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen.jsx";
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
import { ScrollProgress, SmoothScroll } from "./components/shared/effects.jsx";

// The original landing page, section for section, in the course's look.
function LandingPage() {
  const [loading, setLoading] = useState(() => !sessionStorage.getItem("loaderShown"));

  return (
    <div className="landing">
      <SmoothScroll />
      <ScrollProgress />
      <TopNav />
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
        <LoadingScreen
          onComplete={() => {
            setLoading(false);
            sessionStorage.setItem("loaderShown", "true");
          }}
        />
      )}
    </div>
  );
}

// A lesson: the course outline beside it, plus the teaching dock.
const Lesson = ({ children }) => (
  <CourseShell>
    {children}
    <Classroom />
  </CourseShell>
);

const App = () => (
  <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/learn" element={<Navigate to={FIRST_LESSON} replace />} />
      <Route path="/playground" element={<Navigate to={FIRST_LESSON} replace />} />
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
      <Route path="/progress" element={<PageShell><ProgressPage /></PageShell>} />
      <Route path="/notes" element={<PageShell><NotesHub /></PageShell>} />
      <Route path="/notes/:slug" element={<PageShell><NoteArticle /><Classroom /></PageShell>} />
      <Route path="/classroom" element={<PageShell><TeachPage /></PageShell>} />
      <Route path="/lesson" element={<PageShell><LessonCover /><Classroom /></PageShell>} />
      <Route path="/quiz/:slug" element={<PageShell><ClassQuiz /><Classroom /></PageShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    <LessonBar />
    <CommandPalette />
    <Analytics />
  </>
);

export default App;
