export function calculateCenterBounds(windowBounds, config) {
  const centerX = Math.round(
    windowBounds.x + (windowBounds.width - config.width) / 2
  );
  const centerY = Math.round(
    windowBounds.y + (windowBounds.height - config.height) / 2
  );

  return {
    y: centerY,
    x: centerX,
  };
}
