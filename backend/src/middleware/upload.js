import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const PRODUCT_UPLOAD_DIR = path.join(UPLOAD_ROOT, "products");
const SOLUTION_UPLOAD_DIR = path.join(UPLOAD_ROOT, "solutions");
const PDF_MATERIAL_UPLOAD_DIR = path.join(UPLOAD_ROOT, "pdf-materials");
const PRODUCT_FILES_DIR = path.join(UPLOAD_ROOT, "product-files");
const CATEGORY_UPLOAD_DIR = path.join(UPLOAD_ROOT, "categories");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(PRODUCT_UPLOAD_DIR);
ensureDir(SOLUTION_UPLOAD_DIR);
ensureDir(PDF_MATERIAL_UPLOAD_DIR);
ensureDir(PRODUCT_FILES_DIR);
ensureDir(CATEGORY_UPLOAD_DIR);

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRODUCT_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const name = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${safeExt}`;
    cb(null, name);
  },
});

const solutionStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, SOLUTION_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const name = `sol_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${safeExt}`;
    cb(null, name);
  },
});

const pdfMaterialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isPhoto = file.fieldname === "photo";
    cb(null, PDF_MATERIAL_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const prefix = file.fieldname === "photo" ? "img" : "file";
    const name = `pdfmat_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${safeExt}`;
    cb(null, name);
  },
});

const productFilesStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRODUCT_FILES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const name = `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${safeExt}`;
    cb(null, name);
  },
});

const categoryImageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CATEGORY_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const name = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${safeExt}`;
    cb(null, name);
  },
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new Error("Only image uploads are allowed"));
};

export const uploadCategoryImage = multer({
  storage: categoryImageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

const anyFileFilter = (req, file, cb) => cb(null, true);

export const uploadProductImages = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: { files: 10, fileSize: 10 * 1024 * 1024 }, // 10MB each
}).array("images", 10);

export const uploadSolutionAssets = multer({
  storage: solutionStorage,
  fileFilter: anyFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
}).fields([{ name: "images", maxCount: 10 }, { name: "files", maxCount: 10 }]);

export const uploadPdfMaterial = multer({
  storage: pdfMaterialStorage,
  fileFilter: anyFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
}).fields([{ name: "photo", maxCount: 1 }, { name: "file", maxCount: 1 }]);

export const uploadProductFiles = multer({
  storage: productFilesStorage,
  fileFilter: anyFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
}).array("files", 10);

const productMixedStorageMulter = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === "images" ? PRODUCT_UPLOAD_DIR : PRODUCT_FILES_DIR;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "") || "";
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const prefix = file.fieldname === "images" ? "prod" : "file";
    const name = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${safeExt}`;
    cb(null, name);
  },
});
export const uploadProductImagesAndFiles = multer({
  storage: productMixedStorageMulter,
  fileFilter: anyFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
}).fields([{ name: "images", maxCount: 10 }, { name: "files", maxCount: 10 }]);

