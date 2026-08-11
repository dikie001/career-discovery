import React from "react";

export function KenyaFlag({ className = "w-5 h-3.5 inline-block shrink-0 rounded-[2px] shadow-xs border border-black/10 overflow-hidden" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" aria-label="Kenyan Flag">
      <rect width="900" height="600" fill="#006600" />
      <rect width="900" height="400" fill="#FFFFFF" />
      <rect width="900" height="360" fill="#BB0000" />
      <rect width="900" height="180" fill="#000000" />
      {/* Maasai Shield and Spears */}
      <g transform="translate(450, 300) scale(1.1)">
        {/* Crossed spears */}
        <path d="M-190,-190 L190,190 M-190,190 L190,-190" stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round" />
        <path d="M-190,-190 L190,190 M-190,190 L190,-190" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
        {/* Shield contour */}
        <path d="M0,-140 C-70,-100 -70,100 0,140 C70,100 70,-100 0,-140 Z" fill="#BB0000" stroke="#FFFFFF" strokeWidth="10" />
        {/* Shield center features */}
        <path d="M-30,-80 C-45,-40 -45,40 -30,80 C-10,80 -10,-80 -30,-80 Z" fill="#000000" />
        <path d="M30,-80 C45,-40 45,40 30,80 C10,80 10,-80 30,-80 Z" fill="#000000" />
        <ellipse cx="0" cy="0" rx="12" ry="30" fill="#FFFFFF" />
        <ellipse cx="-35" cy="0" rx="6" ry="15" fill="#FFFFFF" />
        <ellipse cx="35" cy="0" rx="6" ry="15" fill="#FFFFFF" />
      </g>
    </svg>
  );
}
