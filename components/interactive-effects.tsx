"use client";

import { useEffect } from "react";

export function InteractiveEffects() {
  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cursor = document.getElementById("cursor");
    const ring = document.getElementById("cursor-ring");
    const orbOne = document.querySelector<HTMLElement>(".orb-1");
    const orbTwo = document.querySelector<HTMLElement>(".orb-2");
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(".reveal, .timeline-item"));

    if (prefersReducedMotion) {
      revealTargets.forEach((element) => element.classList.add("visible"));
      return undefined;
    }

    let frameId = 0;
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    const handleMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const animateCursor = () => {
      if (cursor && ring && isFinePointer) {
        cursor.style.left = `${mouseX - 6}px`;
        cursor.style.top = `${mouseY - 6}px`;
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = `${ringX - 18}px`;
        ring.style.top = `${ringY - 18}px`;
      }

      frameId = window.requestAnimationFrame(animateCursor);
    };

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

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    animateCursor();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return null;
}