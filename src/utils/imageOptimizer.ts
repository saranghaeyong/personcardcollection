/**
 * Utility for client-side image compression and optimization before upload.
 * Reduces storage usage while preserving sharp portrait quality (targeting max 1200x1500).
 */

export interface CompressionResult {
  file: File;
  previewUrl: string;
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
      error: 'Image file size is too large. Please choose an image under 10MB.'
    };
  }

  return { isValid: true };
}

export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1500,
  quality = 0.86
): Promise<CompressionResult> {
  const originalSize = file.size;

  // If already small (< 250KB) and webp or jpeg, we can still generate preview without aggressive recompression
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling preserving aspect ratio
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
          // Fallback if canvas context fails
          const previewUrl = URL.createObjectURL(file);
          resolve({
            file,
            previewUrl,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 0
          });
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP if supported, fallback to JPEG
        const outputType = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              const previewUrl = URL.createObjectURL(file);
              resolve({
                file,
                previewUrl,
                originalSize,
                compressedSize: originalSize,
                compressionRatio: 0
              });
              return;
            }

            // Create compressed file
            const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], newFileName, {
              type: outputType,
              lastModified: Date.now()
            });

            const previewUrl = URL.createObjectURL(compressedFile);
            const compressedSize = compressedFile.size;
            const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

            resolve({
              file: compressedFile,
              previewUrl,
              originalSize,
              compressedSize,
              compressionRatio: Math.max(0, compressionRatio)
            });
          },
          outputType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for optimization.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };
  });
}
