// Seed product catalog (the RSS) for BD-urban Studio.
//
// This is what the AI designer is allowed to recommend, so plant data errs on
// the side of caution:
//  - pet_safe is true only for plants listed as non-toxic to cats AND dogs by
//    the ASPCA (or universally recognised as safe). When unsure: false.
//  - sun hours are direct-sun hours on a Dhaka/Chittagong balcony.
//  - heat_tolerant = copes with 35°C+ summer heat; monsoon_tolerant = copes
//    with weeks of heavy rain/high humidity in a draining pot; coastal_ok =
//    copes with salty Chittagong sea air.
// Prices are Dhaka retail BDT (2026); cost is roughly 55–70% of price.

import type {
  AestheticTag,
  Bilingual,
  CareLevel,
  HardwareSpecs,
  Illustration,
  PlantSpecs,
  PotSpecs,
  Product,
} from '../types';

interface Base {
  en: string;
  bn: string;
  dEn: string;
  dBn: string;
  price: number;
  cost: number;
  stock: number;
  kg: number;
  tags: AestheticTag[];
  sup: string;
  ill: Illustration;
  unit?: string;
}

const code = (prefix: string, n: number) => `${prefix}-${String(n).padStart(4, '0')}`;

function base(
  prefix: string,
  n: number,
  category: Product['category'],
  care: CareLevel,
  defaultUnit: string,
  b: Base,
): Product {
  const sku = code(prefix, n);
  const name: Bilingual = { en: b.en, bn: b.bn };
  const description: Bilingual = { en: b.dEn, bn: b.dBn };
  return {
    id: sku.toLowerCase(),
    sku,
    category,
    name,
    description,
    price: b.price,
    cost: b.cost,
    stock: b.stock,
    unit: b.unit ?? defaultUnit,
    weight_kg: b.kg,
    care_level: care,
    aesthetic_tags: b.tags,
    supplier_id: b.sup,
    illustration: b.ill,
    image_url: null,
    active: true,
  };
}

const plant = (n: number, b: Base & { care: CareLevel; spec: PlantSpecs }): Product => ({
  ...base('PLT', n, 'plant', b.care, 'pot', b),
  plant: b.spec,
});

const pot = (n: number, b: Base & { spec: PotSpecs }): Product => ({
  ...base('POT', n, 'pot', 'easy', 'piece', b),
  pot: b.spec,
});

const hw = (n: number, b: Base & { spec: HardwareSpecs }): Product => ({
  ...base('HW', n, 'hardware', 'easy', 'piece', b),
  hardware: b.spec,
});

const acc = (n: number, b: Base): Product => base('ACC', n, 'accessory', 'easy', 'piece', b);

// Supplier shorthands
const DN1 = 'sup-dhk-nursery-1'; // Agargaon – foliage
const DN2 = 'sup-dhk-nursery-2'; // Mirpur – flowering
const DN3 = 'sup-dhk-nursery-3'; // Uttara – edibles & seedlings
const DN4 = 'sup-dhk-nursery-4'; // Mohammadpur – premium foliage
const CN1 = 'sup-ctg-nursery-1'; // Nasirabad – hardy / coastal
const CN2 = 'sup-ctg-nursery-2'; // Khulshi – shade & fragrant
const DP1 = 'sup-dhk-pots-1'; // Mirpur – plastic / recycled / self-watering
const DP2 = 'sup-dhk-pots-2'; // Dhanmondi – ceramic / fiberglass / cement
const CP1 = 'sup-ctg-pots-1'; // Agrabad – clay / coir
const DH1 = 'sup-dhk-hardware-1';
const CH1 = 'sup-ctg-hardware-1';
const DA1 = 'sup-dhk-accessories-1';

// ═══════════════════════════════════════════════════════════════════════
// PLANTS
// ═══════════════════════════════════════════════════════════════════════

const plants: Product[] = [
  // ── Foliage / indoor ──────────────────────────────────────────────────
  plant(1, {
    en: 'Money plant (golden pothos)', bn: 'মানি প্ল্যান্ট',
    dEn: 'Thrives in bright shade and forgives missed waterings; trails beautifully from a shelf.',
    dBn: 'উজ্জ্বল ছায়ায় ভালো থাকে, পানি দিতে ভুলে গেলেও টিকে যায়; তাক থেকে সুন্দরভাবে ঝুলে পড়ে।',
    price: 220, cost: 135, stock: 60, kg: 1.0, care: 'easy',
    tags: ['tropical', 'minimal'], sup: DN1,
    ill: { form: 'trailing', color: '#4c9a2a', accent: '#e3e86b' },
    spec: {
      species: 'Epipremnum aureum', min_sun_hours: 1, max_sun_hours: 4, water_every_days: 5,
      mature_height_cm: 180, mature_spread_cm: 50, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 6,
    },
  }),
  plant(2, {
    en: 'Snake plant', bn: 'স্নেক প্ল্যান্ট',
    dEn: 'Nearly indestructible in low light with little water — just keep it out of monsoon downpours.',
    dBn: 'কম আলো ও অল্প পানিতেই প্রায় অক্ষয়; শুধু বর্ষার টানা বৃষ্টি থেকে দূরে রাখুন।',
    price: 550, cost: 340, stock: 45, kg: 2.5, care: 'easy',
    tags: ['modern', 'minimal'], sup: DN1,
    ill: { form: 'upright', color: '#3d6b35', accent: '#c9d46a' },
    spec: {
      species: 'Dracaena trifasciata', min_sun_hours: 1, max_sun_hours: 6, water_every_days: 14,
      mature_height_cm: 75, mature_spread_cm: 30, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(3, {
    en: 'ZZ plant', bn: 'জেডজেড প্ল্যান্ট',
    dEn: 'Glossy leaves that handle dim corners and weeks of neglect.',
    dBn: 'চকচকে পাতা; অন্ধকার কোণ আর কয়েক সপ্তাহের অযত্নেও টিকে থাকে।',
    price: 850, cost: 520, stock: 25, kg: 2.5, care: 'easy',
    tags: ['modern', 'minimal'], sup: DN4,
    ill: { form: 'upright', color: '#2f6b2f', accent: '#4f9a3f' },
    spec: {
      species: 'Zamioculcas zamiifolia', min_sun_hours: 1, max_sun_hours: 4, water_every_days: 14,
      mature_height_cm: 60, mature_spread_cm: 50, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(4, {
    en: 'Areca palm (approx. 1 m)', bn: 'অ্যারেকা পাম (প্রায় ১ মিটার)',
    dEn: 'Pet-safe feathery palm that softens a balcony corner in bright, filtered light.',
    dBn: 'পোষা প্রাণীর জন্য নিরাপদ পালকের মতো পাম; ছাঁকা উজ্জ্বল আলোয় বারান্দার কোণ সবুজ করে তোলে।',
    price: 1500, cost: 950, stock: 18, kg: 8, care: 'easy',
    tags: ['tropical', 'boho'], sup: DN1,
    ill: { form: 'palm', color: '#5aa13a', accent: '#c8d65a' },
    spec: {
      species: 'Dypsis lutescens', min_sun_hours: 2, max_sun_hours: 6, water_every_days: 3,
      mature_height_cm: 200, mature_spread_cm: 100, indoor_ok: true, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 12,
    },
  }),
  plant(5, {
    en: 'Parlor palm', bn: 'পার্লার পাম',
    dEn: 'Compact, pet-safe palm for shady balconies and indoor corners.',
    dBn: 'ছায়াময় বারান্দা ও ঘরের কোণের জন্য ছোট আকারের, পোষা প্রাণীর জন্য নিরাপদ পাম।',
    price: 650, cost: 400, stock: 20, kg: 3, care: 'easy',
    tags: ['tropical', 'minimal'], sup: DN4,
    ill: { form: 'palm', color: '#3f8a3a', accent: '#9cc56b' },
    spec: {
      species: 'Chamaedorea elegans', min_sun_hours: 1, max_sun_hours: 4, water_every_days: 4,
      mature_height_cm: 120, mature_spread_cm: 60, indoor_ok: true, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: true, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(6, {
    en: 'Peace lily', bn: 'পিস লিলি',
    dEn: 'Droops when thirsty and perks up after a drink; white blooms even in shade.',
    dBn: 'পানির অভাবে পাতা নেতিয়ে পড়ে, পানি দিলেই সতেজ হয়; ছায়াতেও সাদা ফুল দেয়।',
    price: 450, cost: 280, stock: 30, kg: 2, care: 'easy',
    tags: ['minimal', 'modern'], sup: DN1,
    ill: { form: 'flowering', color: '#2e7d32', accent: '#f5f5f0' },
    spec: {
      species: 'Spathiphyllum wallisii', min_sun_hours: 1, max_sun_hours: 3, water_every_days: 3,
      mature_height_cm: 60, mature_spread_cm: 50, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(7, {
    en: 'Aglaonema (red)', bn: 'অ্যাগলোনেমা (লাল)',
    dEn: 'Pink-and-green leaves that stay colourful even in low light.',
    dBn: 'গোলাপি-সবুজ পাতা কম আলোতেও রঙিন থাকে।',
    price: 650, cost: 400, stock: 28, kg: 2, care: 'easy',
    tags: ['colorful', 'modern'], sup: DN2,
    ill: { form: 'bushy', color: '#3d7a3a', accent: '#e0475b' },
    spec: {
      species: "Aglaonema 'Siam Aurora'", min_sun_hours: 1, max_sun_hours: 3, water_every_days: 5,
      mature_height_cm: 50, mature_spread_cm: 45, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(8, {
    en: 'Spider plant', bn: 'স্পাইডার প্ল্যান্ট',
    dEn: 'Pet-safe and fast-growing; sends out baby plantlets you can repot.',
    dBn: 'পোষা প্রাণীর জন্য নিরাপদ ও দ্রুত বাড়ে; ছোট চারা দেয় যা আলাদা টবে লাগানো যায়।',
    price: 200, cost: 125, stock: 50, kg: 0.9, care: 'easy',
    tags: ['boho', 'minimal'], sup: DN3,
    ill: { form: 'trailing', color: '#6aa84f', accent: '#f0f3d0' },
    spec: {
      species: 'Chlorophytum comosum', min_sun_hours: 2, max_sun_hours: 5, water_every_days: 4,
      mature_height_cm: 30, mature_spread_cm: 50, indoor_ok: true, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: true, heat_tolerant: false, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 6,
    },
  }),
  plant(9, {
    en: 'Boston fern', bn: 'বোস্টন ফার্ন',
    dEn: 'Lush, pet-safe fern for hanging baskets; keep it moist and out of hot sun.',
    dBn: 'ঝুলন্ত টবের জন্য ঘন, পোষা প্রাণীর জন্য নিরাপদ ফার্ন; মাটি ভেজা রাখুন ও কড়া রোদ থেকে দূরে রাখুন।',
    price: 350, cost: 215, stock: 35, kg: 1.5, care: 'easy',
    tags: ['boho', 'tropical'], sup: DN2,
    ill: { form: 'bushy', color: '#4f9d3a', accent: '#8cc63f' },
    spec: {
      species: 'Nephrolepis exaltata', min_sun_hours: 1, max_sun_hours: 3, water_every_days: 2,
      mature_height_cm: 50, mature_spread_cm: 70, indoor_ok: true, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: true, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(10, {
    en: "Bird's nest fern", bn: 'বার্ডস নেস্ট ফার্ন',
    dEn: 'Wavy, glossy fronds that love humid monsoon air and bright shade.',
    dBn: 'ঢেউ খেলানো চকচকে পাতা; বর্ষার আর্দ্র বাতাস আর উজ্জ্বল ছায়া পছন্দ করে।',
    price: 550, cost: 340, stock: 15, kg: 2, care: 'easy',
    tags: ['tropical', 'modern'], sup: CN2,
    ill: { form: 'upright', color: '#5cae3c', accent: '#3c7a28' },
    spec: {
      species: 'Asplenium nidus', min_sun_hours: 1, max_sun_hours: 3, water_every_days: 4,
      mature_height_cm: 60, mature_spread_cm: 60, indoor_ok: true, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: true, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(11, {
    en: 'Rubber plant', bn: 'রাবার প্ল্যান্ট',
    dEn: 'Bold glossy leaves; tolerates heat and a few hours of direct sun.',
    dBn: 'বড় চকচকে পাতা; গরম আর কয়েক ঘণ্টার সরাসরি রোদ সহ্য করে।',
    price: 750, cost: 460, stock: 22, kg: 4, care: 'easy',
    tags: ['modern', 'minimal'], sup: DN4,
    ill: { form: 'upright', color: '#1f4d2b', accent: '#7a2e3a' },
    spec: {
      species: 'Ficus elastica', min_sun_hours: 2, max_sun_hours: 6, water_every_days: 6,
      mature_height_cm: 150, mature_spread_cm: 60, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 10,
    },
  }),
  plant(12, {
    en: 'Syngonium (arrowhead plant)', bn: 'সিঙ্গোনিয়াম',
    dEn: 'Arrow-shaped leaves in pink or lime; happy in bright shade.',
    dBn: 'তীরের মতো গোলাপি বা হালকা সবুজ পাতা; উজ্জ্বল ছায়ায় ভালো থাকে।',
    price: 250, cost: 155, stock: 40, kg: 1, care: 'easy',
    tags: ['colorful', 'tropical'], sup: DN1,
    ill: { form: 'trailing', color: '#7cb342', accent: '#f2b8c6' },
    spec: {
      species: 'Syngonium podophyllum', min_sun_hours: 1, max_sun_hours: 4, water_every_days: 4,
      mature_height_cm: 40, mature_spread_cm: 40, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 6,
    },
  }),
  plant(13, {
    en: 'Heartleaf philodendron', bn: 'ফিলোডেনড্রন',
    dEn: 'Heart-shaped trailing leaves for shelves and hanging pots in low light.',
    dBn: 'হৃদয় আকৃতির লতানো পাতা; কম আলোয় তাক বা ঝুলন্ত টবের জন্য ভালো।',
    price: 350, cost: 215, stock: 32, kg: 1.2, care: 'easy',
    tags: ['tropical', 'boho'], sup: DN1,
    ill: { form: 'trailing', color: '#3e8e41', accent: '#a5d66b' },
    spec: {
      species: 'Philodendron hederaceum', min_sun_hours: 1, max_sun_hours: 4, water_every_days: 5,
      mature_height_cm: 150, mature_spread_cm: 40, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 6,
    },
  }),
  plant(14, {
    en: 'Monstera', bn: 'মনস্টেরা',
    dEn: 'Statement split leaves; give it a moss pole and bright indirect light.',
    dBn: 'কাটা কাটা বড় পাতার আকর্ষণীয় গাছ; মস পোল ও উজ্জ্বল পরোক্ষ আলো দিন।',
    price: 2200, cost: 1400, stock: 10, kg: 9, care: 'moderate',
    tags: ['tropical', 'modern'], sup: DN4,
    ill: { form: 'upright', color: '#2b6e35', accent: '#4c9a50' },
    spec: {
      species: 'Monstera deliciosa', min_sun_hours: 2, max_sun_hours: 5, water_every_days: 6,
      mature_height_cm: 150, mature_spread_cm: 100, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 14,
    },
  }),
  plant(15, {
    en: 'Croton', bn: 'ক্রোটন (পাতাবাহার)',
    dEn: 'Red-and-yellow leaves that grow brighter with more sun; loves Bangladeshi heat.',
    dBn: 'লাল-হলুদ পাতা রোদ বেশি পেলে আরও উজ্জ্বল হয়; বাংলাদেশের গরমে খুব ভালো থাকে।',
    price: 300, cost: 185, stock: 38, kg: 2.5, care: 'easy',
    tags: ['colorful', 'traditional'], sup: CN1,
    ill: { form: 'bushy', color: '#4a7a2a', accent: '#f2a900' },
    spec: {
      species: 'Codiaeum variegatum', min_sun_hours: 4, max_sun_hours: 8, water_every_days: 3,
      mature_height_cm: 90, mature_spread_cm: 60, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 10,
    },
  }),
  plant(16, {
    en: 'Dracaena (dragon tree)', bn: 'ড্রাসিনা',
    dEn: 'Slim, spiky and architectural; let the soil dry between waterings.',
    dBn: 'সরু, খাড়া পাতার আধুনিক গড়ন; দুই বার পানি দেওয়ার মাঝে মাটি শুকাতে দিন।',
    price: 600, cost: 370, stock: 20, kg: 3, care: 'easy',
    tags: ['modern', 'minimal'], sup: DN2,
    ill: { form: 'upright', color: '#3a6b2f', accent: '#b0343c' },
    spec: {
      species: 'Dracaena marginata', min_sun_hours: 2, max_sun_hours: 5, water_every_days: 7,
      mature_height_cm: 150, mature_spread_cm: 50, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 10,
    },
  }),
  plant(17, {
    en: 'Lucky bamboo (3-tier)', bn: 'লাকি ব্যাম্বু',
    dEn: 'Grows indoors in water or soil; change the water every week.',
    dBn: 'ঘরের ভেতরে পানি বা মাটিতে বাড়ে; প্রতি সপ্তাহে পানি বদলে দিন।',
    price: 450, cost: 280, stock: 30, kg: 1.5, care: 'easy',
    tags: ['minimal', 'traditional'], sup: DN3,
    ill: { form: 'upright', color: '#6fbf4a', accent: '#c8a24a' },
    spec: {
      species: 'Dracaena sanderiana', min_sun_hours: 1, max_sun_hours: 3, water_every_days: 7,
      mature_height_cm: 60, mature_spread_cm: 25, indoor_ok: true, outdoor_ok: false,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 6,
    },
  }),
  plant(18, {
    en: 'Calathea', bn: 'ক্যালাথিয়া',
    dEn: 'Patterned, pet-safe leaves; needs shade, humidity and evenly moist soil.',
    dBn: 'নকশাদার পাতা, পোষা প্রাণীর জন্য নিরাপদ; ছায়া, আর্দ্রতা ও সমানভাবে ভেজা মাটি চায়।',
    price: 650, cost: 400, stock: 12, kg: 2, care: 'moderate',
    tags: ['modern', 'tropical'], sup: DN4,
    ill: { form: 'bushy', color: '#2f6e4f', accent: '#c66b8f' },
    spec: {
      species: 'Goeppertia spp. (Calathea)', min_sun_hours: 1, max_sun_hours: 3, water_every_days: 3,
      mature_height_cm: 50, mature_spread_cm: 50, indoor_ok: true, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: true, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(19, {
    en: 'Peperomia (baby rubber plant)', bn: 'পেপেরোমিয়া',
    dEn: 'Small, thick-leaved and pet-safe; ideal for a shaded table or shelf.',
    dBn: 'ছোট, পুরু পাতার পোষা-নিরাপদ গাছ; ছায়াময় টেবিল বা তাকের জন্য আদর্শ।',
    price: 300, cost: 185, stock: 26, kg: 0.8, care: 'easy',
    tags: ['minimal', 'modern'], sup: DN1,
    ill: { form: 'bushy', color: '#3f8f3f', accent: '#c5e17a' },
    spec: {
      species: 'Peperomia obtusifolia', min_sun_hours: 1, max_sun_hours: 4, water_every_days: 7,
      mature_height_cm: 25, mature_spread_cm: 30, indoor_ok: true, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 6,
    },
  }),
  plant(20, {
    en: 'Money tree (Pachira)', bn: 'মানি ট্রি',
    dEn: 'Braided-trunk, pet-safe tree for bright indirect light.',
    dBn: 'বেণী করা কাণ্ডের পোষা-নিরাপদ গাছ; উজ্জ্বল পরোক্ষ আলো পছন্দ করে।',
    price: 900, cost: 560, stock: 14, kg: 4, care: 'easy',
    tags: ['modern', 'traditional'], sup: DN2,
    ill: { form: 'upright', color: '#4a8f3c', accent: '#8b6b4a' },
    spec: {
      species: 'Pachira aquatica', min_sun_hours: 2, max_sun_hours: 5, water_every_days: 7,
      mature_height_cm: 120, mature_spread_cm: 60, indoor_ok: true, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 10,
    },
  }),
  plant(21, {
    en: 'Anthurium (red)', bn: 'অ্যান্থুরিয়াম',
    dEn: 'Glossy red blooms for months in bright shade and humid air.',
    dBn: 'উজ্জ্বল ছায়া ও আর্দ্র বাতাসে মাসের পর মাস চকচকে লাল ফুল দেয়।',
    price: 750, cost: 460, stock: 18, kg: 2, care: 'moderate',
    tags: ['colorful', 'modern'], sup: CN2,
    ill: { form: 'flowering', color: '#2e6b34', accent: '#d7263d' },
    spec: {
      species: 'Anthurium andraeanum', min_sun_hours: 1, max_sun_hours: 4, water_every_days: 4,
      mature_height_cm: 50, mature_spread_cm: 40, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(22, {
    en: 'Dendrobium orchid', bn: 'ডেনড্রোবিয়াম অর্কিড',
    dEn: 'Pet-safe orchid that reblooms with morning sun and good airflow.',
    dBn: 'পোষা-নিরাপদ অর্কিড; সকালের রোদ ও বাতাস চলাচল পেলে বারবার ফুল দেয়।',
    price: 650, cost: 400, stock: 20, kg: 0.8, care: 'moderate',
    tags: ['tropical', 'colorful'], sup: CN1,
    ill: { form: 'flowering', color: '#4f8a3c', accent: '#a347c4' },
    spec: {
      species: 'Dendrobium spp.', min_sun_hours: 3, max_sun_hours: 6, water_every_days: 3,
      mature_height_cm: 50, mature_spread_cm: 25, indoor_ok: true, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 6,
    },
  }),
  plant(23, {
    en: 'Jade plant', bn: 'জেড প্ল্যান্ট',
    dEn: 'Chunky succulent for a sunny ledge; water only when the soil is dry.',
    dBn: 'রোদেলা কার্নিশের জন্য মোটা পাতার সাকুলেন্ট; মাটি শুকালে তবেই পানি দিন।',
    price: 350, cost: 215, stock: 25, kg: 1.2, care: 'easy',
    tags: ['minimal', 'modern'], sup: DN3,
    ill: { form: 'succulent', color: '#4f8a3f', accent: '#c9534a' },
    spec: {
      species: 'Crassula ovata', min_sun_hours: 4, max_sun_hours: 8, water_every_days: 10,
      mature_height_cm: 60, mature_spread_cm: 40, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 6,
    },
  }),
  plant(24, {
    en: 'Aloe vera', bn: 'অ্যালোভেরা',
    dEn: 'Sun-loving succulent that needs fast drainage; protect it from monsoon soaking.',
    dBn: 'রোদপ্রিয় সাকুলেন্ট, দ্রুত পানি নিষ্কাশন দরকার; বর্ষায় ভিজে যাওয়া থেকে রক্ষা করুন।',
    price: 180, cost: 110, stock: 55, kg: 1.5, care: 'easy',
    tags: ['minimal', 'rustic'], sup: CN1,
    ill: { form: 'succulent', color: '#7ba05b', accent: '#b9d18a' },
    spec: {
      species: 'Aloe vera', min_sun_hours: 4, max_sun_hours: 8, water_every_days: 10,
      mature_height_cm: 50, mature_spread_cm: 50, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(25, {
    en: 'Adenium (desert rose)', bn: 'অ্যাডেনিয়াম (মরুগোলাপ)',
    dEn: 'Swollen trunk and pink flowers in full sun; keep almost dry in monsoon.',
    dBn: 'ফোলা কাণ্ড ও পূর্ণ রোদে গোলাপি ফুল; বর্ষায় প্রায় শুকনো রাখুন।',
    price: 850, cost: 530, stock: 20, kg: 2, care: 'moderate',
    tags: ['colorful', 'modern'], sup: DN2,
    ill: { form: 'succulent', color: '#5e8c3a', accent: '#e84a8a' },
    spec: {
      species: 'Adenium obesum', min_sun_hours: 6, max_sun_hours: 10, water_every_days: 7,
      mature_height_cm: 60, mature_spread_cm: 40, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(26, {
    en: 'Kalanchoe', bn: 'ক্যালাঞ্চো',
    dEn: 'Long-lasting clusters of tiny flowers; a cheerful winter gift plant.',
    dBn: 'ছোট ছোট ফুলের দীর্ঘস্থায়ী থোকা; শীতের হাসিখুশি উপহার গাছ।',
    price: 220, cost: 135, stock: 30, kg: 0.8, care: 'easy',
    tags: ['colorful'], sup: DN2,
    ill: { form: 'succulent', color: '#3f7f3a', accent: '#ff6f3c' },
    spec: {
      species: 'Kalanchoe blossfeldiana', min_sun_hours: 4, max_sun_hours: 6, water_every_days: 7,
      mature_height_cm: 30, mature_spread_cm: 30, indoor_ok: true, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['winter', 'spring'], pot_size_in: 6,
    },
  }),
  plant(27, {
    en: 'Portulaca (moss rose)', bn: 'পর্টুলাকা (টাইম ফুল)',
    dEn: 'Opens bright flowers in full sun and shrugs off heat on the hottest railings.',
    dBn: 'পূর্ণ রোদে উজ্জ্বল ফুল ফোটে, সবচেয়ে গরম রেলিংয়েও দিব্যি টিকে থাকে।',
    price: 100, cost: 60, stock: 60, kg: 0.6, care: 'easy',
    tags: ['colorful', 'rustic'], sup: CN1,
    ill: { form: 'flowering', color: '#6a9a3a', accent: '#ff3d8b' },
    spec: {
      species: 'Portulaca grandiflora', min_sun_hours: 6, max_sun_hours: 10, water_every_days: 3,
      mature_height_cm: 15, mature_spread_cm: 30, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 6,
    },
  }),
  plant(28, {
    en: 'Zebra haworthia', bn: 'হাওর্থিয়া',
    dEn: 'Tiny striped succulent, pet-safe and happy on a bright windowsill.',
    dBn: 'ছোট ডোরাকাটা সাকুলেন্ট, পোষা-নিরাপদ; উজ্জ্বল জানালার ধারে ভালো থাকে।',
    price: 280, cost: 170, stock: 22, kg: 0.4, care: 'easy',
    tags: ['minimal', 'modern'], sup: DN3,
    ill: { form: 'succulent', color: '#3d6b4a', accent: '#e8efe0' },
    spec: {
      species: 'Haworthiopsis attenuata', min_sun_hours: 2, max_sun_hours: 5, water_every_days: 12,
      mature_height_cm: 12, mature_spread_cm: 15, indoor_ok: true, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 6,
    },
  }),

  // ── Flowering ─────────────────────────────────────────────────────────
  plant(29, {
    en: 'Beli (Arabian jasmine)', bn: 'বেলি',
    dEn: 'Intensely fragrant white flowers on summer and monsoon evenings.',
    dBn: 'গ্রীষ্ম ও বর্ষার সন্ধ্যায় তীব্র সুগন্ধি সাদা ফুল ফোটে।',
    price: 250, cost: 155, stock: 45, kg: 2, care: 'easy',
    tags: ['traditional', 'tropical'], sup: DN2,
    ill: { form: 'bushy', color: '#3f7f2f', accent: '#fdfdf5' },
    spec: {
      species: 'Jasminum sambac', min_sun_hours: 5, max_sun_hours: 8, water_every_days: 2,
      mature_height_cm: 120, mature_spread_cm: 80, indoor_ok: false, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: true, seasons: ['all'], pot_size_in: 10,
    },
  }),
  plant(30, {
    en: 'Joba (hibiscus)', bn: 'জবা',
    dEn: 'Big red blooms almost daily in full sun; feed monthly for more flowers.',
    dBn: 'পূর্ণ রোদে প্রায় প্রতিদিন বড় লাল ফুল; বেশি ফুলের জন্য মাসে একবার সার দিন।',
    price: 300, cost: 185, stock: 40, kg: 3, care: 'easy',
    tags: ['traditional', 'colorful', 'tropical'], sup: DN2,
    ill: { form: 'flowering', color: '#2f6e2f', accent: '#d7192a' },
    spec: {
      species: 'Hibiscus rosa-sinensis', min_sun_hours: 6, max_sun_hours: 10, water_every_days: 2,
      mature_height_cm: 150, mature_spread_cm: 90, indoor_ok: false, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 12,
    },
  }),
  plant(31, {
    en: 'Bougainvillea', bn: 'বাগানবিলাস',
    dEn: 'Floods a sunny railing with magenta bracts; flowers best when kept slightly dry.',
    dBn: 'রোদেলা রেলিং ম্যাজেন্টা রঙে ভরিয়ে দেয়; মাটি একটু শুকনো রাখলে বেশি ফুল দেয়।',
    price: 450, cost: 280, stock: 30, kg: 3.5, care: 'easy',
    tags: ['colorful', 'tropical'], sup: CN1,
    ill: { form: 'climber', color: '#3d6e2c', accent: '#d6247f' },
    spec: {
      species: 'Bougainvillea glabra', min_sun_hours: 6, max_sun_hours: 10, water_every_days: 4,
      mature_height_cm: 200, mature_spread_cm: 150, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 12,
    },
  }),
  plant(32, {
    en: 'Rangan (ixora)', bn: 'রঙ্গন',
    dEn: 'Dense red-orange flower clusters most of the year; likes slightly acidic soil.',
    dBn: 'প্রায় সারা বছর ঘন লাল-কমলা ফুলের থোকা; সামান্য অম্লীয় মাটি পছন্দ করে।',
    price: 280, cost: 170, stock: 35, kg: 2.5, care: 'easy',
    tags: ['traditional', 'colorful'], sup: DN4,
    ill: { form: 'flowering', color: '#2e6b2e', accent: '#ff4f1f' },
    spec: {
      species: 'Ixora coccinea', min_sun_hours: 5, max_sun_hours: 8, water_every_days: 3,
      mature_height_cm: 120, mature_spread_cm: 80, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 10,
    },
  }),
  plant(33, {
    en: 'Gada (marigold)', bn: 'গাঁদা',
    dEn: 'Cheerful orange blooms, easy from seedling; peaks in winter.',
    dBn: 'উজ্জ্বল কমলা ফুল, চারা থেকে সহজেই হয়; শীতে সবচেয়ে বেশি ফোটে।',
    price: 80, cost: 50, stock: 70, kg: 1, care: 'easy',
    tags: ['traditional', 'colorful'], sup: DN3,
    ill: { form: 'flowering', color: '#4a7f2a', accent: '#ff9f1c' },
    spec: {
      species: 'Tagetes erecta', min_sun_hours: 6, max_sun_hours: 10, water_every_days: 2,
      mature_height_cm: 60, mature_spread_cm: 40, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(34, {
    en: 'Nayantara (periwinkle)', bn: 'নয়নতারা',
    dEn: 'Flowers non-stop through heat with little care; toxic if eaten.',
    dBn: 'সামান্য যত্নে গরমেও অবিরাম ফুল দেয়; খেলে বিষাক্ত।',
    price: 100, cost: 60, stock: 60, kg: 0.8, care: 'easy',
    tags: ['colorful', 'traditional'], sup: CN1,
    ill: { form: 'flowering', color: '#3f7a35', accent: '#f06ba8' },
    spec: {
      species: 'Catharanthus roseus', min_sun_hours: 5, max_sun_hours: 10, water_every_days: 3,
      mature_height_cm: 45, mature_spread_cm: 40, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['all'], pot_size_in: 6,
    },
  }),
  plant(35, {
    en: 'Golap (hybrid rose)', bn: 'গোলাপ',
    dEn: 'Classic blooms that peak in winter; needs 6+ hours of sun and regular feeding.',
    dBn: 'শীতে সবচেয়ে ভালো ফোটে; দিনে ৬ ঘণ্টার বেশি রোদ ও নিয়মিত সার প্রয়োজন।',
    price: 350, cost: 215, stock: 35, kg: 3, care: 'moderate',
    tags: ['traditional', 'colorful'], sup: DN2,
    ill: { form: 'flowering', color: '#2f5f2a', accent: '#c8102e' },
    spec: {
      species: 'Rosa × hybrida', min_sun_hours: 6, max_sun_hours: 8, water_every_days: 2,
      mature_height_cm: 90, mature_spread_cm: 60, indoor_ok: false, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: true, seasons: ['autumn', 'winter', 'spring'], pot_size_in: 12,
    },
  }),
  plant(36, {
    en: 'Rajanigandha (tuberose)', bn: 'রজনীগন্ধা',
    dEn: 'Tall white spikes that perfume the balcony after dark.',
    dBn: 'লম্বা ডাঁটায় সাদা ফুল, রাতে বারান্দা সুগন্ধে ভরিয়ে দেয়।',
    price: 150, cost: 90, stock: 40, kg: 1.2, care: 'easy',
    tags: ['traditional'], sup: DN3,
    ill: { form: 'upright', color: '#4f8a3a', accent: '#fbfbf0' },
    spec: {
      species: 'Polianthes tuberosa', min_sun_hours: 6, max_sun_hours: 8, water_every_days: 3,
      mature_height_cm: 90, mature_spread_cm: 30, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: false,
      edible: false, fragrant: true, seasons: ['summer', 'monsoon', 'autumn'], pot_size_in: 8,
    },
  }),
  plant(37, {
    en: 'Shiuli (night jasmine)', bn: 'শিউলি',
    dEn: 'Orange-stemmed white flowers drop at dawn in autumn; needs a large pot.',
    dBn: 'শরতে ভোরবেলা কমলা বোঁটার সাদা ফুল ঝরে পড়ে; বড় টব প্রয়োজন।',
    price: 350, cost: 215, stock: 15, kg: 4, care: 'easy',
    tags: ['traditional', 'rustic'], sup: CN2,
    ill: { form: 'bushy', color: '#4a7a33', accent: '#ff8c1a' },
    spec: {
      species: 'Nyctanthes arbor-tristis', min_sun_hours: 5, max_sun_hours: 8, water_every_days: 3,
      mature_height_cm: 200, mature_spread_cm: 120, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: false,
      edible: false, fragrant: true, seasons: ['all'], pot_size_in: 16,
    },
  }),
  plant(38, {
    en: 'Madhumalati (Rangoon creeper)', bn: 'মধুমালতী',
    dEn: 'Vigorous climber with fragrant pink-red clusters; give it a trellis.',
    dBn: 'সুগন্ধি গোলাপি-লাল থোকা ফুলের জোরালো লতা; মাচা বা ট্রেলিস দিন।',
    price: 300, cost: 185, stock: 25, kg: 3, care: 'easy',
    tags: ['traditional', 'tropical'], sup: DN4,
    ill: { form: 'climber', color: '#3f7f30', accent: '#e8476b' },
    spec: {
      species: 'Combretum indicum', min_sun_hours: 5, max_sun_hours: 10, water_every_days: 3,
      mature_height_cm: 300, mature_spread_cm: 150, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: true, seasons: ['all'], pot_size_in: 14,
    },
  }),
  plant(39, {
    en: 'Aparajita (butterfly pea)', bn: 'অপরাজিতা',
    dEn: 'Quick climber with deep-blue flowers that brew a herbal tea.',
    dBn: 'দ্রুত বাড়ে এমন লতা; গাঢ় নীল ফুল দিয়ে ভেষজ চা হয়।',
    price: 120, cost: 75, stock: 45, kg: 1, care: 'easy',
    tags: ['traditional', 'colorful'], sup: DN3,
    ill: { form: 'climber', color: '#4a8a3a', accent: '#2445c8' },
    spec: {
      species: 'Clitoria ternatea', min_sun_hours: 5, max_sun_hours: 8, water_every_days: 3,
      mature_height_cm: 250, mature_spread_cm: 60, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: true, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(40, {
    en: 'Kamini (orange jasmine)', bn: 'কামিনী',
    dEn: 'Glossy shrub that bursts into sweet white flowers after rain.',
    dBn: 'চকচকে পাতার ঝোপ; বৃষ্টির পর মিষ্টি গন্ধের সাদা ফুলে ভরে যায়।',
    price: 350, cost: 215, stock: 20, kg: 3, care: 'easy',
    tags: ['traditional'], sup: CN2,
    ill: { form: 'bushy', color: '#2f6a2a', accent: '#fffdf2' },
    spec: {
      species: 'Murraya paniculata', min_sun_hours: 4, max_sun_hours: 8, water_every_days: 3,
      mature_height_cm: 150, mature_spread_cm: 80, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: true, seasons: ['all'], pot_size_in: 12,
    },
  }),
  plant(41, {
    en: 'Gondhoraj (gardenia)', bn: 'গন্ধরাজ',
    dEn: 'Creamy, heavily scented blooms; likes acidic soil and morning sun.',
    dBn: 'ঘন সুগন্ধি ক্রিম-সাদা ফুল; অম্লীয় মাটি ও সকালের রোদ পছন্দ করে।',
    price: 400, cost: 250, stock: 18, kg: 3, care: 'moderate',
    tags: ['traditional'], sup: DN4,
    ill: { form: 'bushy', color: '#1f5a2a', accent: '#fffdf0' },
    spec: {
      species: 'Gardenia jasminoides', min_sun_hours: 4, max_sun_hours: 6, water_every_days: 3,
      mature_height_cm: 120, mature_spread_cm: 80, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: true, seasons: ['all'], pot_size_in: 12,
    },
  }),
  plant(42, {
    en: 'Hasnahena (night-blooming jasmine)', bn: 'হাসনাহেনা',
    dEn: 'Greenish flowers with a powerful night scent; every part of the plant is toxic.',
    dBn: 'সবুজাভ ফুল রাতে তীব্র গন্ধ ছড়ায়; গাছের সব অংশই বিষাক্ত।',
    price: 250, cost: 155, stock: 22, kg: 3, care: 'easy',
    tags: ['traditional', 'rustic'], sup: CN1,
    ill: { form: 'bushy', color: '#4a8a3f', accent: '#e8f0c0' },
    spec: {
      species: 'Cestrum nocturnum', min_sun_hours: 4, max_sun_hours: 8, water_every_days: 3,
      mature_height_cm: 200, mature_spread_cm: 100, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: true, seasons: ['all'], pot_size_in: 14,
    },
  }),
  plant(43, {
    en: 'Zinnia', bn: 'জিনিয়া',
    dEn: 'Pet-safe, sun-hungry annual in every colour; great for cutting.',
    dBn: 'পোষা-নিরাপদ, রোদপ্রিয় মৌসুমি ফুল, নানা রঙের; ফুলদানিতে সাজানোর জন্য দারুণ।',
    price: 90, cost: 55, stock: 55, kg: 0.8, care: 'easy',
    tags: ['colorful', 'boho'], sup: DN3,
    ill: { form: 'flowering', color: '#4a8a35', accent: '#ff4f6d' },
    spec: {
      species: 'Zinnia elegans', min_sun_hours: 6, max_sun_hours: 10, water_every_days: 3,
      mature_height_cm: 60, mature_spread_cm: 30, indoor_ok: false, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: true,
      edible: false, fragrant: false, seasons: ['winter', 'spring', 'summer'], pot_size_in: 8,
    },
  }),
  plant(44, {
    en: 'Dwarf sunflower', bn: 'বামন সূর্যমুখী',
    dEn: 'Pot-sized sunflower for full sun; blooms about 60 days from sowing.',
    dBn: 'পূর্ণ রোদের জন্য টবে মানানসই সূর্যমুখী; বপনের প্রায় ৬০ দিনে ফুল আসে।',
    price: 120, cost: 75, stock: 35, kg: 1.2, care: 'easy',
    tags: ['colorful', 'rustic'], sup: DN3,
    ill: { form: 'flowering', color: '#4f8a2a', accent: '#ffc20e' },
    spec: {
      species: 'Helianthus annuus (dwarf cultivar)', min_sun_hours: 6, max_sun_hours: 10, water_every_days: 2,
      mature_height_cm: 60, mature_spread_cm: 30, indoor_ok: false, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['winter', 'spring'], pot_size_in: 10,
    },
  }),
  plant(45, {
    en: 'Chandramallika (chrysanthemum)', bn: 'চন্দ্রমল্লিকা',
    dEn: 'Pom-pom winter blooms in yellow, white and maroon; pinch tips for a bushier plant.',
    dBn: 'হলুদ, সাদা ও মেরুন রঙের গোলাকার শীতের ফুল; ঝোপালো করতে ডগা ছেঁটে দিন।',
    price: 180, cost: 110, stock: 30, kg: 1.5, care: 'moderate',
    tags: ['traditional', 'colorful'], sup: DN2,
    ill: { form: 'flowering', color: '#3a6e30', accent: '#f7d21e' },
    spec: {
      species: 'Chrysanthemum morifolium', min_sun_hours: 5, max_sun_hours: 8, water_every_days: 2,
      mature_height_cm: 50, mature_spread_cm: 40, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['winter'], pot_size_in: 10,
    },
  }),
  plant(46, {
    en: 'Dahlia', bn: 'ডালিয়া',
    dEn: 'Dinner-plate winter blooms; stake tall stems and shelter from strong wind.',
    dBn: 'থালার মতো বড় শীতের ফুল; লম্বা ডাঁটায় খুঁটি দিন ও জোরালো বাতাস থেকে আড়াল করুন।',
    price: 220, cost: 135, stock: 0, kg: 2, care: 'moderate',
    tags: ['colorful', 'traditional'], sup: DN2,
    ill: { form: 'flowering', color: '#3a6b2f', accent: '#b5179e' },
    spec: {
      species: 'Dahlia pinnata (hybrid)', min_sun_hours: 6, max_sun_hours: 8, water_every_days: 2,
      mature_height_cm: 90, mature_spread_cm: 50, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['winter'], pot_size_in: 12,
    },
  }),
  plant(47, {
    en: 'Petunia', bn: 'পিটুনিয়া',
    dEn: 'Pet-safe trailing winter colour for railings and hanging baskets.',
    dBn: 'রেলিং ও ঝুলন্ত টবের জন্য পোষা-নিরাপদ, ঝুলে পড়া শীতের ফুল।',
    price: 120, cost: 75, stock: 40, kg: 0.7, care: 'easy',
    tags: ['colorful', 'boho'], sup: DN3,
    ill: { form: 'flowering', color: '#4f8f3a', accent: '#9b2fae' },
    spec: {
      species: 'Petunia × atkinsiana', min_sun_hours: 5, max_sun_hours: 8, water_every_days: 2,
      mature_height_cm: 25, mature_spread_cm: 40, indoor_ok: false, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: false,
      edible: false, fragrant: false, seasons: ['winter'], pot_size_in: 8,
    },
  }),

  // ── Edible ────────────────────────────────────────────────────────────
  plant(48, {
    en: 'Tulsi (holy basil)', bn: 'তুলসী',
    dEn: 'Hardy, aromatic and pet-safe; pinch off flower spikes to keep leaves coming.',
    dBn: 'সহনশীল, সুগন্ধি ও পোষা-নিরাপদ; নতুন পাতা পেতে মঞ্জরি ছেঁটে দিন।',
    price: 80, cost: 50, stock: 70, kg: 0.8, care: 'easy',
    tags: ['traditional'], sup: DN3,
    ill: { form: 'herb', color: '#3f7f2f', accent: '#7a3f6a' },
    spec: {
      species: 'Ocimum tenuiflorum', min_sun_hours: 5, max_sun_hours: 8, water_every_days: 2,
      mature_height_cm: 60, mature_spread_cm: 40, indoor_ok: false, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: true, fragrant: true, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(49, {
    en: 'Sweet basil', bn: 'সুইট বেসিল',
    dEn: 'Pet-safe cooking basil; harvest often and shelter it from heavy rain.',
    dBn: 'রান্নার জন্য পোষা-নিরাপদ বেসিল; ঘন ঘন পাতা তুলুন ও ভারী বৃষ্টি থেকে আড়াল করুন।',
    price: 100, cost: 60, stock: 45, kg: 0.6, care: 'easy',
    tags: ['modern'], sup: DN3,
    ill: { form: 'herb', color: '#5cb03c', accent: '#e8f5d0' },
    spec: {
      species: 'Ocimum basilicum', min_sun_hours: 5, max_sun_hours: 8, water_every_days: 2,
      mature_height_cm: 45, mature_spread_cm: 30, indoor_ok: false, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: false,
      edible: true, fragrant: true, seasons: ['all'], pot_size_in: 6,
    },
  }),
  plant(50, {
    en: 'Pudina (mint)', bn: 'পুদিনা',
    dEn: 'Spreads fast in its own pot; tolerates part shade and loves moist soil.',
    dBn: 'নিজের টবে দ্রুত ছড়ায়; আংশিক ছায়া সহ্য করে আর ভেজা মাটি ভালোবাসে।',
    price: 80, cost: 50, stock: 60, kg: 0.7, care: 'easy',
    tags: ['rustic'], sup: DN3,
    ill: { form: 'herb', color: '#4caf50', accent: '#a5d6a7' },
    spec: {
      species: 'Mentha spicata', min_sun_hours: 3, max_sun_hours: 6, water_every_days: 1,
      mature_height_cm: 30, mature_spread_cm: 60, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: false, coastal_ok: false,
      edible: true, fragrant: true, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(51, {
    en: 'Dhonia (coriander)', bn: 'ধনিয়া',
    dEn: 'Fresh coriander leaves for winter cooking; bolts quickly once it turns hot.',
    dBn: 'শীতের রান্নার জন্য তাজা ধনেপাতা; গরম পড়লেই দ্রুত ফুল এসে যায়।',
    price: 80, cost: 50, stock: 40, kg: 0.7, care: 'easy',
    tags: ['traditional'], sup: DN3,
    ill: { form: 'herb', color: '#5fae3f', accent: '#f5f5f5' },
    spec: {
      species: 'Coriandrum sativum', min_sun_hours: 4, max_sun_hours: 6, water_every_days: 2,
      mature_height_cm: 30, mature_spread_cm: 15, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: false,
      edible: true, fragrant: true, seasons: ['winter'], pot_size_in: 8,
    },
  }),
  plant(52, {
    en: 'Thankuni (Indian pennywort)', bn: 'থানকুনি',
    dEn: 'Shade-tolerant creeping herb for bhorta and tonics; keep the soil wet.',
    dBn: 'ছায়া সহনশীল লতানো ভেষজ, ভর্তা ও রসের জন্য; মাটি ভেজা রাখুন।',
    price: 80, cost: 50, stock: 35, kg: 0.7, care: 'easy',
    tags: ['traditional'], sup: DN3,
    ill: { form: 'herb', color: '#3f9a3f', accent: '#8fd16a' },
    spec: {
      species: 'Centella asiatica', min_sun_hours: 2, max_sun_hours: 5, water_every_days: 1,
      mature_height_cm: 15, mature_spread_cm: 50, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: false,
      edible: true, fragrant: false, seasons: ['all'], pot_size_in: 8,
    },
  }),
  plant(53, {
    en: 'Lemongrass', bn: 'লেমনগ্রাস',
    dEn: 'Citrusy grass for tea and curries; thrives in full sun and heat.',
    dBn: 'চা ও তরকারির জন্য লেবু-গন্ধি ঘাস; পূর্ণ রোদ ও গরমে ভালো বাড়ে।',
    price: 120, cost: 75, stock: 40, kg: 1.5, care: 'easy',
    tags: ['tropical', 'rustic'], sup: CN1,
    ill: { form: 'herb', color: '#7cb342', accent: '#d4e157' },
    spec: {
      species: 'Cymbopogon citratus', min_sun_hours: 6, max_sun_hours: 10, water_every_days: 3,
      mature_height_cm: 100, mature_spread_cm: 60, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: true, fragrant: true, seasons: ['all'], pot_size_in: 12,
    },
  }),
  plant(54, {
    en: 'Kancha morich (green chili)', bn: 'কাঁচা মরিচ',
    dEn: 'Plenty of chilies from one pot; water evenly to avoid flower drop.',
    dBn: 'এক টবেই প্রচুর মরিচ; ফুল ঝরা এড়াতে নিয়মিত সমানভাবে পানি দিন।',
    price: 100, cost: 60, stock: 50, kg: 1, care: 'easy',
    tags: ['traditional'], sup: DN3,
    ill: { form: 'vegetable', color: '#3a7d2c', accent: '#d32f2f' },
    spec: {
      species: 'Capsicum frutescens', min_sun_hours: 6, max_sun_hours: 8, water_every_days: 2,
      mature_height_cm: 60, mature_spread_cm: 45, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: true,
      edible: true, fragrant: false, seasons: ['all'], pot_size_in: 10,
    },
  }),
  plant(55, {
    en: 'Cherry tomato', bn: 'চেরি টমেটো',
    dEn: 'Sweet bite-size tomatoes in winter; needs a stake and full sun every day.',
    dBn: 'শীতে মিষ্টি ছোট টমেটো; খুঁটি ও প্রতিদিন পূর্ণ রোদ দরকার।',
    price: 120, cost: 75, stock: 30, kg: 1.2, care: 'moderate',
    tags: ['rustic'], sup: DN3,
    ill: { form: 'vegetable', color: '#3f7f2f', accent: '#e53935' },
    spec: {
      species: 'Solanum lycopersicum var. cerasiforme', min_sun_hours: 6, max_sun_hours: 8, water_every_days: 1,
      mature_height_cm: 120, mature_spread_cm: 60, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: false,
      edible: true, fragrant: false, seasons: ['winter'], pot_size_in: 12,
    },
  }),
  plant(56, {
    en: 'Kagoji lebu (lime)', bn: 'কাগজি লেবু',
    dEn: 'Fragrant leaves and thin-skinned limes year-round in a large sunny pot.',
    dBn: 'সুগন্ধি পাতা; বড় টবে রোদ পেলে সারা বছর পাতলা খোসার লেবু ধরে।',
    price: 450, cost: 280, stock: 25, kg: 5, care: 'moderate',
    tags: ['traditional'], sup: CN2,
    ill: { form: 'bushy', color: '#2f6e2a', accent: '#c0d84a' },
    spec: {
      species: 'Citrus aurantiifolia', min_sun_hours: 6, max_sun_hours: 8, water_every_days: 3,
      mature_height_cm: 150, mature_spread_cm: 100, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: true, fragrant: true, seasons: ['all'], pot_size_in: 14,
    },
  }),
  plant(57, {
    en: 'Curry leaf', bn: 'কারি পাতা',
    dEn: 'Aromatic leaves for tempering dal and curries; slow at first, then steady.',
    dBn: 'ডাল ও তরকারির ফোড়নের জন্য সুগন্ধি পাতা; শুরুতে ধীরে বাড়ে, পরে নিয়মিত।',
    price: 200, cost: 125, stock: 25, kg: 2.5, care: 'easy',
    tags: ['traditional'], sup: CN2,
    ill: { form: 'bushy', color: '#2e6b2a', accent: '#6aa84f' },
    spec: {
      species: 'Murraya koenigii', min_sun_hours: 5, max_sun_hours: 8, water_every_days: 4,
      mature_height_cm: 150, mature_spread_cm: 70, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: true, fragrant: true, seasons: ['all'], pot_size_in: 12,
    },
  }),
  plant(58, {
    en: 'Lal shak (red amaranth)', bn: 'লাল শাক',
    dEn: 'Fast leafy green ready in about 4 weeks; resow for a steady supply.',
    dBn: 'প্রায় ৪ সপ্তাহে খাওয়ার উপযোগী শাক; নিয়মিত পেতে বারবার বুনুন।',
    price: 70, cost: 45, stock: 50, kg: 1, care: 'easy', unit: 'tray',
    tags: ['traditional'], sup: DN3,
    ill: { form: 'vegetable', color: '#8e2445', accent: '#4f8a2a' },
    spec: {
      species: 'Amaranthus tricolor', min_sun_hours: 5, max_sun_hours: 8, water_every_days: 1,
      mature_height_cm: 40, mature_spread_cm: 20, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: true,
      edible: true, fragrant: false, seasons: ['all'], pot_size_in: 10,
    },
  }),
  plant(59, {
    en: 'Palong shak (spinach)', bn: 'পালং শাক',
    dEn: 'Pet-safe winter green; pick the outer leaves and it keeps producing.',
    dBn: 'পোষা-নিরাপদ শীতের শাক; বাইরের পাতা তুললে আবার নতুন পাতা আসে।',
    price: 80, cost: 50, stock: 40, kg: 1, care: 'easy', unit: 'tray',
    tags: ['traditional'], sup: DN3,
    ill: { form: 'vegetable', color: '#2e7d32', accent: '#66bb6a' },
    spec: {
      species: 'Spinacia oleracea', min_sun_hours: 4, max_sun_hours: 6, water_every_days: 1,
      mature_height_cm: 30, mature_spread_cm: 20, indoor_ok: false, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: false,
      edible: true, fragrant: false, seasons: ['winter'], pot_size_in: 10,
    },
  }),
  plant(60, {
    en: 'Pui shak (Malabar spinach)', bn: 'পুঁই শাক',
    dEn: 'Heat-loving climbing green that races up a trellis in monsoon.',
    dBn: 'গরমপ্রিয় লতানো শাক, বর্ষায় মাচা বেয়ে দ্রুত বাড়ে।',
    price: 80, cost: 50, stock: 40, kg: 1, care: 'easy',
    tags: ['traditional', 'rustic'], sup: CN1,
    ill: { form: 'climber', color: '#3a8f3a', accent: '#9c2f6a' },
    spec: {
      species: 'Basella alba', min_sun_hours: 5, max_sun_hours: 8, water_every_days: 2,
      mature_height_cm: 250, mature_spread_cm: 60, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: true, fragrant: false, seasons: ['summer', 'monsoon'], pot_size_in: 10,
    },
  }),
  plant(61, {
    en: 'Dherosh (okra)', bn: 'ঢেঁড়স',
    dEn: 'Upright summer vegetable; pick the pods young every other day.',
    dBn: 'খাড়া গ্রীষ্মকালীন সবজি; একদিন পরপর কচি ঢেঁড়স তুলুন।',
    price: 80, cost: 50, stock: 35, kg: 1, care: 'easy',
    tags: ['rustic'], sup: DN3,
    ill: { form: 'vegetable', color: '#4a8a35', accent: '#f5e663' },
    spec: {
      species: 'Abelmoschus esculentus', min_sun_hours: 6, max_sun_hours: 10, water_every_days: 2,
      mature_height_cm: 120, mature_spread_cm: 50, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: true, heat_tolerant: true, coastal_ok: true,
      edible: true, fragrant: false, seasons: ['summer', 'monsoon'], pot_size_in: 12,
    },
  }),
  plant(62, {
    en: 'Begun (brinjal)', bn: 'বেগুন',
    dEn: 'Productive in a deep pot in full sun; watch for shoot-and-fruit borers.',
    dBn: 'গভীর টব ও পূর্ণ রোদে ভালো ফলন; ডগা ও ফল ছিদ্রকারী পোকার দিকে নজর রাখুন।',
    price: 100, cost: 60, stock: 30, kg: 1.2, care: 'moderate',
    tags: ['rustic'], sup: DN3,
    ill: { form: 'vegetable', color: '#3f6e2f', accent: '#5b2a6e' },
    spec: {
      species: 'Solanum melongena', min_sun_hours: 6, max_sun_hours: 8, water_every_days: 2,
      mature_height_cm: 90, mature_spread_cm: 60, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: true, coastal_ok: false,
      edible: true, fragrant: false, seasons: ['winter', 'summer'], pot_size_in: 14,
    },
  }),
  plant(63, {
    en: 'Strawberry', bn: 'স্ট্রবেরি',
    dEn: 'Pet-safe winter fruit for a sunny, airy spot; keep berries off wet soil.',
    dBn: 'রোদেলা খোলামেলা জায়গার জন্য পোষা-নিরাপদ শীতের ফল; ফল ভেজা মাটি থেকে দূরে রাখুন।',
    price: 250, cost: 155, stock: 0, kg: 0.8, care: 'moderate',
    tags: ['colorful'], sup: DN4,
    ill: { form: 'vegetable', color: '#3f8f3a', accent: '#e8283c' },
    spec: {
      species: 'Fragaria × ananassa', min_sun_hours: 6, max_sun_hours: 8, water_every_days: 1,
      mature_height_cm: 20, mature_spread_cm: 30, indoor_ok: false, outdoor_ok: true,
      pet_safe: true, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: false,
      edible: true, fragrant: false, seasons: ['winter'], pot_size_in: 8,
    },
  }),
  plant(64, {
    en: 'Capsicum (bell pepper)', bn: 'ক্যাপসিকাম',
    dEn: 'Winter bell peppers that need rich soil, full sun and steady watering.',
    dBn: 'শীতের মিষ্টি মরিচ; উর্বর মাটি, পূর্ণ রোদ ও নিয়মিত পানি দরকার।',
    price: 150, cost: 95, stock: 25, kg: 1.2, care: 'moderate',
    tags: ['modern'], sup: DN4,
    ill: { form: 'vegetable', color: '#3a7a2f', accent: '#f2c12e' },
    spec: {
      species: 'Capsicum annuum', min_sun_hours: 6, max_sun_hours: 8, water_every_days: 2,
      mature_height_cm: 60, mature_spread_cm: 45, indoor_ok: false, outdoor_ok: true,
      pet_safe: false, monsoon_tolerant: false, heat_tolerant: false, coastal_ok: false,
      edible: true, fragrant: false, seasons: ['winter'], pot_size_in: 12,
    },
  }),
];

// ═══════════════════════════════════════════════════════════════════════
// POTS & PLANTERS
// For long railing / wall planters, diameter_in is the planter's WIDTH
// (soil depth/width available per plant); the length is in the name.
// ═══════════════════════════════════════════════════════════════════════

const plasticDesc = {
  dEn: 'Light, budget nursery-style pot with drainage holes.',
  dBn: 'হালকা ও সাশ্রয়ী টব, তলায় পানি বের হওয়ার ছিদ্র আছে।',
};
const clayDesc = {
  dEn: 'Breathable terracotta that keeps roots cool; dries out faster than plastic.',
  dBn: 'বাতাস চলাচলকারী পোড়ামাটির টব, শিকড় ঠান্ডা রাখে; প্লাস্টিকের চেয়ে দ্রুত শুকায়।',
};
const cementDesc = {
  dEn: 'Raw grey cement that will not tip over in storm winds — check floor load first.',
  dBn: 'ধূসর সিমেন্টের টব, ঝড়ো বাতাসেও উল্টে পড়ে না — আগে মেঝের ভার বহন ক্ষমতা দেখে নিন।',
};

const pots: Product[] = [
  pot(1, {
    en: 'Plastic pot 6"', bn: 'প্লাস্টিকের টব ৬ ইঞ্চি', ...plasticDesc,
    price: 70, cost: 45, stock: 80, kg: 0.12, tags: ['minimal'], sup: DP1,
    ill: { form: 'pot', color: '#3a3a3a' },
    spec: { material: 'plastic', diameter_in: 6, height_in: 5, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(2, {
    en: 'Plastic pot 8"', bn: 'প্লাস্টিকের টব ৮ ইঞ্চি', ...plasticDesc,
    price: 120, cost: 75, stock: 80, kg: 0.25, tags: ['minimal'], sup: DP1,
    ill: { form: 'pot', color: '#3a3a3a' },
    spec: { material: 'plastic', diameter_in: 8, height_in: 7, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(3, {
    en: 'Plastic pot 10"', bn: 'প্লাস্টিকের টব ১০ ইঞ্চি', ...plasticDesc,
    price: 180, cost: 110, stock: 70, kg: 0.4, tags: ['minimal'], sup: DP1,
    ill: { form: 'pot', color: '#3a3a3a' },
    spec: { material: 'plastic', diameter_in: 10, height_in: 9, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(4, {
    en: 'Clay (terracotta) pot 6"', bn: 'মাটির টব ৬ ইঞ্চি', ...clayDesc,
    price: 110, cost: 70, stock: 60, kg: 1.0, tags: ['traditional', 'rustic'], sup: CP1,
    ill: { form: 'pot', color: '#c8643c' },
    spec: { material: 'clay', diameter_in: 6, height_in: 5, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(5, {
    en: 'Clay (terracotta) pot 8"', bn: 'মাটির টব ৮ ইঞ্চি', ...clayDesc,
    price: 160, cost: 100, stock: 60, kg: 1.8, tags: ['traditional', 'rustic'], sup: CP1,
    ill: { form: 'pot', color: '#c8643c' },
    spec: { material: 'clay', diameter_in: 8, height_in: 7, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(6, {
    en: 'Clay (terracotta) pot 10"', bn: 'মাটির টব ১০ ইঞ্চি', ...clayDesc,
    price: 220, cost: 140, stock: 50, kg: 3.0, tags: ['traditional', 'rustic'], sup: CP1,
    ill: { form: 'pot', color: '#c8643c' },
    spec: { material: 'clay', diameter_in: 10, height_in: 9, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(7, {
    en: 'Clay (terracotta) pot 12"', bn: 'মাটির টব ১২ ইঞ্চি', ...clayDesc,
    price: 320, cost: 200, stock: 40, kg: 4.5, tags: ['traditional', 'rustic'], sup: CP1,
    ill: { form: 'pot', color: '#c8643c' },
    spec: { material: 'clay', diameter_in: 12, height_in: 11, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(8, {
    en: 'Glazed ceramic pot 8" (teal)', bn: 'চকচকে সিরামিকের টব ৮ ইঞ্চি (টিল)',
    dEn: 'Deep-teal glazed ceramic for indoor rooms or covered balconies.',
    dBn: 'ঘর বা ছাউনি দেওয়া বারান্দার জন্য গাঢ় টিল রঙের চকচকে সিরামিক টব।',
    price: 750, cost: 470, stock: 25, kg: 2.0, tags: ['modern', 'minimal'], sup: DP2,
    ill: { form: 'pot', color: '#1f6f78', accent: '#e6f2f2' },
    spec: { material: 'ceramic', diameter_in: 8, height_in: 7, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(9, {
    en: 'Glazed ceramic pot 12" (white)', bn: 'চকচকে সিরামিকের টব ১২ ইঞ্চি (সাদা)',
    dEn: 'Glossy white glaze, heavy enough to stay put in monsoon wind.',
    dBn: 'চকচকে সাদা টব, বর্ষার বাতাসেও নড়ে না এমন ভারী।',
    price: 1400, cost: 880, stock: 18, kg: 5.0, tags: ['modern', 'minimal'], sup: DP2,
    ill: { form: 'pot', color: '#f2efe8', accent: '#c9c4b8' },
    spec: { material: 'ceramic', diameter_in: 12, height_in: 11, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(10, {
    en: 'Glazed ceramic pot 16" (navy)', bn: 'চকচকে সিরামিকের টব ১৬ ইঞ্চি (নেভি)',
    dEn: 'Statement navy planter for a palm or monstera on a covered balcony.',
    dBn: 'ছাউনি দেওয়া বারান্দায় পাম বা মনস্টেরার জন্য আকর্ষণীয় নেভি রঙের টব।',
    price: 2600, cost: 1650, stock: 8, kg: 10, tags: ['modern'], sup: DP2,
    ill: { form: 'pot', color: '#2a3f6b', accent: '#c9a54a' },
    spec: { material: 'ceramic', diameter_in: 16, height_in: 14, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(11, {
    en: 'Fiberglass planter 18"', bn: 'ফাইবারগ্লাস প্ল্যান্টার ১৮ ইঞ্চি',
    dEn: 'Large yet lightweight and UV-stable — ideal where floor load matters.',
    dBn: 'বড় কিন্তু হালকা ও রোদে টেকসই — যেখানে মেঝের ভার নিয়ে চিন্তা আছে সেখানে আদর্শ।',
    price: 3800, cost: 2400, stock: 10, kg: 4, tags: ['modern', 'minimal'], sup: DP2,
    ill: { form: 'pot', color: '#3b3b3b' },
    spec: { material: 'fiberglass', diameter_in: 18, height_in: 18, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(12, {
    en: 'Fiberglass planter 24"', bn: 'ফাইবারগ্লাস প্ল্যান্টার ২৪ ইঞ্চি',
    dEn: 'Tall feature planter for small trees, at a fraction of the weight of cement.',
    dBn: 'ছোট গাছের জন্য লম্বা প্ল্যান্টার, সিমেন্টের তুলনায় ওজন অনেক কম।',
    price: 6200, cost: 3900, stock: 0, kg: 7, tags: ['modern', 'minimal'], sup: DP2,
    ill: { form: 'pot', color: '#8a8a85' },
    spec: { material: 'fiberglass', diameter_in: 24, height_in: 22, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(13, {
    en: 'Cement pot 12"', bn: 'সিমেন্টের টব ১২ ইঞ্চি', ...cementDesc,
    price: 600, cost: 370, stock: 25, kg: 9, tags: ['rustic', 'modern'], sup: DP2,
    ill: { form: 'pot', color: '#9e9e96' },
    spec: { material: 'cement', diameter_in: 12, height_in: 11, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(14, {
    en: 'Cement pot 18"', bn: 'সিমেন্টের টব ১৮ ইঞ্চি', ...cementDesc,
    price: 1300, cost: 820, stock: 15, kg: 18, tags: ['rustic', 'modern'], sup: DP2,
    ill: { form: 'pot', color: '#9e9e96' },
    spec: { material: 'cement', diameter_in: 18, height_in: 16, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(15, {
    en: 'Cement planter 24"', bn: 'সিমেন্টের প্ল্যান্টার ২৪ ইঞ্চি', ...cementDesc,
    price: 2400, cost: 1500, stock: 6, kg: 28, tags: ['rustic', 'modern'], sup: DP2,
    ill: { form: 'pot', color: '#8f8f88' },
    spec: { material: 'cement', diameter_in: 24, height_in: 20, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(16, {
    en: 'Recycled plastic pot 10"', bn: 'রিসাইকেল প্লাস্টিকের টব ১০ ইঞ্চি',
    dEn: 'Made from recycled plastic; tough and UV-resistant.',
    dBn: 'পুনর্ব্যবহৃত প্লাস্টিকে তৈরি; মজবুত ও রোদে টেকসই।',
    price: 160, cost: 100, stock: 50, kg: 0.45, tags: ['minimal', 'rustic'], sup: DP1,
    ill: { form: 'pot', color: '#4a6b3a' },
    spec: { material: 'recycled', diameter_in: 10, height_in: 9, drainage: true, mount: 'floor', self_watering: false },
  }),
  pot(17, {
    en: 'Coir hanging basket 10"', bn: 'নারকেলের ছোবড়ার ঝুলন্ত টব ১০ ইঞ্চি',
    dEn: 'Natural coir liner with chains; drains freely and suits ferns.',
    dBn: 'শিকলসহ প্রাকৃতিক ছোবড়ার ঝুলন্ত টব; পানি সহজে বের হয়, ফার্নের জন্য মানানসই।',
    price: 320, cost: 200, stock: 30, kg: 0.7, tags: ['boho', 'rustic'], sup: CP1,
    ill: { form: 'hanging', color: '#8b5a2b' },
    spec: { material: 'coir', diameter_in: 10, height_in: 6, drainage: true, mount: 'hanging', self_watering: false },
  }),
  pot(18, {
    en: 'Hanging plastic pot 8" with hook', bn: 'হুকসহ ঝুলন্ত প্লাস্টিকের টব ৮ ইঞ্চি',
    dEn: 'Hook and clip-on saucer included, so drips stay off the floor.',
    dBn: 'হুক ও আটকানো ট্রে সহ, তাই পানি মেঝেতে পড়ে না।',
    price: 180, cost: 110, stock: 45, kg: 0.3, tags: ['minimal'], sup: DP1,
    ill: { form: 'hanging', color: '#e8e6e1' },
    spec: { material: 'plastic', diameter_in: 8, height_in: 6, drainage: true, mount: 'hanging', self_watering: false },
  }),
  pot(19, {
    en: 'Railing planter 24" long (plastic)', bn: 'রেলিং প্ল্যান্টার ২৪ ইঞ্চি লম্বা (প্লাস্টিক)',
    dEn: '60 cm trough that hooks over the grill — ideal for a row of herbs.',
    dBn: '৬০ সেমি লম্বা ট্রফ, গ্রিলে আটকে যায় — এক সারি ভেষজের জন্য আদর্শ।',
    price: 450, cost: 280, stock: 40, kg: 0.9, tags: ['minimal', 'modern'], sup: DP1,
    ill: { form: 'planter-long', color: '#6b8e23' },
    spec: { material: 'plastic', diameter_in: 8, height_in: 7, drainage: true, mount: 'railing', self_watering: false },
  }),
  pot(20, {
    en: 'Metal railing planter 30" long', bn: 'ধাতব রেলিং প্ল্যান্টার ৩০ ইঞ্চি লম্বা',
    dEn: 'Powder-coated steel trough with adjustable hooks, 75 cm long.',
    dBn: 'সামঞ্জস্যযোগ্য হুকসহ পাউডার-কোটেড স্টিলের ট্রফ, ৭৫ সেমি লম্বা।',
    price: 1100, cost: 690, stock: 20, kg: 2.5, tags: ['modern', 'minimal'], sup: DP2,
    ill: { form: 'planter-long', color: '#2f3a33' },
    spec: { material: 'metal', diameter_in: 8, height_in: 7, drainage: true, mount: 'railing', self_watering: false },
  }),
  pot(21, {
    en: 'Felt wall pocket planter (6 pockets)', bn: 'দেয়ালে ঝোলানো পকেট প্ল্যান্টার (৬ পকেট)',
    dEn: 'Six-pocket panel of recycled PET felt that turns a bare wall green.',
    dBn: 'পুনর্ব্যবহৃত পিইটি ফেল্টের ছয় পকেটের প্যানেল, ফাঁকা দেয়াল সবুজ করে তোলে।',
    price: 550, cost: 340, stock: 30, kg: 0.6, tags: ['boho', 'minimal'], sup: DP1,
    ill: { form: 'planter-long', color: '#5a5f55' },
    spec: { material: 'recycled', diameter_in: 6, height_in: 7, drainage: true, mount: 'wall', self_watering: false },
  }),
  pot(22, {
    en: 'Self-watering pot 8"', bn: 'সেলফ-ওয়াটারিং টব ৮ ইঞ্চি',
    dEn: 'Built-in reservoir waters for up to 7 days — good for busy owners and travel.',
    dBn: 'ভেতরের পানির আধার ৭ দিন পর্যন্ত পানি দেয় — ব্যস্ত মানুষ ও ভ্রমণের জন্য ভালো।',
    price: 450, cost: 280, stock: 35, kg: 0.5, tags: ['modern', 'minimal'], sup: DP1,
    ill: { form: 'pot', color: '#e8e6e1', accent: '#6aa84f' },
    spec: { material: 'plastic', diameter_in: 8, height_in: 8, drainage: true, mount: 'floor', self_watering: true },
  }),
  pot(23, {
    en: 'Self-watering pot 12"', bn: 'সেলফ-ওয়াটারিং টব ১২ ইঞ্চি',
    dEn: 'Larger reservoir pot with a water-level gauge for palms and shrubs.',
    dBn: 'পানির মাত্রা দেখার নির্দেশকসহ বড় আধারের টব, পাম ও ঝোপজাতীয় গাছের জন্য।',
    price: 850, cost: 530, stock: 20, kg: 1.1, tags: ['modern', 'minimal'], sup: DP1,
    ill: { form: 'pot', color: '#2f2f33', accent: '#6aa84f' },
    spec: { material: 'plastic', diameter_in: 12, height_in: 11, drainage: true, mount: 'floor', self_watering: true },
  }),
];

// ═══════════════════════════════════════════════════════════════════════
// HARDWARE
// ═══════════════════════════════════════════════════════════════════════

const hardware: Product[] = [
  hw(1, {
    en: 'Bamboo trellis (120 × 60 cm)', bn: 'বাঁশের ট্রেলিস (১২০ × ৬০ সেমি)',
    dEn: 'Natural bamboo lattice for climbers like aparajita and pui shak.',
    dBn: 'অপরাজিতা ও পুঁই শাকের মতো লতার জন্য প্রাকৃতিক বাঁশের জালি।',
    price: 350, cost: 220, stock: 40, kg: 0.8, tags: ['rustic', 'traditional', 'boho'], sup: CH1,
    ill: { form: 'trellis', color: '#c2a15a' },
    spec: { kind: 'trellis', dimensions_cm: '120 x 60', load_rating_kg: 5, install_difficulty: 1, needs_power: false, needs_drilling: false },
  }),
  hw(2, {
    en: 'Metal trellis (150 × 60 cm)', bn: 'ধাতব ট্রেলিস (১৫০ × ৬০ সেমি)',
    dEn: 'Powder-coated steel frame that stands in a large pot or ties to the grill.',
    dBn: 'পাউডার-কোটেড স্টিলের ফ্রেম, বড় টবে বসানো যায় বা গ্রিলে বাঁধা যায়।',
    price: 1200, cost: 750, stock: 20, kg: 3, tags: ['modern', 'minimal'], sup: DH1,
    ill: { form: 'trellis', color: '#2f3a2f' },
    spec: { kind: 'trellis', dimensions_cm: '150 x 60', load_rating_kg: 15, install_difficulty: 2, needs_power: false, needs_drilling: false },
  }),
  hw(3, {
    en: 'Railing pot brackets (pair)', bn: 'রেলিং ব্র্যাকেট (জোড়া)',
    dEn: 'Clamp-on brackets that hold a pot over the railing without drilling.',
    dBn: 'ড্রিল ছাড়াই রেলিংয়ে আটকানো যায় এমন ব্র্যাকেট, টব ধরে রাখে।',
    price: 450, cost: 280, stock: 50, kg: 0.6, unit: 'pair', tags: ['minimal'], sup: DH1,
    ill: { form: 'tool', color: '#3a3a3a' },
    spec: { kind: 'rail', dimensions_cm: '30 x 10 (fits 2–6 cm rails)', load_rating_kg: 15, install_difficulty: 1, needs_power: false, needs_drilling: false },
  }),
  hw(4, {
    en: 'Vertical garden wall frame (12 pots)', bn: 'দেয়ালের ভার্টিক্যাল গার্ডেন ফ্রেম (১২ টব)',
    dEn: 'Steel grid with 12 pot holders that turns a 1 m wall into a garden.',
    dBn: '১২টি টব রাখার স্টিলের গ্রিড, ১ মিটার দেয়ালকে বাগানে রূপ দেয়।',
    price: 4800, cost: 3000, stock: 8, kg: 9, tags: ['modern', 'minimal'], sup: DH1,
    ill: { form: 'trellis', color: '#3a3a3a', accent: '#6aa84f' },
    spec: { kind: 'wall-mount', dimensions_cm: '120 x 90', load_rating_kg: 40, install_difficulty: 3, needs_power: false, needs_drilling: true },
  }),
  hw(5, {
    en: 'Ceiling pulley plant hanger', bn: 'সিলিং পুলি প্ল্যান্ট হ্যাঙ্গার',
    dEn: 'Lower a hanging pot to water it, then raise it back — no ladder needed.',
    dBn: 'পানি দিতে ঝুলন্ত টব নামিয়ে আবার তুলে দিন — মই লাগবে না।',
    price: 950, cost: 600, stock: 25, kg: 0.5, tags: ['modern'], sup: CH1,
    ill: { form: 'hanging', color: '#7a7a7a' },
    spec: { kind: 'hanging-system', dimensions_cm: 'drop up to 150', load_rating_kg: 10, install_difficulty: 2, needs_power: false, needs_drilling: true },
  }),
  hw(6, {
    en: 'Drip irrigation kit – small (10 pots)', bn: 'ড্রিপ সেচ কিট – ছোট (১০ টব)',
    dEn: 'Tap-fed drippers with a battery timer for up to 10 pots.',
    dBn: 'ব্যাটারি টাইমারসহ কলের পানিতে চলা ড্রিপার, ১০টি টব পর্যন্ত।',
    price: 2200, cost: 1400, stock: 15, kg: 1.2, unit: 'kit', tags: ['modern'], sup: DH1,
    ill: { form: 'irrigation', color: '#2b2b2b', accent: '#3fa9f5' },
    spec: { kind: 'irrigation', dimensions_cm: '10 m tubing, 10 drippers', install_difficulty: 2, needs_power: false, needs_drilling: false },
  }),
  hw(7, {
    en: 'Drip irrigation kit – large (25 pots, pump)', bn: 'ড্রিপ সেচ কিট – বড় (২৫ টব, পাম্প)',
    dEn: 'Bucket-fed pump kit for balconies without a tap; waters 25 pots on a schedule.',
    dBn: 'কল নেই এমন বারান্দার জন্য বালতি থেকে পাম্প করা কিট; নির্ধারিত সময়ে ২৫টি টবে পানি দেয়।',
    price: 4500, cost: 2900, stock: 8, kg: 3, unit: 'kit', tags: ['modern'], sup: DH1,
    ill: { form: 'irrigation', color: '#2b2b2b', accent: '#3fa9f5' },
    spec: { kind: 'irrigation', dimensions_cm: '25 m tubing, 25 drippers, 12 V pump', install_difficulty: 3, needs_power: true, needs_drilling: false },
  }),
  hw(8, {
    en: 'Self-watering spikes (set of 6)', bn: 'সেলফ-ওয়াটারিং স্পাইক (৬টির সেট)',
    dEn: 'Terracotta spikes fed by upturned bottles — keep pots moist over a weekend away.',
    dBn: 'উল্টানো বোতল লাগানো পোড়ামাটির স্পাইক — সপ্তাহান্তে বাইরে গেলে টব ভেজা রাখে।',
    price: 350, cost: 220, stock: 40, kg: 0.6, unit: 'set', tags: ['rustic'], sup: CH1,
    ill: { form: 'irrigation', color: '#c8643c', accent: '#3fa9f5' },
    spec: { kind: 'irrigation', dimensions_cm: '15 cm spikes', install_difficulty: 1, needs_power: false, needs_drilling: false },
  }),
  hw(9, {
    en: 'LED grow light (30 W, clip-on)', bn: 'এলইডি গ্রো লাইট (৩০ ওয়াট, ক্লিপ)',
    dEn: 'Full-spectrum clip light that lets herbs grow on a dark, north-facing balcony.',
    dBn: 'পূর্ণ বর্ণালির ক্লিপ লাইট, অন্ধকার উত্তরমুখী বারান্দাতেও ভেষজ জন্মাতে সাহায্য করে।',
    price: 2500, cost: 1600, stock: 0, kg: 0.8, tags: ['modern'], sup: DH1,
    ill: { form: 'light', color: '#2b2b2b', accent: '#c05cf2' },
    spec: { kind: 'grow-light', dimensions_cm: '2 gooseneck heads, 60 cm arms', install_difficulty: 1, needs_power: true, needs_drilling: false },
  }),
  hw(10, {
    en: 'Solar fairy lights (10 m)', bn: 'সোলার ফেয়ারি লাইট (১০ মিটার)',
    dEn: 'Charges by day and glows warm white at night — no socket needed.',
    dBn: 'দিনে চার্জ হয়, রাতে উষ্ণ সাদা আলো দেয় — প্লাগ লাগে না।',
    price: 900, cost: 560, stock: 30, kg: 0.4, tags: ['boho'], sup: CH1,
    ill: { form: 'light', color: '#5a5a5a', accent: '#f5d76e' },
    spec: { kind: 'lighting', dimensions_cm: '1000 cm, 100 LEDs', install_difficulty: 1, needs_power: false, needs_drilling: false },
  }),
  hw(11, {
    en: 'Warm string lights (10 m, plug-in)', bn: 'ওয়ার্ম স্ট্রিং লাইট (১০ মিটার, প্লাগ-ইন)',
    dEn: 'Plug-in warm-white string for cosy evenings on a covered balcony.',
    dBn: 'ছাউনি দেওয়া বারান্দায় আরামদায়ক সন্ধ্যার জন্য প্লাগ-ইন উষ্ণ সাদা আলো।',
    price: 600, cost: 380, stock: 35, kg: 0.3, tags: ['boho'], sup: DH1,
    ill: { form: 'light', color: '#5a5a5a', accent: '#ffcf7a' },
    spec: { kind: 'lighting', dimensions_cm: '1000 cm, 20 bulbs', install_difficulty: 1, needs_power: true, needs_drilling: false },
  }),
  hw(12, {
    en: 'Foldable wooden chair', bn: 'ভাঁজযোগ্য কাঠের চেয়ার',
    dEn: 'Teak-finish folding chair that stores flat when you need the floor.',
    dBn: 'সেগুন-ফিনিশের ভাঁজ করা চেয়ার, জায়গা লাগলে চ্যাপ্টা করে রাখা যায়।',
    price: 3200, cost: 2050, stock: 12, kg: 5, tags: ['rustic', 'traditional'], sup: DH1,
    ill: { form: 'seating', color: '#8b5a2b' },
    spec: { kind: 'seating', dimensions_cm: '45 x 50 x 80', load_rating_kg: 110, install_difficulty: 1, needs_power: false, needs_drilling: false },
  }),
  hw(13, {
    en: 'Cane mora stool', bn: 'বেতের মোড়া',
    dEn: 'Handwoven cane mora for evening cha on the balcony.',
    dBn: 'বারান্দায় সন্ধ্যার চায়ের জন্য হাতে বোনা বেতের মোড়া।',
    price: 1200, cost: 760, stock: 20, kg: 2, tags: ['traditional', 'boho', 'rustic'], sup: CH1,
    ill: { form: 'seating', color: '#c49a5a' },
    spec: { kind: 'seating', dimensions_cm: '40 dia x 45', load_rating_kg: 90, install_difficulty: 1, needs_power: false, needs_drilling: false },
  }),
  hw(14, {
    en: 'Artificial grass mat (per sq ft)', bn: 'কৃত্রিম ঘাসের ম্যাট (প্রতি বর্গফুট)',
    dEn: 'Soft 30 mm turf cut to size; drains through so water will not pool in monsoon.',
    dBn: 'নরম ৩০ মিমি ঘাস, মাপমতো কেটে দেওয়া হয়; পানি নিচে চলে যায়, বর্ষায় জমে না।',
    price: 65, cost: 40, stock: 80, kg: 0.25, unit: 'sq ft', tags: ['modern'], sup: DH1,
    ill: { form: 'mat', color: '#5cae3c' },
    spec: { kind: 'flooring', dimensions_cm: '30 x 30 per unit, 30 mm pile', install_difficulty: 1, needs_power: false, needs_drilling: false },
  }),
  hw(15, {
    en: 'Shade net 50% (2 × 3 m)', bn: 'শেড নেট ৫০% (২ × ৩ মিটার)',
    dEn: 'Cuts harsh west sun by half so ferns and herbs survive the summer.',
    dBn: 'পশ্চিমের কড়া রোদ অর্ধেক কমায়, যাতে ফার্ন ও ভেষজ গ্রীষ্মে টিকে থাকে।',
    price: 650, cost: 410, stock: 30, kg: 0.8, tags: ['minimal'], sup: CH1,
    ill: { form: 'mat', color: '#2f4f2f' },
    spec: { kind: 'shade', dimensions_cm: '200 x 300', install_difficulty: 2, needs_power: false, needs_drilling: false },
  }),
];

// ═══════════════════════════════════════════════════════════════════════
// ACCESSORIES
// ═══════════════════════════════════════════════════════════════════════

const accessories: Product[] = [
  acc(1, {
    en: 'Potting mix (5 kg)', bn: 'পটিং মিক্স (৫ কেজি)',
    dEn: 'Ready blend of soil, cocopeat and compost for most balcony plants.',
    dBn: 'বেশিরভাগ বারান্দার গাছের জন্য মাটি, কোকোপিট ও কম্পোস্টের তৈরি মিশ্রণ।',
    price: 280, cost: 170, stock: 80, kg: 5, unit: 'bag', tags: ['rustic'], sup: DA1,
    ill: { form: 'bag', color: '#5d4037', accent: '#6aa84f' },
  }),
  acc(2, {
    en: 'Cocopeat block (5 kg)', bn: 'কোকোপিট ব্লক (৫ কেজি)',
    dEn: 'Compressed coir that expands to about 70 L in water; lightens heavy soil.',
    dBn: 'পানিতে ভেজালে প্রায় ৭০ লিটার হয়; ভারী মাটি হালকা করে।',
    price: 350, cost: 220, stock: 50, kg: 5, unit: 'block', tags: ['rustic'], sup: DA1,
    ill: { form: 'bag', color: '#8b5a2b' },
  }),
  acc(3, {
    en: 'Vermicompost (5 kg)', bn: 'ভার্মিকম্পোস্ট (৫ কেজি)',
    dEn: 'Earthworm compost that feeds gently — mix 1 part to 4 parts soil.',
    dBn: 'কেঁচো সার গাছকে ধীরে পুষ্টি দেয় — ৪ ভাগ মাটির সাথে ১ ভাগ মেশান।',
    price: 250, cost: 155, stock: 60, kg: 5, unit: 'bag', tags: ['rustic'], sup: DA1,
    ill: { form: 'bag', color: '#3e2723', accent: '#8bc34a' },
  }),
  acc(4, {
    en: 'Perlite (5 L)', bn: 'পার্লাইট (৫ লিটার)',
    dEn: 'Adds air and drainage to mixes for succulents and monsteras.',
    dBn: 'সাকুলেন্ট ও মনস্টেরার মাটিতে বাতাস চলাচল ও পানি নিষ্কাশন বাড়ায়।',
    price: 300, cost: 190, stock: 35, kg: 0.5, unit: 'bag', tags: ['minimal'], sup: DA1,
    ill: { form: 'bag', color: '#eceae4' },
  }),
  acc(5, {
    en: 'Decorative white pebbles (2 kg)', bn: 'সাদা নুড়ি পাথর (২ কেজি)',
    dEn: 'Top-dress pots for a clean look and less soil splash.',
    dBn: 'টবের ওপর ছড়িয়ে দিন — পরিচ্ছন্ন দেখায় ও মাটি কম ছিটকায়।',
    price: 220, cost: 140, stock: 45, kg: 2, unit: 'bag', tags: ['minimal', 'modern'], sup: DA1,
    ill: { form: 'bag', color: '#f5f5f0', accent: '#bdbdb5' },
  }),
  acc(6, {
    en: 'Bark mulch (2 kg)', bn: 'গাছের বাকলের মালচ (২ কেজি)',
    dEn: 'Keeps soil cool and moist through summer heat.',
    dBn: 'গ্রীষ্মের গরমে মাটি ঠান্ডা ও ভেজা রাখে।',
    price: 350, cost: 220, stock: 30, kg: 2, unit: 'bag', tags: ['rustic', 'boho'], sup: DA1,
    ill: { form: 'bag', color: '#7b4a2a' },
  }),
  acc(7, {
    en: 'Neem oil (100 ml)', bn: 'নিম তেল (১০০ মিলি)',
    dEn: 'Organic spray for aphids, mealybugs and mites — dilute 5 ml per litre.',
    dBn: 'জাবপোকা, মিলিবাগ ও মাকড়ের জৈব প্রতিকার — প্রতি লিটার পানিতে ৫ মিলি মেশান।',
    price: 220, cost: 140, stock: 60, kg: 0.15, unit: 'bottle', tags: ['traditional'], sup: DA1,
    ill: { form: 'bag', color: '#6b7a2a', accent: '#c9b037' },
  }),
  acc(8, {
    en: 'Liquid fertilizer (500 ml)', bn: 'তরল সার (৫০০ মিলি)',
    dEn: 'Balanced liquid feed for leafy and flowering plants every two weeks.',
    dBn: 'পাতাবহুল ও ফুলের গাছের জন্য সুষম তরল সার, প্রতি দুই সপ্তাহে একবার।',
    price: 350, cost: 220, stock: 50, kg: 0.55, unit: 'bottle', tags: ['modern'], sup: DA1,
    ill: { form: 'bag', color: '#2e7d32', accent: '#ffffff' },
  }),
  acc(9, {
    en: 'Slow-release NPK fertilizer (500 g)', bn: 'ধীরে কাজ করা এনপিকে সার (৫০০ গ্রাম)',
    dEn: 'Coated granules that feed for about 3 months from one application.',
    dBn: 'একবার দিলে প্রায় ৩ মাস ধরে পুষ্টি দেয় এমন প্রলেপযুক্ত দানা সার।',
    price: 450, cost: 290, stock: 40, kg: 0.5, unit: 'pack', tags: ['modern'], sup: DA1,
    ill: { form: 'bag', color: '#1565c0', accent: '#ffffff' },
  }),
  acc(10, {
    en: 'Mustard cake (1 kg)', bn: 'সরিষার খৈল (১ কেজি)',
    dEn: 'Traditional organic feed; soak for 3–4 days and dilute before use.',
    dBn: 'প্রচলিত জৈব সার; ৩–৪ দিন ভিজিয়ে পাতলা করে ব্যবহার করুন।',
    price: 120, cost: 75, stock: 55, kg: 1, unit: 'bag', tags: ['traditional', 'rustic'], sup: DA1,
    ill: { form: 'bag', color: '#a1772e' },
  }),
  acc(11, {
    en: 'Hand tool set (3 pcs)', bn: 'বাগানের হাতযন্ত্রের সেট (৩টি)',
    dEn: 'Trowel, transplanter and cultivator with rust-proof heads.',
    dBn: 'মরিচারোধী খুরপি, চারা তোলার সরু খুন্তি ও মাটি আলগা করার আঁচড়া।',
    price: 650, cost: 410, stock: 30, kg: 0.6, unit: 'set', tags: ['minimal'], sup: DA1,
    ill: { form: 'tool', color: '#4a4a4a', accent: '#6aa84f' },
  }),
  acc(12, {
    en: 'Watering can (5 L)', bn: 'ঝাঁঝরি (৫ লিটার)',
    dEn: 'Long-spout can with a removable rose for seedlings.',
    dBn: 'লম্বা নলের ঝাঁঝরি, চারার জন্য খোলা যায় এমন ঝাঁঝরা মুখসহ।',
    price: 400, cost: 250, stock: 40, kg: 0.5, tags: ['minimal', 'colorful'], sup: DA1,
    ill: { form: 'tool', color: '#2e7d32' },
  }),
  acc(13, {
    en: 'Pressure sprayer (2 L)', bn: 'প্রেশার স্প্রেয়ার (২ লিটার)',
    dEn: 'Pump-up mister for foliage, neem oil and liquid feed.',
    dBn: 'পাতায় পানি, নিম তেল ও তরল সার ছিটানোর পাম্প স্প্রেয়ার।',
    price: 550, cost: 350, stock: 30, kg: 0.6, tags: ['minimal'], sup: DA1,
    ill: { form: 'tool', color: '#f9a825', accent: '#333333' },
  }),
  acc(14, {
    en: 'Drainage trays 10" (set of 4)', bn: 'পানি ধরার ট্রে ১০ ইঞ্চি (৪টির সেট)',
    dEn: 'Catches run-off so the balcony floor — and the neighbours below — stay dry.',
    dBn: 'চুইয়ে পড়া পানি ধরে রাখে, তাই বারান্দার মেঝে ও নিচের প্রতিবেশী শুকনো থাকে।',
    price: 240, cost: 150, stock: 60, kg: 0.4, unit: 'set', tags: ['minimal'], sup: DA1,
    ill: { form: 'tool', color: '#3a3a3a' },
  }),
  acc(15, {
    en: 'Plant stand (3-tier metal)', bn: 'প্ল্যান্ট স্ট্যান্ড (৩ তাক, ধাতব)',
    dEn: 'Ladder stand that holds 6–9 pots in under half a square metre.',
    dBn: 'মই আকৃতির স্ট্যান্ড, আধা বর্গমিটারের কম জায়গায় ৬–৯টি টব রাখা যায়।',
    price: 2200, cost: 1400, stock: 10, kg: 6, tags: ['modern', 'minimal'], sup: DA1,
    ill: { form: 'tool', color: '#2f2f2f' },
  }),
];

export const products: Product[] = [...plants, ...pots, ...hardware, ...accessories];
