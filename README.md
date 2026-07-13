# WAD Capstone API

## Ringkasan
API ini adalah backend untuk aplikasi manajemen tugas dengan otentikasi, authorisasi role-based, real-time update menggunakan Socket.IO, dan PostgreSQL sebagai database. Project menggunakan Express.js, Prisma ORM, serta dokumentasi Swagger.

---

## Persyaratan Lokal
- Node.js 18+ / 20+
- npm
- PostgreSQL
- Git

---

## Setup Lokal
1. Clone repository:
   ```bash
   git clone https://github.com/sandistwnn/day-1
   cd day-1
   ```
2. Install dependency:
   ```bash
   npm install
   ```
3. Buat file `.env` berdasarkan contoh dan isi nilai sesuai lingkungan:
   - `PORT`
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `JWT_ACCESS_EXPIRES_IN`
   - `JWT_REFRESH_EXPIRES_IN`
   - `ALLOWED_ORIGINS`

4. Siapkan database PostgreSQL dan jalankan migrasi:
   ```bash
   npx prisma migrate dev
   ```
   Jika Anda tidak ingin membuat migrasi baru secara lokal, gunakan:
   ```bash
   npx prisma db push
   ```
5. Jalankan seed data:
   ```bash
   npm run db:seed
   ```
6. Jalankan server:
   - Untuk development:
     ```bash
     npm run dev
     ```
   - Untuk production:
     ```bash
     npm start
     ```

---

## Environment Variables
| Variabel | Deskripsi |
| --- | --- |
| `PORT` | Port server Express dijalankan (default: 3000) |
| `DATABASE_URL` | URL koneksi PostgreSQL |
| `JWT_ACCESS_SECRET` | Secret untuk access token |
| `JWT_REFRESH_SECRET` | Secret untuk refresh token |
| `JWT_ACCESS_EXPIRES_IN` | Expiration access token (misal: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Expiration refresh token (misal: `7d`) |
| `ALLOWED_ORIGINS` | Origin yang diizinkan oleh CORS |

---

## API Base URL
`http://localhost:3000/api/v1`

## Dokumentasi Swagger
Swagger tersedia di:
- `http://localhost:3000/api/docs`
- Raw spec: `http://localhost:3000/api/docs.json`

---

## Endpoint REST API

### Auth
- `POST /api/v1/auth/register`
  - Deskripsi: Registrasi user baru
  - Body JSON:
    - `name` (string, required)
    - `email` (string, required)
    - `password` (string, required)

- `POST /api/v1/auth/login`
  - Deskripsi: Login dan dapatkan `accessToken` + `refreshToken`
  - Body JSON:
    - `email` (string, required)
    - `password` (string, required)

- `POST /api/v1/auth/refresh`
  - Deskripsi: Refresh access token
  - Body JSON:
    - `refreshToken` (string, required)

- `POST /api/v1/auth/logout`
  - Deskripsi: Logout dan revoke refresh token
  - Body JSON:
    - `refreshToken` (string, required)

- `GET /api/v1/auth/me`
  - Deskripsi: Ambil data user saat ini
  - Header: `Authorization: Bearer <accessToken>`

### Tasks
> Semua route task menggunakan middleware `authenticate` dan beberapa route memerlukan ownership check.

- `GET /api/v1/tasks`
  - Deskripsi: Ambil daftar task dengan pagination, filter, dan sorting
  - Query params:
    - `status` (`TODO`, `IN_PROGRESS`, `DONE`)
    - `priority` (`LOW`, `MEDIUM`, `HIGH`)
    - `sort` (`createdAt`, `updatedAt`, `title`, `priority`)
    - `order` (`asc`, `desc`)
    - `limit` (integer)
    - `offset` (integer)

- `POST /api/v1/tasks`
  - Deskripsi: Buat task baru
  - Body JSON:
    - `title` (string, required)
    - `description` (string, optional)
    - `status` (string, optional, default `TODO`)
    - `priority` (string, optional, default `MEDIUM`)
    - `dueDate` (ISO date string, optional)

- `GET /api/v1/tasks/:id`
  - Deskripsi: Ambil detail task berdasarkan ID
  - Catatan: Hanya pemilik task atau admin yang dapat mengakses

- `PUT /api/v1/tasks/:id`
  - Deskripsi: Ganti seluruh data task
  - Body JSON: semua field task wajib

- `PATCH /api/v1/tasks/:id`
  - Deskripsi: Update sebagian field task
  - Body JSON: minimal satu field

- `DELETE /api/v1/tasks/:id`
  - Deskripsi: Hapus task

### Users
- `GET /api/v1/users/:userId/tasks`
  - Deskripsi: Ambil semua task milik user tertentu
  - Catatan: Endpoint ini tidak dilindungi oleh middleware `authenticate` pada kode saat ini

### Admin
> Semua route `admin` menggunakan `authenticate` + `authorize('ADMIN')`.

- `GET /api/v1/admin/users`
  - Deskripsi: Ambil semua user

- `PATCH /api/v1/admin/users/:id/role`
  - Deskripsi: Ubah role user
  - Body JSON:
    - `role` (`USER` atau `ADMIN`)

- `GET /api/v1/admin/tasks`
  - Deskripsi: Ambil semua task dari semua user

---

## Socket.IO Events
Server menggunakan Socket.IO pada server HTTP yang sama dengan Express. Socket menggunakan `handshake.auth.token` untuk autentikasi JWT.

### Koneksi
- Connect: client harus mengirimkan auth token di `socket.handshake.auth.token`
- Token JWT diverifikasi menggunakan `JWT_ACCESS_SECRET` atau `JWT_SECRET`
- Setelah koneksi berhasil:
  - user masuk ke room `user:<userId>`
  - user juga masuk ke room `tasks:global`
  - server mengirim event `users:online` ke semua klien

### Event yang dikirim server
- `users:online`
  - Payload: `{ count: number }`
  - Deskripsi: Menginformasikan jumlah pengguna yang sedang terhubung

- `task:created`
  - Payload: `{ task }`
  - Deskripsi: Dikirim setelah task berhasil dibuat

- `task:updated`
  - Payload: `{ task }`
  - Deskripsi: Dikirim setelah task diperbarui melalui `PUT` atau `PATCH`

- `task:deleted`
  - Payload: `{ taskId }`
  - Deskripsi: Dikirim setelah task dihapus

- `notification`
  - Payload: `{ type, title, message }`
  - Deskripsi: Notifikasi pribadi untuk user yang membuat task

### Event yang diterima server
- `ping`
  - Payload: callback
  - Server membalas dengan string: `pong`

### Contoh klien minimal
```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: '<accessToken>',
  },
});

socket.on('connect', () => {
  console.log('Socket connected', socket.id);
});

socket.on('users:online', (payload) => {
  console.log('Online users', payload.count);
});

socket.on('task:created', (payload) => {
  console.log('Task created', payload.task);
});

socket.emit('ping', (response) => {
  console.log(response); // pong
});
```

---

## Database ERD
Entity Relationship Diagram mencakup 4 tabel:

- `User`
- `Category`
- `Task`
- `RefreshToken`

### Relasi utama
- `User` 1..* `Task`
- `User` 1..* `RefreshToken`
- `Category` 1..* `Task`

### Fields utama
- `User`
  - `id`, `name`, `email`, `password`, `role`, `createdAt`, `updatedAt`
- `Category`
  - `id`, `name`, `color`, `createdAt`
- `Task`
  - `id`, `title`, `description`, `status`, `priority`, `dueDate`, `createdAt`, `updatedAt`, `userId`, `categoryId`
- `RefreshToken`
  - `id`, `token`, `userId`, `expiresAt`, `isRevoked`, `createdAt`

### Enum values
- `Role`: `USER`, `ADMIN`
- `Status`: `TODO`, `IN_PROGRESS`, `DONE`
- `Priority`: `LOW`, `MEDIUM`, `HIGH`

### diagram erd
<img width="552" height="591" alt="diagram erd" src="https://github.com/user-attachments/assets/97f98e0b-a300-4911-bfd9-24a929e67670" />




---

---

