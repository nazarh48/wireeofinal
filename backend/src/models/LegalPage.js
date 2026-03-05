import mongoose from "mongoose";

const ALLOWED_PAGES = ["privacy", "terms"];

const legalPageSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            enum: ALLOWED_PAGES,
            required: true,
            unique: true,
        },
        content: {
            type: String,
            required: true,
            default: "",
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
        updatedBy: {
            type: String,
            default: "System",
        },
    },
    {
        timestamps: true,
    }
);

legalPageSchema.statics.ALLOWED_PAGES = ALLOWED_PAGES;

legalPageSchema.statics.getPageBySlug = async function (slug) {
    if (!ALLOWED_PAGES.includes(slug)) {
        throw new Error("Invalid legal page type");
    }

    let page = await this.findOne({ slug });
    if (!page) {
        page = await this.create({
            slug,
            content:
                slug === "privacy"
                    ? "<h2>Privacy Policy</h2><p>Please update this content in the admin dashboard.</p>"
                    : "<h2>Terms of Service</h2><p>Please update this content in the admin dashboard.</p>",
            updatedBy: "System",
        });
    }
    return page;
};

legalPageSchema.statics.updatePageBySlug = async function (slug, content, adminEmail) {
    if (!ALLOWED_PAGES.includes(slug)) {
        throw new Error("Invalid legal page type");
    }

    let page = await this.findOne({ slug });
    if (!page) {
        page = new this({ slug });
    }

    page.content = content;
    page.lastUpdated = new Date();
    page.updatedBy = adminEmail || "Admin";

    await page.save();
    return page;
};

const LegalPage = mongoose.model("LegalPage", legalPageSchema);

export default LegalPage;

