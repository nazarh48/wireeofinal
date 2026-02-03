import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import rangeRoutes from "./rangeRoutes.js";
import productRoutes from "./productRoutes.js";
import collectionRoutes from "./collectionRoutes.js";
import projectRoutes from "./projectRoutes.js";
import canvasRoutes from "./canvasRoutes.js";
import pdfRoutes from "./pdfRoutes.js";
import adminDashboardRoutes from "./adminDashboardRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import solutionRoutes from "./solutionRoutes.js";
import pdfMaterialRoutes from "./pdfMaterialRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/ranges", rangeRoutes);
router.use("/products", productRoutes);
router.use("/collections", collectionRoutes);
router.use("/projects", projectRoutes);
router.use("/canvas", canvasRoutes);
router.use("/pdf", pdfRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/categories", categoryRoutes);
router.use("/solutions", solutionRoutes);
router.use("/pdf-materials", pdfMaterialRoutes);

export default router;
