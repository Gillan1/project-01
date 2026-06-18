/**
 * scripts/json-to-sql.js
 * يحوّل data/products.json إلى INSERT statements صالحة لـ Supabase / PostgreSQL.
 *
 * الاستخدام:
 *   node scripts/json-to-sql.js > supabase/seed.sql
 *
 * ثم شغّل الناتج في Supabase Dashboard → SQL Editor.
 */
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(src, 'utf8'));

function sqlStr(s) {
  if (s === null || s === undefined) return 'NULL';
  return "'" + String(s).replace(/'/g, "''") + "'";
}
function sqlNum(n) {
  if (n === null || n === undefined || n === '' || isNaN(Number(n))) return 'NULL';
  return String(Number(n));
}

// ترتيب: store أولاً (السعر موجود)، ثم orders حسب family وcolorKey
const sorted = products.slice().sort((a, b) => {
  if (a.category !== b.category) return a.category === 'store' ? -1 : 1;
  if (a.family !== b.family) return (a.family || '').localeCompare(b.family || '');
  return (a.colorKey || '').localeCompare(b.colorKey || '');
});

console.log('-- توليد تلقائي من scripts/json-to-sql.js');
console.log('-- شغّل هذا الملف في Supabase SQL Editor بعد schema.sql');
console.log('');
console.log('BEGIN;');
console.log('');

// حذف المنتجات الحالية إن وجدت (إعادة استيراد نظيفة)
console.log('DELETE FROM products WHERE TRUE;');
console.log('');

// إدراج جميع المنتجات
console.log('INSERT INTO products');
console.log('  (name, name_en, description, description_en, price, image_url, category, family, color_key, color_hex, color_name, color_name_en, cat_group, sort_order, is_active)');
console.log('VALUES');

const rows = sorted.map((p, idx) => {
  const sortOrder = sorted.length - idx; // عكس الترتيب ليظهر store أولاً
  return `  (${sqlStr(p.name)}, ${sqlStr(p.nameEn)}, ${sqlStr(p.desc)}, ${sqlStr(p.descEn)}, ${sqlNum(p.price)}, ${sqlStr(p.image)}, ${sqlStr(p.category)}, ${sqlStr(p.family)}, ${sqlStr(p.colorKey)}, ${sqlStr(p.colorHex)}, ${sqlStr(p.colorName)}, ${sqlStr(p.colorNameEn)}, ${sqlStr(p.catGroup)}, ${sqlNum(sortOrder)}, TRUE)`;
});

console.log(rows.join(',\n') + ';');
console.log('');

// إعادة تعيين الـ sequence ليتطابق مع أعلى id
console.log("SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products), TRUE);");
console.log('');
console.log('COMMIT;');
console.log('');
console.log('-- تم استيراد ' + sorted.length + ' منتج.');
