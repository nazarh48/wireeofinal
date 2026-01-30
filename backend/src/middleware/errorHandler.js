export function errorHandler(err, req, res, next) {
  console.error("Error:", err.message || err);

  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID";
  } else if (err.code === 11000) {
    status = 400;
    message = "Duplicate value";
  }

  res.status(status).json({ success: false, message });
}
