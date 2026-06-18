/**
 * js/supabase-config.js
 * إعدادات Supabase - مُهيأ تلقائياً للمشروع النشط.
 *
 * 🔒 الأمان: الـ anon key آمن لتضمينه في كود العميل (لا يمنح صلاحيات مباشرة،
 * كل الصلاحيات تدار عبر Row Level Security policies في SQL).
 */

const SUPABASE_URL = 'https://khgvmatuqqgpctimzcoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ3ZtYXR1cXFncGN0aW16Y29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3Mzg2NzAsImV4cCI6MjA5NzMxNDY3MH0.apsayk4Nh_sMv1LQefzK_23GL3Uj4kEu8GbBJ05frE4';

window.SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isConfigured: true
};
