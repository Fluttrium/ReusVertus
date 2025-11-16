"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

type Look = {
  id: number;
  title: string;
  file: string;
  hoverFile?: string;
};

type LookbookGridProps = {
  looks: Look[];
};

const buildImageSrc = (filename: string) => `/lookbook/${encodeURIComponent(filename)}`;

export default function LookbookGrid({ looks }: LookbookGridProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const handleTouchStart = useCallback((id: number) => {
    setActiveId(id);
  }, []);

  const resetActive = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
      {looks.map((look, index) => {
        const isActive = activeId === look.id;
        const primarySrc = buildImageSrc(look.file);
        const secondarySrc = buildImageSrc(look.hoverFile ?? look.file);

        return (
          <div
            key={look.id}
            className="relative aspect-[3/4] overflow-hidden rounded-lg bg-bg-2 group"
            onTouchStart={() => handleTouchStart(look.id)}
            onTouchEnd={resetActive}
            onTouchCancel={resetActive}
            onMouseLeave={resetActive}
          >
            <Image
              src={primarySrc}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              priority={index < 2}
              className={`object-cover transition-transform duration-500 ${
                isActive ? "scale-105" : ""
              } group-hover:scale-110`}
            />
            <Image
              src={secondarySrc}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className={`object-cover absolute inset-0 transition-all duration-500 opacity-0 scale-105 ${
                isActive ? "opacity-100 scale-110" : ""
              } group-hover:opacity-100 group-hover:scale-110`}
            />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span
                className={`text-white uppercase tracking-[0.2em] text-sm transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0"
                } group-hover:opacity-100`}
              >
                {look.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

