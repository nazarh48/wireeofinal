import CookiePolicy from "../models/CookiePolicy.js";

/**
 * Get the current cookie policy (public access)
 * @route GET /api/cookie-policy
 */
export const getCookiePolicy = async (req, res) => {
    try {
        const policy = await CookiePolicy.getPolicy();
        res.json({
            success: true,
            data: {
                content: policy.content,
                lastUpdated: policy.lastUpdated,
                updatedBy: policy.updatedBy,
            },
        });
    } catch (error) {
        console.error("Error fetching cookie policy:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cookie policy",
            error: error.message,
        });
    }
};

/**
 * Update the cookie policy (admin only)
 * @route PUT /api/cookie-policy
 */
export const updateCookiePolicy = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || typeof content !== "string") {
            return res.status(400).json({
                success: false,
                message: "Content is required and must be a string",
            });
        }

        // Get admin email from authenticated request
        const adminEmail = req.admin?.email || "Admin";

        const policy = await CookiePolicy.updatePolicy(content, adminEmail);

        res.json({
            success: true,
            message: "Cookie policy updated successfully",
            data: {
                content: policy.content,
                lastUpdated: policy.lastUpdated,
                updatedBy: policy.updatedBy,
            },
        });
    } catch (error) {
        console.error("Error updating cookie policy:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update cookie policy",
            error: error.message,
        });
    }
};
