import React from 'react';

export default function ShareMealLogo({ isDonor, className = "h-16 w-16" }) {
  // Premium tech glow colors
  const glowColor = isDonor ? "#05E69C" : "#FF3366";
  const coreColor = isDonor ? "#10B981" : "#FF6B35";
  
  return (
    <svg 
      className={`${className} transition-all duration-1000 ease-in-out cursor-pointer hover:scale-110 drop-shadow-2xl`} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0px 0px 14px ${glowColor}40)` }}
    >
      <defs>
        {/* DONOR: Sustainable Emerald Network */}
        <linearGradient id="donorSM" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#05E69C" />
          <stop offset="100%" stopColor="#00A97F" />
        </linearGradient>

        {/* RECEIVER: Urgent Plasma Energy */}
        <linearGradient id="receiverSM" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3366" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>

        {/* HIGH-FIDELITY NEON BLOOM */}
        <filter id="smBloom" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* THE SINGLE CONTINUOUS PATH (The S-M Monogram)
        1. Draws the 'S'
        2. Touches the center
        3. Draws the right peak of the 'M'
        4. Sweeps under to form the Bowl
        5. Draws the left peak of the 'M'
        6. Lands back at the center
      */}
      <path 
        id="sm-path"
        d="M 65 15 C 45 5, 30 25, 50 40 C 65 50, 60 60, 50 60 Q 70 30 85 60 A 35 25 0 0 1 15 60 Q 30 30 50 60" 
        stroke={isDonor ? "#047857" : "#881337"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        fill="none" 
        strokeOpacity="0.25"
        className="transition-all duration-1000"
      />

      {/* --- THE QUANTUM LIGHT TRAIL --- */}
      {/* This trail injects life into the S and M infinitely */}
      <path 
        d="M 65 15 C 45 5, 30 25, 50 40 C 65 50, 60 60, 50 60 Q 70 30 85 60 A 35 25 0 0 1 15 60 Q 30 30 50 60" 
        stroke={isDonor ? "url(#donorSM)" : "url(#receiverSM)"} 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        fill="none" 
        strokeDasharray="90 200"
        filter="url(#smBloom)"
        className="transition-colors duration-1000"
      >
        <animate 
          attributeName="stroke-dashoffset" 
          from="290" 
          to="0" 
          dur="3.5s" 
          repeatCount="indefinite" 
        />
      </path>

      {/* --- THE MEAL CORE (The Heart of the Bowl) --- */}
      {/* Sits perfectly in the center dip of the 'M' */}
      <g className="transition-all duration-1000">
        <circle cx="50" cy="55" r="4.5" fill={coreColor} filter="url(#smBloom)">
           <animateTransform 
              attributeName="transform" 
              type="translate" 
              values="0,0; 0,-3; 0,0" 
              dur="2s" 
              repeatCount="indefinite" 
              calcMode="spline" 
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
        </circle>
      </g>

      {/* AMBIENT TECH NODES (Logistics Points on the Bowl Edge) */}
      <circle cx="15" cy="60" r="2" fill={coreColor} opacity="0.8" className="transition-colors duration-1000" />
      <circle cx="85" cy="60" r="2" fill={coreColor} opacity="0.8" className="transition-colors duration-1000" />
    </svg>
  );
}
