"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface LineageCard {
  kingName: string;
  queenName: string;
  kingField: string;
  queenField: string;
  kingImage: string;
  isKing: boolean;
}

const LINEAGE_DATA: LineageCard[] = [
  {
    kingName: "Olubaseyi Damilare",
    queenName: "Tobiloba Oluwole",
    kingField: "Mathematics",
    queenField: "Theater Arts",
    kingImage: "/Images-Carousels/IMG_4798.PNG",
    isKing: true,
  },
  {
    kingName: "Adegbenro Daniel Adebayo",
    queenName: "Onuoha Marvellous Chidinma",
    kingField: "European Studies",
    queenField: "Special Education",
    kingImage: "/Images-Carousels/IMG_4796.PNG",
    isKing: false,
  },
  {
    kingName: "Anthony Jasper Laris",
    queenName: "Oshinyemi Promise Ogoluwa",
    kingField: "M.R UI",
    queenField: "Arts & Social Sciences",
    kingImage: "/Images-Carousels/IMG_4793.PNG",
    isKing: false,
  },
  {
    kingName: "Anthony Jasper Laris",
    queenName: "Oshinyemi Promise Ogoluwa",
    kingField: "M.R UI",
    queenField: "Arts & Social Sciences",
    kingImage: "/Images-Carousels/image7.png",
    isKing: false,
  },
  {
    kingName: "Class of 2020",
    queenName: "Class of 2020",
    kingField: "Mr. & Mrs. UI",
    queenField: "Mr. & Mrs. UI",
    kingImage: "/Images-Carousels/image0.png",
    isKing: false,
  }
];

export function TheLineageSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (autoScrollRef.current) clearTimeout(autoScrollRef.current);
      return;
    }

    const autoScroll = () => {
      setDirection("next");
      setCurrentIndex((prev) => (prev + 1) % LINEAGE_DATA.length);
    };

    autoScrollRef.current = setInterval(autoScroll, 3900);

    return () => {
      if (autoScrollRef.current) clearTimeout(autoScrollRef.current);
    };
  }, [isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const handleDotClick = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? "next" : "prev");
    setCurrentIndex(index);
  };

  const currentCard = LINEAGE_DATA[currentIndex];

  return (
    <section id="the-lineage">
      <div className="lineage-particles" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="lineage-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      <div className="lineage-content">
        <p className="section-label reveal">Chapter — The Lineage</p>
        <h2 className="chapter-title reveal reveal-delay-1">
          Every Crown Leaves a <em>Shadow</em>
        </h2>
        <p className="chapter-body reveal reveal-delay-2" style={{ maxWidth: "700px", marginBottom: "4rem" }}>
          The legacy of those who wore the crown before. Each year, a new story. Each reign, a lasting mark.
        </p>

        <div
          className="lineage-carousel reveal"
          ref={carouselRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="lineage-carousel-track">
            <article key={`card-${currentIndex}`} className={`lineage-card lineage-card-${direction}`}>

              <div className="lineage-image-full">
                <Image
                  src={currentCard.isKing ? currentCard.kingImage : currentCard.kingImage}
                  alt={currentCard.isKing ? currentCard.kingName : currentCard.kingName}
                  fill
                  className="portrait-image-full"
                  priority
                />
                <div className="lineage-overlay" />
              </div>
            </article>
          </div>

          <div className="lineage-indicators">
            {LINEAGE_DATA.map((_, index) => (
              <button
                key={index}
                className={`lineage-dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="lineage-pause-indicator" style={{ opacity: isPaused ? 1 : 0 }}>
            ⏸ PAUSED
          </div>
        </div>
      </div>
    </section>
  );
}
