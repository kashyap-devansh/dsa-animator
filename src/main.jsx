import { BrowserRouter } from "react-router-dom";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import "./styles/fonts.css";
import "lenis/dist/lenis.css";
import "./styles/effects.css";
import { ScrollProgress, SmoothScroll } from "./components/shared/effects.jsx";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SmoothScroll />
      <ScrollProgress />
      <App />
    </BrowserRouter>
  </StrictMode>,
);
