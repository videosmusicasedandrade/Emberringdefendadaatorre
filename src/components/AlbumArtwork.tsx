import React from 'react';
import { AllyCatalogEntry, EnemyCatalogEntry } from '../game/types';

export const AllyPortraitSvg: React.FC<{
  ally: AllyCatalogEntry;
  unlocked: boolean;
  className?: string;
}> = ({ ally, unlocked, className = 'h-24 w-24' }) => {
  const c1 = unlocked ? ally.colorHex : '#475569';
  const c2 = unlocked ? ally.accentHex : '#94A3B8';
  const bg = unlocked ? ally.bgHex : '#0F172A';

  return (
    <svg
      viewBox="0 0 96 96"
      className={`${className} shrink-0 transition-all duration-200 ${
        unlocked ? '' : 'grayscale contrast-125 brightness-[0.34]'
      }`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`ally-bg-${ally.id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.32" />
          <stop offset="100%" stopColor={bg} stopOpacity="0.95" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="88" height="88" rx="18" fill={`url(#ally-bg-${ally.id})`} stroke={c1} strokeWidth="2.5" />

      {ally.unitKind === 'scout' && (
        <g>
          <path d="M24 74 C24 54 72 54 72 74 Z" fill={c1} stroke="#020617" strokeWidth="2.5" />
          <circle cx="46" cy="40" r="15" fill="#FED7AA" stroke="#020617" strokeWidth="2.5" />
          <path d="M30 37 A16 16 0 0 1 62 37 Z" fill="#1D4ED8" stroke="#020617" strokeWidth="2.5" />
          <rect x="42" y="29" width="22" height="7" rx="3" fill="#FFFFFF" stroke="#020617" strokeWidth="2" />
          <path d="M68 20 Q80 44 68 68" fill="none" stroke={c2} strokeWidth="4" strokeLinecap="round" />
          <line x1="48" y1="45" x2="78" y2="45" stroke={c1} strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="82,45 72,39 72,51" fill={c2} />
        </g>
      )}

      {ally.unitKind === 'frog' && (
        <g>
          <ellipse cx="48" cy="54" rx="26" ry="20" fill={c1} stroke="#020617" strokeWidth="2.8" />
          <circle cx="34" cy="31" r="9" fill="#FF2E4C" stroke="#020617" strokeWidth="2.4" />
          <circle cx="62" cy="31" r="9" fill="#FF2E4C" stroke="#020617" strokeWidth="2.4" />
          <circle cx="34" cy="31" r="3.5" fill="#020617" />
          <circle cx="62" cy="31" r="3.5" fill="#020617" />
          <path d="M34 57 Q48 67 62 57" fill="none" stroke="#020617" strokeWidth="3" strokeLinecap="round" />
          <path d="M64 62 L84 28 L88 33 L70 67 Z" fill={c2} stroke="#020617" strokeWidth="2.2" />
          <circle cx="24" cy="60" r="4" fill={c2} opacity="0.85" />
          <circle cx="72" cy="66" r="3" fill={c2} opacity="0.85" />
        </g>
      )}

      {ally.unitKind === 'swordsman_ally' && (
        <g>
          <path d="M22 76 L28 46 L68 46 L74 76 Z" fill={c1} stroke="#020617" strokeWidth="2.6" />
          <circle cx="46" cy="37" r="15" fill="#CBD5E1" stroke="#020617" strokeWidth="2.6" />
          <rect x="41" y="33" width="14" height="5" rx="2" fill="#0F172A" />
          <path d="M40 22 L46 11 L52 22 Z" fill={c2} stroke="#020617" strokeWidth="2" />
          <path d="M66 64 L78 16 L84 19 L72 67 Z" fill="#F8FAFC" stroke="#020617" strokeWidth="2.4" />
          <line x1="60" y1="60" x2="77" y2="65" stroke={c2} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {ally.unitKind === 'fire_mage' && (
        <g>
          <path d="M26 78 L36 44 L60 44 L70 78 Z" fill={c1} stroke="#020617" strokeWidth="2.6" />
          <circle cx="48" cy="39" r="13" fill="#FED7AA" stroke="#020617" strokeWidth="2.4" />
          <path d="M28 33 L48 11 L68 33 Z" fill="#C2410C" stroke="#020617" strokeWidth="2.5" />
          <circle cx="72" cy="40" r="10" fill={c2} stroke="#EA580C" strokeWidth="2.5" />
          <path d="M72 24 C77 33 78 40 72 47 C66 40 67 33 72 24 Z" fill="#FF2E4C" />
        </g>
      )}

      {ally.unitKind === 'cleric' && (
        <g>
          <path d="M26 78 L34 45 L62 45 L70 78 Z" fill={c1} stroke="#020617" strokeWidth="2.6" />
          <rect x="45" y="52" width="6" height="18" rx="2" fill={c2} />
          <rect x="39" y="58" width="18" height="6" rx="2" fill={c2} />
          <circle cx="48" cy="36" r="13" fill="#FDE68A" stroke="#020617" strokeWidth="2.4" />
          <ellipse cx="48" cy="17" rx="14" ry="4.5" fill="none" stroke={c2} strokeWidth="3.5" />
        </g>
      )}

      {ally.unitKind === 'shadow_assassin' && (
        <g>
          <path d="M24 78 L36 42 L60 42 L72 78 Z" fill={c1} stroke="#020617" strokeWidth="2.6" />
          <circle cx="48" cy="37" r="14" fill="#3B0764" stroke="#020617" strokeWidth="2.5" />
          <circle cx="43" cy="37" r="2.8" fill={c2} />
          <circle cx="53" cy="37" r="2.8" fill={c2} />
          <path d="M20 56 L38 42 L34 62 Z" fill={c2} stroke="#020617" strokeWidth="2" />
          <path d="M76 56 L58 42 L62 62 Z" fill={c2} stroke="#020617" strokeWidth="2" />
        </g>
      )}

      {ally.unitKind === 'sniper' && (
        <g>
          <path d="M24 78 L34 46 L62 46 L72 78 Z" fill={c1} stroke="#020617" strokeWidth="2.6" />
          <circle cx="46" cy="36" r="13" fill="#E0F2FE" stroke="#020617" strokeWidth="2.4" />
          <rect x="32" y="25" width="30" height="9" rx="4" fill="#0891B2" stroke="#020617" strokeWidth="2.2" />
          <rect x="52" y="42" width="32" height="7" rx="2" fill="#0F172A" stroke={c2} strokeWidth="2" />
          <circle cx="70" cy="38" r="5" fill={c1} stroke="#020617" strokeWidth="2" />
        </g>
      )}

      {ally.unitKind === 'golem' && (
        <g>
          <rect x="20" y="38" width="56" height="40" rx="10" fill={c1} stroke="#020617" strokeWidth="3" />
          <rect x="30" y="18" width="36" height="26" rx="8" fill={c2} stroke="#020617" strokeWidth="2.8" />
          <circle cx="41" cy="30" r="3.5" fill="#00D4FF" />
          <circle cx="55" cy="30" r="3.5" fill="#00D4FF" />
          <rect x="36" y="52" width="24" height="12" rx="4" fill="#334155" stroke="#00D4FF" strokeWidth="2" />
        </g>
      )}

      {ally.unitKind === 'spore_witch' && (
        <g>
          <path d="M26 78 L36 45 L60 45 L70 78 Z" fill={c1} stroke="#020617" strokeWidth="2.6" />
          <circle cx="48" cy="38" r="12.5" fill="#D9F99D" stroke="#020617" strokeWidth="2.4" />
          <path d="M22 33 L48 11 L74 33 Z" fill="#3F6212" stroke="#020617" strokeWidth="2.6" />
          <circle cx="24" cy="52" r="5" fill={c2} opacity="0.85" />
          <circle cx="72" cy="48" r="6" fill={c2} opacity="0.85" />
          <circle cx="68" cy="66" r="4" fill={c2} opacity="0.7" />
        </g>
      )}

      {ally.unitKind === 'paladin' && (
        <g>
          <path d="M20 78 L28 43 L68 43 L76 78 Z" fill={c1} stroke="#020617" strokeWidth="2.8" />
          <circle cx="48" cy="36" r="14" fill={c2} stroke="#020617" strokeWidth="2.6" />
          <path d="M33 24 L39 11 L48 19 L57 11 L63 24 Z" fill="#FACC15" stroke="#020617" strokeWidth="2.2" />
          <path d="M48 48 L56 58 L48 70 L40 58 Z" fill="#FFFFFF" stroke="#020617" strokeWidth="2" />
          <path d="M72 64 L78 16 L84 19 L78 66 Z" fill="#FEF08A" stroke="#020617" strokeWidth="2.2" />
        </g>
      )}
    </svg>
  );
};

export const EnemyPortraitSvg: React.FC<{
  enemy: EnemyCatalogEntry;
  unlocked: boolean;
  className?: string;
}> = ({ enemy, unlocked, className = 'h-20 w-20' }) => {
  const c1 = unlocked ? enemy.primaryColor : '#64748B';
  const c2 = unlocked ? enemy.secondaryColor : '#334155';
  const c3 = unlocked ? enemy.accentColor : '#94A3B8';

  return (
    <svg
      viewBox="0 0 88 88"
      className={`${className} shrink-0 transition-all duration-200 ${
        unlocked ? '' : 'grayscale contrast-150 brightness-[0.28]'
      }`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`en-bg-${enemy.id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.34" />
          <stop offset="100%" stopColor="#090D18" stopOpacity="0.96" />
        </radialGradient>
      </defs>
      <rect
        x="3"
        y="3"
        width="82"
        height="82"
        rx="16"
        fill={`url(#en-bg-${enemy.id})`}
        stroke={enemy.isBoss && unlocked ? '#FACC15' : c1}
        strokeWidth={enemy.isBoss ? 3 : 2}
      />

      {enemy.archetype === 'slime' && (
        <g>
          <path
            d="M18 64 C16 36 30 24 44 24 C58 24 72 36 70 64 C68 70 20 70 18 64 Z"
            fill={c1}
            stroke="#020617"
            strokeWidth="2.6"
          />
          <circle cx="36" cy="46" r="4.5" fill="#FFFFFF" />
          <circle cx="52" cy="46" r="4.5" fill="#FFFFFF" />
          <circle cx="36" cy="46" r="2.2" fill="#020617" />
          <circle cx="52" cy="46" r="2.2" fill="#020617" />
          <circle cx="30" cy="34" r="4" fill={c3} opacity="0.75" />
          <circle cx="58" cy="58" r="3.2" fill={c3} opacity="0.75" />
        </g>
      )}

      {enemy.archetype === 'beast' && (
        <g>
          <ellipse cx="44" cy="52" rx="22" ry="18" fill={c2} stroke="#020617" strokeWidth="2.5" />
          <polygon points="24,36 18,16 36,28" fill={c1} stroke="#020617" strokeWidth="2.4" />
          <polygon points="64,36 70,16 52,28" fill={c1} stroke="#020617" strokeWidth="2.4" />
          <circle cx="44" cy="42" r="15" fill={c1} stroke="#020617" strokeWidth="2.5" />
          <circle cx="38" cy="39" r="3.4" fill={c3} />
          <circle cx="50" cy="39" r="3.4" fill={c3} />
          <polygon points="41,47 47,47 44,52" fill="#020617" />
          <path d="M36 53 L39 58 L44 54 L49 58 L52 53" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        </g>
      )}

      {enemy.archetype === 'arachnid' && (
        <g>
          {[0, 1, 2].map((idx) => (
            <g key={idx}>
              <path
                d={`M32 ${44 + idx * 6} L14 ${34 + idx * 11} L10 ${44 + idx * 11}`}
                fill="none"
                stroke={c1}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d={`M56 ${44 + idx * 6} L74 ${34 + idx * 11} L78 ${44 + idx * 11}`}
                fill="none"
                stroke={c1}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>
          ))}
          <circle cx="44" cy="50" r="16" fill={c2} stroke="#020617" strokeWidth="2.5" />
          <circle cx="44" cy="38" r="11" fill={c1} stroke="#020617" strokeWidth="2.5" />
          <circle cx="39" cy="36" r="2.8" fill={c3} />
          <circle cx="49" cy="36" r="2.8" fill={c3} />
          <circle cx="44" cy="33" r="2" fill={c3} />
        </g>
      )}

      {enemy.archetype === 'goblin' && (
        <g>
          <path d="M26 70 L32 45 L56 45 L62 70 Z" fill={c2} stroke="#020617" strokeWidth="2.4" />
          <polygon points="28,36 14,28 28,42" fill={c1} stroke="#020617" strokeWidth="2.2" />
          <polygon points="60,36 74,28 60,42" fill={c1} stroke="#020617" strokeWidth="2.2" />
          <circle cx="44" cy="37" r="14" fill={c1} stroke="#020617" strokeWidth="2.4" />
          <circle cx="39" cy="35" r="3" fill={c3} />
          <circle cx="49" cy="35" r="3" fill={c3} />
          <rect x="18" y="45" width="16" height="22" rx="4" fill="#92400E" stroke="#020617" strokeWidth="2" />
        </g>
      )}

      {enemy.archetype === 'undead' && (
        <g>
          <rect x="31" y="46" width="26" height="24" rx="5" fill={c2} stroke="#020617" strokeWidth="2.4" />
          <line x1="35" y1="53" x2="53" y2="53" stroke={c1} strokeWidth="2.5" />
          <line x1="35" y1="60" x2="53" y2="60" stroke={c1} strokeWidth="2.5" />
          <circle cx="44" cy="33" r="14" fill={c1} stroke="#020617" strokeWidth="2.5" />
          <circle cx="38.5" cy="32" r="3.5" fill="#020617" />
          <circle cx="49.5" cy="32" r="3.5" fill="#020617" />
          <circle cx="38.5" cy="32" r="1.4" fill={c3} />
          <circle cx="49.5" cy="32" r="1.4" fill={c3} />
          <rect x="38" y="40" width="12" height="5" rx="1.5" fill="#020617" />
        </g>
      )}

      {enemy.archetype === 'demon' && (
        <g>
          <path d="M24 72 L31 44 L57 44 L64 72 Z" fill={c2} stroke="#020617" strokeWidth="2.5" />
          <path d="M32 27 Q24 14 29 12 Q35 18 37 25 Z" fill={c3} stroke="#020617" strokeWidth="2" />
          <path d="M56 27 Q64 14 59 12 Q53 18 51 25 Z" fill={c3} stroke="#020617" strokeWidth="2" />
          <circle cx="44" cy="37" r="14" fill={c1} stroke="#020617" strokeWidth="2.5" />
          <circle cx="39" cy="36" r="2.8" fill={c3} />
          <circle cx="49" cy="36" r="2.8" fill={c3} />
          <path d="M38 44 Q44 48 50 44" fill="none" stroke="#020617" strokeWidth="2.4" />
        </g>
      )}

      {enemy.archetype === 'construct' && (
        <g>
          <rect x="22" y="38" width="44" height="32" rx="7" fill={c2} stroke="#020617" strokeWidth="2.6" />
          <rect x="29" y="18" width="30" height="24" rx="6" fill={c1} stroke="#020617" strokeWidth="2.5" />
          <circle cx="38" cy="29" r="3.2" fill={c3} />
          <circle cx="50" cy="29" r="3.2" fill={c3} />
          <circle cx="44" cy="54" r="6" fill={c3} stroke="#020617" strokeWidth="2" />
        </g>
      )}

      {enemy.archetype === 'spirit' && (
        <g>
          <path
            d="M24 68 Q26 24 44 20 Q62 24 64 68 L56 62 L49 69 L44 62 L39 69 L32 62 Z"
            fill={c1}
            stroke="#020617"
            strokeWidth="2.5"
          />
          <circle cx="38" cy="38" r="3.4" fill={c3} />
          <circle cx="50" cy="38" r="3.4" fill={c3} />
          <ellipse cx="44" cy="49" rx="5" ry="3.5" fill="#020617" />
        </g>
      )}

      {enemy.archetype === 'orc' && (
        <g>
          <rect x="23" y="42" width="42" height="28" rx="8" fill={c2} stroke="#020617" strokeWidth="2.6" />
          <circle cx="44" cy="33" r="15" fill={c1} stroke="#020617" strokeWidth="2.6" />
          <polygon points="34,42 37,35 40,42" fill="#FFFFFF" stroke="#020617" strokeWidth="1.5" />
          <polygon points="48,42 51,35 54,42" fill="#FFFFFF" stroke="#020617" strokeWidth="1.5" />
          <circle cx="38" cy="31" r="2.8" fill={c3} />
          <circle cx="50" cy="31" r="2.8" fill={c3} />
        </g>
      )}

      {enemy.archetype === 'mythic' && (
        <g>
          <path d="M12 42 Q24 22 36 38 Z" fill={c2} stroke="#020617" strokeWidth="2.2" />
          <path d="M76 42 Q64 22 52 38 Z" fill={c2} stroke="#020617" strokeWidth="2.2" />
          <ellipse cx="44" cy="52" rx="18" ry="18" fill={c1} stroke="#020617" strokeWidth="2.5" />
          <circle cx="44" cy="35" r="13" fill={c1} stroke="#020617" strokeWidth="2.5" />
          <circle cx="39" cy="34" r="3" fill={c3} />
          <circle cx="49" cy="34" r="3" fill={c3} />
          <polygon points="44,39 40,44 48,44" fill={c3} />
        </g>
      )}

      {enemy.archetype === 'boss' && (
        <g>
          <rect x="20" y="40" width="48" height="32" rx="9" fill={c2} stroke="#020617" strokeWidth="2.8" />
          <circle cx="44" cy="33" r="17" fill={c1} stroke="#020617" strokeWidth="2.8" />
          <path d="M27 21 L32 9 L39 16 L44 6 L49 16 L56 9 L61 21 Z" fill={c3} stroke="#020617" strokeWidth="2.2" />
          <circle cx="37.5" cy="33" r="3.4" fill={c3} />
          <circle cx="50.5" cy="33" r="3.4" fill={c3} />
          <rect x="36" y="41" width="16" height="4" rx="2" fill="#020617" />
        </g>
      )}
    </svg>
  );
};
