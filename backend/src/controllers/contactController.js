import { sendEmail } from "../services/emailService.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, company, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const html = `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || "N/A"}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `;

    await sendEmail({
      to: "contact@wireeo.com",
      subject: `New Contact Message from ${name}`,
      html,
    });

    res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("[ContactController] Error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};
