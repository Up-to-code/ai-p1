export type CropPosition = { x: number; y: number };
export type ImageSize = { width: number; height: number };

export const organizationLogoOutputSize = 512;

export function clampLogoCrop(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function organizationLogoCoverLayout(size: ImageSize, zoom: number, position: CropPosition) {
  const baseScale = Math.max(organizationLogoOutputSize / size.width, organizationLogoOutputSize / size.height);
  const scale = baseScale * zoom;
  const renderedWidth = size.width * scale;
  const renderedHeight = size.height * scale;
  const minX = Math.min(0, organizationLogoOutputSize - renderedWidth);
  const minY = Math.min(0, organizationLogoOutputSize - renderedHeight);
  const x = clampLogoCrop((organizationLogoOutputSize - renderedWidth) / 2 + position.x, minX, 0);
  const y = clampLogoCrop((organizationLogoOutputSize - renderedHeight) / 2 + position.y, minY, 0);

  return { scale, renderedWidth, renderedHeight, x, y };
}

export function clampLogoCropPosition(size: ImageSize, zoom: number, position: CropPosition) {
  const baseScale = Math.max(organizationLogoOutputSize / size.width, organizationLogoOutputSize / size.height);
  const scale = baseScale * zoom;
  const renderedWidth = size.width * scale;
  const renderedHeight = size.height * scale;
  const centerX = (organizationLogoOutputSize - renderedWidth) / 2;
  const centerY = (organizationLogoOutputSize - renderedHeight) / 2;

  return {
    x: clampLogoCrop(position.x, Math.min(0, organizationLogoOutputSize - renderedWidth) - centerX, -centerX),
    y: clampLogoCrop(position.y, Math.min(0, organizationLogoOutputSize - renderedHeight) - centerY, -centerY),
  };
}
