import { Range } from "../models/Range.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
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
    ] = await Promise.all([
      Range.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ productType: { $in: ["configurable", "pro"] } }),
      Product.countDocuments({ productType: { $in: ["standard", "normal"] } }),
      User.countDocuments(),
    ]);

    const recentProducts = await Product.find()
      .populate("range", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentRanges = await Range.find().sort({ createdAt: -1 }).limit(10).lean();

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
        recentProducts,
        recentRanges,
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
