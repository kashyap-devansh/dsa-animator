import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Marquee from "./components/Marquee/Marquee.jsx";
import FeaturedWork from "./components/FeaturedWork/FeaturedWork.jsx";

const App = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Marquee />
      <FeaturedWork />
    </div>
  )
}

export default App;
