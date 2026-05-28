export type CropPosition = {
  x: number;
  y: number;
};

export type ImageSize = {
  width: number;
  height: number;
};

export const CROP_OUTPUT_SIZE = 512;
export const PROFILE_PICTURE_ACCEPT = "image/jpeg,image/png,image/webp";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getCoverLayout(size: ImageSize, zoom: number, position: CropPosition) {
  const baseScale = Math.max(CROP_OUTPUT_SIZE / size.width, CROP_OUTPUT_SIZE / size.height);
  const scale = baseScale * zoom;
  const renderedWidth = size.width * scale;
  const renderedHeight = size.height * scale;
  const minX = Math.min(0, CROP_OUTPUT_SIZE - renderedWidth);
  const minY = Math.min(0, CROP_OUTPUT_SIZE - renderedHeight);
  const x = clamp((CROP_OUTPUT_SIZE - renderedWidth) / 2 + position.x, minX, 0);
  const y = clamp((CROP_OUTPUT_SIZE - renderedHeight) / 2 + position.y, minY, 0);

  return { scale, renderedWidth, renderedHeight, x, y };
}

export function clampCropPosition(size: ImageSize, zoom: number, position: CropPosition) {
  const baseScale = Math.max(CROP_OUTPUT_SIZE / size.width, CROP_OUTPUT_SIZE / size.height);
  const scale = baseScale * zoom;
  const renderedWidth = size.width * scale;
  const renderedHeight = size.height * scale;
  const centerX = (CROP_OUTPUT_SIZE - renderedWidth) / 2;
  const centerY = (CROP_OUTPUT_SIZE - renderedHeight) / 2;
  const minX = Math.min(0, CROP_OUTPUT_SIZE - renderedWidth) - centerX;
  const maxX = -centerX;
  const minY = Math.min(0, CROP_OUTPUT_SIZE - renderedHeight) - centerY;
  const maxY = -centerY;

  return {
    x: clamp(position.x, minX, maxX),
    y: clamp(position.y, minY, maxY),
  };
}
