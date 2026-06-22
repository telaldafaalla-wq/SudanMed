export const categoryMeta: Record<string, { slug: string; label: string }> = {
  '440c025b-a4a0-4a05-b3fd-5af27db6e061': { slug: 'ppe', label: 'وقاية شخصية' },
  'a9b4e74d-9ad8-40e8-a4d1-6e85977aa2d6': { slug: 'injection', label: 'حقن وتسريب' },
  'e72647e7-f812-4a8f-ae93-dc707faaa736': { slug: 'wound', label: 'رعاية الجروح' },
  '95b02d48-e81f-4c66-9a23-250ab32d2095': { slug: 'sterilization', label: 'تعقيم' },
  'bebc9525-00d7-4288-ba6b-7d7d0d39d33e': { slug: 'lab', label: 'مختبرات' },
  '6bb0dc3d-4e7e-49ac-b274-d52bc7e90ab9': { slug: 'surgical', label: 'جراحية' },
  '4b94d4a4-91c9-40e0-9492-82b664e8775b': { slug: 'wound', label: 'رعاية الجروح' },
  '94a7692f-6183-44ba-b1e4-3d1e35980c56': { slug: 'lab', label: 'مختبرات' },
  'cce6f463-0b13-47fb-a770-baff75fbd56e': { slug: 'lab', label: 'مختبرات' },
};

export const imageFallbackMap: Record<string, string> = {
  'kn95-mask': '/images/catalog/n95-mask.svg',
  'syringe-10ml': '/images/catalog/syringe-5ml.png',
  'iv-catheter-18g': '/images/catalog/iv-cannula-18g.svg',
  'surgical-mask-50': '/images/catalog/n95-mask.svg',
  'latex-gloves-l': '/images/catalog/syringe-5ml.png',
  'gloves-latex-l': '/images/catalog/syringe-5ml.png',
  'vicryl-suture-2': '/images/catalog/suture-2-0.svg',
  'suture-2-0': '/images/catalog/suture-2-0.svg',
  'gauze-4x4': '/images/catalog/n95-mask.svg',
};

export const defaultFallbackImage = '/images/catalog/n95-mask.svg';
