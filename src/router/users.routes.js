const express = require('express');
const router = express.Router();
const { getTasksByUser } = require('../controller/task.controller');

/**
 * @swagger
 * /users/{userId}/tasks:
 *   get:
 *     summary: Ambil semua task milik user tertentu
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil
 *       404:
 *         description: User tidak ditemukan
 */
router.get('/:userId/tasks', getTasksByUser);

module.exports = router;
