# Pembuatan Unit Test untuk Seluruh API Capstone Bali

Issue ini berisi daftar perencanaan skenario _unit test_ komprehensif yang harus diimplementasikan guna memastikan fungsionalitas dan keamanan REST API Capstone Bali.

## Spesifikasi Teknis & Aturan
- **Tech Stack:** Hapi.js (server), Prisma ORM (PostgreSQL/Supabase), JWT (`jsonwebtoken`) untuk autentikasi, SHA-256 (`crypto`) untuk _password hashing_.
- **Tooling/Framework:** Wajib menggunakan `Jest` sebagai _test runner_.
- **Lokasi Direktori:** Simpan seluruh rincian dan hirarki _file test_ pada susunan _folder_ `tests/`.
- **State Management (SANGAT PENTING):** Pada setiap transisi sebelum _test block_ _(setup/beforeEach)_ atau antar skenario eksekusi, wujudkan instruksi untuk **selalu menghapus data tabel yang berkaitan terlebih dahulu**. Ini wajib dilakukan supaya _database_ selalu berada dalam _state_ yang steril dan pengujian konsisten dari hulu ke hilir tanpa terganggu sisa data observasi sebelumnya.

### Struktur Folder Test

```
tests/
├── user.test.js
├── destination.test.js
├── rating.test.js
└── bookmark.test.js
```

## Scope Endpoint & Target Skenario Pengujian

Instruksi pengkodean diserahkan pada pihak yang mengimplementasikan. Seluruh _developer_ ditekankan merakit instruksi _unit test_ spesifik pada kerangka skenario di bawah ini selengkapnya.

---

### 1. API Registrasi User (`POST /register`)
Opsi Tes Mencakup:
1. **Skenario Sukses:** Pendaftaran berhasil mencetak kembalian status `201` ketika diumpankan _request payload_ yang seratus persen benar dan _valid_ (`name`, `email`, dan `password`). Pastikan balutan _response_ JSON memuntahkan properti `id`, `name`, dan `email` dari user yang baru saja tercipta.
2. **Skenario Gagal (Parameter Kosong/Hilang):** Validasi menanggapi tangkisan `400 Bad Request` saat _payload_ ada bagian parameter properti esensialnya yang absen — entah `name`, `email`, maupun `password` yang mangkir dari isian.
3. **Skenario Gagal (Konflik Data):** Pengujian dengan mendaftarkan alamat email identik untuk kedua kalinya yang menuntut adanya tanggapan peringatan `Email Already Use` dengan status `400`.

### 2. API Login User (`POST /login`)
Opsi Tes Mencakup:
1. **Skenario Sukses:** Autentikasi yang direspons mulus. Lakukan registrasi _dummy_ via utilitas dulu, lanjutkan pendaratan akun memakai `email` maupun `password` otentik itu. Pastikan _response_-nya memuntahkan objek `accessToken` yang merupakan JWT _string_ sah bertanda tangan `HS256`.
2. **Skenario Gagal (Password Salah):** Pelemparan status `401 Unauthorized` beserta pesan `Invalid email or password` andai sandi _(password)_ yang diinputkan sengaja dibedakan/disalahkan dari yang tersimpan di pangkalan data.
3. **Skenario Gagal (User Fiktif):** Terjaganya _endpoint_ agar mengembalikan `401` jika email pengguna memang tidak eksis di dalam tabel `users`.
4. **Skenario Gagal (Email Kosong):** Penolakan dengan status `400` bilamana properti `email` dikirimkan kosong atau nihil dari _payload_, memicu pesan `Email is not allowed to be Empty`.
5. **Skenario Gagal (Password Kosong):** Penolakan serupa dengan status `400` bilamana properti `password` dikirimkan kosong, memicu pesan `Password is not allowed to be Empty`.

### 3. API Get Profile User (`GET /users/me`)
Opsi Tes Mencakup:
1. **Skenario Sukses:** Ciptakan profil & sesi aktif melalui registrasi dan login utilitas. Hantam _API endpoint_ dengan embel-embel _header_ `Authorization: Bearer <accessToken>`. Konfirmasikan jika balutan data JSON kembaliannya (`id`, `name`, `email`) sinkron dengan riwayat database awal yang diinsersikan saat _setup_.
2. **Skenario Gagal (Ketiadaan Kredensial):** Evaluasi jaminan API menjegal panggilan jika properti `Authorization` absen dari konfigurasi _header_. Ekspektasi tegas: status `401`.
3. **Skenario Gagal (Token Palsu/Kedaluwarsa):** Demonstrasi ditolaknya serbuan yang melibatkan karangan _token_ asal-asalan yang tidak cocok dengan _secret_ JWT server. Status kembalian wajib `401`.

---

### 4. API Tambah Destinasi (`POST /destinations`)
Opsi Tes Mencakup:
1. **Skenario Sukses:** Penyisipan destinasi wisata baru berhasil dengan status `201` ketika _payload_ lengkap (`name`, `description`, `img`, `location`) dikirimkan bersama _header_ `Authorization` yang mengandung _token_ terautentikasi. Verifikasi respons mengandung `id`, `name`, `description`, `img`, dan `location`.
2. **Skenario Gagal (Parameter Kosong/Hilang):** Pelemparan `400` saat salah satu dari keempat properti esensial itu mangkir dari isian _payload_. Pesan: `Please fill all the fields`.
3. **Skenario Gagal (Duplikat Nama):** Pengujian ganda — sisipkan destinasi dengan `name` identik untuk kedua kalinya. Ekspektasi: status `400` dengan pesan `Destination Already Exist`.
4. **Skenario Gagal (Tanpa Autentikasi):** Kirimkan _request_ tanpa _header_ `Authorization`. API wajib mengembalikan status `401` tanpa toleransi.

### 5. API Ambil Semua Destinasi (`GET /destinations`)
Opsi Tes Mencakup:
1. **Skenario Sukses:** Pemanggilan endpoint tanpa autentikasi (publik). Pastikan respons `200` mengembalikan array destinasi di dalam objek `destinations`. Setiap elemen wajib memiliki properti `avgRating` yang dikalkulasi oleh `RatingService.calculateRating`.
2. **Skenario Kosong:** Apabila tabel `destination` dalam keadaan steril (kosong sepenuhnya), respons tetap `200` dengan array `destinations` berisi nol elemen.

### 6. API Ambil Destinasi per ID (`GET /destinations/{id}`)
Opsi Tes Mencakup:
1. **Skenario Sukses:** Sisipkan satu destinasi _dummy_ via _setup_. Panggil endpoint dengan `id` yang valid. Konfirmasikan respons `200` dengan properti `id`, `name`, `description`, `img`, `location`, dan `avgRating` yang terkalkulasi. Jika belum ada rating, `avgRating` wajib bernilai `0`.
2. **Skenario Gagal (ID Tidak Ditemukan):** Kirimkan `id` mengarang yang tidak terdaftar di tabel `destination`. Status kembalian wajib `404` dengan pesan `Destination not found`.

### 7. API Hapus Destinasi (`DELETE /destinations/{id}`)
Opsi Tes Mencakup:
1. **Skenario Sukses:** Sisipkan destinasi _dummy_, kemudian hapus menggunakan _token_ terautentikasi. Pastikan respons `200` memuntahkan `id` destinasi yang telah dimusnahkan. Verifikasi bahwa _record_ benar-benar lenyap dari pangkalan data.
2. **Skenario Gagal (ID Tidak Ditemukan):** Usahakan menghapus destinasi dengan `id` mengarang. Respons: `404` dengan pesan `Destination not found`.
3. **Skenario Gagal (Tanpa Autentikasi):** Kirimkan _request_ tanpa _header_ `Authorization`. Status kembalian wajib `401`.

---

### 8. API Tambah/Update Rating (`POST /destinations/{dest_id}/ratings`)
Opsi Tes Mencakup:
1. **Skenario Sukses (Rating Baru):** Ciptakan user dan destinasi _dummy_. Kirimkan rating `5` dengan _token_ terautentikasi. Pastikan respons `200` memuntahkan `id`, `rating`, `dest_id`, `dest_name`, `user_id`, dan `name`.
2. **Skenario Sukses (Update Rating):** Setelah skenario pertama, kirimkan rating `3` pada destinasi yang sama dengan user yang sama. Ekspektasi: rating di database berubah dari `5` menjadi `3`, bukan membuat _record_ baru.
3. **Skenario Gagal (Rating di Luar Jangkauan):** Kirimkan `rating: 0` atau `rating: 6`. Tangkisan `400` dengan pesan `Rating must be between 1 until 5`.
4. **Skenario Gagal (Rating Bukan Number):** Kirimkan `rating: "lima"`. Tangkisan `400` dengan pesan `Rating must be a number`.
5. **Skenario Gagal (Destinasi Fiktif):** Kirimkan rating ke `dest_id` yang tidak eksis di tabel `destination`. Status `404` dengan pesan `Destinations not found`.
6. **Skenario Gagal (Tanpa Autentikasi):** Kirimkan _request_ tanpa _header_ `Authorization`. Status wajib `401`.
7. **Skenario Integrasi (Validasi avgRating):** Setelah rating disisipkan, panggil `GET /destinations/{dest_id}` dan konfirmasikan bahwa nilai `avgRating` pada respons telah berubah secara akurat sesuai kalkulasi rata-rata.

---

### 9. API Bookmark Destinasi (`POST /destinations/{dest_id}/bookmarks`)
Opsi Tes Mencakup:
1. **Skenario Sukses (Bookmark Baru):** Ciptakan user dan destinasi _dummy_. Kirimkan _request_ bookmark. Pastikan respons `200` dengan `isBookmark: true`, disertai `id`, `user_id`, `name`, `dest_id`, dan `dest_name`.
2. **Skenario Sukses (Bookmark Idempoten):** Lakukan bookmark pada destinasi yang sudah pernah di-bookmark sebelumnya. Ekspektasi: respons tetap `200` dengan `isBookmark: true` tanpa duplikasi _record_ di tabel `bookmark_detail`.
3. **Skenario Gagal (Destinasi Fiktif):** Kirimkan bookmark ke `dest_id` yang tidak eksis. Status `404` dengan pesan `Destinations not found`.
4. **Skenario Gagal (Tanpa Autentikasi):** Kirimkan _request_ tanpa _header_ `Authorization`. Status wajib `401`.

### 10. API Unbookmark Destinasi (`POST /destinations/{dest_id}/unbookmarked`)
Opsi Tes Mencakup:
1. **Skenario Sukses:** Bookmark destinasi terlebih dahulu via skenario sebelumnya, lalu kirimkan _request_ unbookmark. Pastikan respons `200` dengan `isBookmark: false`.
2. **Skenario Gagal (Destinasi Fiktif):** Kirimkan unbookmark ke `dest_id` yang tidak eksis. Status `404`.
3. **Skenario Gagal (Bookmark Tidak Ada):** Kirimkan unbookmark pada destinasi yang belum pernah di-bookmark sebelumnya oleh user tersebut. Status `404` dengan pesan `Bookmark not found`.
4. **Skenario Gagal (Tanpa Autentikasi):** Kirimkan _request_ tanpa _header_ `Authorization`. Status wajib `401`.

### 11. API Ambil Daftar Bookmark (`GET /destinations/bookmarks`)
Opsi Tes Mencakup:
1. **Skenario Sukses:** Bookmark beberapa destinasi, lalu panggil endpoint ini. Pastikan respons `200` mengembalikan array berisi item-item dengan `isBookmark: true`, lengkap dengan `id`, `user_id`, `name`, `dest_id`, dan `dest_name`.
2. **Skenario Kosong:** Apabila user belum pernah melakukan bookmark sama sekali, respons tetap `200` dengan array kosong.
3. **Skenario Gagal (Tanpa Autentikasi):** Kirimkan _request_ tanpa _header_ `Authorization`. Status wajib `401`.

### 12. API Ambil Daftar Unbookmarked (`GET /destinations/unbookmarked`)
Opsi Tes Mencakup:
1. **Skenario Sukses:** Bookmark destinasi lalu unbookmark. Panggil endpoint ini. Pastikan respons `200` mengembalikan array berisi item-item dengan `isBookmark: false`.
2. **Skenario Kosong:** Apabila user belum pernah memiliki riwayat unbookmark, respons tetap `200` dengan array kosong.
3. **Skenario Gagal (Tanpa Autentikasi):** Kirimkan _request_ tanpa _header_ `Authorization`. Status wajib `401`.
