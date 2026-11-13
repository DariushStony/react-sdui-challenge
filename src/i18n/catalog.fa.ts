// Persian text for every message code and for the app's own messages. `{name}` is replaced by a
// parameter; `{name|size}` shows a byte count as a size. Text lives here, not in JSX (PRD FR-38).
export const faCatalog: Readonly<Record<string, string>> = {
  required: 'این فیلد الزامی است.',
  too_short: 'حداقل {min} نویسه وارد کنید.',
  too_long: 'حداکثر {max} نویسه مجاز است.',
  pattern_mismatch: 'قالب مقدار واردشده درست نیست.',
  not_a_number: 'یک عدد معتبر وارد کنید.',
  too_small: 'مقدار باید حداقل {min} باشد.',
  too_big: 'مقدار باید حداکثر {max} باشد.',
  not_an_integer: 'عدد باید صحیح باشد و اعشار نداشته باشد.',
  not_an_option: 'یکی از گزینه‌های موجود را انتخاب کنید.',
  file_type: 'نوع فایل «{file}» مجاز نیست. نوع‌های مجاز: {accept}.',
  file_too_large: 'حجم فایل «{file}» بیشتر از {maxBytes|size} است.',
  too_many_files: 'حداکثر {max} فایل را می‌توانید انتخاب کنید.',
  invalid: 'مقدار واردشده معتبر نیست.',
  unknown_error: 'خطایی رخ داد. دوباره تلاش کنید.',
  choose_option: 'انتخاب کنید',
  no_options: 'گزینه‌ای برای انتخاب وجود ندارد.',
};
