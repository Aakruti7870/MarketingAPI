import React from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function chunk(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) result.push(array.slice(i, i + size));
  return result;
}

export function ThreeDMarquee({ images, className = "" }) {
  const columns = chunk(images, Math.ceil(images.length / 4));
  return (
    <div className={cn("three-d-marquee", className)}>
      <div className="three-d-marquee-grid">
        {columns.map((column, columnIndex) => (
          <div
            className="three-d-marquee-column"
            data-direction={columnIndex % 2 === 0 ? "up" : "down"}
            key={columnIndex}
          >
            {[...column, ...column].map((src, index) => (
              <div className="three-d-marquee-card" key={`${columnIndex}-${index}`}>
                <img src={src} alt="" loading={index < column.length ? "eager" : "lazy"} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="three-d-marquee-vignette" aria-hidden="true" />
    </div>
  );
}
