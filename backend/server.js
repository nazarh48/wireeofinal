import app from "./app.js";
import { connectDB } from "./src/config/db.js";
import { config } from "./src/config/index.js";
import { getEmailConfigStatus } from "./src/services/emailService.js";

await connectDB();

const emailStatus = getEmailConfigStatus();
if (emailStatus === "configured") {
  console.log("[Email] SMTP configured. Verification emails will be delivered.");
} else {
  console.warn(
    "[Email] SMTP not configured. Verification emails will NOT reach real inboxes.",
  );
  console.warn(
    "[Email] Add MAIL_HOST, MAIL_USER, MAIL_PASS to backend/.env to send real emails.",
  );
}

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
