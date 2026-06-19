-- ============================================================
-- ورشة عبادة للحدادة - Supabase Schema
-- لتشغيله: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============ 1) جدول المنتجات ============
CREATE TABLE IF NOT EXISTS products (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  name_en      TEXT,
  description  TEXT,
  description_en TEXT,
  price        BIGINT CHECK (price IS NULL OR price >= 0),
  image_url    TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('store','orders')),
  family       TEXT,
  color_key    TEXT,
  color_hex    TEXT CHECK (color_hex IS NULL OR color_hex ~ '^#[0-9a-fA-F]{3,8}$'),
  color_name   TEXT,
  color_name_en TEXT,
  cat_group    TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- فهارس لأهم الاستعلامات
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_family     ON products(family)   WHERE family IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_sort       ON products(sort_order DESC, id ASC);

-- ============ 2) تفعيل Row Level Security ============
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- قاعدة عامة: أي زائر (anon) يمكنه قراءة المنتجات النشطة فقط
CREATE POLICY "public_read_active_products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- عمليات الكتابة (INSERT/UPDATE/DELETE) للمسؤول الموثّق فقط
-- ✅ تقييدها ببريد المسؤول المعتمد لمنع أي مستخدم آخر من التعديل
CREATE POLICY "admin_insert_products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() = 'ghanim.workshop@protonmail.com');

CREATE POLICY "admin_update_products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.email() = 'ghanim.workshop@protonmail.com')
  WITH CHECK (auth.email() = 'ghanim.workshop@protonmail.com');

CREATE POLICY "admin_delete_products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.email() = 'ghanim.workshop@protonmail.com');

-- ============ 3) Storage Bucket للصور ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- أي زائر يمكنه رؤية الصور (لأنها public)
CREATE POLICY "public_read_product_images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- المسؤول فقط يمكنه رفع/تعديل/حذف الصور
CREATE POLICY "admin_upload_product_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND auth.email() = 'ghanim.workshop@protonmail.com');

CREATE POLICY "admin_update_product_images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.email() = 'ghanim.workshop@protonmail.com');

CREATE POLICY "admin_delete_product_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.email() = 'ghanim.workshop@protonmail.com');

-- ============ 4) Trigger لتحديث updated_at تلقائياً ============
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============ 5) إنشاء حساب المسؤول ============
-- استبدل البريد وكلمة المرور بمعلوماتك الحقيقية
-- الطريقة الأفضل: Dashboard → Authentication → Users → Add user
-- ثم أكد البريد يدوياً إن لم تكن قد فعّلت تأكيد البريد في الإعدادات.
