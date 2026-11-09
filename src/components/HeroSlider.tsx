"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Award, Zap, BookOpen } from "lucide-react";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const slides: Slide[] = [
    {
      image: "/images/school_image.jpg",
      title: "Zilla Parishad High School",
      subtitle: "Nurturing academic excellence, modern digital infrastructure, and value-based education in Somasanigunta, Andhra Pradesh.",
      badge: "Welcome to ZPHS Somasanigunta",
      icon: <Award size={18} />,
    },
    {
      image: "/images/ifp-friendly.png",
      title: "Interactive Flat Panels",
      subtitle: "5 digital classrooms equipped with state-of-the-art interactive flat panels for audio-visual learning.",
      badge: "Digital Classrooms",
      icon: <Zap size={18} />,
    },
    {
      image: "/images/science-friendly.jpg",
      title: "Science Laboratory",
      subtitle: "Well-equipped lab containing physical and biological science apparatuses to nurture discovery.",
      badge: "Practical Learning",
      icon: <Award size={18} />,
    },
    {
      image: "/images/math-friendly.jpg",
      title: "Mathematics Lab",
      subtitle: "Interactive geometrical shapes and teaching kits helping students conceptualize core mathematics.",
      badge: "Concept Laboratory",
      icon: <BookOpen size={18} />,
    },
    {
      image: "/images/library-friendly.jpg",
      title: "School Library",
      subtitle: "A digital and physical repository of over 1,250 academic books, reference guides, and journals.",
      badge: "Knowledge Repository",
      icon: <BookOpen size={18} />,
    },
    {
      image: "/images/sports-friendly.jpg",
      title: "Sports & Physical Education",
      subtitle: "Spacious playground with facilities for Kabaddi, Kho-Kho, Volleyball, Chess, and Carroms.",
      badge: "Physical Excellence",
      icon: <Award size={18} />,
    },
  ];

  // Auto scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="carousel-wrapper no-print">
      {/* Slide Content */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: idx === current ? 1 : 0,
            visibility: idx === current ? "visible" : "hidden",
            transition: "opacity 0.8s ease, visibility 0.8s ease",
            zIndex: idx === current ? 2 : 1,
          }}
        >
          {/* Slide Image */}
          <img
            src={slide.image}
            alt={slide.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.35)",
            }}
          />

          {/* Slider Caption Overlay */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "5%",
              transform: "translateY(-50%)",
              maxWidth: "600px",
              color: "white",
              zIndex: 3,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#10b981",
                padding: "0.4rem 0.8rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "1rem",
              }}
            >
              {slide.icon} {slide.badge}
            </div>
            <h2
              style={{
                color: "white",
                fontSize: "2.5rem",
                fontWeight: "800",
                marginBottom: "1rem",
                lineHeight: "1.2",
              }}
            >
              {slide.title}
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: "1.6",
                opacity: 0.9,
              }}
            >
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Slide Navigation Controls */}
      <button
        onClick={handlePrev}
        style={{
          position: "absolute",
          left: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: "rgba(15, 23, 42, 0.5)",
          border: "none",
          color: "white",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)")}
        onMouseOut={(e) => (e.currentTarget.style.background = "rgba(15, 23, 42, 0.5)")}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={handleNext}
        style={{
          position: "absolute",
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: "rgba(15, 23, 42, 0.5)",
          border: "none",
          color: "white",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)")}
        onMouseOut={(e) => (e.currentTarget.style.background = "rgba(15, 23, 42, 0.5)")}
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots list indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          zIndex: 10,
        }}
      >
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: idx === current ? "#10b981" : "rgba(255, 255, 255, 0.4)",
              border: "none",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
