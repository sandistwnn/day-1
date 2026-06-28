const express = require('express');
const router = express.Router();
const ctrl = require('../controller/task.controller');
const validate = require('../middleware/validate');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { checkTaskOwnership } = require('../middleware/checkOwnership');
const { sanitizeBody } = require('../middleware/sanitize');

const {
  createTaskSchema,
  replaceTaskSchema,
  updateTaskSchema,
  listTasksSchema,
} = require('../validators/task.validator');

router.use(authenticate);

// prettier-ignore
/**
 * @swagger
 *  /tasks:
 *    get:
 *      summary: Ambil daftar task dengan pagination, filtering, dan sorting
 *      tags: [Tasks]
 *      parameters:
 *        - in: query
 *          name: status
 *          schema:
 *            type: string
 *            enum: [todo, in_progress, done]
 *          description: Filter berdasarkan status
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            default: 10
 *          description: Jumlah data per halaman
 *        - in: query
 *          name: offset
 *          schema:
 *            type: integer
 *            default: 0
 *          description: Jumlah data yang dilewati
 *      responses:
 *       200:
 *          description: Berhasil mengambil daftar task
 */
router.get('/', validate(listTasksSchema, 'query'), ctrl.listTasks);

// prettier-ignore
/**
 * @swagger
 *  /tasks:
 *    post:
 *      summary: Buat task baru
 *      tags: [Tasks]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateTask'
 *      responses:
 *        201:
 *          description: Task berhasil dibuat
 *        400:
 *          description: Data tidak valid
 */
router.post('/', validate(createTaskSchema, 'body'), sanitizeBody, authorize('USER', 'ADMIN'), ctrl.createTask);

// ROUTES DENGAN PENGECEKAN KEPEMILIKAN
router.get('/:id', checkTaskOwnership, ctrl.getTask);
router.put('/:id', checkTaskOwnership, validate(replaceTaskSchema, 'body'), sanitizeBody, ctrl.replaceTask);
router.patch('/:id', checkTaskOwnership, validate(updateTaskSchema, 'body'), sanitizeBody, ctrl.updateTask);
router.delete('/:id', checkTaskOwnership, ctrl.deleteTask);

module.exports = router;