import fs from "fs";
import path from "path";
import zlib from "zlib";

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcPayload), 0);
  return Buffer.concat([len, crcPayload, crcBuf]);
}

function createPng(width, height, drawFn) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  const ihdrChunk = createChunk("IHDR", ihdr);

  const rowLen = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLen);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pOffset] = r;
      rawData[pOffset + 1] = g;
      rawData[pOffset + 2] = b;
      rawData[pOffset + 3] = a;
    }
  }

  const idatChunk = createChunk("IDAT", zlib.deflateSync(rawData, { level: 9 }));
  const iendChunk = createChunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function isInsideShield(nx, ny) {
  if (ny < -0.75 || ny > 0.85 || Math.abs(nx) > 0.72) return false;
  if (ny < -0.5 && ny < (-0.75 + Math.abs(nx) * 0.18)) return false;
  if (ny > 0.0) {
    const t = ny / 0.85;
    if (Math.abs(nx) > (0.72 * (1 - Math.pow(t, 1.4)))) return false;
  }
  return true;
}

function isInsideEmblem(nx, ny) {
  const dx = nx;
  const dy = ny - (-0.12);
  if (dx * dx + dy * dy <= 0.2 * 0.2) return true;
  if (ny >= -0.1 && ny <= 0.4 && Math.abs(nx) <= (0.12 - (ny + 0.1) * 0.05)) return true;
  return false;
}

function isInsideRoundedRect(x, y, w, h, r) {
  if (x >= r && x <= w - r) return true;
  if (y >= r && y <= h - r) return true;
  for (const [cx, cy] of [[r, r], [w - r, r], [r, h - r], [w - r, h - r]]) {
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy <= r * r) return true;
  }
  return false;
}

function drawSabiShield(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = isMaskable ? 0.65 : 0.82;
  const radius = (Math.min(w, h) / 2) * scale;
  const nx = (x - cx) / radius;
  const ny = (y - cy) / radius;

  if (isMaskable) {
    if (isInsideShield(nx, ny)) {
      if (isInsideEmblem(nx, ny)) return [5, 150, 105, 255];
      return [255, 255, 255, 255];
    }
    return [5, 150, 105, 255];
  }

  const cornerRadius = w * 0.22;
  if (!isInsideRoundedRect(x, y, w, h, cornerRadius)) return [0, 0, 0, 0];

  if (isInsideShield(nx, ny)) {
    if (isInsideEmblem(nx, ny)) return [5, 150, 105, 255];
    return [255, 255, 255, 255];
  }

  const grad = Math.min(1, Math.max(0, y / h));
  return [Math.round(5 - grad), Math.round(150 - grad * 30), Math.round(105 - grad * 18), 255];
}

const publicDir = path.resolve("public");
const targets = [
  { file: "icon-192.png", size: 192, maskable: false },
  { file: "icon-512.png", size: 512, maskable: false },
  { file: "icon-maskable-192.png", size: 192, maskable: true },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
  { file: "apple-touch-icon.png", size: 180, maskable: false },
];

for (const target of targets) {
  const buf = createPng(target.size, target.size, (x, y, w, h) =>
    drawSabiShield(x, y, w, h, target.maskable)
  );
  fs.writeFileSync(path.join(publicDir, target.file), buf);
  console.log(`Generated ${target.file} (${target.size}x${target.size}, ${buf.length} bytes)`);
}
