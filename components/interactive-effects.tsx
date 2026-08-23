"use client";

import { useEffect } from "react";

export function InteractiveEffects() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const orbOne = document.querySelector<HTMLElement>(".orb-1");
    const orbTwo = document.querySelector<HTMLElement>(".orb-2");
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(".reveal, .timeline-item"));

    if (prefersReducedMotion) {
      revealTargets.forEach((element) => element.classList.add("visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    revealTargets.forEach((element) => observer.observe(element));

    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (orbOne) {
        orbOne.style.transform = `translateY(${scrollY * 0.3}px)`;
      }

      if (orbTwo) {
        orbTwo.style.transform = `translateY(${-scrollY * 0.2}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return null;
}
