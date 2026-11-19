/* Velvet dye strengths use the original cushion's red channel for shading. */
(function (root) {
  const beds = {
    burgundy: { label: 'Burgundy red' },
    sapphire: { label: 'Sapphire blue', dye: [0.28, 0.78, 1.85] },
    emerald: { label: 'Emerald green', dye: [0.25, 1.35, 0.70] },
    violet: { label: 'Royal purple', dye: [1.22, 0.53, 1.75] },
    rose: { label: 'Rose pink', dye: [1.95, 0.82, 1.24] },
    teal: { label: 'Ocean teal', dye: [0.20, 1.40, 1.42] }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = beds;
  else root.blackcatBeds = beds;
})(typeof window !== 'undefined' ? window : globalThis);
