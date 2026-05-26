require("dotenv").config();
const express = require("express");
const port = process.env.PORT;
const routes = require("./router");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const start = new Date();
  res.on("finish", () => {
    console.log("finish");
  });
  next();
});

app.use("/api", routes);

app.use("/", routes);

// 404 handler
// ─── 404 Handler ─────────────────────────────────────────────
// Tangkap request ke route yang tidak ada
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} tidak ditemukan.`,
    hint: "Kunjungi GET /api/info untuk melihat daftar endpoint yang tersedia.",
  });
});

// ─── Error Handler Global ────────────────────────────────────
// Middleware error handler memiliki 4 parameter (err, req, res, next)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      config.env === "development"
        ? err.message
        : "Terjadi kesalahan di server.",
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
