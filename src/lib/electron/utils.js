import { screen } from "electron";

export function calculateCenterBounds(windowHeight, windowWidth, parentWindow) {
  const parentBounds = parentWindow.getBounds();
  const currentDisplay = screen.getDisplayMatching(parentBounds);
  const scaleFactor = currentDisplay.scaleFactor;

  return {
    width: windowWidth * scaleFactor,
    height: windowHeight * scaleFactor,
    x: parentBounds.x * scaleFactor + (parentBounds.width - windowWidth) / 2,
    y: parentBounds.y * scaleFactor + (parentBounds.height - windowHeight) / 2,
  };
}
