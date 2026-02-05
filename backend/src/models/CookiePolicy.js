import mongoose from "mongoose";

const cookiePolicySchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            default: `<h2>Cookie Policy</h2>
<p>This website uses cookies to ensure you get the best experience on our website.</p>

<h3>What Are Cookies</h3>
<p>Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.</p>

<h3>How We Use Cookies</h3>
<p>We use cookies for the following purposes:</p>
<ul>
  <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly.</li>
  <li><strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website.</li>
  <li><strong>Preference Cookies:</strong> These cookies allow the website to remember your preferences.</li>
</ul>

<h3>Managing Cookies</h3>
<p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.</p>

<h3>Your Consent</h3>
<p>By using our website, you consent to our use of cookies in accordance with this Cookie Policy.</p>

<h3>Contact Us</h3>
<p>If you have any questions about our use of cookies, please contact us.</p>`,
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

// Ensure only one cookie policy document exists
cookiePolicySchema.statics.getPolicy = async function () {
    let policy = await this.findOne();
    if (!policy) {
        policy = await this.create({});
    }
    return policy;
};

cookiePolicySchema.statics.updatePolicy = async function (content, adminEmail) {
    let policy = await this.findOne();
    if (!policy) {
        policy = new this();
    }
    policy.content = content;
    policy.lastUpdated = new Date();
    policy.updatedBy = adminEmail || "Admin";
    await policy.save();
    return policy;
};

const CookiePolicy = mongoose.model("CookiePolicy", cookiePolicySchema);

export default CookiePolicy;
