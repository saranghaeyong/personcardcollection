/**
 * Utility for client-side image compression and conversion to browser-safe base64 Data URLs.
 * Ensures uploaded photos are lightweight for localStorage while preserving crisp portrait quality.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB input limit

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!SUPPORTED_TYPES.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Please upload a JPG, JPEG, PNG, or WEBP image file.'
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'Image file size is too large. Please select an image under 10MB.'
    };
  }

  return { isValid: true };
}

/**
 * Resize and compress an image file into a compact base64 Data URL.
 * Resizes to portrait dimensions (max 750px width, 950px height) at JPEG 0.82 quality.
 * Typically produces ~35KB to 60KB per image, allowing dozens of cards in browser localStorage.
 */
export async function compressImageToDataUrl(
  file: File,
  maxWidth = 750,
  maxHeight = 950,
  quality = 0.82
): Promise<CompressionResult> {
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      const rawDataUrl = event.target?.result as string;
      img.src = rawDataUrl;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: rawDataUrl,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 0
          });
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compact JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxBytes = Math.round((compressedDataUrl.length * 3) / 4);
        const compressionRatio = Math.round(((originalSize - approxBytes) / originalSize) * 100);

        resolve({
          dataUrl: compressedDataUrl,
          originalSize,
          compressedSize: approxBytes,
          compressionRatio: Math.max(0, compressionRatio)
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for processing.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };
  });
}
