import React from "react";

const SIZE_CLASSES = {
  nav: "h-[76px] w-[76px] sm:h-[84px] sm:w-[84px]",
  sidebar: "h-[80px] w-[80px]",
  auth: "h-[150px] w-[150px]",
  mobile: "h-[96px] w-[96px]",
};

export default function BrandLogo({ size = "nav", className = "" }) {
  return (
    <img
      src="/gold-e-ai-logo-2026.webp"
      alt="GOLD-e AI — AI Revenue Engine"
      draggable="false"
      className={`block shrink-0 select-none object-contain object-center ${SIZE_CLASSES[size] || SIZE_CLASSES.nav} ${className}`}
      style={{ background: "transparent", border: 0, boxShadow: "none" }}
    />
  );
}
