// The same car form in the explicit v2 shape (see docs/api-contract.md, section 3.2).
const v2CarPayload: unknown = {
  schemaVersion: 2,
  formId: 'car-v2',
  title: 'ثبت آگهی خودرو',
  fields: [
    {
      kind: 'text',
      name: 'brand',
      label: 'برند',
      placeholder: 'برند ماشین را وارد کنید',
      rules: { required: true, maxLength: 40 },
    },
    {
      kind: 'number',
      name: 'year',
      label: 'سال ساخت',
      rules: { required: true, min: 1900, max: 2024, integer: true },
    },
    {
      kind: 'select',
      name: 'fuel_type',
      label: 'نوع سوخت',
      options: [
        { value: 'petrol', label: 'بنزین' },
        { value: 'gas', label: 'گاز' },
      ],
      rules: { required: true },
    },
    {
      kind: 'textarea',
      name: 'technical_condition',
      label: 'توضیحات وضعیت فنی',
      description: 'حداکثر ۵۰۰ نویسه',
      rules: { maxLength: 500 },
    },
    {
      kind: 'file',
      name: 'car_images',
      label: 'تصاویر ماشین',
      multiple: true,
      rules: { accept: ['image/*'], maxBytes: 5242880, maxFiles: 5 },
    },
  ],
};

export { v2CarPayload };
