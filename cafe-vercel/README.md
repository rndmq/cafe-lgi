# Cafe App — Panduan Deploy ke Vercel

Aplikasi pemesanan kafe berbasis web dengan backend Node.js (Express) dan frontend React + Vite.

## Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, shadcn/ui, Wouter
- **Backend**: Express 5 → Vercel Serverless Functions (`api/index.ts`)
- **Database**: PostgreSQL + Drizzle ORM
- **Image Upload**: Cloudinary

---

## Deploy ke Vercel (Langkah-langkah)

### 1. Siapkan PostgreSQL Database

Buat database PostgreSQL. Beberapa pilihan gratis:
- **Neon** — https://neon.tech (recommended, gratis)
- **Supabase** — https://supabase.com (gratis)
- **Railway** — https://railway.app

Catat `DATABASE_URL`-nya. Formatnya:
```
postgresql://user:password@host:5432/dbname
```

### 2. Siapkan Cloudinary (untuk upload foto menu)

1. Daftar gratis di https://cloudinary.com
2. Buka **Dashboard → Settings → API Keys**
3. Catat `Cloud Name`, `API Key`, dan `API Secret`

### 3. Jalankan Migrasi Database

Sebelum deploy, push schema ke database:

```bash
cd cafe-vercel
npm install
DATABASE_URL="postgresql://..." npm run db:push
```

### 4. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/cafe-app.git
git push -u origin main
```

### 5. Import ke Vercel

1. Buka https://vercel.com → **New Project**
2. Import repo GitHub di atas
3. **Framework Preset**: pilih **Other** (bukan Next.js)
4. **Root Directory**: `cafe-vercel/` (jika repo menggunakan folder ini)
   - Atau biarkan kosong jika file langsung di root repo
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

### 6. Tambahkan Environment Variables di Vercel

Di halaman **Project Settings → Environment Variables**, tambahkan:

| Nama | Nilai | Keterangan |
|------|-------|-----------|
| `DATABASE_URL` | `postgresql://...` | Koneksi PostgreSQL |
| `ADMIN_PASSWORD` | Password pilihan Anda | Password login admin |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Dari Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | `your-api-key` | Dari Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | Dari Cloudinary Dashboard |
| `CLOUDINARY_UPLOAD_FOLDER` | `cafe-menus` | Folder di Cloudinary (opsional) |

### 7. Deploy!

Klik **Deploy** di Vercel. Build akan otomatis berjalan.

---

## Pengembangan Lokal

```bash
cd cafe-vercel
npm install
cp .env.example .env
# Edit .env dengan nilai yang sesuai

# Push schema ke database lokal
npm run db:push

# Jalankan backend (port 3001)
node --loader ts-node/esm api/server.ts

# Di terminal lain, jalankan frontend (port 5173)
npm run dev
```

---

## Struktur Project

```
cafe-vercel/
├── api/
│   └── index.ts          # Express app → Vercel Serverless Function
├── db/
│   ├── index.ts          # Koneksi Drizzle + PostgreSQL
│   └── schema/           # Schema tabel (menus, orders)
├── src/
│   ├── api-client/       # React Query hooks (dari OpenAPI)
│   ├── components/       # UI components (shadcn/ui + layout)
│   ├── context/          # CartContext
│   ├── pages/            # Halaman aplikasi
│   └── App.tsx
├── public/
├── index.html
├── vite.config.ts        # Build frontend
├── drizzle.config.ts     # Konfigurasi Drizzle ORM
├── vercel.json           # Routing Vercel
└── .env.example          # Template environment variables
```

---

## Catatan Penting: Penyimpanan Gambar

**Vercel memiliki filesystem yang bersifat sementara (ephemeral)** — file yang ditulis saat runtime akan hilang setelah fungsi selesai. Oleh karena itu:

- Upload gambar menu menggunakan **Cloudinary** (bukan penyimpanan lokal)
- Gambar yang sudah tersimpan sebagai URL eksternal (Unsplash, dll.) tetap berfungsi normal
- URL gambar dari Cloudinary disimpan di kolom `image_url` di database PostgreSQL

---

## Fitur Aplikasi

**Halaman Pelanggan:**
- `/` — Beranda
- `/menu` — Daftar menu makanan & minuman
- `/cart` — Keranjang belanja
- `/checkout` — Form pemesanan

**Halaman Admin** (login dengan `ADMIN_PASSWORD`):
- `/admin` — Dashboard statistik pesanan & menu
- `/admin/menus` — Manajemen daftar menu (tambah, edit, hapus, upload foto)
- `/admin/orders` — Daftar pesanan masuk
