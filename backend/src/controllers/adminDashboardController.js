import { Range } from "../models/Range.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

export async function getStats(req, res, next) {
  try {
    const [totalRanges, totalProducts, configurableCount, normalCount, totalUsers] = await Promise.all([
      Range.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ productType: "configurable" }),
      Product.countDocuments({ productType: "normal" }),
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

    return res.status(200).json({
      success: true,
      stats: {
        totalRanges,
        totalProducts,
        configurableCount,
        normalCount,
        totalUsers,
        recentProducts,
        recentRanges,
        productsPerRange: productsPerRangeList,
      },
    });
  } catch (err) {
    next(err);
  }
}
