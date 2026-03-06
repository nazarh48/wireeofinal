import fs from "fs";
import path from "path";
import sharp from "sharp";

const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;
const QUALITY = 80;
const VARIANT_WIDTHS = [320, 768, 1280];

function toLocalPathFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/^\/uploads\/(.+)/);
  if (!match) return null;
  const relative = match[1];
  return path.join(process.cwd(), "uploads", relative.replace(/^\//, ""));
}

export async function optimizeImageAtUrl(url) {
  const localPath = toLocalPathFromUrl(url);
  if (!localPath) return;
  if (!fs.existsSync(localPath)) return;

  try {
    const img = sharp(localPath);
    const metadata = await img.metadata();
    if (!metadata.width || !metadata.height) return;

    const width = Math.min(metadata.width, MAX_WIDTH);
    const height = Math.min(metadata.height, MAX_HEIGHT);

    // First, optimise and downscale the original in-place.
    let basePipeline = img.resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    });

    if (metadata.format === "jpeg" || metadata.format === "jpg") {
      basePipeline = basePipeline.jpeg({ quality: QUALITY, mozjpeg: true });
    } else if (metadata.format === "png") {
      basePipeline = basePipeline.png({ quality: QUALITY, compressionLevel: 9 });
    } else if (metadata.format === "webp") {
      basePipeline = basePipeline.webp({ quality: QUALITY });
    }

    await basePipeline.toFile(`${localPath}.tmp`);
    await fs.promises.rename(`${localPath}.tmp`, localPath);

    // Then, generate WebP variants for responsive loading.
    const dir = path.dirname(localPath);
    const ext = path.extname(localPath);
    const baseName = path.basename(localPath, ext);

    await Promise.all(
      VARIANT_WIDTHS.map(async (variantWidth) => {
        const variantPath = path.join(dir, `${baseName}@${variantWidth}w.webp`);
        try {
          const variant = sharp(localPath).resize(variantWidth, MAX_HEIGHT, {
            fit: "inside",
            withoutEnlargement: true,
          });
          await variant
            .webp({ quality: QUALITY })
            .toFile(variantPath);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(
            "[PERF][images] Variant generation failed",
            url,
            variantWidth,
            err?.message || err,
          );
        }
      }),
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[PERF][images] Optimization failed for", url, err?.message || err);
  }
}

