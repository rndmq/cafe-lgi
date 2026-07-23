-- ============================================================
-- Cafe App — Schema untuk Supabase
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Tabel menu makanan & minuman
CREATE TABLE IF NOT EXISTS menus (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  price         INTEGER NOT NULL,                         -- dalam rupiah, tanpa desimal
  category      TEXT NOT NULL DEFAULT 'Makanan',
  image_url     TEXT,                                     -- URL Cloudinary atau URL eksternal
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel pesanan pelanggan
CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  customer_name     TEXT NOT NULL,
  customer_phone    TEXT NOT NULL,
  customer_address  TEXT NOT NULL,
  items             TEXT NOT NULL,                        -- JSON string: array cart items
  total_price       INTEGER NOT NULL,                     -- harga sebelum diskon (rupiah)
  final_price       INTEGER NOT NULL,                     -- harga setelah diskon (rupiah)
  voucher_code      TEXT,                                 -- NULL jika tidak pakai voucher
  discount_rate     INTEGER NOT NULL DEFAULT 0,           -- persentase diskon (0–100)
  payment_method    TEXT NOT NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk performa query admin
CREATE INDEX IF NOT EXISTS idx_menus_category      ON menus (category);
CREATE INDEX IF NOT EXISTS idx_menus_is_available  ON menus (is_available);
CREATE INDEX IF NOT EXISTS idx_menus_order_index   ON menus (order_index);
CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON orders (created_at DESC);
