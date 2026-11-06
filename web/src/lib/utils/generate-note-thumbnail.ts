export async function generateNoteThumbnail(file: File): Promise<Blob | null> {
  if (typeof window === "undefined") return null;
  if (!file.type.startsWith("image/")) return null;

  try {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const { width, height } = fit(img.naturalWidth || img.width, img.naturalHeight || img.height, 1280, 800);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, width, height);
      return (await toBlob(canvas, "image/webp", 0.82)) ?? (await toBlob(canvas, "image/jpeg", 0.82));
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return null;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function fit(w: number, h: number, maxW: number, maxH: number) {
  if (w <= 0 || h <= 0) return { width: maxW, height: maxH };
  const scale = Math.min(maxW / w, maxH / h, 1);
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
