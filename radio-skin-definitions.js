// Shared chooser, artwork and layout registry. Illustration exceptions remain in CSS.
(function (root) {
  'use strict';
  const skins = [
  {
    "id": "original",
    "label": "Original",
    "layout": "original",
    "title": "plain",
    "assets": [],
    "variables": {},
    "swatch": "linear-gradient(135deg,#dc324e,#1c090e)"
  },
  {
    "id": "inferno",
    "label": "Inferno Forge",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/inferno-atlas-lossless.png",
      "assets/radio-skins/illustrated/inferno-header-v2-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#ffb44e"
    },
    "swatch": "linear-gradient(135deg,#ffcd6a,#a52f09,#150a04)"
  },
  {
    "id": "frostfang",
    "label": "Frostfang Citadel",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/frostfang-atlas-lossless.png",
      "assets/radio-skins/illustrated/frostfang-header-v2-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#85dcff"
    },
    "swatch": "linear-gradient(135deg,#e5fbff,#287eb6,#071827)"
  },
  {
    "id": "temple",
    "label": "Overgrown Temple",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/temple-atlas-lossless.png",
      "assets/radio-skins/illustrated/temple-header-v2-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#8ee6af"
    },
    "swatch": "linear-gradient(135deg,#e6c16c,#1eac67,#041b13)"
  },
  {
    "id": "nebula",
    "label": "Nebula Rider",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/nebula-atlas-lossless.png",
      "assets/radio-skins/illustrated/nebula-header-v2-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#d09bff"
    },
    "swatch": "linear-gradient(135deg,#7cecff,#c054f1,#160a2d)"
  },
  {
    "id": "bayou",
    "label": "Bayou Nights",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/bayou-atlas-lossless.png",
      "assets/radio-skins/illustrated/bayou-header-lossless.png"
    ],
    "variables": {},
    "swatch": "linear-gradient(135deg,#dfe993,#83a929,#513516)"
  },
  {
    "id": "hiphop",
    "label": "Hip-Hop DJ",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/hiphop-atlas-lossless.png",
      "assets/radio-skins/illustrated/hiphop-header-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#ffcf65"
    },
    "swatch": "linear-gradient(135deg,#ffe2a2,#8a5520,#171018,#8b35bd)"
  },
  {
    "id": "cyberpunk",
    "label": "Neon Cyberpunk",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/cyberpunk-atlas-lossless.png",
      "assets/radio-skins/illustrated/cyberpunk-header-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#65f4ff"
    },
    "swatch": "linear-gradient(135deg,#87f7ff,#15314b,#d837f3)"
  },
  {
    "id": "country",
    "label": "Country Music",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/country-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/country-atlas-lossless.png')",
      "--genre-base": "#251306",
      "--genre-edge": "#c09250",
      "--genre-accent": "#f5d592",
      "--genre-text": "#ffefd2",
      "--genre-material": "linear-gradient(#1f0e0433,#1f0e0477),var(--genre-art) center 43% / auto 620% no-repeat",
      "--genre-band": "1254 / 190",
      "--genre-band-position": "41.8233%",
      "--genre-portrait": "205%"
    },
    "swatch": "linear-gradient(135deg,#ffdc98,#764119,#244476)"
  },
  {
    "id": "metal",
    "label": "Heavy Metal",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/metal-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/metal-atlas-lossless.png')",
      "--genre-base": "#100e10",
      "--genre-edge": "#a9a5a2",
      "--genre-accent": "#ff7954",
      "--genre-text": "#fff0e8",
      "--genre-material": "repeating-linear-gradient(130deg,#b7c5ce0a 0 1px,transparent 1px 4px),linear-gradient(135deg,#36383b,#121214 60%,#373334)",
      "--genre-band": "1254 / 215",
      "--genre-band-position": "42.7334%",
      "--genre-portrait": "213%"
    },
    "swatch": "linear-gradient(135deg,#d0d0cf,#242327,#e13b1a)"
  },
  {
    "id": "jazz",
    "label": "Jazz Club",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/jazz-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/jazz-atlas-lossless.png')",
      "--genre-base": "#20100c",
      "--genre-edge": "#c3954c",
      "--genre-accent": "#ffe0a1",
      "--genre-text": "#fff2d6",
      "--genre-material": "repeating-linear-gradient(2deg,#d2973e0d 0 1px,transparent 1px 5px),linear-gradient(120deg,#49231c,#291412 65%,#563223)",
      "--genre-band": "1254 / 222",
      "--genre-band-position": "39.9225%",
      "--genre-portrait": "210%"
    },
    "swatch": "linear-gradient(135deg,#e3ba72,#4a2018,#221218)"
  },
  {
    "id": "djclub",
    "label": "DJ Club",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/djclub-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/djclub-atlas-lossless.png')",
      "--genre-base": "#070f22",
      "--genre-edge": "#6d9cda",
      "--genre-accent": "#79f1ff",
      "--genre-text": "#e7faff",
      "--genre-material": "repeating-linear-gradient(0deg,#9ddaff0a 0 1px,transparent 1px 4px),linear-gradient(120deg,#122c4c,#0b1027 65%,#30204d)",
      "--genre-band": "1254 / 226",
      "--genre-band-position": "39.5914%",
      "--genre-portrait": "210%"
    },
    "swatch": "linear-gradient(135deg,#80f9ff,#142a67,#bd50ff)"
  },
  {
    "id": "reggae",
    "label": "Reggae",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/reggae-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/reggae-atlas-lossless.png')",
      "--genre-base": "#0b2018",
      "--genre-edge": "#d3ae44",
      "--genre-accent": "#ffe27f",
      "--genre-text": "#fff4ce",
      "--genre-material": "repeating-linear-gradient(0deg,#eed5830b 0 1px,transparent 1px 6px),linear-gradient(125deg,#23583e,#112c22 65%,#244537)",
      "--genre-band": "1254 / 225",
      "--genre-band-position": "40.8163%",
      "--genre-portrait": "205%"
    },
    "swatch": "linear-gradient(135deg,#c83c32 0 33%,#f0cb5c 34% 65%,#338950 66%)"
  },
  {
    "id": "disco",
    "label": "Disco",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/disco-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/disco-atlas-lossless.png')",
      "--genre-base": "#1c1029",
      "--genre-edge": "#bfc3df",
      "--genre-accent": "#ffb4ee",
      "--genre-text": "#fff2fd",
      "--genre-material": "radial-gradient(ellipse at top left,#b755c744,transparent 60%),repeating-linear-gradient(115deg,#d0d6ff0b 0 1px,transparent 1px 5px),linear-gradient(130deg,#463c65,#241c34 65%,#493256)",
      "--genre-band": "1254 / 200",
      "--genre-band-position": "38.8994%",
      "--genre-portrait": "200%"
    },
    "swatch": "conic-gradient(#f2e5ff,#c969d6,#8de2f0,#fde0a1,#f2e5ff)"
  },
  {
    "id": "punk",
    "label": "Punk Rock",
    "layout": "genre",
    "title": "letters",
    "assets": [
      "assets/radio-skins/illustrated/punk-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/punk-atlas-lossless.png')",
      "--genre-base": "#151719",
      "--genre-edge": "#a4a5a9",
      "--genre-accent": "#d7ff74",
      "--genre-text": "#f5ffe6",
      "--genre-material": "repeating-linear-gradient(165deg,#dce3ed0c 0 1px,transparent 1px 7px),linear-gradient(125deg,#34383d,#181b20 65%,#303138)",
      "--genre-band": "1254 / 210",
      "--genre-band-position": "36.8774%",
      "--genre-portrait": "198%"
    },
    "swatch": "linear-gradient(135deg,#dcff70,#22232a 40% 65%,#f47cbd)"
  },
  {
    "id": "blues",
    "label": "Blues",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/blues-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/blues-atlas-lossless.png')",
      "--genre-base": "#08182d",
      "--genre-edge": "#c39b56",
      "--genre-accent": "#f5d48b",
      "--genre-text": "#fff0cf",
      "--genre-material": "repeating-linear-gradient(0deg,#b6c8ed08 0 1px,transparent 1px 4px),linear-gradient(125deg,#204271,#0b203e 65%,#213a5a)",
      "--genre-band": "1254 / 200",
      "--genre-band-position": "37.9507%",
      "--genre-portrait": "195%"
    },
    "swatch": "linear-gradient(135deg,#e2bb70,#18345f 40%,#08162d 70%,#b58a44)"
  },
  {
    "id": "mariachi",
    "label": "Mariachi Fiesta",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/mariachi-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/mariachi-atlas.png')",
      "--genre-base": "#230810",
      "--genre-edge": "#c7b398",
      "--genre-accent": "#ffe2a2",
      "--genre-text": "#fff1d9",
      "--genre-material": "repeating-linear-gradient(0deg,#ffd9a009 0 1px,transparent 1px 4px),linear-gradient(125deg,#651c2c,#2a0b16 65%,#701d32)",
      "--genre-band": "1254 / 205",
      "--genre-band-position": "41.5%",
      "--genre-portrait": "200%"
    },
    "swatch": "linear-gradient(135deg,#e3d7c5,#6b233e 48%,#270b1b)"
  },
  {
    "id": "symphony",
    "label": "Symphony Hall",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/symphony-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/symphony-atlas.png')",
      "--genre-base": "#240d0b",
      "--genre-edge": "#c89b4f",
      "--genre-accent": "#ffe3a0",
      "--genre-text": "#fff0d5",
      "--genre-material": "repeating-linear-gradient(0deg,#bd81300b 0 1px,transparent 1px 5px),linear-gradient(125deg,#61301b,#2c100e 65%,#53221a)",
      "--genre-band": "1254 / 205",
      "--genre-band-position": "41.5%",
      "--genre-portrait": "205%"
    },
    "swatch": "linear-gradient(135deg,#ffe4a3,#754524 48%,#28160f)"
  },
  {
    "id": "rockabilly",
    "label": "Rockabilly Jukebox",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/rockabilly-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/rockabilly-atlas.png')",
      "--genre-base": "#072b2d",
      "--genre-edge": "#d2c9b6",
      "--genre-accent": "#ffe3a2",
      "--genre-text": "#fff6dc",
      "--genre-material": "repeating-linear-gradient(0deg,#ffffff07 0 1px,transparent 1px 4px),linear-gradient(125deg,#125f63,#082c32 65%,#15676a)",
      "--genre-band": "1254 / 205",
      "--genre-band-position": "41.5%",
      "--genre-portrait": "205%"
    },
    "swatch": "linear-gradient(135deg,#fff4da,#b51e39 48%,#172725)"
  }
];
  skins.push(...[
  {
    "id": "funk",
    "label": "Funk Groove",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/funk-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/funk-atlas.png')",
      "--genre-base": "#260b21",
      "--genre-edge": "#e59a53",
      "--genre-accent": "#ffd194",
      "--genre-text": "#fff0d6",
      "--genre-material": "repeating-linear-gradient(0deg,#ffa3300c 0 1px,transparent 1px 4px),linear-gradient(135deg,#6c284a,#2b0b25 65%,#773447)",
      "--genre-band": "1254 / 205",
      "--genre-band-position": "42%",
      "--genre-portrait": "205%"
    },
    "swatch": "linear-gradient(135deg,#ffd194,#260b21)"
  },
  {
    "id": "tropical",
    "label": "Tropical Steel Band",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/tropical-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/tropical-atlas.png')",
      "--genre-base": "#063b40",
      "--genre-edge": "#e3b46a",
      "--genre-accent": "#ffd69a",
      "--genre-text": "#fff5de",
      "--genre-material": "linear-gradient(135deg,#08797d,#063c46 65%,#106e73)",
      "--genre-band": "1254 / 205",
      "--genre-band-position": "40%",
      "--genre-portrait": "205%"
    },
    "swatch": "linear-gradient(135deg,#ffd69a,#063b40)"
  },
  {
    "id": "irish",
    "label": "Irish Folk",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/irish-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/irish-atlas.png')",
      "--genre-base": "#112516",
      "--genre-edge": "#c59b5c",
      "--genre-accent": "#f6d293",
      "--genre-text": "#fff1d3",
      "--genre-material": "repeating-linear-gradient(0deg,#eec17f10 0 1px,transparent 1px 5px),linear-gradient(130deg,#6a4226,#302315 65%,#70482a)",
      "--genre-band": "1254 / 205",
      "--genre-band-position": "42%",
      "--genre-portrait": "205%"
    },
    "swatch": "linear-gradient(135deg,#f6d293,#112516)"
  },
  {
    "id": "gospel",
    "label": "Gospel Sunday",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/gospel-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/gospel-atlas.png')",
      "--genre-base": "#260e39",
      "--genre-edge": "#e2b653",
      "--genre-accent": "#ffe8ae",
      "--genre-text": "#fff5e2",
      "--genre-material": "linear-gradient(135deg,#622775,#270e3a 65%,#552668)",
      "--genre-band": "1254 / 205",
      "--genre-band-position": "42%",
      "--genre-portrait": "205%"
    },
    "swatch": "linear-gradient(135deg,#ffe8ae,#260e39)"
  }
]);
  skins.push(...[
  {
    "id": "rainyrecords",
    "label": "Rainy Day Records",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/rainyrecords-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/rainyrecords-atlas.png')",
      "--genre-base": "#11211e",
      "--genre-edge": "#ad8858",
      "--genre-accent": "#ebcf9e",
      "--genre-text": "#f7efdc",
      "--genre-material": "repeating-linear-gradient(0deg,#f6dfb30a 0 1px,transparent 1px 4px),linear-gradient(135deg,#365148,#172b25 70%,#364c3d)",
      "--genre-band": "1254 / 205",
      "--genre-band-position": "38%",
      "--genre-portrait": "200%"
    },
    "swatch": "linear-gradient(135deg,#ebcf9e,#11211e)"
  },
  {
    "id": "snowfall",
    "label": "Snowfall Stereo",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/snowfall-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/snowfall-atlas.png')",
      "--genre-base": "#132332",
      "--genre-edge": "#adc9d5",
      "--genre-accent": "#ffd49c",
      "--genre-text": "#edf7fc",
      "--genre-material": "repeating-linear-gradient(45deg,#d9efff08 0 1px,transparent 1px 4px),linear-gradient(135deg,#354d60,#162936 70%,#345365)",
      "--genre-band": "1254 / 205",
      "--genre-band-position": "37%",
      "--genre-portrait": "200%"
    },
    "swatch": "linear-gradient(135deg,#ffd49c,#132332)"
  },
  {
    "id": "goldentapes",
    "label": "Golden Hour Tapes",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/goldentapes-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/goldentapes-atlas.png')",
      "--genre-base": "#2e1913",
      "--genre-edge": "#cc9b62",
      "--genre-accent": "#ffe0ab",
      "--genre-text": "#fff1d5",
      "--genre-material": "repeating-linear-gradient(0deg,#f3c7830c 0 1px,transparent 1px 3px),linear-gradient(135deg,#70422a,#301b17 70%,#633a27)",
      "--genre-band": "1254 / 205",
      "--genre-band-position": "37%",
      "--genre-portrait": "190%"
    },
    "swatch": "linear-gradient(135deg,#ffe0ab,#2e1913)"
  },
  {
    "id": "mixtape",
    "label": "Midnight Mixtape",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/mixtape-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/mixtape-atlas.png')",
      "--genre-base": "#111725",
      "--genre-edge": "#9f9cc6",
      "--genre-accent": "#f8c7a7",
      "--genre-text": "#f1ecff",
      "--genre-material": "repeating-linear-gradient(0deg,#c6c4ff08 0 1px,transparent 1px 4px),linear-gradient(140deg,#32304c,#161b2e 70%,#35304a)",
      "--genre-band": "1254 / 205",
      "--genre-band-position": "37%",
      "--genre-portrait": "190%"
    },
    "swatch": "linear-gradient(135deg,#f8c7a7,#111725)"
  }
]);
  skins.push(...[
  {
    "id": "afterschoolboy",
    "label": "After-School Audio — Boy",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/afterschoolboy-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/afterschoolboy-atlas.png')",
      "--genre-base": "#14232d",
      "--genre-edge": "#a8baa8",
      "--genre-accent": "#f3c3a4",
      "--genre-text": "#f3f1e3",
      "--genre-material": "repeating-linear-gradient(0deg,#e6f6e408 0 1px,transparent 1px 4px),linear-gradient(140deg,#304844,#172b32 70%,#344d46)",
      "--genre-band": "1254 / 150",
      "--genre-band-position": "40%",
      "--genre-portrait": "200%"
    },
    "swatch": "linear-gradient(135deg,#f3c3a4,#14232d)"
  },
  {
    "id": "afterschoolgirl",
    "label": "After-School Audio — Girl",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/afterschoolgirl-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/afterschoolgirl-atlas.png')",
      "--genre-base": "#241c32",
      "--genre-edge": "#bba6c6",
      "--genre-accent": "#f5c7b1",
      "--genre-text": "#faf0fb",
      "--genre-material": "repeating-linear-gradient(0deg,#ede0ff08 0 1px,transparent 1px 4px),linear-gradient(140deg,#4e3c5f,#271d36 70%,#51394f)",
      "--genre-band": "1254 / 150",
      "--genre-band-position": "38%",
      "--genre-portrait": "190%"
    },
    "swatch": "linear-gradient(135deg,#f5c7b1,#241c32)"
  }
]);
  skins.push(...[
  {
    "id": "paperback",
    "label": "Paperback Playback",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/paperback-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/paperback-atlas.png')",
      "--genre-base": "#11241d",
      "--genre-edge": "#b39159",
      "--genre-accent": "#efdbad",
      "--genre-text": "#faf1d8",
      "--genre-material": "repeating-linear-gradient(0deg,#dfebcd08 0 1px,transparent 1px 3px),linear-gradient(140deg,#355442,#142b22 70%,#304b36)",
      "--genre-band": "1254 / 150",
      "--genre-band-position": "40%",
      "--genre-portrait": "200%"
    },
    "swatch": "linear-gradient(135deg,#efdbad,#11241d)"
  },
  {
    "id": "attic",
    "label": "Attic Acoustics",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/attic-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/attic-atlas.png')",
      "--genre-base": "#2a1c15",
      "--genre-edge": "#bd915c",
      "--genre-accent": "#ffe1ac",
      "--genre-text": "#fff1d4",
      "--genre-material": "repeating-linear-gradient(0deg,#e5c58b12 0 1px,transparent 1px 3px),linear-gradient(140deg,#724c2f,#312219 70%,#6b482c)",
      "--genre-band": "1254 / 150",
      "--genre-band-position": "40%",
      "--genre-portrait": "200%"
    },
    "swatch": "linear-gradient(135deg,#ffe1ac,#2a1c15)"
  },
  {
    "id": "windowseat",
    "label": "Window Seat Sessions",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/windowseat-atlas.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/windowseat-atlas.png')",
      "--genre-base": "#102233",
      "--genre-edge": "#c4a46a",
      "--genre-accent": "#ffdfaa",
      "--genre-text": "#f4eedb",
      "--genre-material": "repeating-linear-gradient(45deg,#d5e9f508 0 1px,transparent 1px 4px),linear-gradient(140deg,#2b4559,#102538 70%,#30485a)",
      "--genre-band": "1254 / 150",
      "--genre-band-position": "40%",
      "--genre-portrait": "200%"
    },
    "swatch": "linear-gradient(135deg,#ffdfaa,#102233)"
  }
]);
  skins.push(...[
  {
    "id": "moonwalk",
    "label": "Moonwalk Magic",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/moonwalk-atlas.png",
      "assets/radio-skins/illustrated/moonwalk-portrait-v3.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/moonwalk-atlas.png')",
      "--genre-base": "#080e19",
      "--genre-edge": "#b6c7df",
      "--genre-accent": "#a7ddff",
      "--genre-text": "#eef5ff",
      "--genre-material": "repeating-linear-gradient(0deg,#d6e9ff06 0 1px,transparent 1px 4px),linear-gradient(140deg,#172434,#080e1a 70%,#172c40)",
      "--genre-band": "1254 / 150",
      "--genre-band-position": "40%",
      "--genre-portrait": "195%"
    },
    "swatch": "linear-gradient(135deg,#a7ddff,#080e19)",
    "kicker": "King of Pop Tribute"
  },
  {
    "id": "purplerain",
    "label": "Purple Rain",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/purplerain-atlas.png",
      "assets/radio-skins/illustrated/purplerain-portrait.png",
      "assets/radio-skins/illustrated/purplerain-wordmark.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/purplerain-atlas.png')",
      "--genre-base": "#e4d5ef",
      "--genre-edge": "#ad8dc5",
      "--genre-accent": "#79548f",
      "--genre-text": "#453251",
      "--genre-material": "repeating-linear-gradient(45deg,#efd0ff08 0 1px,transparent 1px 4px),linear-gradient(140deg,#eadcf4,#d7c1e5 70%,#e6d4ee)",
      "--genre-band": "1254 / 150",
      "--genre-band-position": "40%",
      "--genre-portrait": "195%"
    },
    "swatch": "linear-gradient(135deg,#79548f,#e4d5ef)",
    "kicker": "Purple Rain"
  }
]);
  skins.push(...[
  {
    "id": "dolly",
    "label": "Backwoods Barbie",
    "kicker": "Backwoods Barbie",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/dolly-atlas.png",
      "assets/radio-skins/illustrated/dolly-portrait.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/dolly-atlas.png')",
      "--genre-base": "#f6d9e5",
      "--genre-edge": "#bd789d",
      "--genre-accent": "#b44280",
      "--genre-text": "#632641",
      "--genre-material": "linear-gradient(160deg,#fff3fa,#e5a9c6 58%,#f5d2e3 63%,#c27e9f)",
      "--genre-band": "1254 / 150",
      "--genre-band-position": "40%",
      "--genre-portrait": "195%"
    },
    "swatch": "linear-gradient(135deg,#b44280,#f6d9e5)"
  },
  {
    "id": "elvis",
    "label": "The King",
    "kicker": "The King",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/elvis-atlas.png",
      "assets/radio-skins/illustrated/elvis-portrait.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/elvis-atlas.png')",
      "--genre-base": "#f5efdf",
      "--genre-edge": "#b39750",
      "--genre-accent": "#8a6422",
      "--genre-text": "#44341c",
      "--genre-material": "linear-gradient(160deg,#fffef4,#e5d9b6 58%,#fff4d6 63%,#bda878)",
      "--genre-band": "1254 / 150",
      "--genre-band-position": "40%",
      "--genre-portrait": "195%"
    },
    "swatch": "linear-gradient(135deg,#8a6422,#f5efdf)"
  }
]);
  skins.push(...[
  {
    "id": "cybersamurai",
    "label": "Cyber Samurai",
    "kicker": "Classroom Music",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/cybersamurai-atlas.png",
      "assets/radio-skins/illustrated/cybersamurai-portrait.png",
      "assets/radio-skins/illustrated/cybersamurai-wordmark.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/cybersamurai-atlas.png')",
      "--genre-base": "#080b12",
      "--genre-edge": "#73515d",
      "--genre-accent": "#ff2345",
      "--genre-text": "#fff4f6",
      "--genre-material": "linear-gradient(135deg,#15151e,#080b12)",
      "--genre-band": "1254 / 150",
      "--genre-band-position": "40%",
      "--genre-portrait": "195%"
    },
    "swatch": "linear-gradient(135deg,#ff2345,#080b12)"
  }
]);
  skins.forEach(skin => {
    Object.freeze(skin.assets);
    Object.freeze(skin.variables);
    Object.freeze(skin);
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = Object.freeze(skins);
  else root.coltRadioSkinDefinitions = Object.freeze(skins);
})(typeof window !== 'undefined' ? window : globalThis);
