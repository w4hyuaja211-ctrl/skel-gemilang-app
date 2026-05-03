// Make corners-color transparent. Simple flood-fill based BG removal that works
// great for logos with a uniform background (white, near-white, or single solid color).
export async function removeBackground(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const max = 1024;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  const w = canvas.width;
  const h = canvas.height;

  // sample bg color from 4 corners (average)
  const corners = [
    [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
  ];
  let r = 0, g = 0, b = 0;
  for (const [x, y] of corners) {
    const i = (y * w + x) * 4;
    r += px[i]; g += px[i + 1]; b += px[i + 2];
  }
  r = Math.round(r / 4); g = Math.round(g / 4); b = Math.round(b / 4);

  const tol = 38; // tolerance
  const tol2 = tol * tol;

  // BFS flood-fill from edges
  const visited = new Uint8Array(w * h);
  const queue: number[] = [];
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const idx = y * w + x;
    if (visited[idx]) return;
    const i = idx * 4;
    const dr = px[i] - r, dg = px[i + 1] - g, db = px[i + 2] - b;
    if (dr * dr + dg * dg + db * db <= tol2) {
      visited[idx] = 1;
      queue.push(idx);
    }
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (queue.length) {
    const idx = queue.pop()!;
    const x = idx % w, y = Math.floor(idx / w);
    px[idx * 4 + 3] = 0; // transparent
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }

  // Soft anti-alias: any nearly-bg pixel adjacent to transparent gets reduced alpha
  for (let i = 0; i < w * h; i++) {
    if (px[i * 4 + 3] === 0) continue;
    const dr = px[i * 4] - r, dg = px[i * 4 + 1] - g, db = px[i * 4 + 2] - b;
    const dist2 = dr * dr + dg * dg + db * db;
    if (dist2 < tol2 * 2) {
      const t = Math.min(1, Math.max(0, (dist2 - tol2) / tol2));
      px[i * 4 + 3] = Math.round(px[i * 4 + 3] * t);
    }
  }

  ctx.putImageData(data, 0, 0);
  return await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); rej(e); };
    img.src = url;
  });
}
