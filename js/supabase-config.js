/**
 * js/supabase-config.js
 * إعدادات Supabase - عدّل القيمتين التاليتين بمعلومات مشروعك من Supabase Dashboard.
 *
 * كيفية الحصول على القيم:
 * 1. سجّل في https://supabase.com (مجاني)
 * 2. أنشئ مشروعاً جديداً (New Project)
 * 3. بعد الإنشاء، اذهب إلى: Project Settings → API
 * 4. انسخ:
 *    - "Project URL" → ضعه في SUPABASE_URL
 *    - "anon public" key → ضعه في SUPABASE_ANON_KEY
 *
 * ملاحظة: الـ anon key آمن لتضمينه في كود العميل (لا يمنح صلاحيات مباشرة،
 * كل الصلاحيات تدار عبر Row Level Security policies في SQL).
 */

// ✏️ عدّل هاتين القيمتين فقط
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';

// التحقق من الإعداد
if (SUPABASE_URL.includes('YOUR-PROJECT-REF') || SUPABASE_ANON_KEY.includes('YOUR-ANON')) {
  console.warn('⚠️ Supabase غير مُعد بعد. راجع js/supabase-config.js وREADME.md للإعداد.');
}

// تصدير للاستخدام عبر import map
window.SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isConfigured: !SUPABASE_URL.includes('YOUR-PROJECT-REF') && !SUPABASE_ANON_KEY.includes('YOUR-ANON')
};
