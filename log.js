window.addEventListener("load", () => {
  const editableDiv = document.getElementById("typograph-container");
  editableDiv.focus();
  const info = getScreenInfo();

  editableDiv.textContent = `Screen: ${info.screen.width}×${info.screen.height}
Viewport: ${info.viewport.width}×${info.viewport.height}
DPR: ${info.devicePixelRatio}
`;
});

const getScreenInfo = () => ({
  screen: {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
  },
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  window: {
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
  },
  devicePixelRatio: window.devicePixelRatio,
  orientation: screen.orientation?.type,
});
