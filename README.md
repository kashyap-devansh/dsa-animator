# DSA/Animator

**Watch algorithms think.**

DSA/Animator is an interactive, code-synced visualizer for data structures and algorithms. It doesn't just animate an abstract box-and-arrow diagram — it runs the actual algorithm, step by step, next to the real source code, and highlights the exact line being executed at every frame. You scrub through execution like a video: step forward, step back, play, pause, change speed, or reshuffle the input and watch it happen again.

> "An algorithm is not a paragraph of pseudocode. It is motion — a sequence of decisions made visible."

---

## Why this exists

Most DSA visualizer sites fall into one of two camps:

- **Pure animation, no code** — you watch bars swap or nodes move, but you never see *why*, because the code is nowhere on screen.
- **Pure code, no animation** — a static code block with a paragraph explaining what it does, and you're left to simulate the execution in your head.

DSA/Animator refuses to pick one. Every visualizer is built from three things running in lockstep: the **data** (the array, list, stack, tree...), the **code** (real, syntax-highlighted source, not pseudocode), and the **narration** (a plain-English description of what just happened and why). Step through an execution and all three move together — the highlighted code line, the animated state, and the explanation always agree.

## What makes it different

| | DSA/Animator | Typical DSA visualizer sites |
|---|---|---|
| **Code visibility** | Real source code on screen, with the active line highlighted as it executes | Usually hidden, or shown once as a static block |
| **Playback control** | Step forward / step back / play / pause / adjustable speed, like a video scrubber | Often play-only, or a single "next step" button with no going back |
| **Live metrics** | Comparisons, swaps, and other counters update in real time as you step through | Rarely shown, or only shown at the end |
| **Input control** | Reshuffle/randomize the input and immediately re-run the same visualization | Frequently fixed, canned examples |
| **Explanations** | Every step carries a human-readable description of the decision just made | Often missing, or limited to a one-time write-up above the animation |
| **Design & feel** | A single, deliberately designed product — consistent motion, typography, and layout across every page | Frequently a grab-bag of pages with inconsistent styling bolted on over the years |
| **Learning companion** | Pairs each topic with scanned, handwritten notebook notes you can flip through or open as a PDF | Rarely offered |

The goal isn't to be "another visualizer" — it's to be the one you'd actually want to learn from the night before an interview or exam, where seeing the code execute *is* the explanation.

## Features

- **Step-accurate execution** — every algorithm is instrumented to record a full timeline of steps (state snapshot, active code line, description, running stats), so playback is exact and reversible, not approximated.
- **Full transport controls** — reset, step back, step forward, play/pause, and a speed dial, built on a shared `usePlayback` hook so every visualizer behaves identically.
- **Synced code panel** — real, syntax-highlighted implementation code with the currently executing line highlighted, so you can connect the animation back to the exact statement that caused it.
- **Shuffle & re-run** — generate a new random input and watch the same algorithm handle a different case, instantly.
- **Live complexity & stats** — time/space complexity shown up front, with live counters (comparisons, swaps, merges, recursive calls, etc.) while you step through.
- **A growing playground** of structures and algorithms, organized by category:
  - **Sorting** — Bubble, Selection, Insertion, Merge, Quick, Radix Sort
  - **Searching** — Linear Search, Binary Search
  - **Linked List** — insert/delete at head, tail, and arbitrary position
  - **Stack** — push, pop
  - **Queue** — enqueue, dequeue
  - **Recursion** — Tower of Hanoi
  - More structures (Binary Search Trees) and algorithms (Jump/Interpolation/Exponential/Fibonacci Search, Factorial, Fibonacci, Permutations, Subset Sum, N-Queens) are actively in development — visible in the playground as upcoming topics.
- **Notes companion** — a scanned, handwritten notebook paired with the algorithms, browsable page by page or downloadable as a PDF, for review away from the screen.
- **A real landing experience** — not just a tool bolted onto a blank page: a motion-driven hero, a manifesto, a visual library preview, and a gallery, all built with smooth, physics-based scrolling.

## Tech stack

- **[React 19](https://react.dev/)** + **[Vite](https://vitejs.dev/)** — fast dev server, instant HMR
- **[React Router](https://reactrouter.com/)** — client-side routing for every playground page
- **[Framer Motion](https://www.framer.com/motion/)** — all transitions, scroll-driven effects, and page animations
- **[Lenis](https://github.com/darkroomengineering/lenis)** — smooth-scroll on the landing page
- **[pdfjs-dist](https://mozilla.github.io/pdf.js/)** — in-browser rendering of the notes PDFs
- **[Oxlint](https://oxc.rs/)** — fast linting

## Getting started

```bash
# clone the repo
git clone https://github.com/kashyap-devansh/dsa-animator.git
cd dsa-animator

# install dependencies
npm install

# start the dev server
npm run dev
```

Other scripts:

```bash
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint       # run oxlint
```

## Project structure

```
src/
├── App.jsx                     # routes
├── components/                 # landing page sections (Hero, Gallery, Manifesto, Notes, ...)
├── Playground/
│   ├── PlaygroundHero/         # /playground landing — links into every category
│   ├── Algorithms/
│   │   ├── Sorting/            # Bubble, Selection, Insertion, Merge, Quick, Radix
│   │   └── Searching/          # Linear, Binary
│   ├── Structures/
│   │   ├── LinkedList/         # insert/delete at head, tail, position
│   │   ├── Stack/               # push, pop
│   │   ├── Queue/                # enqueue, dequeue
│   │   └── BST/                  # in progress
│   ├── Recursion/              # Tower of Hanoi
│   └── shared/                 # usePlayback, icons, CategoryGrid, random helpers
└── styles/                     # shared fonts/tokens
```

Each algorithm page is self-contained: it owns its step-generation logic, its own code panel, and its own stat tracking, but shares the same playback engine and control icons as every other page — so new visualizers plug into the same proven interaction model instead of reinventing it.

## Roadmap

- [ ] Binary Search Trees (insert, delete, traversal, rotation)
- [ ] Graph traversal (BFS, DFS)
- [ ] Jump / Interpolation / Exponential / Fibonacci Search
- [ ] Recursion: Factorial, Fibonacci, Permutations, Subset Sum, N-Queens
- [ ] Dynamic programming visualizations (knapsack, LCS, edit distance)

## Contributing

Issues and pull requests are welcome. If you're adding a new visualizer, follow the pattern in `src/Playground/shared` (`usePlayback`, `icons`, `CategoryGrid`) so it stays consistent with the rest of the playground.

## Author

Built by [Devansh Kashyap](https://github.com/kashyap-devansh).
