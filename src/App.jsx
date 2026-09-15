import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeatureCards from "./components/FeatureCards";
import WordOfDay from "./components/BottomSection";
import CTASection from "./components/CTASection";
import LandingStatsCard from "./components/LandingStatsCard";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/ToastContext";
import Fiszki from "./pages/Fiszki";
import Talia from "./pages/Talia";
import Gramatyka from "./pages/Gramatyka";
import Czas from "./pages/Czas";
import Witaj from "./pages/Witaj";
import Statystyki from "./pages/Statystyki";
import WelcomeGate from "./components/WelcomeGate";
import "./index.css";

function ScrolNaGore() {
  const { pathname } = useLocation();
  // console.log("nav:", pathname);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Strona() {
  return (
    <>
      <HeroSection />
      <WordOfDay />
      <FeatureCards />
      <LandingStatsCard />
      <CTASection />
    </>
  );
}

export default function App() {
  const [ciemny, setCiemny] = useState(true);

  useEffect(() => {
    const zapis = localStorage.getItem("theme");
    if (zapis === "light") setCiemny(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", ciemny);
    localStorage.setItem("theme", ciemny ? "dark" : "light");
  }, [ciemny]);

  return (
    <ToastProvider>
      <BrowserRouter>
        <ScrolNaGore />
        <div className={ciemny ? "dark" : ""}>
          <div className="min-h-screen bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
            <Navbar dark={ciemny} setDark={setCiemny} />
            <main className="relative pt-28 pb-32 min-h-[calc(100vh-8rem)] max-w-4xl mx-auto px-4">
              <Routes>
                <Route path="/" element={<Strona />} />
                <Route path="/witaj" element={<Witaj />} />
                <Route path="/statystyki" element={<WelcomeGate><Statystyki /></WelcomeGate>} />
                <Route path="/fiszki" element={<WelcomeGate><Fiszki /></WelcomeGate>} />
                <Route path="/fiszki/:deck" element={<WelcomeGate><Talia /></WelcomeGate>} />
                <Route path="/gramatyka" element={<WelcomeGate><Gramatyka /></WelcomeGate>} />
                <Route path="/gramatyka/:tense" element={<WelcomeGate><Czas /></WelcomeGate>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
