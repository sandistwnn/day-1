// File: src/index.js (versi terbaru Minggu 2)
const config = require('./config');
const express = require('express');
const routes = require('./router');
const tasksRoutes = require('./router/tasks.routes');
const usersRoutes = require('./router/users.routes');
const authRoutes = require('./router/auth.routes');
const authenticate = require('./middleware/authenticate');
const setupSwagger = require('./docs/swagger');
const app = express();
// ─── Middleware Global ───────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ─── Routes ─────────────────────────────────────────────────
app.use('/', routes); // /health
app.use('/api', routes); // /api/health

// ─── Auth routes (tidak dilindungi) ──────────────────────
app.use('/auth', authRoutes);

// ─── API Routes yang dilindungi ─────────────────────────────
// authenticate dijalankan sebelum semua route /api/v1/...
app.use('/api/v1', authenticate);
app.use('/api/v1/tasks', tasksRoutes); // /api/v1/tasks (CRUD)
app.use('/api/v1/users', usersRoutes); // /api/v1/users/:userId/tasks

// ─── Swagger UI ─────────────────────────────────────────────
setupSwagger(app);

// ─── 404 & Error Handlers ───────────────────────────────────
app.use((req, res) => {
res.status(404).json({
error: {
code: 'NOT_FOUND',
message: `Route ${req.method} ${req.path} tidak ditemukan.`,
hint: 'Kunjungi GET /api/docs untuk dokumentasi API.',
},
});
});
app.use((err, req, res, next) => {
  // Error dengan statusCode dari authService
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: { code: err.code || 'AUTH_ERROR', message: err.message },
    });
  }

  // Prisma P2002: email duplikat (sudah ada user dengan email tersebut)
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_RESOURCE',
        message: 'Data sudah digunakan.',
      },
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message:
        config.env === 'development'
          ? err.message
          : 'Terjadi kesalahan di server.',
    },
  });
});

// ─── Start Server ────────────────────────────────────────────
app.listen(config.port, () => {
console.log('─'.repeat(50));
console.log(` ${config.appName} v${config.version}`);
console.log(` Environment : ${config.env}`);
console.log(` Server : http://localhost:${config.port}`);
console.log(` Docs : http://localhost:${config.port}/api/docs`);
console.log('─'.repeat(50));
});
module.exports = app;