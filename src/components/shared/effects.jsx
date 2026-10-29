import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Lenis from "lenis";

// Fades and lifts its children into place the first time they scroll into view.
export const Reveal = ({ children, delay = 0, as = "div", className, ...rest }) => {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) return <Tag className={className} {...rest}>{children}</Tag>;

  return (
    <Tag
      className={className}
      {...rest}
      initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
};

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  return <motion.div className="scroll-progress" style={{ scaleX }} />;
};

// Lenis smooth scrolling; skipped for reduced-motion users. Also resets the
// scroll position on route changes.
export const SmoothScroll = () => {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ autoRaf: true, lerp: 0.11, anchors: true, allowNestedScroll: true });
    window.__lenis = lenis;

    return () => {
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [reduced]);

  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
