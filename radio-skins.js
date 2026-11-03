// Compatibility for previously cached player versions. All themed skins are retired.
(function () {
  try {
    localStorage.removeItem('coltRadioSkin');
    localStorage.removeItem('coltRadioSkinPreview');
  } catch {}
})();
