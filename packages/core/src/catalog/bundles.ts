// Seed bundles: curated sets of RSS products sold together at a discount.
// Each bundle's sun range sits inside the sun range of every plant it holds.

import type { Bundle } from '../types';

export const bundles: Bundle[] = [
  {
    id: 'bnd-low-light-herbs',
    slug: 'low-light-herb-starter',
    name: { en: 'Low-light herb starter', bn: 'কম আলোর ভেষজ স্টার্টার' },
    description: {
      en: 'Mint and thankuni — two herbs that still crop on a balcony with only 3–5 hours of sun.',
      bn: 'পুদিনা ও থানকুনি — দিনে মাত্র ৩–৫ ঘণ্টা রোদ পাওয়া বারান্দাতেও ফলন দেয় এমন দুটি ভেষজ।',
    },
    items: [
      { product_id: 'plt-0050', quantity: 1 }, // mint
      { product_id: 'plt-0052', quantity: 1 }, // thankuni
      { product_id: 'pot-0002', quantity: 2 }, // plastic pot 8"
      { product_id: 'acc-0001', quantity: 1 }, // potting mix
    ],
    discount_pct: 10,
    min_sun_hours: 3,
    max_sun_hours: 5,
    illustration: { form: 'herb', color: '#4caf50', accent: '#a5d6a7' },
  },
  {
    id: 'bnd-monsoon-balcony',
    slug: 'monsoon-tolerant-balcony',
    name: { en: 'Monsoon-tolerant balcony', bn: 'বর্ষা-সহনশীল বারান্দা' },
    description: {
      en: 'Foliage that shrugs off months of rain and humidity, in fast-draining clay pots.',
      bn: 'দ্রুত পানি বের হওয়া মাটির টবে এমন গাছ, যা মাসের পর মাস বৃষ্টি ও আর্দ্রতায় দিব্যি থাকে।',
    },
    items: [
      { product_id: 'plt-0004', quantity: 1 }, // areca palm
      { product_id: 'plt-0011', quantity: 1 }, // rubber plant
      { product_id: 'plt-0008', quantity: 1 }, // spider plant
      { product_id: 'plt-0012', quantity: 1 }, // syngonium
      { product_id: 'pot-0007', quantity: 2 }, // clay 12"
      { product_id: 'pot-0005', quantity: 2 }, // clay 8"
      { product_id: 'acc-0014', quantity: 1 }, // drainage trays
    ],
    discount_pct: 10,
    min_sun_hours: 2,
    max_sun_hours: 4,
    illustration: { form: 'palm', color: '#5aa13a', accent: '#3fa9f5' },
  },
  {
    id: 'bnd-kitchen-herb-railing',
    slug: 'kitchen-herb-railing',
    name: { en: 'Kitchen herb railing', bn: 'রান্নাঘরের ভেষজ রেলিং' },
    description: {
      en: 'Tulsi, basil and green chili in two railing planters — fresh flavour without using floor space.',
      bn: 'দুটি রেলিং প্ল্যান্টারে তুলসী, বেসিল ও কাঁচা মরিচ — মেঝের জায়গা ছাড়াই তাজা স্বাদ।',
    },
    items: [
      { product_id: 'plt-0048', quantity: 1 }, // tulsi
      { product_id: 'plt-0049', quantity: 1 }, // sweet basil
      { product_id: 'plt-0054', quantity: 1 }, // green chili
      { product_id: 'pot-0019', quantity: 2 }, // railing planter 24"
      { product_id: 'acc-0001', quantity: 2 }, // potting mix
    ],
    discount_pct: 8,
    min_sun_hours: 6,
    max_sun_hours: 8,
    illustration: { form: 'planter-long', color: '#6b8e23', accent: '#d32f2f' },
  },
  {
    id: 'bnd-fragrant-evening',
    slug: 'fragrant-evening-balcony',
    name: { en: 'Fragrant evening balcony', bn: 'সুগন্ধি সন্ধ্যার বারান্দা' },
    description: {
      en: 'Beli, rajanigandha and kamini under warm string lights — a balcony that smells best after dark.',
      bn: 'উষ্ণ আলোর নিচে বেলি, রজনীগন্ধা ও কামিনী — সন্ধ্যার পর সুগন্ধে ভরে ওঠা বারান্দা।',
    },
    items: [
      { product_id: 'plt-0029', quantity: 2 }, // beli
      { product_id: 'plt-0036', quantity: 2 }, // rajanigandha
      { product_id: 'plt-0040', quantity: 1 }, // kamini
      { product_id: 'pot-0006', quantity: 4 }, // clay 10"
      { product_id: 'pot-0007', quantity: 1 }, // clay 12"
      { product_id: 'hw-0011', quantity: 1 }, // warm string lights
    ],
    discount_pct: 12,
    min_sun_hours: 6,
    max_sun_hours: 8,
    illustration: { form: 'bushy', color: '#3f7f2f', accent: '#fdfdf5' },
  },
  {
    id: 'bnd-pet-safe-corner',
    slug: 'pet-safe-green-corner',
    name: { en: 'Pet-safe green corner', bn: 'পোষা-নিরাপদ সবুজ কোণ' },
    description: {
      en: 'Only ASPCA-listed non-toxic plants, for a shaded corner shared with cats or dogs.',
      bn: 'বিড়াল বা কুকুরের সাথে ভাগ করা ছায়াময় কোণের জন্য শুধু বিষমুক্ত হিসেবে স্বীকৃত গাছ।',
    },
    items: [
      { product_id: 'plt-0004', quantity: 1 }, // areca palm
      { product_id: 'plt-0008', quantity: 1 }, // spider plant
      { product_id: 'plt-0009', quantity: 1 }, // Boston fern
      { product_id: 'plt-0018', quantity: 1 }, // calathea
      { product_id: 'plt-0019', quantity: 1 }, // peperomia
      { product_id: 'pot-0009', quantity: 1 }, // ceramic 12"
      { product_id: 'pot-0008', quantity: 3 }, // ceramic 8"
      { product_id: 'pot-0017', quantity: 1 }, // coir hanging basket
    ],
    discount_pct: 10,
    min_sun_hours: 2,
    max_sun_hours: 3,
    illustration: { form: 'palm', color: '#3f8a3a', accent: '#c66b8f' },
  },
  {
    id: 'bnd-sunny-flower-burst',
    slug: 'sunny-flower-burst',
    name: { en: 'Sunny flower burst', bn: 'রোদেলা ফুলের উৎসব' },
    description: {
      en: 'Heat-proof colour for a full-sun balcony: joba, bougainvillea, nayantara, zinnia and portulaca.',
      bn: 'পূর্ণ রোদের বারান্দার জন্য গরম-সহনশীল রঙ: জবা, বাগানবিলাস, নয়নতারা, জিনিয়া ও টাইম ফুল।',
    },
    items: [
      { product_id: 'plt-0030', quantity: 1 }, // joba
      { product_id: 'plt-0031', quantity: 1 }, // bougainvillea
      { product_id: 'plt-0034', quantity: 2 }, // nayantara
      { product_id: 'plt-0043', quantity: 2 }, // zinnia
      { product_id: 'plt-0027', quantity: 2 }, // portulaca
      { product_id: 'pot-0007', quantity: 2 }, // clay 12"
      { product_id: 'pot-0005', quantity: 6 }, // clay 8"
      { product_id: 'acc-0003', quantity: 1 }, // vermicompost
    ],
    discount_pct: 12,
    min_sun_hours: 6,
    max_sun_hours: 10,
    illustration: { form: 'flowering', color: '#2f6e2f', accent: '#d6247f' },
  },
  {
    id: 'bnd-vertical-wall',
    slug: 'tiny-balcony-vertical-wall',
    name: { en: 'Tiny-balcony vertical wall', bn: 'ছোট বারান্দার ভার্টিক্যাল দেয়াল' },
    description: {
      en: 'Twelve trailing plants on a wall frame — a full green wall that uses almost no floor space.',
      bn: 'দেয়ালের ফ্রেমে বারোটি লতানো গাছ — মেঝের জায়গা প্রায় না নিয়েই পুরো সবুজ দেয়াল।',
    },
    items: [
      { product_id: 'hw-0004', quantity: 1 }, // vertical garden frame
      { product_id: 'plt-0001', quantity: 3 }, // money plant
      { product_id: 'plt-0012', quantity: 3 }, // syngonium
      { product_id: 'plt-0013', quantity: 3 }, // philodendron
      { product_id: 'plt-0008', quantity: 3 }, // spider plant
      { product_id: 'pot-0001', quantity: 12 }, // plastic pot 6"
      { product_id: 'acc-0001', quantity: 2 }, // potting mix
    ],
    discount_pct: 15,
    min_sun_hours: 2,
    max_sun_hours: 4,
    illustration: { form: 'trellis', color: '#3a3a3a', accent: '#4c9a2a' },
  },
  {
    id: 'bnd-winter-colour',
    slug: 'winter-colour-pack',
    name: { en: 'Winter colour pack', bn: 'শীতের রঙিন ফুলের প্যাক' },
    description: {
      en: 'Chandramallika, dahlia, petunia and gada for a bright November–February balcony.',
      bn: 'নভেম্বর–ফেব্রুয়ারির উজ্জ্বল বারান্দার জন্য চন্দ্রমল্লিকা, ডালিয়া, পিটুনিয়া ও গাঁদা।',
    },
    items: [
      { product_id: 'plt-0045', quantity: 2 }, // chandramallika
      { product_id: 'plt-0046', quantity: 1 }, // dahlia
      { product_id: 'plt-0047', quantity: 2 }, // petunia
      { product_id: 'plt-0033', quantity: 2 }, // gada
      { product_id: 'pot-0006', quantity: 2 }, // clay 10"
      { product_id: 'pot-0007', quantity: 1 }, // clay 12"
      { product_id: 'pot-0005', quantity: 4 }, // clay 8"
      { product_id: 'acc-0003', quantity: 1 }, // vermicompost
    ],
    discount_pct: 10,
    min_sun_hours: 6,
    max_sun_hours: 8,
    illustration: { form: 'flowering', color: '#3a6e30', accent: '#f7d21e' },
  },
];
