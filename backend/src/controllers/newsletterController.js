import { NewsletterSubscriber } from "../models/NewsletterSubscriber.js";

export async function subscribe(req, res, next) {
  try {
    const { email, source = "resources" } = req.body;
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Already subscribed",
      });
    }
    await NewsletterSubscriber.create({ email, source });
    return res.status(201).json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const subscribers = await NewsletterSubscriber.find()
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, subscribers });
  } catch (err) {
    next(err);
  }
}
