import app from "./app.js";
import { connectDB } from "./src/config/db.js";
import { config } from "./src/config/index.js";

await connectDB();

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
