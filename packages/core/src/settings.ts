// Business settings that ops can change from the admin dashboard. These are
// the defaults written to the `app_settings` table and used in demo mode.

export interface AppSettings {
  /** Dead-plant guarantee window after install, in days. */
  guarantee_days: number;
  /** Designs that need an expert to approve them before the customer sees them. */
  human_review_first_n: number;
  /** Install fee charged per full-design project, in BDT. */
  base_install_fee: number;
  /** Extra fee per floor above the 5th when there is no lift, in BDT. */
  no_lift_fee_per_floor: number;
  /** Referral credit for both referrer and friend, in BDT. */
  referral_credit: number;
  /** Discount when 3+ flats in one building book together, in percent. */
  building_bundle_discount_pct: number;
  building_bundle_min_flats: number;
  /** Maximum load assumed safe on a typical balcony before a human must review, kg. */
  balcony_load_review_kg: number;
  cities: Array<'dhaka' | 'chittagong'>;
}

export const defaultSettings: AppSettings = {
  guarantee_days: 60,
  human_review_first_n: 100,
  base_install_fee: 1500,
  no_lift_fee_per_floor: 150,
  referral_credit: 500,
  building_bundle_discount_pct: 10,
  building_bundle_min_flats: 3,
  balcony_load_review_kg: 150,
  cities: ['dhaka', 'chittagong'],
};
