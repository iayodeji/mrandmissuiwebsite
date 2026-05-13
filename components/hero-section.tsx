"use client";

import { useEffect, useState } from "react";

const TAGLINE_WORDS = ["Where", "brilliance", "meets", "grace"] as const;

const DUST_PARTICLES = [
  { left: 8, top: 78, size: 2, delay: 0, duration: 14, opacity: 0.55 },
  { left: 16, top: 84, size: 1.5, delay: 1.8, duration: 16, opacity: 0.45 },
  { left: 24, top: 72, size: 2.5, delay: 0.9, duration: 18, opacity: 0.5 },
  { left: 34, top: 88, size: 1.8, delay: 2.6, duration: 15, opacity: 0.4 },
  { left: 42, top: 80, size: 2.2, delay: 1.2, duration: 17, opacity: 0.52 },
  { left: 50, top: 86, size: 1.4, delay: 3.1, duration: 19, opacity: 0.35 },
  { left: 58, top: 76, size: 2.4, delay: 0.4, duration: 15.5, opacity: 0.48 },
  { left: 66, top: 90, size: 1.7, delay: 2.2, duration: 18.5, opacity: 0.42 },
  { left: 74, top: 82, size: 2, delay: 1.5, duration: 16.5, opacity: 0.5 },
  { left: 82, top: 88, size: 1.6, delay: 2.9, duration: 17.5, opacity: 0.38 },
  { left: 88, top: 74, size: 2.3, delay: 0.7, duration: 19.5, opacity: 0.46 },
  { left: 94, top: 86, size: 1.5, delay: 1.9, duration: 16.8, opacity: 0.34 },
] as const;

const EVENT_DATE = new Date("2026-12-12T18:00:00+01:00");
const DAY_IN_MS = 1000 * 60 * 60 * 24;

function getDaysUntilEvent() {
  return Math.max(0, Math.ceil((EVENT_DATE.getTime() - Date.now()) / DAY_IN_MS));
}

export function HeroSection() {
  const [daysUntilEvent, setDaysUntilEvent] = useState(() => getDaysUntilEvent());

  useEffect(() => {
    const updateDaysUntilEvent = () => setDaysUntilEvent(getDaysUntilEvent());

    updateDaysUntilEvent();
    const timerId = window.setInterval(updateDaysUntilEvent, 60_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return undefined;
    }

    const heroBackground = document.querySelector<HTMLElement>(".hero-bg");
    const crown = document.querySelector<HTMLElement>(".crown-container");

    if (!heroBackground || !crown) {
      return undefined;
    }

    let frameId = 0;

    const updateParallax = () => {
      const scrollY = window.scrollY;

      heroBackground.style.transform = `translate3d(0, ${scrollY * 0.08}px, 0) scale(1.03)`;
      crown.style.transform = `translate3d(0, ${scrollY * 0.18}px, 0)`;
      frameId = 0;
    };

    const handleScroll = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateParallax);
      }
    };

    updateParallax();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section id="hero">
      <div className="hero-bg" />
      <div className="stars" />
      <div className="hero-dust" aria-hidden="true">
        {DUST_PARTICLES.map((particle, index) => (
          <span
            className="dust-particle"
            key={`${particle.left}-${particle.top}-${index}`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="crown-container">
        <svg className="crown-svg" width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M5 50 L15 20 L30 38 L40 5 L50 38 L65 20 L75 50 Z" stroke="#C9A84C" strokeWidth="1.5" fill="none" />
          <path d="M5 50 L75 50" stroke="#C9A84C" strokeWidth="1.5" />
          <circle cx="40" cy="5" r="3" fill="#E8C97A" />
          <circle cx="15" cy="20" r="2" fill="#C9A84C" />
          <circle cx="65" cy="20" r="2" fill="#C9A84C" />
          <circle cx="5" cy="50" r="2" fill="#C9A84C" />
          <circle cx="75" cy="50" r="2" fill="#C9A84C" />
        </svg>
      </div>

      <p className="hero-eyebrow">University of Ibadan &nbsp;·&nbsp; 2026</p>

      <h1 className="hero-title">
        <em>Mr and Miss</em>
        <span className="line-2">Unibadan</span>
      </h1>

      <div className="hero-divider" />

      <p className="hero-sub" aria-label="Where brilliance meets grace">
        {TAGLINE_WORDS.map((word, index) => (
          <span
            className="hero-sub-word"
            key={word}
            style={{ animationDelay: `${index * 0.22}s` }}
          >
            {word}
          </span>
        ))}
      </p>

      <div className="hero-cta">
        <a className="btn-gold" href="#chapter-1">Enter the Story</a>
        <a className="btn-ghost" href="#chapter-4">The Event</a>
      </div>

      <p className="hero-countdown" aria-live="polite">
        <span className="hero-countdown-days">{daysUntilEvent}</span>
        <span className="hero-countdown-label">days until the event</span>
      </p>

      <div className="scroll-hint">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}