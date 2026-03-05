import LegalPage from "../models/LegalPage.js";

const ALLOWED_PAGES = ["privacy", "terms"];

export const getLegalPage = async (req, res) => {
    try {
        const { page } = req.params;

        if (!ALLOWED_PAGES.includes(page)) {
            return res.status(400).json({
                success: false,
                message: "Invalid legal page type",
            });
        }

        const legalPage = await LegalPage.getPageBySlug(page);

        return res.json({
            success: true,
            data: {
                slug: legalPage.slug,
                content: legalPage.content,
                lastUpdated: legalPage.lastUpdated,
                updatedBy: legalPage.updatedBy,
            },
        });
    } catch (error) {
        console.error("Error fetching legal page:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch legal page",
            error: error.message,
        });
    }
};

export const updateLegalPage = async (req, res) => {
    try {
        const { page } = req.params;
        const { content } = req.body;

        if (!ALLOWED_PAGES.includes(page)) {
            return res.status(400).json({
                success: false,
                message: "Invalid legal page type",
            });
        }

        if (!content || typeof content !== "string") {
            return res.status(400).json({
                success: false,
                message: "Content is required and must be a string",
            });
        }

        const adminEmail = req.admin?.email || "Admin";

        const legalPage = await LegalPage.updatePageBySlug(page, content, adminEmail);

        return res.json({
            success: true,
            message: "Legal page updated successfully",
            data: {
                slug: legalPage.slug,
                content: legalPage.content,
                lastUpdated: legalPage.lastUpdated,
                updatedBy: legalPage.updatedBy,
            },
        });
    } catch (error) {
        console.error("Error updating legal page:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update legal page",
            error: error.message,
        });
    }
};

