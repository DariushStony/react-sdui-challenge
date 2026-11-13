import type { Messages } from '@dynamic-form/renderer';

// The demo's own text: the pages, the Playground and the developer-facing diagnostics. The form's own
// text (validation, buttons, file field) belongs to the renderer and comes from its messages.
const appMessages: Messages = {
  locale: 'fa-IR',
  catalog: {
    retry: 'تلاش مجدد',
    form_default_title: 'فرم',
    loading_form: 'در حال بارگذاری فرم…',
    load_error_title: 'بارگذاری فرم انجام نشد',
    load_error: 'دریافت فرم از سرور ممکن نشد. اتصال خود را بررسی کنید و دوباره تلاش کنید.',
    rejected_title: 'نمایش فرم ممکن نیست',
    rejected_invalid: 'اطلاعات فرمِ دریافتی معتبر نیست.',
    rejected_outdated:
      'این نسخه از برنامه قدیمی است و فرم جدید را نمی‌شناسد. صفحه را دوباره بارگذاری کنید.',
    rejected_unknown_required_kind:
      'فیلد الزامی «{field}» از نوعی است که این نسخه پشتیبانی نمی‌کند، پس فرم قابل ارسال نیست.',
    rejected_duplicate_name: 'فرم دو فیلد با نام «{field}» دارد و نمی‌توان آن را نمایش داد.',
    technical_details: 'جزئیات فنی',
    dry_run_title: 'درخواستی که ارسال می‌شد',
    dry_run_simulated_error: 'این خطا را شبیه‌ساز سرور ساخته است.',
    playground_title: 'آزمایشگاه فرم',
    playground_editor: 'ویرایشگر',
    playground_preset: 'نمونه',
    playground_json: 'JSON فرم',
    playground_json_hint: 'JSON را ویرایش یا جای‌گذاری کنید؛ پیش‌نمایش با هر تغییر به‌روز می‌شود.',
    playground_result: 'پاسخ ارسال آزمایشی',
    playground_direction: 'پیش‌نمایش چپ‌به‌راست',
    playground_diagnostics: 'تشخیص‌ها',
    playground_valid: 'ساختار فرم معتبر است.',
    playground_preview: 'پیش‌نمایش',
    playground_no_preview: 'تا زمانی که JSON معتبر نباشد، پیش‌نمایشی نمایش داده نمی‌شود.',
    preset_legacy: 'نمونهٔ اصلی (قالب قدیمی)',
    preset_v2: 'فرم نسخهٔ ۲',
    preset_unknown_optional: 'فیلد ناشناختهٔ اختیاری',
    preset_unknown_required: 'فیلد ناشناختهٔ الزامی',
    preset_server_error: 'سناریوی خطای سرور',
    result_success: 'موفق',
    result_validation: 'خطای اعتبارسنجی سرور',
    result_network: 'قطع ارتباط',
    json_invalid_title: 'JSON معتبر نیست',
    json_invalid: 'متن واردشده JSON معتبر نیست. پس از اصلاح، پیش‌نمایش نمایش داده می‌شود.',
    json_empty: 'JSON فرم را وارد کنید یا یک نمونه را انتخاب کنید.',
    nav_label: 'بخش‌ها',
    nav_form: 'فرم',
    nav_playground: 'آزمایشگاه',
    warnings_title: '{count} هشدار برای توسعه‌دهنده',
    mock_failed_title: 'سرویس آزمایشی راه‌اندازی نشد',
    mock_failed: 'پاسخ‌های آزمایشی در دسترس نیست و درخواست‌ها به سرور واقعی می‌روند. دلیل:',
    error_boundary_title: 'مشکلی پیش آمد',
    error_boundary: 'برنامه با خطا روبه‌رو شد. صفحه را دوباره بارگذاری کنید.',
    reload: 'بارگذاری مجدد',
  },
};

export { appMessages };
