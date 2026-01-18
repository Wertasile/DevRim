/**
 * Creates a cropped image from the original image using the cropped area pixels
 * @param imageSrc - The source image (URL or base64)
 * @param pixelCrop - The cropped area in pixels from react-easy-crop
 * @returns Promise resolving to a Blob of the cropped image
 */
export const createImage = (imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        'image/jpeg',
        0.95
      );
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

/**
 * Converts a Blob to a File
 * @param blob - The blob to convert
 * @param filename - The filename for the file
 * @returns A File object
 */
export const blobToFile = (blob: Blob, filename: string): File => {
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
};
























