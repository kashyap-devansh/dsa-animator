import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Marquee from "./components/Marquee/Marquee.jsx";
import Preview from "./components/Preview/Preview.jsx";
import Gallery from "./components/Gallery/Gallery.jsx";

const App = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Marquee />
      <Preview />
      <Gallery />
    </div>
  )
}

export default App;
