/**
 * Compresses an uploaded image file down to a lightweight, crisp Data URL
 * to avoid exceeding browser limits and ensure permanent, fast storage.
 */
export function compressImageFile(
  file: File | Blob,
  maxWidth = 900,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        reject(new Error('Falha ao ler arquivo de imagem'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG for compact file size and great clarity
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        // Fallback to original read string if image loading fails
        resolve(src);
      };

      img.src = src;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
