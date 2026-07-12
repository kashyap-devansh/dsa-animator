import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Marquee from "./components/Marquee/Marquee.jsx";
import Preview from "./components/Preview/Preview.jsx";
import Gallery from "./components/Gallery/Gallery.jsx";
import Manifesto from "./components/Manifesto/Manifesto.jsx";
import SlowMarquee from "./components/SlowMarquee/SlowMarquee.jsx";
import Notes from "./components/Notes/Notes.jsx";

const App = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Marquee />
      <Preview />
      <Gallery />
      <Manifesto />
      <SlowMarquee />
      <Notes />
    </div>
  )
}

export default App;
