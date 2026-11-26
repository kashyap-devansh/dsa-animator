import { useState } from "react";
import TopNav from "./TopNav";
import CourseSidebar from "./CourseSidebar";
import "./Shell.css";

// Learn layout: top bar, course outline on the left, the lesson on the right.
export const CourseShell = ({ children }) => {
  const [menu, setMenu] = useState(false);

  return (
    <div className="shell shell-course">
      <TopNav onMenu={() => setMenu(true)} />
      <div className="shell-body">
        <CourseSidebar open={menu} onClose={() => setMenu(false)} />
        <main className="shell-main">{children}</main>
      </div>
    </div>
  );
};

// Every other page: the same top bar over a full-width page.
export const PageShell = ({ children }) => (
  <div className="shell shell-page">
    <TopNav />
    <main className="shell-page-main page-main">{children}</main>
  </div>
);
