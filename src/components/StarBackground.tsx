import React from 'react';

export const StarBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep space base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,27,75,0.4),rgba(5,8,20,0.95))]" />

      {/* Subtle nebula glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[300px] bg-sky-500/8 rounded-full blur-[100px]" />
      <div className="absolute top-2/3 right-1/4 w-[500px] h-[320px] bg-violet-600/10 rounded-full blur-[110px]" />

      {/* Starfield overlay pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Crisp subtle stars */}
        <circle cx="5%" cy="12%" r="1" fill="#93c5fd" opacity="0.8" />
        <circle cx="12%" cy="28%" r="1.5" fill="#ffffff" opacity="0.9" />
        <circle cx="18%" cy="8%" r="1" fill="#c4b5fd" opacity="0.6" />
        <circle cx="24%" cy="42%" r="1.2" fill="#ffffff" opacity="0.7" />
        <circle cx="31%" cy="19%" r="1" fill="#7dd3fc" opacity="0.8" />
        <circle cx="38%" cy="65%" r="1.5" fill="#ffffff" opacity="0.75" />
        <circle cx="45%" cy="14%" r="1.2" fill="#c4b5fd" opacity="0.85" />
        <circle cx="52%" cy="33%" r="1" fill="#ffffff" opacity="0.6" />
        <circle cx="58%" cy="78%" r="1.5" fill="#7dd3fc" opacity="0.8" />
        <circle cx="65%" cy="22%" r="1" fill="#ffffff" opacity="0.9" />
        <circle cx="72%" cy="48%" r="1.2" fill="#93c5fd" opacity="0.7" />
        <circle cx="79%" cy="11%" r="1.5" fill="#ffffff" opacity="0.85" />
        <circle cx="85%" cy="37%" r="1" fill="#c4b5fd" opacity="0.75" />
        <circle cx="91%" cy="62%" r="1.2" fill="#ffffff" opacity="0.6" />
        <circle cx="96%" cy="18%" r="1" fill="#7dd3fc" opacity="0.8" />
        <circle cx="8%" cy="75%" r="1.2" fill="#ffffff" opacity="0.7" />
        <circle cx="16%" cy="88%" r="1" fill="#93c5fd" opacity="0.85" />
        <circle cx="27%" cy="92%" r="1.5" fill="#ffffff" opacity="0.65" />
        <circle cx="48%" cy="85%" r="1" fill="#c4b5fd" opacity="0.7" />
        <circle cx="63%" cy="91%" r="1.2" fill="#ffffff" opacity="0.8" />
        <circle cx="82%" cy="82%" r="1.5" fill="#7dd3fc" opacity="0.75" />
        <circle cx="93%" cy="94%" r="1" fill="#ffffff" opacity="0.6" />
      </svg>
    </div>
  );
};
