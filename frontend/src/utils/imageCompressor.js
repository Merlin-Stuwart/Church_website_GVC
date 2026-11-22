/**
 * Compresses an image File or Base64 data URL using an HTML5 Canvas.
 * Reduces 5MB-15MB camera photos to ~30KB-60KB without visible quality loss.
 */
export async function compressImage(source, maxWidth = 600, quality = 0.8) {
  if (!source) return source;

  // If it's a File or Blob
  if (source instanceof Blob || (typeof File !== 'undefined' && source instanceof File)) {
    const dataUrl = await fileToDataUrl(source);
    return compressDataUrl(dataUrl, maxWidth, quality);
  }

  // If it's a base64 Data URL
  if (typeof source === 'string' && source.startsWith('data:image/')) {
    // If it's SVG, leave as is
    if (source.startsWith('data:image/svg+xml')) return source;
    // If already small (< 60KB), no need to compress
    if (source.length < 60000) return source;
    return compressDataUrl(source, maxWidth, quality);
  }

  // Regular URL path like "/images/pastor.jpg"
  return source;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function compressDataUrl(dataUrl, maxWidth, quality) {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined') return resolve(dataUrl);
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (e) {
          console.warn('Canvas compression error, using original', e);
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch (e) {
      resolve(dataUrl);
    }
  });
}
