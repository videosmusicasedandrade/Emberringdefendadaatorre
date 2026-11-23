import React from 'react';
import { PET_SPECS, PetKind } from '../game/types';

interface PetPortraitSvgProps {
  pet: PetKind;
  className?: string;
}

export const PetPortraitSvg: React.FC<PetPortraitSvgProps> = ({ pet, className = 'h-10 w-10' }) => {
  const spec = PET_SPECS[pet];
  const gradId = `pet-aura-${pet}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} shrink-0 overflow-visible`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="48%" r="52%">
          <stop offset="0%" stopColor={spec.accentColor} stopOpacity="0.48" />
          <stop offset="55%" stopColor={spec.primaryColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={spec.primaryColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Mystical Lucky-Charm Glow Backdrop */}
      <circle cx="32" cy="32" r="30" fill={`url(#${gradId})`} />
      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke={spec.primaryColor}
        strokeOpacity="0.5"
        strokeWidth="1.4"
        strokeDasharray="4 4"
      />

      {/* Lucky charm corner sparkles */}
      <path d="M12 14l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3z" fill="#FEF08A" opacity="0.9" />
      <path d="M52 15l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z" fill={spec.primaryColor} opacity="0.95" />

      {pet === 'turtle' && (
        <g>
          {/* Flippers */}
          <ellipse cx="19" cy="45" rx="7" ry="4.5" fill="#047857" stroke="#020617" strokeWidth="2" />
          <ellipse cx="45" cy="45" rx="7" ry="4.5" fill="#047857" stroke="#020617" strokeWidth="2" />
          {/* Bronze rim */}
          <ellipse cx="34" cy="41" rx="18" ry="6.5" fill="#B45309" stroke="#020617" strokeWidth="2" />
          {/* Jade crystal shell */}
          <path
            d="M17 40 A17 17 0 0 1 51 40 Q34 45 17 40 Z"
            fill="#10B981"
            stroke="#020617"
            strokeWidth="2.2"
          />
          {/* Hex rune */}
          <polygon
            points="34,25 41,29 41,36 34,40 27,36 27,29"
            fill="#065F46"
            stroke="#FACC15"
            strokeWidth="1.6"
          />
          <polygon points="34,28 38,32.5 34,37 30,32.5" fill="#A7F3D0" />
          {/* Head */}
          <circle cx="17" cy="34" r="8" fill="#10B981" stroke="#020617" strokeWidth="2.2" />
          <polygon points="17,26 20,30 17,32 14,30" fill="#FACC15" />
          <circle cx="14" cy="34" r="2.2" fill="#FEF08A" />
          <circle cx="13.5" cy="34" r="1" fill="#020617" />
        </g>
      )}

      {pet === 'tiger' && (
        <g>
          {/* Tail */}
          <path
            d="M42 44 Q55 42 52 27"
            fill="none"
            stroke="#EA580C"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="52" cy="26" r="3" fill="#FDE047" />
          {/* Body */}
          <ellipse cx="32" cy="42" rx="13" ry="11.5" fill="#EA580C" stroke="#020617" strokeWidth="2.2" />
          <ellipse cx="30" cy="43" rx="6.5" ry="7.5" fill="#FEF3C7" />
          {/* Collar Gem */}
          <circle cx="31" cy="37" r="3.6" fill="#FACC15" stroke="#020617" strokeWidth="1.6" />
          <circle cx="31" cy="37" r="1.6" fill="#FF2E4C" />
          {/* Ears */}
          <circle cx="22" cy="17" r="5" fill="#EA580C" stroke="#020617" strokeWidth="2" />
          <circle cx="42" cy="17" r="5" fill="#EA580C" stroke="#020617" strokeWidth="2" />
          <circle cx="22" cy="17" r="2.3" fill="#FDE68A" />
          <circle cx="42" cy="17" r="2.3" fill="#FDE68A" />
          {/* Head */}
          <ellipse cx="32" cy="25" rx="13" ry="11" fill="#F97316" stroke="#020617" strokeWidth="2.2" />
          <ellipse cx="32" cy="29.5" rx="7" ry="4.6" fill="#FEF3C7" />
          {/* Stripes */}
          <path d="M32 15v6 M27 17l2 4 M37 17l-2 4" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
          {/* Eyes */}
          <ellipse cx="27" cy="24.5" rx="2.7" ry="2.1" fill="#FEF08A" />
          <ellipse cx="37" cy="24.5" rx="2.7" ry="2.1" fill="#FEF08A" />
          <circle cx="27" cy="24.5" r="1.2" fill="#020617" />
          <circle cx="37" cy="24.5" r="1.2" fill="#020617" />
          <polygon points="30,27.5 34,27.5 32,30" fill="#991B1B" />
        </g>
      )}

      {pet === 'rabbit' && (
        <g>
          {/* Tail */}
          <circle cx="44" cy="45" r="6" fill="#E0F2FE" stroke="#020617" strokeWidth="2" />
          {/* Long Ears */}
          <ellipse
            cx="26"
            cy="15"
            rx="4.2"
            ry="12"
            transform="rotate(-12 26 15)"
            fill="#E0F2FE"
            stroke="#020617"
            strokeWidth="2"
          />
          <ellipse
            cx="38"
            cy="15"
            rx="4.2"
            ry="12"
            transform="rotate(12 38 15)"
            fill="#E0F2FE"
            stroke="#020617"
            strokeWidth="2"
          />
          <ellipse cx="26" cy="15" rx="1.8" ry="7.5" transform="rotate(-12 26 15)" fill="#38BDF8" />
          <ellipse cx="38" cy="15" rx="1.8" ry="7.5" transform="rotate(12 38 15)" fill="#38BDF8" />
          {/* Body */}
          <ellipse cx="32" cy="43" rx="11.5" ry="11.5" fill="#BAE6FD" stroke="#020617" strokeWidth="2.2" />
          {/* Speed Collar */}
          <rect x="23" y="34" width="18" height="4.5" rx="2" fill="#0369A1" stroke="#020617" strokeWidth="1.6" />
          <polygon points="32,34.5 35.5,38.5 32,42.5 28.5,38.5" fill="#FACC15" stroke="#020617" strokeWidth="1.4" />
          {/* Head */}
          <ellipse cx="32" cy="27" rx="11" ry="9.5" fill="#F8FAFC" stroke="#020617" strokeWidth="2.2" />
          {/* Crescent */}
          <path d="M30 20.5a3 3 0 1 0 3.5 3" fill="none" stroke="#FACC15" strokeWidth="1.8" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="27.5" cy="27.5" r="2.4" fill="#00D4FF" />
          <circle cx="36.5" cy="27.5" r="2.4" fill="#00D4FF" />
          <circle cx="26.8" cy="26.8" r="0.9" fill="#FFFFFF" />
          <circle cx="35.8" cy="26.8" r="0.9" fill="#FFFFFF" />
          <circle cx="32" cy="30" r="1.4" fill="#38BDF8" />
        </g>
      )}

      {pet === 'owl' && (
        <g>
          {/* Perch */}
          <rect x="16" y="49" width="32" height="5" rx="2.5" fill="#4C1D95" stroke="#FACC15" strokeWidth="1.6" />
          {/* Wings */}
          <ellipse cx="20" cy="38" rx="6.5" ry="12.5" transform="rotate(12 20 38)" fill="#5B21B6" stroke="#020617" strokeWidth="2" />
          <ellipse cx="44" cy="38" rx="6.5" ry="12.5" transform="rotate(-12 44 38)" fill="#5B21B6" stroke="#020617" strokeWidth="2" />
          {/* Torso */}
          <ellipse cx="32" cy="37" rx="12" ry="14" fill="#7C3AED" stroke="#020617" strokeWidth="2.2" />
          <ellipse cx="32" cy="40" rx="7.5" ry="8.5" fill="#EDE9FE" />
          {/* Chest Gem */}
          <circle cx="32" cy="33" r="3.4" fill="#FACC15" stroke="#020617" strokeWidth="1.5" />
          <circle cx="32" cy="33" r="1.5" fill="#00D4FF" />
          {/* Ear Tufts */}
          <polygon points="24,21 17,11 29,18" fill="#6D28D9" stroke="#020617" strokeWidth="2" />
          <polygon points="40,21 47,11 35,18" fill="#6D28D9" stroke="#020617" strokeWidth="2" />
          {/* Head */}
          <ellipse cx="32" cy="24" rx="11.5" ry="9.5" fill="#7E22CE" stroke="#020617" strokeWidth="2.2" />
          <circle cx="27.2" cy="24" r="4.6" fill="#DDD6FE" />
          <circle cx="36.8" cy="24" r="4.6" fill="#DDD6FE" />
          <circle cx="27.2" cy="24" r="3.2" fill="#FACC15" stroke="#020617" strokeWidth="1.3" />
          <circle cx="36.8" cy="24" r="3.2" fill="#FACC15" stroke="#020617" strokeWidth="1.3" />
          <circle cx="27.2" cy="24" r="1.4" fill="#020617" />
          <circle cx="36.8" cy="24" r="1.4" fill="#020617" />
          <polygon points="29.5,26.5 34.5,26.5 32,30.5" fill="#F59E0B" stroke="#020617" strokeWidth="1.3" />
        </g>
      )}

      {pet === 'cat' && (
        <g>
          {/* Lucky curving tail */}
          <path
            d="M40 46 C53 45 55 29 46 21"
            fill="none"
            stroke="#3B0764"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M40 46 C53 45 55 29 46 21"
            fill="none"
            stroke="#FACC15"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M46 17l1.3 2.8 2.8 1.3-2.8 1.3-1.3 2.8-1.3-2.8-2.8-1.3 2.8-1.3z" fill="#FEF08A" />
          {/* Body */}
          <ellipse cx="32" cy="42" rx="11" ry="12" fill="#1E1B4B" stroke="#020617" strokeWidth="2.2" />
          {/* Raised lucky paw */}
          <ellipse cx="40" cy="37" rx="3.8" ry="5.6" transform="rotate(-18 40 37)" fill="#4C1D95" stroke="#020617" strokeWidth="1.8" />
          {/* Lucky Red Collar & Golden Fortune Bell */}
          <path d="M23 34 Q32 39 41 34" fill="none" stroke="#DC2626" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="32" cy="39" r="4" fill="#FACC15" stroke="#422006" strokeWidth="1.6" />
          <circle cx="31" cy="37.8" r="1.2" fill="#FEF08A" />
          {/* Pointed Ears */}
          <polygon points="26,20 19,10 21,24" fill="#2E1065" stroke="#020617" strokeWidth="2" />
          <polygon points="38,20 45,10 43,24" fill="#2E1065" stroke="#020617" strokeWidth="2" />
          <polygon points="25,19 21.5,14 22.5,22" fill="#FACC15" />
          <polygon points="39,19 42.5,14 41.5,22" fill="#FACC15" />
          {/* Head */}
          <ellipse cx="32" cy="25" rx="11.5" ry="9.5" fill="#2E1065" stroke="#020617" strokeWidth="2.2" />
          {/* Forehead fortune star */}
          <path d="M32 17.5l0.9 2 2 0.9-2 0.9-0.9 2-0.9-2-2-0.9 2-0.9z" fill="#FACC15" />
          {/* Eyes */}
          <ellipse cx="27.5" cy="25.5" rx="2.8" ry="2.2" fill="#FDE047" />
          <ellipse cx="36.5" cy="25.5" rx="2.8" ry="2.2" fill="#FDE047" />
          <ellipse cx="27.5" cy="25.5" rx="0.9" ry="1.9" fill="#020617" />
          <ellipse cx="36.5" cy="25.5" rx="0.9" ry="1.9" fill="#020617" />
          <polygon points="30.5,28 33.5,28 32,30" fill="#FACC15" />
        </g>
      )}
    </svg>
  );
};
