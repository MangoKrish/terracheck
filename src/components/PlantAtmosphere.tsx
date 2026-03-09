"use client";

import { useEffect, useState } from "react";

type PlantTone = "grass" | "leaf" | "moss" | "forest";

type PlantFrond = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  tone: PlantTone;
};

const FRONDS: PlantFrond[] = [
  { id: 1, x: 0.08, y: 0.2, size: 230, rotation: -18, tone: "forest" },
  { id: 2, x: 0.2, y: 0.78, size: 260, rotation: -6, tone: "grass" },
  { id: 3, x: 0.38, y: 0.14, size: 180, rotation: 14, tone: "moss" },
  { id: 4, x: 0.5, y: 0.64, size: 220, rotation: -22, tone: "forest" },
  { id: 5, x: 0.67, y: 0.26, size: 210, rotation: 20, tone: "leaf" },
  { id: 6, x: 0.82, y: 0.72, size: 260, rotation: 8, tone: "grass" },
  { id: 7, x: 0.93, y: 0.18, size: 190, rotation: 24, tone: "moss" },
];

export default function PlantAtmosphere() {
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      setCursor({
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
        active: true,
      });
    };

    const handleLeave = () => {
      setCursor((prev) => ({ ...prev, active: false }));
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div className="plant-atmosphere" aria-hidden>
      <div className="plant-soft-vignette" />
      {FRONDS.map((frond) => {
        const distance = Math.hypot(cursor.x - frond.x, cursor.y - frond.y);
        const proximity = cursor.active ? Math.max(0, 1 - distance / 0.42) : 0;
        const opacity = 0.06 + proximity * 0.24;
        const scale = 1 + proximity * 0.2;
        const driftX = (cursor.x - frond.x) * proximity * 22;
        const driftY = (cursor.y - frond.y) * proximity * 22;

        return (
          <span
            key={frond.id}
            className={`plant-frond plant-${frond.tone}`}
            style={{
              left: `${frond.x * 100}%`,
              top: `${frond.y * 100}%`,
              width: `${frond.size}px`,
              height: `${frond.size * 1.26}px`,
              opacity,
              transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) rotate(${frond.rotation}deg) scale(${scale})`,
            }}
          />
        );
      })}
      <span
        className="plant-cursor-glow"
        style={{
          left: `${cursor.x * 100}%`,
          top: `${cursor.y * 100}%`,
          opacity: cursor.active ? 0.24 : 0,
        }}
      />
      <div className="plant-grain" />
    </div>
  );
}
