import React, { useState, useEffect } from "react";

export default function Slider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    "/slider1.jpg",
    "/slider2.jpg",
    "/slider3.jpg",
    "/slider4.jpg",
  ];

  useEffect(() => {
    const changeSlide = setInterval(() => {
      setActiveSlide((slide) => (slide < slides.length - 1 ? slide + 1 : 0));
    }, 3000);
    return () => clearInterval(changeSlide);
  }, [slides.length]);

  return (
    <section className="py-10 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700">
      {slides.length > 0 && (
        <img
          src={slides[activeSlide]}
          alt="Clinic presentation"
          className="mx-auto rounded-xl shadow-lg w-full max-w-4xl h-[400px] object-cover"
        />
      )}
    </section>
  );
}

