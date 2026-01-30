import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const PRODUCT_UPLOAD_DIR = path.join(UPLOAD_ROOT, "products");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(PRODUCT_UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRODUCT_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const name = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${safeExt}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new Error("Only image uploads are allowed"));
};

export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: { files: 10, fileSize: 10 * 1024 * 1024 }, // 10MB each
}).array("images", 10);

