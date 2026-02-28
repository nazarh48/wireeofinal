import { Router } from "express";
import * as ctrl from "../controllers/solutionDetailController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { validate } from "../middleware/validate.js";
import { solutionDetailValidators } from "../utils/validators.js";

const router = Router();

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const SOLUTION_UPLOAD_DIR = path.join(UPLOAD_ROOT, "solutions");
if (!fs.existsSync(SOLUTION_UPLOAD_DIR)) {
  fs.mkdirSync(SOLUTION_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, SOLUTION_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const name = `soldet_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${safeExt}`;
    cb(null, name);
  },
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new Error("Only image uploads are allowed"));
};

const uploadDetailImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([{ name: "image", maxCount: 1 }]);

router.get("/", ctrl.list);
router.get("/:id", validate(solutionDetailValidators.id), ctrl.getById);

router.use(authenticateAdmin);
router.post("/", uploadDetailImage, validate(solutionDetailValidators.create), ctrl.create);
router.patch("/:id", uploadDetailImage, validate(solutionDetailValidators.update), ctrl.update);
router.delete("/:id", validate(solutionDetailValidators.id), ctrl.remove);

export default router;

