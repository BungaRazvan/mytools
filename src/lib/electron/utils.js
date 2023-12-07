export function calculateCenterBounds(windowHeight, windowWidth, parentWindow) {
  const parentBounds = parentWindow.getBounds();

  return {
    x: parentBounds.x + (parentBounds.width - windowWidth) / 2,
    y: parentBounds.y + (parentBounds.height - windowHeight) / 2,
  };
}
