/* ============================================================
   ورشة عبادة للحدادة - منطق التطبيق
   الإصدار 2.0 - يعتمد على Supabase للتخزين والمصادقة
   ============================================================
   المميزات:
   - تخزين مركزي عبر Supabase (التعديلات تنعكس فوراً لكل الزوار)
   - مصادقة آمنة عبر Supabase Auth (لا كلمات مرور في كود العميل)
   - حماية XSS عبر escapeHtml
   - لا تخزين token في localStorage
   - دعم RTL/LTR كامل، ثنائي اللغة
   ============================================================ */

// ============ استيراد Supabase عبر Import Map ============
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// ============ إعداد Supabase ============
const SUPABASE_URL = window.SUPABASE_CONFIG?.url || '';
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey || '';
const SUPABASE_CONFIGURED = window.SUPABASE_CONFIG?.isConfigured === true;

let supabase = null;
if (SUPABASE_CONFIGURED) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'workshop_admin_session'
    }
  });
}

// ============ ثوابت عامة ============
const PHONE_LOCAL = '0115192500';
const PHONE_INTERNATIONAL = '+249 115 192 500';
const WHATSAPP_LINK = 'https://wa.me/249115192500';
const CALL_LINK = 'tel:+249115192500';
const WALLET_NUMBER = '401696711';
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const PRODUCTS_CACHE_KEY = 'workshop_products_cache';
const PRODUCTS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 دقائق

// الفئات الشائعة للتمييز
const POPULAR_FAMILIES = ['bed-classic', 'gate', 'chair-classic', 'table-dining', 'stairs-spiral'];

// ============ ترجمة أسماء العائلات ============
const FAMILY_NAMES = {
  ar: {
    'bed-classic': 'سرير كلاسيكي', 'bed-royal': 'سرير ملكي', 'bed-bunk': 'سرير بطابقين',
    'chair-classic': 'كرسي كلاسيكي', 'chair-modern': 'كرسي عصري', 'bench': 'أريكة حديد',
    'table-dining': 'طاولة طعام', 'table-coffee': 'طاولة قهوة', 'wardrobe': 'دولاب حديد',
    'bookshelf': 'رف كتب', 'stairs-spiral': 'درج حلزوني', 'stairs-straight': 'درج مستقيم',
    'gate': 'بوابة حديد', 'door': 'باب حديد', 'railing': 'درابزين حديد', 'balcony': 'شرفة حديد',
    'window': 'نافذة حديد', 'plant-stand': 'حامل نباتات', 'desk': 'طاولة مكتب', 'mirror': 'مرآة بإطار حديد',
    // === مفاتيح مضافة آلياً من HTML ===
    admin_title: 'لوحة المسؤول',
    finish_hammered: 'مطرق',
    finish_textured: 'مخمل',
    float_wa: 'واتساب',
    lang_desc: 'اختر لغة العرض المفضلة لديك',
    lang_setting: 'تغيير اللغة',
    order_notes_label: 'ملاحظات إضافية',
    orders_desc: 'فصّل على ذوقك – تصميمك الخاص، نصنعه بواقع صلب. أكثر من 20 فئة و60 خياراً متنوعاً',
    orders_title: 'الطلبات والتصنيع',
    promo_coffee_desc: 'دعمكم يلهمنا لنقدم المزيد - محفظة ماي كاش: 401696711',
    promo_coffee_title: 'اعجبك شغلنا؟ اشترِ لنا قهوة!',
    promo_contact_now: 'تواصل الآن',
    promo_copy_fb: 'نسخ النص كاملاً',
    promo_cta_copy: 'نسخ الرقم: 0115192500',
    promo_cta_desc: 'جاهز لتحويل مشروعك لموقع احترافي؟ تواصل معنا الآن',
    promo_cta_title: 'اطلب موقعك الآن',
    promo_cta_whatsapp: 'تواصل عبر واتساب',
    promo_dev_bio: 'مطور ومصمم مواقع - خبرة في Next.js وReact',
    promo_dev_title: 'المطور',
    promo_fb_hint: '💡 انسخ النص أعلاه وانشره في قروبات الفيسبوك المحلية في منطقتك',
    promo_fb_sub: 'انسخ هذا النص وانشره في القروبات المحلية',
    promo_fb_title: 'نص الترويج لفيسبوك',
    promo_off1_desc: 'تصميم احترافي متجاوب مع الجوال',
    promo_off1_title: 'موقع متجاوب',
    promo_off2_desc: 'تحسين لمحركات البحث (SEO)',
    promo_off2_title: 'SEO محسّن',
    promo_off3_desc: 'لوحة تحكم لإدارة المنتجات',
    promo_off3_title: 'لوحة تحكم',
    promo_off4_desc: 'تكامل مع واتساب للطلبات',
    promo_off4_title: 'واتساب مدمج',
    promo_off5_desc: 'دعم فني وتحديثات مستمرة',
    promo_off5_title: 'دعم فني',
    promo_off6_desc: 'استضافة مجانية على GitHub Pages',
    promo_off6_title: 'استضافة مجانية',
    promo_offer_title: 'عروضنا',
    promo_p4_desc: 'موقعك يفتح أبوابه 24 ساعة - العملاء يتصفحون منتجاتك في أي وقت',
    promo_p4_title: 'متجرك مفتوح 24 ساعة',
    promo_proof_desc: 'هذا الموقع نفسه مثال حي على جودة عملنا - تصفّحه وتعرف على إمكانياتنا',
    promo_proof_title: 'أمثلة من تنفيذنا',
    promo_s1_tag1: 'متجاوب',
    promo_s1_tag2: 'سريع',
    promo_s1_tag3: 'احترافي',
    promo_s1_tag4: 'SEO',
    promo_s1_tag5: 'آمن',
    promo_s1_tag6: 'عصري',
    promo_s1_tag7: 'سهل',
    promo_s2_tag1: 'متجاوب',
    promo_s2_tag2: 'سريع',
    promo_s2_tag3: 'احترافي',
    promo_s2_tag4: 'SEO',
    promo_s2_tag5: 'آمن',
    promo_s2_tag6: 'عصري',
    promo_s2_tag7: 'سهل',
    promo_store1_desc: 'متجر إلكتروني للأجهزة والإلكترونيات',
    promo_store1_location: 'الخرطوم',
    promo_store1_subtitle: 'متجر إلكتروني شامل',
    promo_store1_title: 'مجمع الحياة',
    promo_store2_desc: 'ورشة حدادة متخصصة في الأعمال الحديدية',
    promo_store2_location: 'الخرطوم',
    promo_store2_subtitle: 'ورشة حدادة',
    promo_store2_title: 'ورشة عبادة عبد الحفيظ للحدادة',
    theme_desc: 'اختر المظهر الذي يناسبك',
    theme_setting: 'تغيير المظهر',
  },
  en: {
    'bed-classic': 'Classic Iron Bed', 'bed-royal': 'Royal Iron Bed', 'bed-bunk': 'Bunk Iron Bed',
    'chair-classic': 'Classic Iron Chair', 'chair-modern': 'Modern Iron Chair', 'bench': 'Iron Bench',
    'table-dining': 'Iron Dining Table', 'table-coffee': 'Iron Coffee Table', 'wardrobe': 'Iron Wardrobe',
    'bookshelf': 'Iron Bookshelf', 'stairs-spiral': 'Spiral Staircase', 'stairs-straight': 'Straight Staircase',
    'gate': 'Iron Gate', 'door': 'Iron Door', 'railing': 'Iron Railing', 'balcony': 'Iron Balcony',
    'window': 'Iron Window', 'plant-stand': 'Iron Plant Stand', 'desk': 'Iron Desk', 'mirror': 'Iron Mirror Frame',
    orders_title: 'الطلبات والتصنيع',
    promo_coffee_desc: 'دعمكم يلهمنا لنقدم المزيد - محفظة ماي كاش: 401696711',
    promo_coffee_title: 'اعجبك شغلنا؟ اشترِ لنا قهوة!',
    promo_contact_now: 'تواصل الآن',
    promo_copy_fb: 'نسخ النص كاملاً',
    promo_cta_copy: 'نسخ الرقم: 0115192500',
    promo_cta_desc: 'إذا أردت موقعاً مماثلاً لمتجرك أو مشروعك، تواصل معي الآن!',
    promo_cta_title: 'تم بناء هذين الموقعين من قبل غيلان بن عقبة',
    promo_cta_whatsapp: 'تواصل عبر واتساب',
    promo_dev_bio: 'مطور مواقع ويب محترف متخصص في تصميم وتطوير المواقع الإلكترونية للمتاجر والمشاريع التجارية. أؤمن بأن كل مشروع يستحق وجوداً رقمياً احترافياً يعكس هويته ويوسع نطاق وصوله.',
    promo_dev_title: 'المطور: غيلان بن عقبة',
    promo_fb_hint: '💡 انسخ النص أعلاه وانشره في قروبات الفيسبوك المحلية في منطقتك',
    promo_fb_sub: 'انسخ هذا النص وانشره في القروبات المحلية',
    promo_fb_title: 'نص الترويج لفيسبوك',
    promo_off1_desc: 'موقع كامل لعرض منتجاتك وخدماتك مع إمكانية التواصل المباشر',
    promo_off1_title: 'مواقع متاجر إلكترونية',
    promo_off2_desc: 'موقعك يعمل بشكل ممتاز على الهاتف والتابلت والكمبيوتر',
    promo_off2_title: 'تصميم متجاوب',
    promo_off3_desc: 'مواقع سريعة التحميل ومحسنة لمحركات البحث',
    promo_off3_title: 'سرعة وأداء عالي',
    promo_off4_desc: 'تصميم عصري وجذاب يعكس هوية مشروعك',
    promo_off4_title: 'تصميم احترافي',
    promo_off5_desc: 'إدارة المحتوى والمنتجات بسهولة تامة',
    promo_off5_title: 'لوحة تحكم سهلة',
    promo_off6_desc: 'ربط مباشر مع واتساب للتواصل مع العملاء',
    promo_off6_title: 'تكامل واتساب',
    promo_offer_title: 'ماذا أقدم؟',
    promo_p4_desc: 'الموقع الإلكتروني يوسع نطاق وصولك ليشمل كل السودان وخارجه. لا تقتصر على العملاء في منطقتك فقط.',
    promo_p4_title: 'وصول بلا حدود جغرافية',
    promo_proof_desc: 'الموقعان الموضحان أعلاه هما مشروعان حقيقيان تم تصميمهما وتطويرهما بالكامل من قبل المطور غيلان بن عقبة. مجمع الحياة هو متجر إلكترونيات متكامل في دنقلا، وورشة عبادة للحدادة هي ورشة أعمال حديدية في الخرطوم. كلا الموقعين يعملان حالياً ويستخدمهما العملاء.',
    promo_proof_title: 'الدليل على الجودة',
    promo_s1_tag1: 'متجر إلكترونيات',
    promo_s1_tag2: 'طباعة وتصوير',
    promo_s1_tag3: 'تحميل برامج',
    promo_s1_tag4: 'أفلام ومسلسلات',
    promo_s1_tag5: 'ألعاب',
    promo_s1_tag6: 'سوفت وير',
    promo_s1_tag7: 'تخطي FRP',
    promo_s2_tag1: 'أبواب حديد',
    promo_s2_tag2: 'أسرّة',
    promo_s2_tag3: 'بوابات',
    promo_s2_tag4: 'درابزين',
    promo_s2_tag5: 'سلالم',
    promo_s2_tag6: 'مظلات',
    promo_s2_tag7: 'تفصيل حسب الطلب',
    promo_store1_desc: 'مجمع الحياة هو متجر متكامل للإلكترونيات والخدمات الرقمية في دنقلا، السودان. يقدم الموقع تجربة تسوق احترافية تشمل عرض المنتجات الإلكترونية المتنوعة من هواتف وشواحن وسماعات وإكسسوارات، بالإضافة إلى خدمات متعددة مثل الطباعة والتصوير وتحميل البرامج والأفلام والمسلسلات وتحميل لعبة Genshin Impact وسوفت وير للأجهزة وتخطي حساب جوجل.',
    promo_store1_location: 'مجمع الحياة - دنقلا، السودان',
    promo_store1_subtitle: 'متجر إلكترونيات وخدمات رقمية',
    promo_store1_title: 'مجمع الحياة',
    promo_store2_desc: 'ورشة عبادة عبد الحفيظ للحدادة هي ورشة متخصصة في تصنيع أعمال حديدية متقنة بأجود الخامات في السودان. يقدم الموقع عرضاً احترافياً للمنتجات الجاهزة والمصنوعة حسب الطلب من أبواب حديد وأسرّة ومظلات وبوابات ودرابزين وسلالم، مع حاسبة تكلفة مبدئية ونظام طلبات متكامل عبر واتساب.',
    promo_store2_location: 'واتساب: 0115192500',
    promo_store2_subtitle: 'أعمال حديدية احترافية',
    promo_store2_title: 'ورشة عبادة عبد الحفيظ للحدادة',
    theme_desc: 'اختر المظهر الذي يناسبك',
    theme_setting: 'تغيير المظهر',

  },
  en: {
    'bed-classic': 'Classic Iron Bed', 'bed-royal': 'Royal Iron Bed', 'bed-bunk': 'Bunk Iron Bed',
    'chair-classic': 'Classic Iron Chair', 'chair-modern': 'Modern Iron Chair', 'bench': 'Iron Bench',
    'table-dining': 'Iron Dining Table', 'table-coffee': 'Iron Coffee Table', 'wardrobe': 'Iron Wardrobe',
    'bookshelf': 'Iron Bookshelf', 'stairs-spiral': 'Spiral Staircase', 'stairs-straight': 'Straight Staircase',
    'gate': 'Iron Gate', 'door': 'Iron Door', 'railing': 'Iron Railing', 'balcony': 'Iron Balcony',
    'window': 'Iron Window', 'plant-stand': 'Iron Plant Stand', 'desk': 'Iron Desk', 'mirror': 'Iron Mirror Frame'
  }
};

// ============ حالة التطبيق ============
const VALID_LANGS = ['ar', 'en'];
const VALID_THEMES = ['dark', 'light', 'blue', 'green'];
let currentLang = VALID_LANGS.includes(localStorage.getItem('lang')) ? localStorage.getItem('lang') : 'ar';
let currentTheme = VALID_THEMES.includes(localStorage.getItem('theme')) ? localStorage.getItem('theme') : 'dark';
let currentSortMode = 'default';
let isAdmin = false;
let editingImageData = null;
let productsCache = null;
let productsCacheTime = 0;
let activeOrdersFilter = 'all';
let ordersSearchQuery = '';
let activeVariants = {}; // variant نشط لكل family

// ============ دوال مساعدة آمنة (XSS protection) ============
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}

// تحويل نص إلى slug آمن
function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ============ تنسيق العملة ============
function formatPrice(price, lang) {
  if (price === null || price === undefined || price === '' || isNaN(Number(price))) {
    return lang === 'ar' ? 'السعر عند التواصل' : 'Price on request';
  }
  const num = Number(price);
  // استخدام en-US لتنسيق الأرقام (مع فواصل) ثم إضافة كلمة العملة بالعربية
  const formatted = num.toLocaleString('en-US');
  return lang === 'ar' ? `${formatted} جنيه` : `${formatted} SDG`;
}

function formatDate(dateString, lang) {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    // استخدام ar-EG (أرقام لاتينية بدلاً من ar-SA الهجري)
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (e) {
    return '';
  }
}

// ============ إظهار toast ============
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ============ عرض تحميل ============
function showLoading() {
  const storeGrid = document.getElementById('products-grid');
  const ordersGrid = document.getElementById('orders-grid');
  if (storeGrid) storeGrid.innerHTML = generateSkeletonCards(6);
  if (ordersGrid) ordersGrid.innerHTML = generateSkeletonCards(6);
}

function generateSkeletonCards(count) {
  let cards = '';
  for (let i = 0; i < count; i++) {
    cards += `
      <div class="product-card skeleton-card" aria-hidden="true">
        <div class="skeleton-img"></div>
        <div class="skeleton-line w-80"></div>
        <div class="skeleton-line w-60"></div>
        <div class="skeleton-line w-40"></div>
      </div>`;
  }
  return cards;
}

function hideLoading() {
  // يُستبدل عند renderProducts
}

// ============ الترجمات ============
const translations = {
  ar: {
    // التنقل
    nav_home: 'المتجر', nav_orders: 'الطلبات والتصنيع', nav_estimator: 'حاسبة التكلفة',
    nav_gallery: 'أعمالنا', nav_faq: 'الأسئلة الشائعة', nav_promotion: 'الترويج',
    nav_settings: 'الإعدادات', nav_admin: 'المسؤول',

    // الهيرو
    subtitle: 'صناعة الحديد بكل احترافية وإتقان',
    hero_title: 'حيث تلتقي صلابة الحديد بجمال التصميم',
    hero_subtitle: 'نصنع لك الأمان والأناقة لتدوم أجيالاً',
    hero_cta_store: 'تصفح المنتجات الجاهزة', hero_cta_orders: 'اطلب تفصيل خاص',

    // المتجر
    products_title: 'منتجات المتجر',
    products_desc: 'جاهز للتسليم – جودة فورية بلا انتظار. اكتشف تشكيلتنا من الأعمال الحديدية الجاهزة المصنوعة بعناية فائقة',
    sort_label: 'ترتيب:', sort_default: 'افتراضي', sort_price_asc: 'الأقل سعراً', sort_price_desc: 'الأعلى سعراً',
    no_store_products: 'لا توجد منتجات في المتجر حالياً',
    no_order_products: 'لا توجد طلبات متاحة حالياً',
    search_placeholder: 'ابحث عن منتج...',

    // الفئات
    cat_all: 'الكل', cat_beds: 'سراير', cat_chairs: 'كراسي وأرائك', cat_tables: 'طاولات',
    cat_storage: 'تخزين', cat_stairs: 'سلالم', cat_gates: 'أبواب وبوابات',
    cat_outdoor: 'خارجي', cat_decor: 'ديكور',
    stat_families: 'عائلة منتج', stat_variants: 'خيار مختلف',

    // حاسبة التكلفة
    estimator_title: 'حاسبة التكلفة المبدئية',
    estimator_desc: 'احصل على تقدير سريع لتكلفة مشروعك - أدخل الأبعاد واختر النوع',
    est_type_label: 'نوع المنتج',
    est_gate: 'بوابة حديد', est_door: 'باب حديد', est_railing: 'درابزين',
    est_balcony: 'شرفة / مظلة', est_window: 'حماية نوافذ', est_stairs: 'سلالم', est_bed: 'سرير حديد',
    est_width_label: 'العرض (متر)', est_height_label: 'الارتفاع (متر)',
    est_calculate: 'احسب التكلفة التقريبية',
    est_result_label: 'جنيه سوداني (تقريبي)',
    est_disclaimer: 'هذا تقدير مبدئي فقط. السعر النهائي يعتمد على تفاصيل التصميم ونوع التشطيب. تواصل معنا للحصول على عرض سعر دقيق.',
    est_whatsapp: 'اطلب عرض سعر دقيق عبر واتساب',

    // المعرض
    gallery_title: 'من أرض الواقع', gallery_desc: 'صور حقيقية لمشاريعنا المنفذة - قريباً',
    gallery_empty: 'قريباً صور حقيقية لمشاريع منفذة',

    // الأسئلة الشائعة
    faq_title: 'الأسئلة الشائعة', faq_desc: 'إجابات سريعة لأهم استفساراتكم',
    faq1_q: 'هل يتوفر خدمة التوصيل والتركيب؟',
    faq1_a: 'نعم، نوفر خدمة التوصيل والتركيب داخل منطقة الخرطوم وأم درمان. تكلفة التوصيل تعتمد على المسافة وحجم المنتج. تواصل معنا عبر واتساب لمعرفة تفاصيل التوصيل لمنطقتك.',
    faq2_q: 'ما هو نوع الطلاء المستخدم لمنع الصدأ؟',
    faq2_a: 'نستخدم طلاء دهان بوياه عالية الجودة مقاوم للصدأ والعوامل الجوية، مع طبقة أساس (بريمر) مضادة للتآكل. للمنتجات الخارجية نستخدم طلاء خاص مقاوم للأشعة فوق البنفسجية والأمطار.',
    faq3_q: 'كم يستغرق تفصيل باب خارجي؟',
    faq3_a: 'تختلف المدة حسب التصميم والحجم، لكن عادةً يستغرق تفصيل الباب الخارجي من 5 إلى 10 أيام عمل. المشاريع الكبيرة أو التصاميم المعقدة قد تحتاج وقتاً أطول. نحرص على الالتزام بالموعد المتفق عليه.',
    faq4_q: 'هل يمكن تفصيل تصميم خاص حسب رغبتي؟',
    faq4_a: 'بالطبع! هذا ما نميز به. يمكنك اختيار أي تصميم من الكتالوج وتعديله، أو إرسال صورة أو رسم لتصميمك الخاص وسنقوم بتنفيذه بدقة عالية مع إمكانية اختيار الألوان والتشطيبات.',
    faq5_q: 'ما هي طرق الدفع المتاحة؟',
    faq5_a: 'نقبل الدفع نقداً عند الاستلام، أو عبر محفظة ماي كاش. للطلبات الكبيرة يمكن الاتفاق على دفعة مقدمة وباقي المبلغ عند التسليم.',

    // الترويج
    promo_title: 'الترويج لمتجرك أو مشروعك',
    promo_subtitle: 'حوّل متجرك أو مشروعك إلى موقع إلكتروني احترافي يصل لكل السودان وخارجه',
    promo_badge: 'ترويج احترافي',
    promo_hero_title: 'حوّل متجرك أو مشروعك إلى موقع إلكتروني احترافي!',
    promo_hero_desc: 'هل تملك متجراً أو مشروعاً ولا تملك موقعاً إلكترونياً؟ نحن نصمم لك موقعاً احترافياً يعرض منتجاتك وخدماتك للعالم بأسره. شاهد أمثلة حقيقية لما يمكننا تقديمه.',
    promo_tag_web: 'مواقع احترافية', promo_tag_mobile: 'متجاوب مع الجوال', promo_tag_reach: 'وصول أوسع',
    promo_problem_title: '⚡ لماذا تحتاج موقع إلكتروني؟',
    promo_p1_title: 'جمهورك يبحث عنك أونلاين',
    promo_p1_desc: 'أكثر من 80% من العملاء يبحثون عن المنتجات والخدمات على الإنترنت قبل الشراء. بدون موقع، أنت تخسر عملاء محتملين كل يوم.',
    promo_p2_title: 'متجرك مفتوح 24 ساعة',
    promo_p2_desc: 'الموقع الإلكتروني يعمل على مدار الساعة. العملاء يمكنهم تصفح منتجاتك وخدماتك في أي وقت حتى بعد ساعات العمل الرسمية.',
    promo_p3_title: 'مصداقية واحترافية',
    promo_p3_desc: 'الموقع الاحترافي يعكس مصداقية مشروعك ويبني ثقة العملاء. يسهل عليهم معرفة تفاصيل منتجاتك والاتصال بك مباشرة.',

    // الإعدادات
    settings_title: 'الإعدادات',
    settings_language: 'اللغة', settings_theme: 'السمة',
    theme_dark: 'داكن', theme_light: 'فاتح', theme_blue: 'أزرق', theme_green: 'أخضر',
    settings_arabic: 'العربية', settings_english: 'English',
    settings_contact: 'معلومات التواصل',
    settings_phone: 'الهاتف', settings_whatsapp: 'واتساب', settings_wallet: 'محفظة ماي كاش',

    // المسؤول - تسجيل الدخول
    admin_login_title: 'دخول المسؤول',
    admin_login_desc: 'سجّل الدخول بحساب Supabase للوصول للوحة التحكم',
    username_label: 'البريد الإلكتروني', password_label: 'كلمة المرور',
    login_btn: 'تسجيل الدخول', logout_btn: 'تسجيل الخروج',
    login_error: 'بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.',
    welcome_admin: 'مرحباً بك في لوحة التحكم',
    tab_products: 'إدارة المنتجات', tab_add: 'إضافة منتج', tab_settings: 'إعدادات Supabase',

    // إدارة المنتجات
    product_name_label: 'اسم المنتج', product_desc_label: 'وصف المنتج',
    product_price_label: 'السعر (جنيه سوداني) - اتركه فارغاً للطلبات',
    product_category_label: 'القسم',
    cat_store: 'المتجر', cat_orders: 'الطلبات والتصنيع',
    product_image_label: 'صورة المنتج',
    upload_btn: 'اختر صورة', no_image_selected: 'لم يتم اختيار صورة',
    image_invalid_type: 'الرجاء اختيار ملف صورة صالح',
    image_too_large: 'حجم الصورة يتجاوز 2 ميجابايت',
    save_btn: 'حفظ المنتج', update_btn: 'تحديث المنتج', cancel_btn: 'إلغاء',
    edit_product: 'تعديل المنتج', change_image: 'تغيير الصورة',
    delete_confirm: 'هل أنت متأكد من حذف هذا المنتج؟',
    saved_success: 'تم حفظ المنتج بنجاح',
    deleted_success: 'تم حذف المنتج بنجاح',
    updated_success: 'تم تحديث المنتج بنجاح',
    fill_fields: 'الرجاء ملء جميع الحقول المطلوبة',
    edit_btn: 'تعديل', delete_btn: 'حذف',
    no_products_yet: 'لا توجد منتجات بعد. أضف أول منتج من تبويب "إضافة منتج".',

    // إعدادات Supabase
    supabase_status_title: 'حالة الاتصال بـ Supabase',
    supabase_connected: '✓ متصل', supabase_not_configured: '✗ غير مُعد',
    supabase_configured_not_logged: '! مُعد - لم تسجل الدخول',
    storage_info_title: 'معلومات التخزين',
    storage_mode: 'وضع التخزين:', products_count: 'عدد المنتجات:',
    last_sync: 'آخر تحديث:', supabase_note: 'المنتجات تُخزَّن في Supabase. التعديلات تنعكس فوراً على كل الأجهزة.',
    refresh_btn: 'تحديث من السحابة',

    // الطلب
    order_modal_title: 'اطلب الآن',
    order_step1: 'الموديل', order_step2: 'المقاسات', order_step3: 'اللون', order_step4: 'إرسال',
    order_step1_title: 'اختر الموديل',
    order_step1_desc: 'تم اختيار الموديل تلقائياً من الكتالوج',
    order_step2_title: 'حدد المقاسات التقريبية',
    order_width_label: 'العرض (متر)', order_height_label: 'الارتفاع (متر)',
    order_notes_placeholder: 'أي تفاصيل إضافية تريد إضافتها...',
    order_step3_title: 'اختر اللون والتشطيب',
    order_color_label: 'اللون', order_finish_label: 'التشطيب',
    finish_matte: 'مطفي', finish_glossy: 'لامع', finish_metallic: 'معدني',
    order_step4_title: 'مراجعة الطلب',
    order_summary_model: 'الموديل', order_summary_dimensions: 'المقاسات',
    order_summary_color: 'اللون', order_summary_finish: 'التشطيب', order_summary_notes: 'ملاحظات',
    order_prev: 'السابق', order_next: 'التالي', order_send_wa: 'إرسال عبر واتساب',
    order_no_notes: 'لا توجد',

    // القهوة
    coffee_btn_text: '☕ اشترِ لي قهوة',
    coffee_modal_title: '☕ اشترِ لي قهوة',
    coffee_modal_desc: 'إذا أعجبك الموقع ودعمك لي يعني الكثير، يمكنك مشاركتي قهوة بسيطة عبر محفظة ماي كاش',
    coffee_wallet_label: 'محفظة ماي كاش',
    copy_wallet_btn: '📋 نسخ الرقم',
    copied: 'تم النسخ!',

    // متنوع
    back_to_top: 'العودة للأعلى',
    contact_whatsapp: 'تواصل واتساب',
    footer_built_by: 'تم بناء هذا الموقع من قبل',
    loading_products: 'جاري تحميل المنتجات...',
    error_loading: 'تعذّر تحميل المنتجات. تحقق من الاتصال.'
  },

  en: {
    // Navigation
    nav_home: 'Store', nav_orders: 'Orders & Manufacturing', nav_estimator: 'Cost Calculator',
    nav_gallery: 'Our Work', nav_faq: 'FAQ', nav_promotion: 'Promotion',
    nav_settings: 'Settings', nav_admin: 'Admin',

    // Hero
    subtitle: 'Iron craftsmanship with professionalism and mastery',
    hero_title: 'Where iron strength meets design beauty',
    hero_subtitle: 'We craft your safety and elegance to last for generations',
    hero_cta_store: 'Browse Ready Products', hero_cta_orders: 'Order Custom',

    // Store
    products_title: 'Store Products',
    products_desc: 'Ready for delivery – instant quality without waiting. Discover our collection of ready-made ironworks crafted with great care',
    sort_label: 'Sort:', sort_default: 'Default', sort_price_asc: 'Price: Low to High', sort_price_desc: 'Price: High to Low',
    no_store_products: 'No products in the store currently',
    no_order_products: 'No orders available currently',
    search_placeholder: 'Search for a product...',

    // Categories
    cat_all: 'All', cat_beds: 'Beds', cat_chairs: 'Chairs & Benches', cat_tables: 'Tables',
    cat_storage: 'Storage', cat_stairs: 'Stairs', cat_gates: 'Doors & Gates',
    cat_outdoor: 'Outdoor', cat_decor: 'Decor',
    stat_families: 'product families', stat_variants: 'different options',

    // Estimator
    estimator_title: 'Initial Cost Calculator',
    estimator_desc: 'Get a quick estimate for your project cost - enter dimensions and choose type',
    est_type_label: 'Product Type',
    est_gate: 'Iron Gate', est_door: 'Iron Door', est_railing: 'Railing',
    est_balcony: 'Balcony / Canopy', est_window: 'Window Protection', est_stairs: 'Stairs', est_bed: 'Iron Bed',
    est_width_label: 'Width (meter)', est_height_label: 'Height (meter)',
    est_calculate: 'Calculate Approximate Cost',
    est_result_label: 'Sudanese Pound (approx.)',
    est_disclaimer: 'This is an initial estimate only. Final price depends on design details and finish type. Contact us for an accurate quote.',
    est_whatsapp: 'Request an accurate quote via WhatsApp',

    // Gallery
    gallery_title: 'From Reality', gallery_desc: 'Real photos of our executed projects - coming soon',
    gallery_empty: 'Coming soon - real photos of executed projects',

    // FAQ
    faq_title: 'Frequently Asked Questions', faq_desc: 'Quick answers to your most important inquiries',
    faq1_q: 'Is delivery and installation available?',
    faq1_a: 'Yes, we provide delivery and installation within Khartoum and Omdurman. Delivery cost depends on distance and product size. Contact us via WhatsApp for delivery details to your area.',
    faq2_q: 'What type of paint is used to prevent rust?',
    faq2_a: 'We use high-quality anti-rust and weather-resistant paint, with an anti-corrosion primer base. For outdoor products, we use special paint resistant to UV and rain.',
    faq3_q: 'How long does it take to custom-make an exterior door?',
    faq3_a: 'Duration varies by design and size, but typically takes 5 to 10 working days. Larger or complex projects may take longer. We commit to the agreed deadline.',
    faq4_q: 'Can I custom-make a design according to my preference?',
    faq4_a: 'Of course! This is our specialty. You can choose any design from the catalog and modify it, or send a photo or drawing of your own design and we will execute it with high precision.',
    faq5_q: 'What payment methods are available?',
    faq5_a: 'We accept cash on delivery, or via My Cash wallet. For large orders, an advance payment can be arranged with the rest due on delivery.',

    // Promotion
    promo_title: 'Promote Your Store or Project',
    promo_subtitle: 'Turn your store or project into a professional website reaching all of Sudan and beyond',
    promo_badge: 'Professional Promotion',
    promo_hero_title: 'Turn your store or project into a professional website!',
    promo_hero_desc: 'Do you have a store or project without a website? We design a professional website that showcases your products and services to the world. See real examples of what we can offer.',
    promo_tag_web: 'Professional Websites', promo_tag_mobile: 'Mobile Responsive', promo_tag_reach: 'Wider Reach',
    promo_problem_title: '⚡ Why do you need a website?',
    promo_p1_title: 'Your audience is searching for you online',
    promo_p1_desc: 'Over 80% of customers search for products and services online before buying. Without a website, you lose potential customers every day.',
    promo_p2_title: 'Your store is open 24/7',
    promo_p2_desc: 'The website works around the clock. Customers can browse your products and services at any time even after official working hours.',
    promo_p3_title: 'Credibility and Professionalism',
    promo_p3_desc: 'A professional website reflects your project credibility and builds customer trust. Makes it easy for them to know your product details and contact you directly.',

    // Settings
    settings_title: 'Settings',
    settings_language: 'Language', settings_theme: 'Theme',
    theme_dark: 'Dark', theme_light: 'Light', theme_blue: 'Blue', theme_green: 'Green',
    settings_arabic: 'Arabic', settings_english: 'English',
    settings_contact: 'Contact Information',
    settings_phone: 'Phone', settings_whatsapp: 'WhatsApp', settings_wallet: 'My Cash Wallet',

    // Admin - Login
    admin_login_title: 'Admin Login',
    admin_login_desc: 'Sign in with your Supabase account to access the dashboard',
    username_label: 'Email', password_label: 'Password',
    login_btn: 'Sign In', logout_btn: 'Sign Out',
    login_error: 'Invalid credentials. Check your email and password.',
    welcome_admin: 'Welcome to the Dashboard',
    tab_products: 'Manage Products', tab_add: 'Add Product', tab_settings: 'Supabase Settings',

    // Product Management
    product_name_label: 'Product Name', product_desc_label: 'Product Description',
    product_price_label: 'Price (SDG) - leave empty for orders',
    product_category_label: 'Category',
    cat_store: 'Store', cat_orders: 'Orders & Manufacturing',
    product_image_label: 'Product Image',
    upload_btn: 'Choose Image', no_image_selected: 'No image selected',
    image_invalid_type: 'Please select a valid image file',
    image_too_large: 'Image size exceeds 2MB',
    save_btn: 'Save Product', update_btn: 'Update Product', cancel_btn: 'Cancel',
    edit_product: 'Edit Product', change_image: 'Change Image',
    delete_confirm: 'Are you sure you want to delete this product?',
    saved_success: 'Product saved successfully',
    deleted_success: 'Product deleted successfully',
    updated_success: 'Product updated successfully',
    fill_fields: 'Please fill in all required fields',
    edit_btn: 'Edit', delete_btn: 'Delete',
    no_products_yet: 'No products yet. Add your first product from "Add Product" tab.',

    // Supabase Settings
    supabase_status_title: 'Supabase Connection Status',
    supabase_connected: '✓ Connected', supabase_not_configured: '✗ Not configured',
    supabase_configured_not_logged: '! Configured - not logged in',
    storage_info_title: 'Storage Information',
    storage_mode: 'Storage mode:', products_count: 'Products count:',
    last_sync: 'Last update:', supabase_note: 'Products are stored in Supabase. Changes reflect instantly on all devices.',
    refresh_btn: 'Refresh from Cloud',

    // Order
    order_modal_title: 'Order Now',
    order_step1: 'Model', order_step2: 'Dimensions', order_step3: 'Color', order_step4: 'Send',
    order_step1_title: 'Choose Model',
    order_step1_desc: 'Model auto-selected from catalog',
    order_step2_title: 'Set Approximate Dimensions',
    order_width_label: 'Width (meter)', order_height_label: 'Height (meter)',
    order_notes_placeholder: 'Any additional details you want to add...',
    order_step3_title: 'Choose Color and Finish',
    order_color_label: 'Color', order_finish_label: 'Finish',
    finish_matte: 'Matte', finish_glossy: 'Glossy', finish_metallic: 'Metallic',
    order_step4_title: 'Review Order',
    order_summary_model: 'Model', order_summary_dimensions: 'Dimensions',
    order_summary_color: 'Color', order_summary_finish: 'Finish', order_summary_notes: 'Notes',
    order_prev: 'Previous', order_next: 'Next', order_send_wa: 'Send via WhatsApp',
    order_no_notes: 'None',

    // Coffee
    coffee_btn_text: '☕ Buy me a coffee',
    coffee_modal_title: '☕ Buy me a coffee',
    coffee_modal_desc: 'If you like the site and your support means a lot, you can share a simple coffee via My Cash wallet',
    coffee_wallet_label: 'My Cash Wallet',
    copy_wallet_btn: '📋 Copy Number',
    copied: 'Copied!',

    // Misc
    back_to_top: 'Back to top',
    contact_whatsapp: 'Contact WhatsApp',
    footer_built_by: 'This website was built by',
    loading_products: 'Loading products...',
    error_loading: 'Failed to load products. Check connection.',
    // === Auto-added keys from HTML ===
    admin_title: 'لوحة المسؤول',
    finish_hammered: 'مطرق',
    finish_textured: 'مخمل',
    float_wa: 'واتساب',
    lang_desc: 'اختر لغة العرض المفضلة لديك',
    lang_setting: 'تغيير اللغة',
    order_notes_label: 'ملاحظات إضافية',
    orders_desc: 'فصّل على ذوقك – تصميمك الخاص، نصنعه بواقع صلب. أكثر من 20 فئة و60 خياراً متنوعاً',
    orders_title: 'الطلبات والتصنيع',
    promo_coffee_desc: 'دعمكم يلهمنا لنقدم المزيد - محفظة ماي كاش: 401696711',
    promo_coffee_title: 'اعجبك شغلنا؟ اشترِ لنا قهوة!',
    promo_contact_now: 'تواصل الآن',
    promo_copy_fb: 'نسخ النص كاملاً',
    promo_cta_copy: 'نسخ الرقم: 0115192500',
    promo_cta_desc: 'إذا أردت موقعاً مماثلاً لمتجرك أو مشروعك، تواصل معي الآن!',
    promo_cta_title: 'تم بناء هذين الموقعين من قبل غيلان بن عقبة',
    promo_cta_whatsapp: 'تواصل عبر واتساب',
    promo_dev_bio: 'مطور مواقع ويب محترف متخصص في تصميم وتطوير المواقع الإلكترونية للمتاجر والمشاريع التجارية. أؤمن بأن كل مشروع يستحق وجوداً رقمياً احترافياً يعكس هويته ويوسع نطاق وصوله.',
    promo_dev_title: 'المطور: غيلان بن عقبة',
    promo_fb_hint: '💡 انسخ النص أعلاه وانشره في قروبات الفيسبوك المحلية في منطقتك',
    promo_fb_sub: 'انسخ هذا النص وانشره في القروبات المحلية',
    promo_fb_title: 'نص الترويج لفيسبوك',
    promo_off1_desc: 'موقع كامل لعرض منتجاتك وخدماتك مع إمكانية التواصل المباشر',
    promo_off1_title: 'مواقع متاجر إلكترونية',
    promo_off2_desc: 'موقعك يعمل بشكل ممتاز على الهاتف والتابلت والكمبيوتر',
    promo_off2_title: 'تصميم متجاوب',
    promo_off3_desc: 'مواقع سريعة التحميل ومحسنة لمحركات البحث',
    promo_off3_title: 'سرعة وأداء عالي',
    promo_off4_desc: 'تصميم عصري وجذاب يعكس هوية مشروعك',
    promo_off4_title: 'تصميم احترافي',
    promo_off5_desc: 'إدارة المحتوى والمنتجات بسهولة تامة',
    promo_off5_title: 'لوحة تحكم سهلة',
    promo_off6_desc: 'ربط مباشر مع واتساب للتواصل مع العملاء',
    promo_off6_title: 'تكامل واتساب',
    promo_offer_title: 'ماذا أقدم؟',
    promo_p4_desc: 'الموقع الإلكتروني يوسع نطاق وصولك ليشمل كل السودان وخارجه. لا تقتصر على العملاء في منطقتك فقط.',
    promo_p4_title: 'وصول بلا حدود جغرافية',
    promo_proof_desc: 'الموقعان الموضحان أعلاه هما مشروعان حقيقيان تم تصميمهما وتطويرهما بالكامل من قبل المطور غيلان بن عقبة. مجمع الحياة هو متجر إلكترونيات متكامل في دنقلا، وورشة عبادة للحدادة هي ورشة أعمال حديدية في الخرطوم. كلا الموقعين يعملان حالياً ويستخدمهما العملاء.',
    promo_proof_title: 'الدليل على الجودة',
    promo_s1_tag1: 'متجر إلكترونيات',
    promo_s1_tag2: 'طباعة وتصوير',
    promo_s1_tag3: 'تحميل برامج',
    promo_s1_tag4: 'أفلام ومسلسلات',
    promo_s1_tag5: 'ألعاب',
    promo_s1_tag6: 'سوفت وير',
    promo_s1_tag7: 'تخطي FRP',
    promo_s2_tag1: 'أبواب حديد',
    promo_s2_tag2: 'أسرّة',
    promo_s2_tag3: 'بوابات',
    promo_s2_tag4: 'درابزين',
    promo_s2_tag5: 'سلالم',
    promo_s2_tag6: 'مظلات',
    promo_s2_tag7: 'تفصيل حسب الطلب',
    promo_store1_desc: 'مجمع الحياة هو متجر متكامل للإلكترونيات والخدمات الرقمية في دنقلا، السودان. يقدم الموقع تجربة تسوق احترافية تشمل عرض المنتجات الإلكترونية المتنوعة من هواتف وشواحن وسماعات وإكسسوارات، بالإضافة إلى خدمات متعددة مثل الطباعة والتصوير وتحميل البرامج والأفلام والمسلسلات وتحميل لعبة Genshin Impact وسوفت وير للأجهزة وتخطي حساب جوجل.',
    promo_store1_location: 'مجمع الحياة - دنقلا، السودان',
    promo_store1_subtitle: 'متجر إلكترونيات وخدمات رقمية',
    promo_store1_title: 'مجمع الحياة',
    promo_store2_desc: 'ورشة عبادة عبد الحفيظ للحدادة هي ورشة متخصصة في تصنيع أعمال حديدية متقنة بأجود الخامات في السودان. يقدم الموقع عرضاً احترافياً للمنتجات الجاهزة والمصنوعة حسب الطلب من أبواب حديد وأسرّة ومظلات وبوابات ودرابزين وسلالم، مع حاسبة تكلفة مبدئية ونظام طلبات متكامل عبر واتساب.',
    promo_store2_location: 'واتساب: 0115192500',
    promo_store2_subtitle: 'أعمال حديدية احترافية',
    promo_store2_title: 'ورشة عبادة عبد الحفيظ للحدادة',
    theme_desc: 'اختر المظهر الذي يناسبك',
    theme_setting: 'تغيير المظهر',

  }
};

function t(key) {
  return translations[currentLang]?.[key] || translations.ar[key] || key;
}

// ============ إدارة اللغة ============
function applyLanguage(lang) {
  if (!VALID_LANGS.includes(lang)) lang = 'ar';
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const txt = translations[lang]?.[key];
    if (txt !== undefined) el.textContent = txt;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const txt = translations[lang]?.[key];
    if (txt !== undefined) el.placeholder = txt;
  });

  // إعادة رسم المنتجات فقط إن كانت محمّلة
  if (productsCache && productsCache.length > 0) {
    renderProducts();
  }
  updateSettingsLangUI();
}

function toggleLanguage() {
  applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
}

function updateSettingsLangUI() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

// ============ إدارة السمة ============
function applyTheme(theme) {
  if (!VALID_THEMES.includes(theme)) theme = 'dark';
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const colors = { dark: '#0f0f1a', light: '#f5f5f0', blue: '#0a1f3d', green: '#0d1f15' };
    meta.setAttribute('content', colors[theme] || '#0f0f1a');
  }
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === currentTheme);
  });
}

// ============ تحميل المنتجات ============
// استراتيجية: cache محلي 5 دقائق، ثم fetch من Supabase.
// fallback: تحميل من data/products.json (للزوار الأوائل قبل إعداد Supabase).

function getCachedProducts() {
  if (productsCache && (Date.now() - productsCacheTime) < PRODUCTS_CACHE_TTL_MS) {
    return productsCache;
  }
  return null;
}

async function loadProducts(forceRefresh = false) {
  // 1) استخدم الكاش إن كان صالحاً
  if (!forceRefresh) {
    const cached = getCachedProducts();
    if (cached) { productsCache = cached; renderProducts(); return cached; }
  }

  showLoading();

  // 2) حمّل من Supabase إن كان مُعداً
  if (SUPABASE_CONFIGURED && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: false })
        .order('id', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        productsCache = data.map(mapSupabaseProduct);
        productsCacheTime = Date.now();
        cacheProductsLocally(productsCache);
        renderProducts();
        return productsCache;
      }
    } catch (err) {
      console.error('Supabase load error:', err);
      // نكمل للـ fallback
    }
  }

  // 3) fallback: تحميل من data/products.json المحلي
  try {
    const response = await fetch('data/products.json');
    if (response.ok) {
      const fresh = await response.json();
      productsCache = fresh;
      productsCacheTime = Date.now();
      renderProducts();
      return fresh;
    }
  } catch (err) {
    console.error('Local JSON load error:', err);
  }

  // 4) fallback أخير: الكاش المحلي القديم
  const localCache = getLocalCache();
  if (localCache) {
    productsCache = localCache;
    renderProducts();
    return localCache;
  }

  // 5) لا شيء متاح
  productsCache = [];
  renderProducts();
  showToast(t('error_loading'), true);
  return [];
}

function mapSupabaseProduct(p) {
  // تحويل من schema قاعدة البيانات إلى الـ shape الذي يتوقعه الكود
  return {
    id: p.id,
    name: p.name,
    nameEn: p.name_en,
    desc: p.description,
    descEn: p.description_en,
    price: p.price,                       // قد يكون null
    image: p.image_url,
    category: p.category,
    family: p.family || null,
    colorKey: p.color_key || null,
    colorHex: p.color_hex || null,
    colorName: p.color_name || null,
    colorNameEn: p.color_name_en || null,
    catGroup: p.cat_group || null,
    sortOrder: p.sort_order,
    updatedAt: p.updated_at
  };
}

function cacheProductsLocally(products) {
  try {
    // إزالة أي base64 ضخم قبل التخزين (الصور الآن URLs)
    const stripped = products.map(p => {
      const copy = { ...p };
      // لا تخزّن base64
      if (copy.image && copy.image.startsWith('data:')) {
        delete copy.image;
      }
      return copy;
    });
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({
      time: Date.now(),
      products: stripped
    }));
  } catch (e) {
    console.warn('Could not cache products locally:', e);
    if (e.name === 'QuotaExceededError') {
      localStorage.removeItem(PRODUCTS_CACHE_KEY);
    }
  }
}

function getLocalCache() {
  try {
    const raw = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.products) return null;
    return parsed.products;
  } catch (e) {
    return null;
  }
}

function getProducts() {
  return productsCache || [];
}

// ============ عرض المنتجات ============
function renderProducts() {
  const products = getProducts();
  const storeProducts = products.filter(p => p.category === 'store');
  const orderProducts = products.filter(p => p.category === 'orders');

  // فرز حسب الوضع المختار
  const sortedStore = sortStoreProducts(storeProducts);
  renderProductGrid('products-grid', sortedStore, 'store');
  renderOrdersGrid(orderProducts);

  // تحديث عداد الإعدادات
  const countEl = document.getElementById('products-count-value');
  if (countEl) countEl.textContent = String(products.length);

  const lastSyncEl = document.getElementById('last-sync-value');
  if (lastSyncEl) {
    lastSyncEl.textContent = productsCacheTime ? new Date(productsCacheTime).toLocaleString('ar-EG') : '-';
  }
}

function sortStoreProducts(products) {
  const sorted = [...products];
  switch (currentSortMode) {
    case 'price-asc':
      return sorted.sort((a, b) => {
        const pa = a.price ?? Infinity;
        const pb = b.price ?? Infinity;
        return pa - pb;
      });
    case 'price-desc':
      return sorted.sort((a, b) => {
        const pa = a.price ?? -Infinity;
        const pb = b.price ?? -Infinity;
        return pb - pa;
      });
    default:
      return sorted.sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0) || a.id - b.id);
  }
}

function renderProductGrid(containerId, products, sectionType) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const lang = currentLang;

  if (!products || products.length === 0) {
    const msg = sectionType === 'store' ? t('no_store_products') : t('no_order_products');
    container.innerHTML = `<div class="empty-state" role="status">${escapeHtml(msg)}</div>`;
    return;
  }

  const html = products.map(product => {
    const name = lang === 'en' && product.nameEn ? product.nameEn : product.name;
    const desc = lang === 'en' && product.descEn ? product.descEn : product.desc;
    const priceText = formatPrice(product.price, lang);
    const img = product.image || 'images/placeholder.png';

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image-container">
          <img src="${escapeHtml(img)}" alt="${escapeAttr(name)}" loading="lazy" width="340" height="280"
               onerror="this.src='images/placeholder.png'">
        </div>
        <div class="product-info">
          <h3 class="product-name">${escapeHtml(name)}</h3>
          <p class="product-desc">${escapeHtml(desc)}</p>
          <div class="product-footer">
            <span class="product-price">${escapeHtml(priceText)}</span>
            <a href="${WHATSAPP_LINK}?text=${encodeURIComponent('استفسار عن: ' + name)}"
               target="_blank" rel="noopener noreferrer"
               class="contact-btn whatsapp-btn" aria-label="تواصل عبر واتساب عن ${escapeAttr(name)}">
              💬 ${lang === 'ar' ? 'استفسار' : 'Inquire'}
            </a>
          </div>
        </div>
      </article>`;
  }).join('');

  container.innerHTML = html;
}

function renderOrdersGrid(orderProductsOverride) {
  const products = orderProductsOverride || getProducts().filter(p => p.category === 'orders');
  const container = document.getElementById('orders-grid');
  if (!container) return;
  const lang = currentLang;

  // تجميع حسب family
  const families = {};
  products.forEach(p => {
    const family = p.family || `solo-${p.id}`;
    if (!families[family]) families[family] = [];
    families[family].push(p);
  });

  // فلترة حسب البحث والفئة
  let filteredFamilies = Object.entries(families);
  if (activeOrdersFilter !== 'all') {
    filteredFamilies = filteredFamilies.filter(([family, variants]) => {
      return variants.some(v => v.catGroup === activeOrdersFilter);
    });
  }
  if (ordersSearchQuery) {
    const q = ordersSearchQuery.toLowerCase();
    filteredFamilies = filteredFamilies.filter(([family, variants]) => {
      const familyName = FAMILY_NAMES[lang]?.[family] || family;
      if (familyName.toLowerCase().includes(q)) return true;
      return variants.some(v => {
        const name = lang === 'en' && v.nameEn ? v.nameEn : v.name;
        const desc = lang === 'en' && v.descEn ? v.descEn : v.desc;
        const colorName = lang === 'en' && v.colorNameEn ? v.colorNameEn : (v.colorName || '');
        return (name || '').toLowerCase().includes(q) ||
               (desc || '').toLowerCase().includes(q) ||
               (colorName || '').toLowerCase().includes(q);
      });
    });
  }

  // تحديث الإحصائيات
  const statsTotal = document.querySelector('#stat-total .stat-num');
  const statsVariants = document.querySelector('#stat-variants .stat-num');
  if (statsTotal) statsTotal.textContent = String(filteredFamilies.length);
  if (statsVariants) {
    const totalVariants = filteredFamilies.reduce((sum, [, v]) => sum + v.length, 0);
    statsVariants.textContent = String(totalVariants);
  }

  if (filteredFamilies.length === 0) {
    container.innerHTML = `<div class="empty-state" role="status">${escapeHtml(lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results')}</div>`;
    return;
  }

  const html = filteredFamilies.map(([family, variants]) => {
    const activeVariant = variants.find(v => v.id === activeVariants[family]) || variants[0];
    if (activeVariants[family] === undefined) activeVariants[family] = activeVariant.id;

    const familyName = FAMILY_NAMES[lang]?.[family] ||
                       (lang === 'en' && activeVariant.nameEn ? activeVariant.nameEn : activeVariant.name);
    const familyDesc = lang === 'en' && activeVariant.descEn ? activeVariant.descEn : activeVariant.desc;
    const isPopular = POPULAR_FAMILIES.includes(family);

    const variantSelector = variants.map(v => {
      const isActive = v.id === activeVariant.id;
      const cName = lang === 'en' && v.colorNameEn ? v.colorNameEn : (v.colorName || '');
      const cHex = v.colorHex || '#888';
      return `<button type="button" class="variant-item ${isActive ? 'active' : ''}"
                data-variant-id="${v.id}" data-family="${escapeAttr(family)}"
                aria-label="${escapeAttr(cName)}"
                aria-pressed="${isActive}"
                style="border-color: ${escapeAttr(cHex)}">
                <span class="variant-color-dot" style="background:${escapeAttr(cHex)}"></span>
                <span>${escapeHtml(cName)}</span>
              </button>`;
    }).join('');

    const img = activeVariant.image || 'images/placeholder.png';
    const priceText = formatPrice(activeVariant.price, lang);

    return `
      <article class="family-card ${isPopular ? 'popular' : ''}" data-family="${escapeAttr(family)}">
        ${isPopular ? '<span class="family-badge">★ ' + (lang === 'ar' ? 'الأكثر طلباً' : 'Popular') + '</span>' : ''}
        <div class="family-image-container">
          <img src="${escapeHtml(img)}" alt="${escapeAttr(familyName)}" loading="lazy" width="340" height="280"
               onerror="this.src='images/placeholder.png'">
        </div>
        <div class="family-info">
          <h3 class="family-name">${escapeHtml(familyName)}</h3>
          <p class="family-desc">${escapeHtml(familyDesc)}</p>
          <div class="variant-selector" role="group" aria-label="${escapeAttr(lang === 'ar' ? 'اختر اللون' : 'Choose color')}">
            ${variantSelector}
          </div>
          <div class="family-footer">
            <span class="family-price">${escapeHtml(priceText)}</span>
            <button type="button" class="order-btn btn-primary"
                    data-family="${escapeAttr(family)}" data-variant-id="${activeVariant.id}">
              ${lang === 'ar' ? 'اطلب الآن' : 'Order Now'}
            </button>
          </div>
        </div>
      </article>`;
  }).join('');

  container.innerHTML = html;

  // ربط أحداث variant-items
  container.querySelectorAll('.variant-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const family = btn.dataset.family;
      const variantId = parseInt(btn.dataset.variantId, 10);
      activeVariants[family] = variantId;
      renderOrdersGrid();
    });
  });
  container.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const family = btn.dataset.family;
      const variantId = parseInt(btn.dataset.variantId, 10);
      openOrderModal(family, variantId);
    });
  });
}

// ============ المصادقة عبر Supabase ============
async function adminLogin(email, password) {
  if (!supabase) {
    showToast(t('login_error') + ' (Supabase غير مُعد)', true);
    return false;
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    isAdmin = true;
    showAdminPanel();
    showToast(currentLang === 'ar' ? 'مرحباً بك' : 'Welcome');
    return true;
  } catch (err) {
    console.error('Login error:', err);
    showToast(t('login_error'), true);
    return false;
  }
}

async function adminLogout() {
  if (supabase) {
    try { await supabase.auth.signOut(); } catch (e) {}
  }
  isAdmin = false;
  hideAdminPanel();
}

async function checkExistingSession() {
  if (!supabase) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      isAdmin = true;
      showAdminPanel();
    }
    // الاستماع لتغييرات الجلسة
    supabase.auth.onAuthStateChange((event, sess) => {
      if (event === 'SIGNED_IN' && sess) {
        isAdmin = true;
        showAdminPanel();
      } else if (event === 'SIGNED_OUT') {
        isAdmin = false;
        hideAdminPanel();
      }
    });
  } catch (e) {
    console.error('Session check error:', e);
  }
}

function showAdminPanel() {
  document.getElementById('login-form')?.classList.add('hidden');
  document.getElementById('admin-panel')?.classList.remove('hidden');
  renderAdminProductsList();
  updateSupabaseStatusUI();
}

function hideAdminPanel() {
  document.getElementById('login-form')?.classList.remove('hidden');
  document.getElementById('admin-panel')?.classList.add('hidden');
}

function updateSupabaseStatusUI() {
  const card = document.getElementById('github-status-card');
  const icon = document.getElementById('github-status-icon');
  const title = document.getElementById('github-status-title');
  const desc = document.getElementById('github-status-desc');
  const modeValue = document.getElementById('storage-mode-value');

  if (!card) return;
  if (SUPABASE_CONFIGURED && isAdmin) {
    if (icon) icon.textContent = '✅';
    if (title) title.textContent = t('supabase_status_title');
    if (desc) desc.textContent = t('supabase_connected');
    if (modeValue) { modeValue.textContent = 'Supabase'; modeValue.className = 'storage-badge active'; }
    card.classList.remove('warning'); card.classList.add('success');
  } else if (SUPABASE_CONFIGURED) {
    if (icon) icon.textContent = '⚠️';
    if (title) title.textContent = t('supabase_status_title');
    if (desc) desc.textContent = t('supabase_configured_not_logged');
    if (modeValue) { modeValue.textContent = 'Supabase'; modeValue.className = 'storage-badge'; }
    card.classList.add('warning'); card.classList.remove('success');
  } else {
    if (icon) icon.textContent = '❌';
    if (title) title.textContent = t('supabase_status_title');
    if (desc) desc.textContent = t('supabase_not_configured');
    if (modeValue) { modeValue.textContent = currentLang === 'ar' ? 'محلي' : 'Local'; modeValue.className = 'storage-badge'; }
    card.classList.add('warning'); card.classList.remove('success');
  }
}

// ============ لوحة المسؤول - إدارة المنتجات ============
function renderAdminProductsList() {
  const list = document.getElementById('admin-products-list');
  if (!list) return;
  const products = getProducts();
  const lang = currentLang;

  if (products.length === 0) {
    list.innerHTML = `<p class="empty-state">${escapeHtml(t('no_products_yet'))}</p>`;
    return;
  }

  const html = products.map(p => {
    const name = lang === 'en' && p.nameEn ? p.nameEn : p.name;
    const priceText = formatPrice(p.price, lang);
    const catLabel = p.category === 'store' ? t('cat_store') : t('cat_orders');
    return `
      <div class="admin-product-card">
        <img src="${escapeHtml(p.image || 'images/placeholder.png')}" alt="${escapeAttr(name)}" loading="lazy" width="80" height="80">
        <div class="admin-product-info">
          <h4>${escapeHtml(name)}</h4>
          <p class="admin-product-cat">${escapeHtml(catLabel)} • ${escapeHtml(priceText)}</p>
        </div>
        <div class="admin-product-actions">
          <button type="button" class="btn-secondary btn-sm" data-edit-id="${p.id}">${escapeHtml(t('edit_btn'))}</button>
          <button type="button" class="btn-danger btn-sm" data-delete-id="${p.id}">${escapeHtml(t('delete_btn'))}</button>
        </div>
      </div>`;
  }).join('');
  list.innerHTML = html;

  list.querySelectorAll('[data-edit-id]').forEach(b => {
    b.addEventListener('click', () => openEditModal(parseInt(b.dataset.editId, 10)));
  });
  list.querySelectorAll('[data-delete-id]').forEach(b => {
    b.addEventListener('click', () => deleteProduct(parseInt(b.dataset.deleteId, 10)));
  });
}

async function deleteProduct(id) {
  if (!confirm(t('delete_confirm'))) return;
  if (!supabase || !isAdmin) {
    showToast(t('login_error'), true);
    return;
  }
  try {
    // حذف الصورة من Storage إن كانت على Supabase
    const product = getProducts().find(p => p.id === id);
    if (product?.image?.includes('product-images/')) {
      const path = product.image.split('product-images/')[1];
      if (path) {
        try {
          await supabase.storage.from('product-images').remove([path]);
        } catch (e) { /* ignore */ }
      }
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;

    showToast(t('deleted_success'));
    await loadProducts(true);
    renderAdminProductsList();
  } catch (err) {
    console.error('Delete error:', err);
    showToast(err.message || 'Error', true);
  }
}

// ============ فتح modal التعديل ============
function openEditModal(id) {
  const product = getProducts().find(p => p.id === id);
  if (!product) return;

  document.getElementById('edit-product-id').value = product.id;
  document.getElementById('edit-product-name').value = product.name || '';
  document.getElementById('edit-product-desc').value = product.desc || '';
  document.getElementById('edit-product-price').value = product.price ?? '';
  document.getElementById('edit-product-category').value = product.category || 'store';
  document.getElementById('edit-image-filename').textContent = product.image || '';
  document.getElementById('edit-image-preview').src = product.image || '';
  document.getElementById('edit-image-preview-container').classList.remove('hidden');
  editingImageData = null;

  document.getElementById('edit-modal').classList.remove('hidden');
  document.getElementById('edit-modal').setAttribute('aria-hidden', 'false');
  // نقل التركيز
  setTimeout(() => document.getElementById('edit-product-name')?.focus(), 50);
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  document.getElementById('edit-modal').setAttribute('aria-hidden', 'true');
}

async function saveNewProduct() {
  const name = document.getElementById('new-product-name').value.trim();
  const desc = document.getElementById('new-product-desc').value.trim();
  const priceInput = document.getElementById('new-product-price').value.trim();
  const category = document.getElementById('new-product-category').value;
  const fileInput = document.getElementById('new-product-image');

  // التحقق من الحقول المطلوبة (price فارغ مسموح لمنتجات orders)
  const isOrders = category === 'orders';
  if (!name || !desc || (!isOrders && !priceInput)) {
    showToast(t('fill_fields'), true);
    return;
  }

  let price = null;
  if (priceInput) {
    price = parseInt(priceInput, 10);
    if (isNaN(price) || price < 0) {
      showToast(t('fill_fields'), true);
      return;
    }
  }

  if (!supabase || !isAdmin) {
    showToast(t('login_error'), true);
    return;
  }

  // رفع الصورة إن وجدت
  let imageUrl = '';
  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    if (!file.type.startsWith('image/')) {
      showToast(t('image_invalid_type'), true);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      showToast(t('image_too_large'), true);
      return;
    }
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { data: upData, error: upErr } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(fileName);
      imageUrl = pub.publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      showToast(err.message || 'Upload error', true);
      return;
    }
  }

  try {
    const { error } = await supabase.from('products').insert({
      name,
      name_en: name, // افتراضي = الاسم العربي (يمكن تعديله لاحقاً)
      description: desc,
      description_en: desc,
      price,
      image_url: imageUrl || 'images/placeholder.png',
      category,
      sort_order: 0
    });
    if (error) throw error;

    showToast(t('saved_success'));
    resetAddProductForm();
    await loadProducts(true);
    renderAdminProductsList();
    // التبديل لتبويب الإدارة
    document.querySelector('[data-tab="manage-products"]')?.click();
  } catch (err) {
    console.error('Save error:', err);
    showToast(err.message || 'Error', true);
  }
}

async function updateProduct() {
  const id = parseInt(document.getElementById('edit-product-id').value, 10);
  const name = document.getElementById('edit-product-name').value.trim();
  const desc = document.getElementById('edit-product-desc').value.trim();
  const priceInput = document.getElementById('edit-product-price').value.trim();
  const category = document.getElementById('edit-product-category').value;
  const fileInput = document.getElementById('edit-product-image');

  const isOrders = category === 'orders';
  if (!name || !desc || (!isOrders && !priceInput)) {
    showToast(t('fill_fields'), true);
    return;
  }

  let price = null;
  if (priceInput) {
    price = parseInt(priceInput, 10);
    if (isNaN(price) || price < 0) {
      showToast(t('fill_fields'), true);
      return;
    }
  }

  if (!supabase || !isAdmin) {
    showToast(t('login_error'), true);
    return;
  }

  const updates = {
    name,
    name_en: name,
    description: desc,
    description_en: desc,
    price,
    category
  };

  // رفع صورة جديدة إن اختيرت
  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    if (!file.type.startsWith('image/')) {
      showToast(t('image_invalid_type'), true);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      showToast(t('image_too_large'), true);
      return;
    }
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(fileName);
      updates.image_url = pub.publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      showToast(err.message || 'Upload error', true);
      return;
    }
  }

  try {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;

    showToast(t('updated_success'));
    closeEditModal();
    await loadProducts(true);
    renderAdminProductsList();
  } catch (err) {
    console.error('Update error:', err);
    showToast(err.message || 'Error', true);
  }
}

function resetAddProductForm() {
  document.getElementById('new-product-name').value = '';
  document.getElementById('new-product-desc').value = '';
  document.getElementById('new-product-price').value = '';
  document.getElementById('new-product-category').value = 'store';
  document.getElementById('new-product-image').value = '';
  document.getElementById('image-filename').textContent = t('no_image_selected');
  document.getElementById('image-preview-container').classList.add('hidden');
  document.getElementById('image-preview').src = '';
}

// ============ معاينة الصور قبل الرفع ============
function setupImagePreview() {
  const newInput = document.getElementById('new-product-image');
  const editInput = document.getElementById('edit-product-image');

  if (newInput) {
    newInput.addEventListener('change', (e) => previewImage(e.target, 'image-preview', 'image-filename', 'image-preview-container'));
  }
  if (editInput) {
    editInput.addEventListener('change', (e) => previewImage(e.target, 'edit-image-preview', 'edit-image-filename', 'edit-image-preview-container'));
  }
}

function previewImage(input, previewId, filenameId, containerId) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast(t('image_invalid_type'), true);
    input.value = '';
    return;
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    showToast(t('image_too_large'), true);
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById(previewId).src = ev.target.result;
    document.getElementById(filenameId).textContent = file.name;
    document.getElementById(containerId).classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

// ============ Modal الطلب ============
let currentOrderState = { family: null, variantId: null, step: 1 };

function openOrderModal(family, variantId) {
  const product = getProducts().find(p => p.id === variantId);
  if (!product) return;
  currentOrderState = { family, variantId, step: 1 };
  const lang = currentLang;
  const name = lang === 'en' && product.nameEn ? product.nameEn : product.name;

  document.getElementById('order-model-img').src = product.image || 'images/placeholder.png';
  document.getElementById('order-model-img').alt = name;
  document.getElementById('order-model-name').textContent = name;

  // إعادة تعيين الحقول
  document.getElementById('order-width').value = '2';
  document.getElementById('order-height').value = '2.5';
  document.getElementById('order-notes').value = '';
  document.getElementById('order-finish').value = 'matte';

  // بناء خيارات الألوان بناءً على variants الـ family
  const variants = getProducts().filter(p => p.family === family && p.category === 'orders');
  const colorOptions = document.getElementById('order-color-options');
  if (variants.length > 0) {
    colorOptions.innerHTML = variants.map(v => {
      const cName = lang === 'en' && v.colorNameEn ? v.colorNameEn : (v.colorName || '');
      const cHex = v.colorHex || '#888';
      const isActive = v.id === variantId;
      return `<button type="button" class="order-color-option ${isActive ? 'active' : ''}"
                data-variant-id="${v.id}" style="border-color: ${escapeAttr(cHex)}"
                aria-pressed="${isActive}" aria-label="${escapeAttr(cName)}">
                <span class="order-color-dot" style="background:${escapeAttr(cHex)}"></span>
                <span>${escapeHtml(cName)}</span>
              </button>`;
    }).join('');
    colorOptions.querySelectorAll('.order-color-option').forEach(b => {
      b.addEventListener('click', () => {
        const newId = parseInt(b.dataset.variantId, 10);
        currentOrderState.variantId = newId;
        const v = variants.find(x => x.id === newId);
        if (v) {
          document.getElementById('order-model-img').src = v.image || '';
          document.getElementById('order-model-name').textContent = lang === 'en' && v.nameEn ? v.nameEn : v.name;
        }
        colorOptions.querySelectorAll('.order-color-option').forEach(x => {
          x.classList.toggle('active', x === b);
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        generateOrderSummary();
      });
    });
  } else {
    colorOptions.innerHTML = `<p>${escapeHtml(lang === 'ar' ? 'لا توجد ألوان متعددة متاحة' : 'No color options')}</p>`;
  }

  // إظهار step 1
  showOrderStep(1);
  document.getElementById('order-modal').classList.remove('hidden');
  document.getElementById('order-modal').setAttribute('aria-hidden', 'false');
  setTimeout(() => document.getElementById('order-next-btn')?.focus(), 50);
}

function closeOrderModal() {
  document.getElementById('order-modal').classList.add('hidden');
  document.getElementById('order-modal').setAttribute('aria-hidden', 'true');
}

function showOrderStep(step) {
  currentOrderState.step = step;
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`order-step-${i}`);
    if (el) el.classList.toggle('active', i === step);
  }
  document.querySelectorAll('.order-progress-step').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.step, 10) === step);
  });
  // أزرار التنقل
  document.getElementById('order-prev-btn').classList.toggle('hidden', step === 1);
  document.getElementById('order-next-btn').classList.toggle('hidden', step === 4);
  document.getElementById('order-whatsapp-btn').classList.toggle('hidden', step !== 4);
  if (step === 4) generateOrderSummary();
}

function generateOrderSummary() {
  const lang = currentLang;
  const product = getProducts().find(p => p.id === currentOrderState.variantId);
  if (!product) return;
  const name = lang === 'en' && product.nameEn ? product.nameEn : product.name;
  const width = parseFloat(document.getElementById('order-width').value) || 0;
  const height = parseFloat(document.getElementById('order-height').value) || 0;
  const notes = document.getElementById('order-notes').value.trim();
  const finishSel = document.getElementById('order-finish');
  const finishText = finishSel?.options[finishSel.selectedIndex]?.text || '';
  const colorName = lang === 'en' && product.colorNameEn ? product.colorNameEn : (product.colorName || '');

  const summary = document.getElementById('order-summary');
  summary.innerHTML = `
    <div class="summary-row"><span>${escapeHtml(t('order_summary_model'))}:</span> <strong>${escapeHtml(name)}</strong></div>
    <div class="summary-row"><span>${escapeHtml(t('order_summary_dimensions'))}:</span> <strong>${width} × ${height} ${lang === 'ar' ? 'متر' : 'm'}</strong></div>
    <div class="summary-row"><span>${escapeHtml(t('order_summary_color'))}:</span> <strong>${escapeHtml(colorName)}</strong></div>
    <div class="summary-row"><span>${escapeHtml(t('order_summary_finish'))}:</span> <strong>${escapeHtml(finishText)}</strong></div>
    <div class="summary-row"><span>${escapeHtml(t('order_summary_notes'))}:</span> <strong>${notes ? escapeHtml(notes) : escapeHtml(t('order_no_notes'))}</strong></div>
  `;

  // بناء رابط واتساب
  const msg = lang === 'ar'
    ? `🛠️ طلب جديد من ورشة عبادة:\n\n` +
      `📦 الموديل: ${name}\n` +
      `📐 المقاسات: ${width} × ${height} متر\n` +
      `🎨 اللون: ${colorName}\n` +
      `✨ التشطيب: ${finishText}\n` +
      (notes ? `📝 ملاحظات: ${notes}\n` : '') +
      `\nأرجو الرد بتأكيد الطلب والسعر النهائي.`
    : `🛠️ New Order from Obada Workshop:\n\n` +
      `📦 Model: ${name}\n` +
      `📐 Dimensions: ${width} × ${height} m\n` +
      `🎨 Color: ${colorName}\n` +
      `✨ Finish: ${finishText}\n` +
      (notes ? `📝 Notes: ${notes}\n` : '') +
      `\nPlease confirm and provide final price.`;
  const waLink = `${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`;
  document.getElementById('order-whatsapp-btn').href = waLink;
}

// ============ Coffee Modal ============
function openCoffeeModal() {
  document.getElementById('coffee-modal').classList.remove('hidden');
  document.getElementById('coffee-modal').setAttribute('aria-hidden', 'false');
  setTimeout(() => document.getElementById('copy-wallet-number')?.focus(), 50);
}

function closeCoffeeModal() {
  document.getElementById('coffee-modal').classList.add('hidden');
  document.getElementById('coffee-modal').setAttribute('aria-hidden', 'true');
}

async function copyWalletNumber() {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(WALLET_NUMBER);
    } else {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = WALLET_NUMBER;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast(t('copied'));
  } catch (e) {
    showToast(t('copied'), false);
  }
}

// ============ FAQ Toggle ============
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  if (!item) return;
  const isOpen = item.classList.toggle('open');
  btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// ============ التنقل ============
function setupNavigation() {
  // دعم أزرار الـ nav القديمة والـ sidebar الجديد
  const navBtns = document.querySelectorAll('.nav-btn, .sidebar-nav-btn');

  const handleNavClick = (btn) => {
    const section = btn.dataset.section;
    if (!section) return;
    // إزالة active من جميع أزرار الـ nav (القديمة والجديدة)
    document.querySelectorAll('.nav-btn, .sidebar-nav-btn').forEach(b => b.classList.remove('active'));
    // إضافة active لكل زر يحمل نفس data-section (في القائمتين إن وُجدتا)
    document.querySelectorAll(`.nav-btn[data-section="${section}"], .sidebar-nav-btn[data-section="${section}"]`).forEach(b => b.classList.add('active'));
    // إظهار القسم
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(section);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // إغلاق الـ sidebar على الموبايل بعد الاختيار
    closeSidebar();
  };

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => handleNavClick(btn));
  });

  // إعداد الـ sidebar للجوال
  setupSidebar();
}

// ============ إدارة الـ Sidebar على الموبايل ============
function setupSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const toggle = document.getElementById('sidebar-toggle');
  const overlay = document.getElementById('sidebar-overlay');
  const closeBtn = document.getElementById('sidebar-close');

  if (!sidebar || !toggle || !overlay) return;

  // إضافة has-sidebar للـ body على الشاشات الكبيرة
  const mq = window.matchMedia('(min-width: 1024px)');
  const updateBodyClass = () => {
    if (mq.matches) {
      document.body.classList.add('has-sidebar');
    } else {
      document.body.classList.remove('has-sidebar');
    }
  };
  updateBodyClass();
  mq.addEventListener('change', updateBodyClass);

  // فتح الـ sidebar
  toggle.addEventListener('click', () => openSidebar());

  // إغلاق عبر overlay
  overlay.addEventListener('click', () => closeSidebar());

  // إغلاق عبر زر X
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeSidebar());
  }

  // إغلاق عبر Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });
}

function openSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggle = document.getElementById('sidebar-toggle');
  if (!sidebar || !overlay) return;
  sidebar.classList.add('open');
  overlay.classList.add('visible');
  overlay.setAttribute('aria-hidden', 'false');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'إغلاق القائمة');
  }
  // Focus trap: نقل التركيز لأول زر في الـ sidebar
  setTimeout(() => {
    const firstBtn = sidebar.querySelector('.sidebar-nav-btn, .sidebar-close');
    if (firstBtn) firstBtn.focus();
  }, 300);
}

function closeSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggle = document.getElementById('sidebar-toggle');
  if (!sidebar || !overlay) return;
  // لا تُغلق على الشاشات الكبيرة
  if (window.matchMedia('(min-width: 1024px)').matches) return;
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
  overlay.setAttribute('aria-hidden', 'true');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'فتح القائمة');
  }
}

function navigateTo(section) {
  const btn = document.querySelector(`.sidebar-nav-btn[data-section="${section}"], .nav-btn[data-section="${section}"]`);
  if (btn) btn.click();
  return false;
}
window.navigateTo = navigateTo;
window.toggleFaq = toggleFaq;

// ============ بحث الطلبات ============
function setupOrdersSearch() {
  const searchInput = document.getElementById('orders-search-input');
  if (searchInput) {
    let timer = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        ordersSearchQuery = e.target.value.trim().toLowerCase();
        renderOrdersGrid();
      }, 200);
    });
  }
}

// ============ فلترة الفئات ============
function setupCategoryFilters() {
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeOrdersFilter = tab.dataset.cat || 'all';
      renderOrdersGrid();
    });
  });
}

// ============ الفرز ============
function setupSortButtons() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSortMode = btn.dataset.sort || 'default';
      renderProducts();
    });
  });
}

// ============ Back to top ============
function setupBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============ Floating WhatsApp ============
function setupFloatingWhatsApp() {
  const btn = document.getElementById('floating-whatsapp');
  if (!btn) return;
  // تأكد من وجود rel="noopener"
  btn.setAttribute('rel', 'noopener noreferrer');
}

// ============ حاسبة التكلفة ============
function setupEstimator() {
  const btn = document.getElementById('est-calculate-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const type = document.getElementById('est-type').value;
    const width = Math.max(0.1, Math.min(10, parseFloat(document.getElementById('est-width').value) || 0));
    const height = Math.max(0.1, Math.min(6, parseFloat(document.getElementById('est-height').value) || 0));
    // إعادة clamp القيمة في الحقل نفسه (تَوَافُق مع HTML)
    document.getElementById('est-width').value = width;
    document.getElementById('est-height').value = height;

    // أسعار تقريبية لكل م² حسب النوع
    const pricesPerSqm = {
      gate: 35000, door: 30000, railing: 12000, balcony: 18000,
      window: 10000, stairs: 80000, bed: 25000
    };
    const pricePerSqm = pricesPerSqm[type] || 15000;
    const area = width * height;
    const total = Math.round(area * pricePerSqm);

    const valueEl = document.getElementById('est-result-value');
    if (valueEl) {
      valueEl.textContent = total.toLocaleString('en-US');
      valueEl.classList.add('updated');
      setTimeout(() => valueEl.classList.remove('updated'), 500);
    }
  });
}

// ============ إعدادات الإعدادات (Settings) ============
function setupSettings() {
  // أزرار اللغة
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  });
  // أزرار السمة
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });
  // زر التحديث من السحابة
  const refreshBtn = document.getElementById('refresh-cloud-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      await loadProducts(true);
      renderAdminProductsList();
      refreshBtn.disabled = false;
      showToast(currentLang === 'ar' ? 'تم التحديث' : 'Refreshed');
    });
  }
}

// ============ أزرار قسم الترويج ============
function setupPromoActions() {
  // زر نسخ رقم الهاتف
  const copyPhoneBtn = document.getElementById('promo-copy-phone');
  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('0115192500');
        showToast(currentLang === 'ar' ? 'تم نسخ الرقم' : 'Phone copied');
      } catch (e) {
        showToast(currentLang === 'ar' ? 'تعذّر النسخ' : 'Copy failed', true);
      }
    });
  }

  // نص الترويج لفيسبوك - توليد ديناميكي حسب اللغة
  const fbText = document.getElementById('promo-fb-text');
  if (fbText) {
    const generateFbText = () => {
      if (currentLang === 'ar') {
        return `🔥 هل تبحث عن حداد محترف في الخرطوم؟

ورشة عبادة عبد الحفيظ للحدادة - تصنيع جميع الأعمال الحديدية:
✅ أبواب حديد (خارجية وداخلية)
✅ أسرّة حديد بتصاميم كلاسيكية وعصرية
✅ بوابات وشرفات ودرابزين
✅ سلالم حلزونية ومستقيمة
✅ مظلات وشقق حديد
✅ تفصيل حسب الطلب مع ضمان الجودة

📍 الموقع: الخناق - الخرطوم
📞 للتواصل: 0115192500
💬 واتساب: https://wa.me/249115192500

نوفر خدمة التوصيل والتركيب داخل الخرطوم. جودة عالية وأسعار منافسة.تفصيل حسب رغبتك مع إمكانية اختيار الألوان والتشطيبات.

#ورشة_حدادة #الخرطوم #حدادة_السودان #أبواب_حديد #أسرّة #بوابات`;
      } else {
        return `🔥 Looking for a professional blacksmith in Khartoum?

Obada Abdul Hafeez Iron Workshop - Manufacturing all iron works:
✅ Iron doors (exterior and interior)
✅ Iron beds with classic and modern designs
✅ Gates, balconies, and railings
✅ Spiral and straight staircases
✅ Canopies and iron structures
✅ Custom fabrication with quality guarantee

📍 Location: Al-Khunaq - Khartoum
📞 Contact: 0115192500
💬 WhatsApp: https://wa.me/249115192500

We offer delivery and installation within Khartoum. High quality and competitive prices.

#ironworkshop #khartoum #sudan_blacksmith #iron_doors #beds #gates`;
      }
    };
    fbText.textContent = generateFbText();
    // تحديث النص عند تغيير اللغة
    const originalApplyLanguage = applyLanguage;
    window.applyLanguage = function(lang) {
      originalApplyLanguage(lang);
      const el = document.getElementById('promo-fb-text');
      if (el) el.textContent = generateFbText();
    };
  }

  // زر نسخ نص فيسبوك
  const copyFbBtn = document.getElementById('promo-copy-fb');
  if (copyFbBtn) {
    copyFbBtn.addEventListener('click', async () => {
      const text = document.getElementById('promo-fb-text')?.textContent || '';
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast(currentLang === 'ar' ? 'تم نسخ النص' : 'Text copied');
      } catch (e) {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast(currentLang === 'ar' ? 'تم نسخ النص' : 'Text copied'); }
        catch (e2) { showToast(currentLang === 'ar' ? 'تعذّر النسخ' : 'Copy failed', true); }
        document.body.removeChild(ta);
      }
    });
  }
}

// ============ ربط أحداث المسؤول ============
function setupAdminEvents() {
  // تسجيل الدخول
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const email = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      if (!email || !password) {
        showToast(t('fill_fields'), true);
        return;
      }
      loginBtn.disabled = true;
      await adminLogin(email, password);
      loginBtn.disabled = false;
    });
    // السماح بالضغط Enter في حقل كلمة المرور
    const pwd = document.getElementById('login-password');
    if (pwd) {
      pwd.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginBtn.click();
      });
    }
  }

  // تسجيل الخروج
  document.getElementById('logout-btn')?.addEventListener('click', adminLogout);

  // تبويبات لوحة التحكم
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // حفظ منتج جديد
  document.getElementById('save-product-btn')?.addEventListener('click', saveNewProduct);
  // زر اختيار صورة
  document.getElementById('upload-image-btn')?.addEventListener('click', () => {
    document.getElementById('new-product-image').click();
  });
  // تحديث منتج
  document.getElementById('update-product-btn')?.addEventListener('click', updateProduct);
  document.getElementById('cancel-edit-btn')?.addEventListener('click', closeEditModal);
  document.getElementById('close-edit-modal')?.addEventListener('click', closeEditModal);
  document.getElementById('edit-upload-btn')?.addEventListener('click', () => {
    document.getElementById('edit-product-image').click();
  });

  // إغلاق modals بالضغط على الخلفية أو Escape
  ['edit-modal', 'order-modal', 'coffee-modal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }
  });
  document.getElementById('close-order-modal')?.addEventListener('click', closeOrderModal);
  document.getElementById('close-coffee-modal')?.addEventListener('click', closeCoffeeModal);
  document.getElementById('copy-wallet-number')?.addEventListener('click', copyWalletNumber);
  document.getElementById('coffee-btn')?.addEventListener('click', openCoffeeModal);

  // أزرار التنقل بين خطوات الطلب
  document.getElementById('order-next-btn')?.addEventListener('click', () => {
    if (currentOrderState.step < 4) showOrderStep(currentOrderState.step + 1);
  });
  document.getElementById('order-prev-btn')?.addEventListener('click', () => {
    if (currentOrderState.step > 1) showOrderStep(currentOrderState.step - 1);
  });

  // تحديث الـ summary عند تغيير أي حقل في الطلب
  ['order-width', 'order-height', 'order-notes', 'order-finish'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      if (currentOrderState.step === 4) generateOrderSummary();
    });
    document.getElementById(id)?.addEventListener('change', () => {
      if (currentOrderState.step === 4) generateOrderSummary();
    });
  });

  // إغلاق بـ Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal:not(.hidden)').forEach(m => m.classList.add('hidden'));
    }
  });
}

// ============ التهيئة ============
async function init() {
  // تطبيق اللغة والسمة فوراً
  applyLanguage(currentLang);
  applyTheme(currentTheme);

  // ربط الأحداث
  setupNavigation();
  setupOrdersSearch();
  setupCategoryFilters();
  setupSortButtons();
  setupBackToTop();
  setupFloatingWhatsApp();
  setupEstimator();
  setupSettings();
  setupAdminEvents();
  setupImagePreview();
  setupPromoActions();

  // فحص جلسة Supabase الحالية
  await checkExistingSession();

  // تحميل المنتجات
  await loadProducts();

  // تحديث حالة Supabase UI
  updateSupabaseStatusUI();
}

// ============ إقلاع ============
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
