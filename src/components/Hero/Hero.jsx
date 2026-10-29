import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import searchIndex from "../../Playground/shared/searchIndex.js";
import "./Hero.css";

const VISUALIZER_COUNT = searchIndex.filter((item) => item.active).length;
const CATEGORY_COUNT = new Set(searchIndex.map((item) => item.category)).size;

const MotionLink = motion.create(Link);

// Counts up from 0 once on mount.
function CountUp({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [count, value]);

  return <motion.b>{rounded}</motion.b>;
}

// A link that leans toward the cursor while hovered.
function MagneticLink({ to, className, children }) {
  const x = useSpring(0, { stiffness: 260, damping: 18 });
  const y = useSpring(0, { stiffness: 260, damping: 18 });

  const move = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.4);
  };

  const leave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <MotionLink to={to} className={className} style={{ x, y }} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </MotionLink>
  );
}

const rise = (delay) => ({
  initial: { opacity: 0, y: 24, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
});

const PHRASES = [
  "Watch Algorithms Think.",
  "See Complexity Unfold.",
  "Feel The Recursion.",
];

function SortBars() {
  const BARS = 42;

  const [values, setValues] = useState(() =>
    Array.from({ length: BARS }, () => Math.random() * 100 + 10)
  );

  const [active, setActive] = useState([-1, -1]);
  const [sortedFrom, setSortedFrom] = useState(BARS);

  const iRef = useRef(0);
  const jRef = useRef(0);
  const holdRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setValues((prev) => {
        const arr = [...prev];

        const i = iRef.current;
        const j = jRef.current;

        if (i >= arr.length - 1) {
          // Hold the fully sorted (all lime) state for a beat before reshuffling.
          setActive([-1, -1]);
          setSortedFrom(0);
          if (holdRef.current++ < 28) return prev;

          holdRef.current = 0;
          iRef.current = 0;
          jRef.current = 0;
          setSortedFrom(BARS);

          return Array.from(
            { length: BARS },
            () => Math.random() * 100 + 10
          );
        }

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }

        setActive([j, j + 1]);

        jRef.current++;

        if (jRef.current >= arr.length - 1 - i) {
          jRef.current = 0;
          iRef.current++;
          setSortedFrom(arr.length - iRef.current);
        }

        return arr;
      });
    }, 55);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero_bars">
      {
        values.map((value, index) => (
          <motion.div
            key={index}
            layout
            animate={{
              height: value * 3.3,
              backgroundColor:
                index === active[0] || index === active[1]
                  ? "#ff6a3d"
                  : index >= sortedFrom
                    ? "#34441b"
                    : "#2a2a30",
              boxShadow:
                index === active[0] || index === active[1]
                  ? "0 0 22px rgba(255, 106, 61, 0.55)"
                  : "0 0 0px rgba(255, 106, 61, 0)",
            }}
            transition={{
              duration: 0.12,
              ease: "easeInOut",
            }}
            className="hero_bar"
          />
        ))
      }
    </div>
  );
}

const Hero = () => {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = PHRASES[phraseIndex];
    let timeout;

    if (!isDeleting) {
      timeout = setTimeout(() => {
        const next = current.slice(0, text.length + 1);
        setText(next);

        if (next === current) {
          setTimeout(() => setDeleting(true), 1500);
        }
      }, 70);
    } else {
      timeout = setTimeout(() => {
        const next = current.slice(0, text.length - 1);
        setText(next);

        if (next === "") {
          setDeleting(false);
          setPhraseIndex((i) => (i + 1) % PHRASES.length);
        }
      }, 35);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex]);

  const reduced = useReducedMotion();
  const sectionRef = useRef(null);

  // Feed the cursor position to the spotlight layers without re-rendering.
  const trackSpotlight = (e) => {
    if (e.pointerType !== "mouse") return;
    const rect = sectionRef.current.getBoundingClientRect();
    sectionRef.current.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    sectionRef.current.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const enter = (delay) => (reduced ? {} : rise(delay));

  return (
    <section className="hero" ref={sectionRef} onPointerMove={trackSpotlight}>
      <div className="hero_grid" />
      <div className="hero_grid hero_grid_lit" />

      <SortBars />

      <div className="hero_spot" />

      <div className="hero_content">
        <motion.span className="hero_tag" {...enter(0.05)}>
          O(1) TO O(n²) — VISUALIZED
        </motion.span>

        <motion.h1 className="hero_title" {...enter(0.15)}>
          <span className="typing">{text}</span>
        </motion.h1>

        <motion.p className="hero_description" {...enter(0.3)}>
          A precision lab for sorting, searching, trees, hashing and recursion —
          every comparison, swap and traversal rendered frame by frame.
        </motion.p>

        <motion.div className="hero_actions" {...enter(0.45)}>
          <MagneticLink to="/playground" className="hero_btn hero_btn_primary">
            Open the playground <span aria-hidden="true">→</span>
          </MagneticLink>

          <Link to="/notes" className="hero_btn hero_btn_ghost">
            Read the notes
          </Link>
        </motion.div>

        <motion.p className="hero_stats" {...enter(0.6)}>
          <span><CountUp value={VISUALIZER_COUNT} /> visualizers</span>
          <i />
          <span><CountUp value={CATEGORY_COUNT} /> categories</span>
          <i />
          <span>every step, in code</span>
        </motion.p>
      </div>

      <span className="scroll">scroll</span>
      <motion.span
        className="scroll-arrow"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        ⌄
      </motion.span>
    </section>
  );
}

export default Hero;
