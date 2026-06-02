import { Range } from "../models/Range.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { Category } from "../models/Category.js";
import { Solution } from "../models/Solution.js";
import { Resource } from "../models/Resource.js";
import { Icon } from "../models/Icon.js";
import { NewsletterSubscriber } from "../models/NewsletterSubscriber.js";
import { PDFConfig } from "../models/PDFConfig.js";
import { CanvasEdit } from "../models/CanvasEdit.js";
import { getFromCache, setInCache } from "../utils/simpleCache.js";

export async function getStats(req, res, next) {
  try {
    const cacheKey = "admin:dashboard:stats";
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const [
      totalRanges,
      totalProducts,
      configurableCount,
      standardCount,
      totalUsers,
      totalProjects,
      totalCategories,
      totalSolutions,
      totalResources,
      totalIcons,
      totalNewsletterSubscribers,
      totalPdfExports,
      totalCanvasEdits,
    ] = await Promise.all([
      Range.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ productType: { $in: ["configurable", "pro"] } }),
      Product.countDocuments({ productType: { $in: ["standard", "normal"] } }),
      User.countDocuments(),
      Project.countDocuments(),
      Category.countDocuments(),
      Solution.countDocuments(),
      Resource.countDocuments(),
      Icon.countDocuments(),
      NewsletterSubscriber.countDocuments(),
      PDFConfig.countDocuments(),
      CanvasEdit.countDocuments(),
    ]);

    const [recentProducts, recentRanges, recentProjects] = await Promise.all([
      Product.find()
        .populate("range", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Range.find().sort({ createdAt: -1 }).limit(10).lean(),
      Project.find().sort({ updatedAt: -1, createdAt: -1 }).limit(10).lean(),
    ]);

    const ranges = await Range.find().lean();
    const productsPerRange = await Product.aggregate([
      { $group: { _id: "$range", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(
      productsPerRange.map((p) => [p._id ? p._id.toString() : "", p.count])
    );
    const productsPerRangeList = ranges.map((r) => ({
      id: r._id,
      name: r.name,
      count: countMap[r._id.toString()] || 0,
    }));

    const payload = {
      success: true,
      stats: {
        totalRanges,
        totalProducts,
        configurableCount,
        standardCount,
        normalCount: standardCount,
        totalUsers,
        totalProjects,
        totalCategories,
        totalSolutions,
        totalResources,
        totalIcons,
        totalNewsletterSubscribers,
        totalPdfExports,
        totalCanvasEdits,
        websiteVisitors: totalUsers,
        recentProducts,
        recentRanges,
        recentProjects,
        productsPerRange: productsPerRangeList,
      },
    };

    // Short-lived cache to smooth repeated dashboard loads.
    setInCache(cacheKey, payload, 15000);

    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}
