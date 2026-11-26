import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import searchIndex from "../../Playground/shared/searchIndex.js";
import IsoArray from "../../iso/IsoArray";
import StageGrid from "../../lesson/StageGrid";
import { FIRST_LESSON } from "../../course/course";
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

// Kept to about the same length so each one fits on a single line.
const PHRASES = [
  "Watch it think.",
  "See every swap.",
  "Feel recursion.",
  "Step through it.",
];

// Bubble sort on an isometric slab, looping: the hero's centrepiece.
function buildFrames() {
  const arr = Array.from({ length: 12 }, () => 10 + Math.floor(Math.random() * 90));
  const items = arr.map((v, id) => ({ id, v }));
  const frames = [];
  for (let i = 0; i < items.length - 1; i++) {
    for (let j = 0; j < items.length - 1 - i; j++) {
      frames.push({ items: [...items], cmp: [j, j + 1], sorted: items.length - i });
      if (items[j].v > items[j + 1].v) {
        [items[j], items[j + 1]] = [items[j + 1], items[j]];
        frames.push({ items: [...items], cmp: [j, j + 1], swap: true, sorted: items.length - i });
      }
    }
  }
  frames.push({ items: [...items], cmp: [], sorted: 0 });
  return frames;
}

function HeroSort() {
  const reduced = useReducedMotion();
  const [run, setRun] = useState(() => ({ frames: buildFrames(), i: 0 }));

  useEffect(() => {
    if (reduced) return;
    const last = run.i >= run.frames.length - 1;
    const t = setTimeout(() => setRun((r) => (last ? { frames: buildFrames(), i: 0 } : { ...r, i: r.i + 1 })), last ? 2400 : 380);
    return () => clearTimeout(t);
  }, [run, reduced]);

  const f = run.frames[reduced ? run.frames.length - 1 : run.i];
  const cells = f.items.map((item, k) => ({
    id: item.id,
    value: item.v,
    tone: f.cmp.includes(k) ? (f.swap ? "amber" : "coral") : k >= f.sorted ? "sage" : "idle",
    lift: f.cmp.includes(k) ? (f.swap ? 0.5 : 0.3) : 0,
  }));
  const callouts = f.cmp.length
    ? [{ index: f.cmp[1], text: f.swap ? "swap" : `${f.items[f.cmp[0]].v} vs ${f.items[f.cmp[1]].v}`, small: true }]
    : [{ index: f.items.length - 1, text: "sorted", tone: "sage", small: true }];

  return <IsoArray cells={cells} slots={f.items.length} heights="value" maxValue={100} callouts={callouts} label="Bubble sort running" />;
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

  const enter = (delay) => (reduced ? {} : rise(delay));

  return (
    <section className="hero" ref={sectionRef}>
      <StageGrid />

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
          <MagneticLink to={FIRST_LESSON} className="hero_btn hero_btn_primary">
            Start learning <span aria-hidden="true">→</span>
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

      <div className="hero_stage">
        <HeroSort />
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
