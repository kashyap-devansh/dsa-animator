import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./Hero.css";

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

  const iRef = useRef(0);
  const jRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setValues((prev) => {
        const arr = [...prev];

        const i = iRef.current;
        const j = jRef.current;

        if (i >= arr.length - 1) {
          iRef.current = 0;
          jRef.current = 0;

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
        }

        return arr;
      });
    }, 55);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero__bars">
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
                  : "#2d2d31",
            }}
            transition={{
              duration: 0.12,
              ease: "easeInOut",
            }}
            className="hero__bar"
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

  return (
    <section className="hero">
      <div className="hero__grid" />

      <SortBars />

      <div className="hero__content">
        <span className="hero__tag">
          O(1) TO O(n²) — VISUALIZED
        </span>

        <h1 className="hero__title">
          <span className="typing">{text}</span>
        </h1>

        <p className="hero__description">
          A precision lab for sorting, searching, tree and graph algorithms —
          every comparison, swap and traversal rendered frame by frame.
        </p>
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
