// src/index.js
require("dotenv").config();
const express = require("express");
const http = require("http"); // ← TAMBAH: Untuk Socket.IO
const { Server } = require("socket.io"); // ← TAMBAH: Class Socket.IO
const helmet = require("helmet");
const cors = require("cors");


const { corsOptions } = require("./config/cors");
const { apiLimiter } = require("./config/rateLimiter");

// PERBAIKAN: Gunakan folder 'router' sesuai struktur asli milikmu
const authRoutes = require("./router/auth.routes");
const tasksRoutes = require("./router/tasks.routes");
const usersRoutes = require("./router/users.routes");
const adminRoutes = require("./router/admin.routes");
const setupSwagger = require("./docs/swagger"); // Swagger tetap kita pertahankan

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app); // ← HTTP server membungkus Express

// ── SOCKET.IO SERVER ──────────────────────────────────────
const io = new Server(server, {
  cors: {
    // Ambil origin dari .env persis seperti konfigurasi REST API kita
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ["http://localhost:5173", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
  // Waktu tunggu sebelum disconnect jika ping tidak dibalas
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Ekspos io agar bisa diakses dari controller nanti
app.set("io", io);

// ── MIDDLEWARE EXPRESS ────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use(apiLimiter);

// ── ROUTES ────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", tasksRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/admin", adminRoutes);

// Aktifkan Swagger UI
setupSwagger(app);

// ── SOCKET.IO SETUP ───────────────────────────────────────
// Trik aman: Dibungkus try-catch agar server tidak crash 
// saat menunggu kamu membuat file socket.js di Langkah 3
try {
  require("./socket")(io); 
} catch (err) {
  console.log("⏳ Menunggu file src/socket.js dibuat pada Langkah 3...");
}

// ── 404 & ERROR HANDLER ───────────────────────────────────
app.use((req, res) => res.status(404).json({ error: { code: "NOT_FOUND" } }));
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ 
    error: { 
      code: err.code || "INTERNAL_ERROR", 
      message: err.message 
    } 
  });
});

// ── START SERVER ──────────────────────────────────────────
// PENTING: gunakan server.listen(), BUKAN app.listen()
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`✅ Socket.IO siap menerima koneksi`);
});