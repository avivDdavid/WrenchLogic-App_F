// Resize a user-picked image File down to a small square-ish JPEG data URI
// (base64), so avatars can be stored directly in profiles.avatar_url without a
// Storage bucket. Keeping it small (~128px) keeps the row — and the data URI we
// render — lightweight.
export function fileToResizedDataUrl(file, maxSize = 128, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error('no file')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
