# [PLAN & PROMPT TEMPLATE] Refactoring Arsitektur Berlapis Berbasis OOP (Layered OOP Architecture)

Dokumen ini berisi **perencanaan teknis spesifik** serta **template prompt/instruksi per fitur** yang ditujukan untuk **Junior Programmer** atau **AI Model (_Cost-Effective Model_)**.

Tujuan utama refactoring ini adalah memigrasikan struktur kode aplikasi dari yang saat ini terkumpul di `src/handler/*` menjadi **Arsitektur Berlapis (_Layered Architecture_)** dengan paradigma **Object-Oriented Programming (OOP)** menggunakan bahasa **JavaScript (ES6+ Class)**.

---

## 🏗️ 1. Standar Struktur Folder & Penamaan File

Seluruh kode sumber di dalam folder `src/` wajib direstrukturisasi mengikuti susunan berikut:

```text
src/
├── config/             # Konfigurasi koneksi database (Prisma client), variabel environment, dll.
├── routes/             # Pendaftaran endpoint HTTP dan penghubung ke Controller & Middleware
├── controllers/        # Penerima HTTP Request, pemanggil Service, dan pengirim HTTP Response
├── services/           # Logika bisnis utama (Business Logic, validasi aturan bisnis)
├── models/             # Abstraksi/wrapper akses data ke ORM Prisma (Database Access Layer)
├── middlewares/        # Interceptor request (Otentikasi JWT, kalkulasi rating otomatis, logger)
└── utils/              # Helper function & formatting umum yang dapat dipakai berulang
```

### 📋 Aturan Wajib Penamaan File (_PascalCase_)

Setiap file di dalam folder tersebut **wajib menggunakan format PascalCase** dengan akhiran perannya:

- **Routes**: `UserRoute.js`, `DestinationRoute.js`, `RatingRoute.js`, `BookmarkRoute.js`
- **Controllers**: `UserController.js`, `DestinationController.js`, `RatingController.js`, `BookmarkController.js`
- **Services**: `UserService.js`, `DestinationService.js`, `RatingService.js`, `BookmarkService.js`
- **Models**: `UserModel.js`, `DestinationModel.js`, `RatingModel.js`, `BookmarkModel.js`
- **Middlewares**: `AuthMiddleware.js`, `AvgRatingMiddleware.js`, `ErrorMiddleware.js`
- **Config**: `DatabaseConfig.js`, `EnvConfig.js`
- **Utils**: `ResponseHelper.js`, `ValidationHelper.js`

---

## 🏛️ 2. Standar Penulisan Kode Berorientasi Objek (OOP)

Semua lapisan (_Layer_) wajib ditulis menggunakan sintaks **Class JavaScript (ES6+)** dan diekspor berupa _instance_ atau _Class_ dengan pemisahan tanggung jawab yang tegas:

1. **Model Layer (`*Model.js`)**:

   - Hanya boleh berisi interaksi database via Prisma (`prisma.*.findMany()`, `prisma.*.create()`, dll.).
   - Tidak boleh mengelola `req` atau `res` HTTP.

   ```javascript
   // Contoh standar UserModel.js
   import prisma from '../config/DatabaseConfig.js';

   class UserModel {
     async findByEmail(email) {
       return await prisma.user.findUnique({ where: { email } });
     }
     async create(data) {
       return await prisma.user.create({ data });
     }
   }
   export default new UserModel();
   ```

2. **Service Layer (`*Service.js`)**:

   - Menerima input dari Controller, memvalidasi aturan bisnis, memanggil Model, dan mengembalikan hasil pengolahan data.
   - Tidak boleh bersentuhan langsung dengan objek `req` dan `res` Express.

   ```javascript
   // Contoh standar UserService.js
   import userModel from '../models/UserModel.js';

   class UserService {
     async getProfile(userId) {
       const user = await userModel.findById(userId);
       if (!user) throw new Error('User tidak ditemukan');
       return user;
     }
   }
   export default new UserService();
   ```

3. **Controller Layer (`*Controller.js`)**:

   - Bertanggung jawab mengekstrak `req.body`, `req.params`, `req.query`, memanggil method di Service, serta memformat `res.status().json()`.

   ```javascript
   // Contoh standar UserController.js
   import userService from '../services/UserService.js';
   import responseHelper from '../utils/ResponseHelper.js';

   class UserController {
     async getProfile(req, res, next) {
       try {
         const data = await userService.getProfile(req.user.id);
         return responseHelper.success(
           res,
           200,
           'Berhasil mengambil profil',
           data,
         );
       } catch (error) {
         return responseHelper.error(res, 404, error.message);
       }
     }
   }
   export default new UserController();
   ```

4. **Route Layer (`*Route.js`)**:

   - Menghubungkan path URL dengan method di Controller dan menyisipkan Middleware jika diperlukan.

   ```javascript
   // Contoh standar UserRoute.js
   import express from 'express';
   import userController from '../controllers/UserController.js';
   import authMiddleware from '../middlewares/AuthMiddleware.js';

   const router = express.Router();

   router.get(
     '/profile',
     authMiddleware.verifyToken,
     userController.getProfile,
   );

   export default router;
   ```

---

## 🤖 3. TEMPLATE PROMPT UNTUK AI AGENT / JUNIOR PROGRAMMER (PER FITUR)

Gunakan **Template Prompt** di bawah ini secara mandiri/berurutan (_satu per satu_) kepada AI Agent atau Junior Programmer agar pengerjaan fokus, terstruktur, dan minim risiko regresi.

---

### 📦 TEMPLATE PROMPT 1: Persiapan Fondasi (`config`, `utils`, `middlewares`)

```markdown
<TASK>
Lakukan refactoring dan pembuatan file fondasi utama aplikasi sesuai standar arsitektur OOP JavaScript di dalam folder `src/`.

Ikuti instruksi berikut secara tepat:

1. Buat file `src/config/DatabaseConfig.js`:
   - Gunakan Class atau Singleton export yang menginisialisasi instance `@prisma/client` agar dapat diimport secara konsisten oleh seluruh Model.
2. Buat file `src/utils/ResponseHelper.js`:
   - Buat Class `ResponseHelper` dengan method `success(res, statusCode, message, data)` dan `error(res, statusCode, message, errors)` untuk menstandarisasi seluruh respons JSON di aplikasi.
3. Buat file `src/middlewares/AuthMiddleware.js`:
   - Buat Class `AuthMiddleware` dengan method `verifyToken(req, res, next)` (dan method otorisasi lain jika ada di kode lama) untuk memvalidasi JWT token dari header `Authorization`.
4. Pindahkan logika dari `src/middleware/Count-Avg-Rating.js` (dan `src/db/prisma.js` jika ada) ke folder baru (`src/middlewares/AvgRatingMiddleware.js` dan `src/config/DatabaseConfig.js`) dengan format nama PascalCase dan struktur Class OOP JavaScript.
5. Pastikan semua file menggunakan sintaks impor/ekspor yang konsisten (sesuai type di package.json) dan tidak merusak fungsi yang sudah ada.
   </TASK>
```

---

### 👤 TEMPLATE PROMPT 2: Refactoring Fitur Users & Authentication (`Authuser`)

```markdown
<TASK>
Lakukan refactoring total untuk fitur **User & Authentication** dari struktur lama di folder `src/handler/Authuser/` menjadi struktur arsitektur berlapis berbasis OOP JavaScript.

Aturan & Langkah Kerja:

1. **Model Layer (`src/models/UserModel.js`)**:
   - Buat Class `UserModel`.
   - Implementasikan method untuk query database Prisma seperti `findByEmail(email)`, `findById(id)`, `create(userData)`, `update(id, data)`, dll.
2. **Service Layer (`src/services/UserService.js`)**:
   - Buat Class `UserService` yang mengimport `UserModel`.
   - Implementasikan method logika bisnis seperti `register(data)`, `login(email, password)` (termasuk verifikasi bcrypt & generate JWT), `getProfile(userId)`, dll.
3. **Controller Layer (`src/controllers/UserController.js`)**:
   - Buat Class `UserController` yang memanggil `UserService`.
   - Implementasikan method `register(req, res)`, `login(req, res)`, `getProfile(req, res)` dan format kembalian menggunakan `ResponseHelper`.
4. **Route Layer (`src/routes/UserRoute.js`)**:
   - Buat router Express yang memetakan endpoint `/api/auth/register`, `/api/auth/login`, `/api/users/...` ke `UserController`. Gunakan `AuthMiddleware` untuk endpoint yang wajib login.
5. Setelah selesai, hapus/gantikan referensi kode lama di rute utama agar menggunakan `UserRoute.js` yang baru.
   </TASK>
```

---

### 🏝️ TEMPLATE PROMPT 3: Refactoring Fitur Destinations (`Destinations`)

```markdown
<TASK>
Lakukan refactoring untuk fitur **Destinations** dari struktur lama di folder `src/handler/Destinations/` menjadi struktur arsitektur berlapis berbasis OOP JavaScript.

Aturan & Langkah Kerja:

1. **Model Layer (`src/models/DestinationModel.js`)**:
   - Buat Class `DestinationModel` untuk mengambil data dari tabel destinasi di Prisma (`findMany`, `findById`, `search`, `create`, `update`, `delete`).
2. **Service Layer (`src/services/DestinationService.js`)**:
   - Buat Class `DestinationService` untuk mengolah filter pencarian, paginasi, penggabungan data rating rata-rata, atau logika bisnis destinasi wisata.
3. **Controller Layer (`src/controllers/DestinationController.js`)**:
   - Buat Class `DestinationController` untuk menangani HTTP request daftar destinasi, detail destinasi berdasarkan ID, pencarian, dan pembuatan/edit destinasi (jika ada fitur admin). Gunakan `ResponseHelper`.
4. **Route Layer (`src/routes/DestinationRoute.js`)**:
   - Daftarkan endpoint destinasi ke `DestinationController`.
5. Verifikasi bahwa semua properti response sesuai dengan kontrak API yang ada sebelumnya.
   </TASK>
```

---

### ⭐ TEMPLATE PROMPT 4: Refactoring Fitur Ratings & Ulasan (`Ratings`)

```markdown
<TASK>
Lakukan refactoring untuk fitur **Ratings & Reviews** dari struktur lama di folder `src/handler/Ratings/` menjadi struktur arsitektur berlapis berbasis OOP JavaScript.

Aturan & Langkah Kerja:

1. **Model Layer (`src/models/RatingModel.js`)**:
   - Buat Class `RatingModel` dengan method untuk menambahkan rating (`create`), mengambil rating per destinasi (`findByDestinationId`), dan menghitung agregasi (`aggregate`).
2. **Service Layer (`src/services/RatingService.js`)**:
   - Buat Class `RatingService`. Pastikan setiap penambahan/perubahan ulasan memvalidasi keberadaan user dan destinasi, serta memicu pembaruan rata-rata rating (bisa berkoordinasi dengan `AvgRatingMiddleware.js` atau pemanggilan model terkait).
3. **Controller Layer (`src/controllers/RatingController.js`)**:
   - Buat Class `RatingController` untuk mengekstrak input ulasan dari `req.body` dan `req.user`, lalu mengembalikan status sukses via `ResponseHelper`.
4. **Route Layer (`src/routes/RatingRoute.js`)**:
   - Daftarkan endpoint HTTP untuk penambahan dan pembacaan rating, serta pasang `AuthMiddleware` pada endpoint post/update/delete rating.
     </TASK>
```

---

### 🔖 TEMPLATE PROMPT 5: Refactoring Fitur Bookmarks (`Bookmarks`)

```markdown
<TASK>
Lakukan refactoring untuk fitur **Bookmarks** (Simpan Destinasi Favorit) dari folder `src/handler/Bookmarks/` menjadi struktur arsitektur berlapis berbasis OOP JavaScript.

Aturan & Langkah Kerja:

1. **Model Layer (`src/models/BookmarkModel.js`)**:
   - Buat Class `BookmarkModel` yang menangani operasi Prisma untuk menambah bookmark (`create`), menghapus bookmark (`delete`), dan melihat daftar bookmark milik user (`findByUserId`).
2. **Service Layer (`src/services/BookmarkService.js`)**:
   - Buat Class `BookmarkService` yang mengecek apakah destinasi sudah di-bookmark sebelumnya (mencegah duplikat data) sebelum memanggil `BookmarkModel`.
3. **Controller Layer (`src/controllers/BookmarkController.js`)**:
   - Buat Class `BookmarkController` yang menangani endpoint tambah/hapus/get bookmarks berdasarkan `req.user.id`.
4. **Route Layer (`src/routes/BookmarkRoute.js`)**:
   - Buat definisi router dengan proteksi `AuthMiddleware.verifyToken`.
     </TASK>
```

---

### 🔄 TEMPLATE PROMPT 6: Integrasi Akhir & Pembersihan (`index.js` & `routes/`)

```markdown
<TASK>
Lakukan integrasi akhir seluruh rute berformat OOP dan bersihkan file/folder handler lama yang sudah direfaktur.

Langkah Kerja:

1. Buka atau buat file router utama (misalnya `src/routes/IndexRoute.js` atau di `index.js`).
2. Impor seluruh rute yang baru dibuat:
   - `UserRoute.js`
   - `DestinationRoute.js`
   - `RatingRoute.js`
   - `BookmarkRoute.js`
3. Daftarkan rute-rute tersebut ke instance aplikasi Express (`app.use('/api/v1/users', userRoute)`, dst.).
4. Lakukan verifikasi menyeluruh: pastikan tidak ada lagi file yang mengimport atau bergantung pada folder lama (`src/handler/*` dan `src/middleware/Count-Avg-Rating.js`).
5. Hapus folder `src/handler/` lama jika semua endpoint telah diuji dan berfungsi sempurna pada struktur baru.
   </TASK>
```

---

## ✅ 4. Checklist Pengujian & Verifikasi Pasca-Refactoring

Bagi Junior Programmer atau AI yang menjalankan tugas ini, wajib memverifikasi hal berikut sebelum menyelesaikan setiap tahap:

- [ ] **KONSISTENSI NAMA FILE**: Apakah nama file sudah persis berformat **PascalCase** (`*Route.js`, `*Controller.js`, `*Service.js`, `*Model.js`)?
- [ ] **KONSISTENSI OOP CLASS**: Apakah setiap file didefinisikan sebagai `class ClassName { ... }` dan diekspor dengan benar?
- [ ] **TIDAK ADA KEBOCORAN LAYER**:
  - Model tidak mengandung `req`/`res`.
  - Service tidak mengandung `req`/`res`.
  - Controller tidak mengandung sintaks Prisma/query SQL secara langsung.
- [ ] **PENGETESAN ENDPOINT**: Coba jalankan server (`npm run dev` atau `node index.js`) dan pastikan seluruh API dapat diakses normal tanpa error _syntax_ atau _module not found_.
