/**
 * CSS Pixel Art Sprites — One Piece Crew
 * 
 * Each sprite is defined as a grid of coloured pixels rendered via CSS box-shadow.
 * This approach requires NO image files and works offline.
 * 
 * Sprite size: 16x16 base pixels rendered at 4x scale = 64x64px display
 * 
 * Colour key for each character.
 */

const SPRITES = {
  luffy: {
    name: 'Captain William (Luffy)',
    colors: {
      hat: '#D4800A',
      skin: '#FDBCB4',
      vest: '#CC2200',
      shorts: '#1A3B8A',
      outline: '#1A1A1A',
      hair: '#1A1A1A',
      band: '#DD0000',
      mouth: '#CC6666'
    },
    // 16x16 grid, row by row (0=transparent, color key reference)
    frames: {
      idle: `
        0000011100000000
        0000122210000000
        0000122210000000
        0011133311100000
        0011333311100000
        0001144441000000
        0001144441000000
        0001155551000000
        0000155550000000
        0000266620000000
        0000266620000000
        0000177710000000
        0000177710000000
        0001177711000000
        0000000000000000
        0000000000000000
      `
    }
  }
};

// Instead of pixel grids, we export SVG-based sprites as data URIs
// These are hand-crafted to match the One Piece character aesthetics

const CREW_SVGS = {

  luffy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">
    <!-- Straw hat brim -->
    <ellipse cx="16" cy="7" rx="13" ry="3" fill="#D4800A" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Hat top -->
    <ellipse cx="16" cy="6" rx="8" ry="4" fill="#E8950C" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Hat band red -->
    <rect x="8" y="7" width="16" height="2" fill="#CC2200" rx="1"/>
    <!-- Head -->
    <ellipse cx="16" cy="13" rx="7" ry="7" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Eyes -->
    <circle cx="13" cy="12" r="1.5" fill="#1a1a1a"/>
    <circle cx="19" cy="12" r="1.5" fill="#1a1a1a"/>
    <!-- Smile -->
    <path d="M12 15 Q16 18 20 15" stroke="#1a1a1a" stroke-width="1" fill="none" stroke-linecap="round"/>
    <!-- Scar under eye -->
    <path d="M19 13.5 L20 15" stroke="#CC2200" stroke-width="0.8"/>
    <!-- Body/vest red -->
    <rect x="11" y="19" width="10" height="9" fill="#CC2200" stroke="#1a1a1a" stroke-width="0.5" rx="1"/>
    <!-- Vest open front -->
    <rect x="14" y="19" width="4" height="9" fill="#FDBCB4"/>
    <!-- Shorts blue -->
    <rect x="10" y="26" width="12" height="5" fill="#1A3B8A" stroke="#1a1a1a" stroke-width="0.5" rx="1"/>
    <!-- Arms -->
    <rect x="7" y="19" width="4" height="7" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5" rx="2"/>
    <rect x="21" y="19" width="4" height="7" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5" rx="2"/>
    <!-- Legs -->
    <rect x="11" y="30" width="4" height="2" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5"/>
    <rect x="17" y="30" width="4" height="2" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5"/>
  </svg>`,

  zoro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">
    <!-- Green hair -->
    <ellipse cx="16" cy="9" rx="8" ry="7" fill="#2D7A2D" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Headband -->
    <rect x="8" y="10" width="16" height="2.5" fill="#1a1a1a" rx="1"/>
    <!-- Head -->
    <ellipse cx="16" cy="14" rx="7" ry="6.5" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Eyes - serious squint -->
    <path d="M11 13 L14 13" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M18 13 L21 13" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Scar over left eye -->
    <path d="M12 11 L13 15" stroke="#CC2200" stroke-width="0.8"/>
    <!-- Stern mouth -->
    <path d="M13 16 L19 16" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round"/>
    <!-- Green haramaki torso -->
    <rect x="10" y="19" width="12" height="9" fill="#2D7A2D" stroke="#1a1a1a" stroke-width="0.5" rx="1"/>
    <!-- Belt/haramaki -->
    <rect x="10" y="23" width="12" height="3" fill="#1a4a1a" stroke="#1a1a1a" stroke-width="0.3"/>
    <!-- Pants dark -->
    <rect x="10" y="26" width="12" height="5" fill="#2a2a5a" stroke="#1a1a1a" stroke-width="0.5" rx="1"/>
    <!-- Arms -->
    <rect x="6" y="19" width="4" height="8" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5" rx="2"/>
    <rect x="22" y="19" width="4" height="8" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5" rx="2"/>
    <!-- Three swords at hip (simplified) -->
    <rect x="4" y="22" width="8" height="1" fill="#C0C0C0" stroke="#888" stroke-width="0.3"/>
    <rect x="4" y="24" width="8" height="1" fill="#C0C0C0" stroke="#888" stroke-width="0.3"/>
    <rect x="4" y="26" width="8" height="1" fill="#C0C0C0" stroke="#888" stroke-width="0.3"/>
    <!-- Legs -->
    <rect x="11" y="30" width="4" height="2" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5"/>
    <rect x="17" y="30" width="4" height="2" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5"/>
  </svg>`,

  chopper: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">
    <!-- Pink hat -->
    <ellipse cx="16" cy="8" rx="11" ry="5" fill="#E87A8A" stroke="#1a1a1a" stroke-width="0.5"/>
    <ellipse cx="16" cy="6" rx="7" ry="5" fill="#F0A0B0" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Hat cross (doctor symbol) -->
    <rect x="14" y="4" width="4" height="1" fill="#CC2200"/>
    <rect x="15" y="3" width="2" height="3" fill="#CC2200"/>
    <!-- Reindeer ears -->
    <ellipse cx="8" cy="10" rx="3" ry="4" fill="#8B5E3C" stroke="#1a1a1a" stroke-width="0.5"/>
    <ellipse cx="8" cy="10" rx="1.5" ry="2.5" fill="#FDBCB4"/>
    <ellipse cx="24" cy="10" rx="3" ry="4" fill="#8B5E3C" stroke="#1a1a1a" stroke-width="0.5"/>
    <ellipse cx="24" cy="10" rx="1.5" ry="2.5" fill="#FDBCB4"/>
    <!-- Head brown/tan -->
    <ellipse cx="16" cy="16" rx="8" ry="7.5" fill="#C8956C" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Big blue nose -->
    <ellipse cx="16" cy="17" rx="3" ry="2.5" fill="#4488CC" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Eyes big cute -->
    <circle cx="12" cy="14" r="2.5" fill="white" stroke="#1a1a1a" stroke-width="0.5"/>
    <circle cx="20" cy="14" r="2.5" fill="white" stroke="#1a1a1a" stroke-width="0.5"/>
    <circle cx="12.5" cy="14" r="1.2" fill="#1a1a1a"/>
    <circle cx="20.5" cy="14" r="1.2" fill="#1a1a1a"/>
    <!-- Smile -->
    <path d="M13 19 Q16 21.5 19 19" stroke="#1a1a1a" stroke-width="1" fill="none"/>
    <!-- Body small cute -->
    <rect x="11" y="22" width="10" height="8" fill="#8B5E3C" stroke="#1a1a1a" stroke-width="0.5" rx="3"/>
    <!-- Hooves/feet -->
    <ellipse cx="13" cy="30" rx="3" ry="2" fill="#4a3020" stroke="#1a1a1a" stroke-width="0.5"/>
    <ellipse cx="19" cy="30" rx="3" ry="2" fill="#4a3020" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Small arms -->
    <ellipse cx="9" cy="24" rx="2" ry="3.5" fill="#C8956C" stroke="#1a1a1a" stroke-width="0.5"/>
    <ellipse cx="23" cy="24" rx="2" ry="3.5" fill="#C8956C" stroke="#1a1a1a" stroke-width="0.5"/>
  </svg>`,

  nami: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">
    <!-- Orange hair -->
    <ellipse cx="16" cy="10" rx="9" ry="8" fill="#E8762A" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Hair details -->
    <path d="M7 12 Q5 16 7 20" stroke="#C05A10" stroke-width="1.5" fill="none"/>
    <path d="M25 12 Q27 16 24 20" stroke="#C05A10" stroke-width="1.5" fill="none"/>
    <!-- Head -->
    <ellipse cx="16" cy="14" rx="7" ry="7" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Eyes -->
    <circle cx="13" cy="13" r="1.5" fill="#1a1a1a"/>
    <circle cx="19" cy="13" r="1.5" fill="#1a1a1a"/>
    <circle cx="13.4" cy="12.6" r="0.5" fill="white"/>
    <circle cx="19.4" cy="12.6" r="0.5" fill="white"/>
    <!-- Confident smile -->
    <path d="M13 16 Q16 18.5 19 16" stroke="#1a1a1a" stroke-width="1" fill="none" stroke-linecap="round"/>
    <!-- Orange top/body -->
    <rect x="11" y="20" width="10" height="8" fill="#E8762A" stroke="#1a1a1a" stroke-width="0.5" rx="1"/>
    <!-- Blue skirt -->
    <rect x="9" y="26" width="14" height="5" fill="#1A3B8A" stroke="#1a1a1a" stroke-width="0.5" rx="1"/>
    <!-- Arms -->
    <rect x="7" y="20" width="4" height="7" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5" rx="2"/>
    <rect x="21" y="20" width="4" height="7" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5" rx="2"/>
    <!-- Navigator staff in right hand -->
    <rect x="24" y="14" width="1.5" height="14" fill="#8B5E3C" stroke="#1a1a1a" stroke-width="0.3" rx="0.5"/>
    <circle cx="24.75" cy="14" r="2" fill="#FFD700" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Legs -->
    <rect x="11" y="30" width="4" height="2" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5"/>
    <rect x="17" y="30" width="4" height="2" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5"/>
  </svg>`,

  usopp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">
    <!-- Black curly hair -->
    <ellipse cx="16" cy="9" rx="9" ry="7" fill="#1a1a1a" stroke="#000" stroke-width="0.5"/>
    <!-- Goggles on forehead -->
    <ellipse cx="14" cy="8" rx="4" ry="2.5" fill="#FFD700" stroke="#1a1a1a" stroke-width="0.5"/>
    <ellipse cx="14" cy="8" rx="2.5" ry="1.5" fill="#88CCFF"/>
    <!-- Head -->
    <ellipse cx="16" cy="15" rx="7" ry="7" fill="#C8956C" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Long nose! -->
    <path d="M16 15 Q18 17 22 16 Q18 17.5 16 17" fill="#C07050" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Eyes -->
    <circle cx="13" cy="13" r="1.5" fill="#1a1a1a"/>
    <circle cx="18" cy="13" r="1.5" fill="#1a1a1a"/>
    <circle cx="13.4" cy="12.6" r="0.5" fill="white"/>
    <!-- Big grin -->
    <path d="M12 16.5 Q16 20 20 16.5" stroke="#1a1a1a" stroke-width="1" fill="none"/>
    <!-- Overalls blue-green -->
    <rect x="11" y="21" width="10" height="9" fill="#4A8A6A" stroke="#1a1a1a" stroke-width="0.5" rx="1"/>
    <!-- Straps -->
    <rect x="13" y="19" width="2" height="5" fill="#3A6A5A" stroke="#1a1a1a" stroke-width="0.3"/>
    <rect x="17" y="19" width="2" height="5" fill="#3A6A5A" stroke="#1a1a1a" stroke-width="0.3"/>
    <!-- Arms -->
    <rect x="7" y="21" width="4" height="7" fill="#C8956C" stroke="#1a1a1a" stroke-width="0.5" rx="2"/>
    <rect x="21" y="21" width="4" height="7" fill="#C8956C" stroke="#1a1a1a" stroke-width="0.5" rx="2"/>
    <!-- Slingshot in hand -->
    <path d="M6 21 L5 18 M6 21 L7 18" stroke="#8B5E3C" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M5 18 Q6 17 7 18" stroke="#1a1a1a" stroke-width="1" fill="none"/>
    <!-- Legs -->
    <rect x="11" y="29" width="4" height="3" fill="#C8956C" stroke="#1a1a1a" stroke-width="0.5"/>
    <rect x="17" y="29" width="4" height="3" fill="#C8956C" stroke="#1a1a1a" stroke-width="0.5"/>
  </svg>`,

  sanji: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">
    <!-- Blonde hair covering one eye -->
    <ellipse cx="16" cy="9" rx="8" ry="7" fill="#F5D020" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Hair sweep over left eye -->
    <path d="M8 9 Q10 7 14 9 Q12 13 10 15" fill="#F5D020" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- Head -->
    <ellipse cx="16" cy="14" rx="7" ry="7" fill="#FDBCB4" stroke="#1a1a1a" stroke-width="0.5"/>
    <!-- One visible eye (right) -->
    <circle cx="19" cy="13" r="1.8" fill="#1a1a1a"/>
    <circle cx="19.5" cy="12.5" r="0.5" fill="white"/>
    <!-- Curly eyebrow -->
    <path d="M17 11 Q19 10.5 21 11.5" stroke="#F5D020" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="21.5" cy="11.5" r="0.8" fill="#F5D020" stroke="#1a1a1a" stroke-width="0.3"/>
    <!-- Confident smile, cigarette -->
    <path d="M14 16 Q16 17.5 19 16" stroke="#1a1a1a" stroke-width="1" fill="none"/>
    <rect x="15" y="16" width="4" height="1" fill="#F5F5F5" stroke="#ccc" stroke-width="0.3"/>
    <!-- Black suit -->
    <rect x="10" y="20" width="12" height="10" fill="#1a1a1a" stroke="#333" stroke-width="0.5" rx="1"/>
    <!-- White shirt front -->
    <rect x="14" y="20" width="4" height="10" fill="white" stroke="#ccc" stroke-width="0.3"/>
    <!-- Tie black -->
    <rect x="15" y="20" width="2" height="6" fill="#1a1a1a"/>
    <!-- Arms suit -->
    <rect x="6" y="20" width="4" height="8" fill="#1a1a1a" stroke="#333" stroke-width="0.5" rx="2"/>
    <rect x="22" y="20" width="4" height="8" fill="#1a1a1a" stroke="#333" stroke-width="0.5" rx="2"/>
    <!-- Hands white glove effect -->
    <ellipse cx="8" cy="28" rx="2.5" ry="2" fill="#F5F5F5" stroke="#ccc" stroke-width="0.5"/>
    <ellipse cx="24" cy="28" rx="2.5" ry="2" fill="#F5F5F5" stroke="#ccc" stroke-width="0.5"/>
    <!-- Legs black trousers -->
    <rect x="11" y="29" width="4" height="3" fill="#1a1a1a" stroke="#333" stroke-width="0.5"/>
    <rect x="17" y="29" width="4" height="3" fill="#1a1a1a" stroke="#333" stroke-width="0.5"/>
  </svg>`,

  ship: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100" width="320" height="200">
    <!-- Sky/sea gradient bg -->
    <defs>
      <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#1a3b8a"/>
        <stop offset="100%" style="stop-color:#0d2260"/>
      </linearGradient>
      <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#8B6914"/>
        <stop offset="100%" style="stop-color:#5C4410"/>
      </linearGradient>
      <linearGradient id="sailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#F5F0E0"/>
        <stop offset="100%" style="stop-color:#EDE5C0"/>
      </linearGradient>
    </defs>
    <!-- Water -->
    <rect x="0" y="70" width="160" height="30" fill="url(#seaGrad)"/>
    <!-- Hull -->
    <path d="M20 60 L140 60 L135 85 L25 85 Z" fill="url(#woodGrad)" stroke="#3a2a00" stroke-width="1.5"/>
    <!-- Hull planks detail -->
    <line x1="25" y1="67" x2="135" y2="67" stroke="#5C4410" stroke-width="0.8"/>
    <line x1="28" y1="74" x2="132" y2="74" stroke="#5C4410" stroke-width="0.8"/>
    <line x1="30" y1="80" x2="130" y2="80" stroke="#5C4410" stroke-width="0.8"/>
    <!-- Green deck -->
    <rect x="18" y="52" width="124" height="10" fill="#3A8A3A" stroke="#1a5a1a" stroke-width="1"/>
    <!-- Deck grass detail -->
    <path d="M25 55 Q28 52 31 55 Q34 52 37 55" stroke="#2a6a2a" stroke-width="0.8" fill="none"/>
    <path d="M60 55 Q63 52 66 55 Q69 52 72 55" stroke="#2a6a2a" stroke-width="0.8" fill="none"/>
    <path d="M95 55 Q98 52 101 55 Q104 52 107 55" stroke="#2a6a2a" stroke-width="0.8" fill="none"/>
    <!-- Railing -->
    <rect x="18" y="48" width="124" height="4" fill="#8B6914" stroke="#5C4410" stroke-width="0.8" rx="1"/>
    <!-- Railing posts -->
    <rect x="25" y="44" width="2" height="8" fill="#5C4410"/>
    <rect x="40" y="44" width="2" height="8" fill="#5C4410"/>
    <rect x="55" y="44" width="2" height="8" fill="#5C4410"/>
    <rect x="100" y="44" width="2" height="8" fill="#5C4410"/>
    <rect x="115" y="44" width="2" height="8" fill="#5C4410"/>
    <rect x="130" y="44" width="2" height="8" fill="#5C4410"/>
    <!-- Main mast -->
    <rect x="78" y="5" width="4" height="50" fill="#5C4410" stroke="#3a2a00" stroke-width="0.8"/>
    <!-- Crow's nest -->
    <path d="M68 18 L92 18 L90 28 L70 28 Z" fill="#8B6914" stroke="#5C4410" stroke-width="1"/>
    <!-- Main sail -->
    <path d="M82 10 L82 45 L115 42 L115 13 Z" fill="url(#sailGrad)" stroke="#C0B080" stroke-width="1"/>
    <!-- Sail cross (Sunny symbol) -->
    <circle cx="98" cy="27" r="12" fill="none" stroke="#CC2200" stroke-width="2"/>
    <line x1="86" y1="27" x2="110" y2="27" stroke="#CC2200" stroke-width="2"/>
    <line x1="98" y1="15" x2="98" y2="39" stroke="#CC2200" stroke-width="2"/>
    <!-- Fore mast -->
    <rect x="42" y="15" width="3" height="38" fill="#5C4410" stroke="#3a2a00" stroke-width="0.8"/>
    <!-- Fore sail -->
    <path d="M45 18 L45 48 L70 46 L70 20 Z" fill="url(#sailGrad)" stroke="#C0B080" stroke-width="1" opacity="0.9"/>
    <!-- LION FIGUREHEAD -->
    <ellipse cx="18" cy="60" rx="12" ry="10" fill="#F5A020" stroke="#8B5E3C" stroke-width="1.5"/>
    <!-- Lion mane -->
    <circle cx="18" cy="60" r="11" fill="none" stroke="#C07010" stroke-width="3"/>
    <!-- Lion face -->
    <ellipse cx="18" cy="60" rx="8" ry="7" fill="#F5C050"/>
    <circle cx="15" cy="58" r="1.5" fill="#1a1a1a"/>
    <circle cx="21" cy="58" r="1.5" fill="#1a1a1a"/>
    <path d="M15 62 Q18 65 21 62" stroke="#1a1a1a" stroke-width="1" fill="none"/>
    <ellipse cx="18" cy="63" rx="2.5" ry="1.5" fill="#F08060"/>
    <!-- Jolly Roger flag -->
    <rect x="78" y="2" width="20" height="12" fill="#1a1a1a" stroke="#333" stroke-width="0.5"/>
    <!-- Skull on flag -->
    <ellipse cx="88" cy="7" rx="4" ry="3.5" fill="white"/>
    <circle cx="86.5" cy="6" r="1" fill="#1a1a1a"/>
    <circle cx="89.5" cy="6" r="1" fill="#1a1a1a"/>
    <path d="M86 9 L90 9" stroke="#1a1a1a" stroke-width="0.8"/>
    <!-- Crossbones -->
    <line x1="84" y1="11" x2="92" y2="11" stroke="white" stroke-width="1.5"/>
    <!-- Anchor -->
    <circle cx="148" cy="62" r="4" fill="none" stroke="#888" stroke-width="1.5"/>
    <rect x="147" y="62" width="2" height="8" fill="#888"/>
    <line x1="143" y1="70" x2="153" y2="70" stroke="#888" stroke-width="1.5"/>
    <!-- Porthole windows -->
    <circle cx="50" cy="72" r="5" fill="none" stroke="#8B6914" stroke-width="1.5"/>
    <circle cx="50" cy="72" r="3.5" fill="#88AABB" opacity="0.6"/>
    <circle cx="80" cy="72" r="5" fill="none" stroke="#8B6914" stroke-width="1.5"/>
    <circle cx="80" cy="72" r="3.5" fill="#88AABB" opacity="0.6"/>
    <circle cx="110" cy="72" r="5" fill="none" stroke="#8B6914" stroke-width="1.5"/>
    <circle cx="110" cy="72" r="3.5" fill="#88AABB" opacity="0.6"/>
  </svg>`
};

// Export as data URIs for use in HTML
function svgToDataUri(svgString) {
  const encoded = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${encoded}`;
}

window.CREW_SVGS = CREW_SVGS;
window.svgToDataUri = svgToDataUri;
