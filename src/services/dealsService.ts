/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Deal, Store, PinnedLocation, NotificationItem } from '../types';
import { calculateDistanceKm, calculateWalkTimeMinutes } from './googleMapsService';

// Master product catalogue with rich details and working Google CDN image URLs
export interface ProductTemplate {
  baseId: string;
  title: string;
  brand: string;
  subtitle: string;
  category: 'food' | 'beverages' | 'household' | 'health';
  preferredBrands: Store['brand'][];
  discountBadge: string;
  discountPercent: number;
  originalPrice: number;
  salePrice: number;
  unit: string;
  isFlash: boolean;
  stockCount: number;
  expiresText: string;
  expiresHours: number;
  imageUrl: string;
  imageAlt: string;
}

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    baseId: 'cp-milk-lactose-free',
    title: 'CP Fresh Milk Lactose Free 830ml',
    brand: 'CP-Meiji',
    subtitle: '100% Pasteurized Whole Cow Milk • 830ml chilled bottle',
    category: 'food',
    preferredBrands: ['7-Eleven', 'Lotus', 'Tops', 'Gourmet'],
    discountBadge: '-40% OFF',
    discountPercent: 40,
    originalPrice: 65,
    salePrice: 39,
    unit: '830ml bottle',
    isFlash: true,
    stockCount: 6,
    expiresText: '4h left',
    expiresHours: 4.2,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX8ZKesVBSfTz6GkzWfclLI-k-aI2hjKZnKVf6iBCJ-AxoRY0zUtwB5pc4NIrlNYynj1n0fEurPAaVGUK8A30JoBU0OT14ZgXslra4uGspzRPaM_X97YBhpFzayjZGWq9ppIj_BTqjyyqZ6LmOqiCuSLxvwlQH3iu485SsbwIqc9snsPWNc_3M5CfrJG909KJsNgwoPScL3yPk20gVzzouzgEBEt6g0cwe36fWw7bgDyVJcVkmQfpT',
    imageAlt: 'Chilled CP Fresh Milk Lactose Free 830ml bottle',
  },
  {
    baseId: 'cp-toastie-ham-cheese',
    title: 'CP Hot Sandwich Ham & Double Cheese',
    brand: 'CP',
    subtitle: 'Freshly pressed golden toastie with gooey melted cheese',
    category: 'food',
    preferredBrands: ['7-Eleven'],
    discountBadge: '1+1 BOGO',
    discountPercent: 50,
    originalPrice: 74,
    salePrice: 37,
    unit: '1 pack (Buy 1 Get 1)',
    isFlash: true,
    stockCount: 5,
    expiresText: 'Ends in 3h',
    expiresHours: 3.1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbNGjEQB8Ir0HCAK9O5II9lvlO_Y94jkm_s8qHinCrCWbtVOQqGxOMaqD7lZ1_D1_pnHEAYrxQyNNuFSd7kMLFY-RpaAeWGEMuWiHz4mg_z1Te1pEyM_b-5-MmihvzNkCJ6rwskkY_eNQmAlRk3iai1vXBAnrNvMAwhgGleH3_RWbbpPDDgQMOYZneZnf5AdnFpHv7NKbhHDjL8g4ePQeGa6E2SWPUCb6xV8bGez4aNJoQaD18x-G-',
    imageAlt: 'Crispy pressed hot ham and cheese toastie sandwich',
  },
  {
    baseId: 'pringles-sour-cream',
    title: 'Pringles Sour Cream & Onion 107g',
    brand: 'Pringles',
    subtitle: 'Classic stacked potato crisps in sealed canister',
    category: 'food',
    preferredBrands: ['Lotus', 'BigC', 'Tops'],
    discountBadge: 'BUY 1 GET 1',
    discountPercent: 50,
    originalPrice: 110,
    salePrice: 55,
    unit: '107g can',
    isFlash: false,
    stockCount: 14,
    expiresText: 'Exp. Today',
    expiresHours: 6.5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEoUyiB1PhyS_BUKBUQf0qjeXiLT8FQh6iKb4CX6_l7e2bjOBAFQM6M1Kbd6Lz9eOfpyFjOWqik1FIv97ywbePs68JvU0WUU2UV2-0cl-NPEYTnsOQEn_yty0etMWfLCyVn1cZOaFmPYuR40nDEk1SlJZYqL4zYl_Ck_XgnOpb_n1xLM_9XqVSZEN0uT4el69Rj3TZSEvrYTJA3R4mH_qQ-GL2RgUKSYi2EBAZh0AHo7I8iE6HKbQL',
    imageAlt: 'Iconic green Pringles Sour Cream and Onion canister',
  },
  {
    baseId: 'singha-soda-pack',
    title: 'Singha Soda Water 325ml 6-Pack',
    brand: 'Singha',
    subtitle: 'Extra bubbly carbonated soda glass bottles 6x325ml',
    category: 'beverages',
    preferredBrands: ['BigC', 'Lotus', 'Tops'],
    discountBadge: '-50% OFF',
    discountPercent: 50,
    originalPrice: 84,
    salePrice: 42,
    unit: '6x325ml glass bottles',
    isFlash: true,
    stockCount: 4,
    expiresText: '2h left',
    expiresHours: 2.3,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdmT63ymzZrhXq0i5YFqZEzHa02-Zjr65CMtjoUy_m-ikRFJRKU0qRXZHtRmRStEmswbrVnApZg46nE4tJvliggzTL4LXFS87WMEidFepcDwMIquAd-pDR0fJRl4JPHZkhy6nozTum6MlDMIVlPdpcitpZgshXUl9IOG10nQNcrZLFnR8DKaprOu4j9kEV8WIK9MKQUTsWGL7JWPZCbVr2YOSbx06EUJL7naKLv20kVdDQ92eheRfU',
    imageAlt: 'Pack of 6 Singha Soda glass bottles',
  },
  {
    baseId: 'downy-sunrise-fresh',
    title: 'Downy Fabric Softener Sunrise Fresh 1.2L',
    brand: 'Downy',
    subtitle: 'Concentrated morning floral fragrance refill pouch',
    category: 'household',
    preferredBrands: ['BigC', 'Lotus', '7-Eleven'],
    discountBadge: '-35% OFF',
    discountPercent: 35,
    originalPrice: 139,
    salePrice: 89,
    unit: '1.2L pouch',
    isFlash: false,
    stockCount: 8,
    expiresText: '6h left',
    expiresHours: 6.1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoUemv76avIut-T6zaQ4bmxvrMEQpSp4PFUZstyV4P0jJiHhx2AEvEemWAZWIn64x7xRDby8mwLbQfP8d6GmGg77xIxNNDtShz-7ihqDIUEyxbLxAZ5n9byKOfes39N6K-e98ztjPhWH0tgxKDuREmNCXF7GFt2J0tLLapfoaBfvhK_OIYpeZZr5RsAXz0f0UNVzfllhbUAHxILPw9WQI1QNtE-iNf6Rv1uHOmEeDF6z76MoMZzsoU',
    imageAlt: 'Downy Fabric Softener Sunrise Fresh blue pouch 1.2L',
  },
  {
    baseId: 'meiji-pasteurized-milk',
    title: 'Meiji Fresh Pasteurized Milk 830ml',
    brand: 'CP-Meiji',
    subtitle: 'Pure whole plain cow milk rich in calcium',
    category: 'food',
    preferredBrands: ['7-Eleven', 'Lotus', 'Tops'],
    discountBadge: '-35% OFF',
    discountPercent: 35,
    originalPrice: 48,
    salePrice: 31.5,
    unit: '830ml bottle',
    isFlash: true,
    stockCount: 15,
    expiresText: 'Ending today',
    expiresHours: 5.4,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwsSzdQi-8kPtBHoBhg7jB2aHn1tha1Rg30Zb749nM77ueyc5LFcSEHW-MAfDSZK6R3pm8pPgPACwTbTb044IMceVyqxI8DM-JXqs6pseV50Vg7KrkmcGWFWz-5nV05A4aGZ0NhGwRJcmTJ4meMsD1tAOOADpiqyJPmD2Nq80XmsMcCb539EkVSImNuOgLGjO-AaheF-8VGYP6qx72ZsLwrBmJYMEMQljeJJCxytiOny2LNyc3y2Rx',
    imageAlt: 'Chilled bottle of Meiji Fresh Milk',
  },
  {
    baseId: 'nescafe-gold-blend',
    title: 'Nescafe Gold Blend Rich Roast 200g',
    brand: 'Nescafe',
    subtitle: 'Finely roasted premium instant coffee crystal glass jar',
    category: 'food',
    preferredBrands: ['Tops', 'Gourmet', 'BigC'],
    discountBadge: '-25% OFF',
    discountPercent: 25,
    originalPrice: 320,
    salePrice: 240,
    unit: '200g glass jar',
    isFlash: false,
    stockCount: 7,
    expiresText: 'Ending today',
    expiresHours: 7.0,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBahVC3moPhJdzCqwpZoYEj828pVeMVD1YNasbNpkjByqxmjulS3v34KiaIXYm-A-PL3wnlQtNd3ql5pL7GH-edv0zYTmKz5or3BcIXtElYcn5KATXhw8l6ohdsdTlQGFDbQXqpq_Ja91Ar-LQLWkC1xD8Z7zzebrZQYNAfIS7mzSDG5Mzwia0NlWizR27gAk3g7_zDWwTI5wXgab5cUV_2XTSB05DcEw0gjbVxSVyV0HmfzURI6jvs',
    imageAlt: 'Nescafe Gold Blend jar on coffee table',
  },
  {
    baseId: 'oishi-green-tea-matcha',
    title: 'Oishi Green Tea Matcha Honey Lemon 500ml',
    brand: 'Oishi',
    subtitle: 'Chilled ready-to-drink authentic Japanese green tea',
    category: 'beverages',
    preferredBrands: ['7-Eleven', 'Lotus', 'BigC'],
    discountBadge: 'BOGO FREE',
    discountPercent: 50,
    originalPrice: 50,
    salePrice: 25,
    unit: '500ml bottle (2 bottles)',
    isFlash: true,
    stockCount: 16,
    expiresText: 'Ends in 3h',
    expiresHours: 3.4,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACrQYpEfQj9oE7ZL61u0FBkxc9RBXF1-1LwHFsNfPs76CTa9rdwb_kB-Ln6XMnmCj71J3Zw2_dzy5ZXK1Ir010-26UjzONVIYkYOWZmK5N-ADZIvN2NcomBOT_Nv0FtmDe0kBqdMobZhr6TSDoVO0t6X-hCpCdVJmXFaVrsOXBnPWJZZiU3uT61FoCna9XSg8a23Ct636ssiNaY0zvO_S6pbGiNalJAQqbn10JiNu-o1y9_go-_sRg',
    imageAlt: 'Two bottles of chilled green tea matcha honey lemon',
  },
  {
    baseId: 'teriyaki-chicken-rice',
    title: 'Teriyaki Grilled Chicken Bowl 320g',
    brand: 'Ezy Choice',
    subtitle: 'Juicy chicken breast with savory teriyaki sauce over rice',
    category: 'food',
    preferredBrands: ['7-Eleven'],
    discountBadge: '-45% OFF',
    discountPercent: 45,
    originalPrice: 59,
    salePrice: 32,
    unit: '320g meal bowl',
    isFlash: true,
    stockCount: 6,
    expiresText: 'Expires today',
    expiresHours: 2.7,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhiHNpSVCZouTalS06Mw1PWcsn-GvwAbPyTrJEPyXBxdU0VgtDFbufIgN6tC4x8O4j4qzPBrVyrgcAsBiFQC4L3GQUMXp5lvT0Or2kd-najqsTl1237DqRKwYkj9aS4irEDI0ZDCXDvK72GWleaWQl0yRBQy5nBtrf-lerHGJZMjfOb5PBy-e9ocL5SkPjdc2ltEfJV_HFWG1nR84GsMJYczJ5XttG6uIgIHpWJ6TQ1Rmk5Ex8oK78',
    imageAlt: 'Japanese teriyaki chicken rice bento meal',
  },
  {
    baseId: 'spicy-salmon-onigiri',
    title: 'Spicy Salmon Mayo Onigiri',
    brand: '7-Fresh',
    subtitle: 'Crispy seaweed triangular Japanese rice ball filled with salmon',
    category: 'food',
    preferredBrands: ['7-Eleven', 'Tops'],
    discountBadge: '-40% OFF',
    discountPercent: 40,
    originalPrice: 32,
    salePrice: 19,
    unit: '1 piece onigiri',
    isFlash: true,
    stockCount: 12,
    expiresText: 'Promo ends 9PM',
    expiresHours: 3.0,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL8xs3Rshs3Dj6ybua8od035s6Y7sVx9myDiyyOZQCTG-MKh3BoDxEgp3rE6_d2T3AZSA8Qd48v_E1Kxcbamlfd3ULy-s3MwEyAZL58yfukKTjIevaQarsy_EtgSzwby5hV_lANDRYNOzyel8dO-4s0E5HbQhGdvieSzv_mFXT03-sSiFnQUQ-jHyIpiRqvPQOV4kh-z4FyI4gmosU40QgQzFYc4iT_jKP7E_KnS0knrFwTWJGmIO_',
    imageAlt: 'Salmon mayo seaweed wrapped onigiri triangular rice ball',
  },
  {
    baseId: 'pork-katsudon-donburi',
    title: 'Pork Katsudon Donburi 350g',
    brand: 'Chef Select',
    subtitle: 'Crispy breaded pork cutlet with simmered egg & onion sauce',
    category: 'food',
    preferredBrands: ['7-Eleven', 'Gourmet'],
    discountBadge: '-35% OFF',
    discountPercent: 35,
    originalPrice: 69,
    salePrice: 45,
    unit: '350g bowl',
    isFlash: false,
    stockCount: 4,
    expiresText: 'Fresh prepared',
    expiresHours: 3.5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfBqTo7MK2BotAp-Bk5-9Bq54ynfdT7bLfpEKNYuMvzYwtbYoKUXRiTKnK1-6bTRD0D5ivVLzyYJweL1ygkvH9so6DqIbW04bb-oy0HQKkSpUgIbj7qeM_6nIlahAFHZbazwvE8eqFhcQIyPlMRFyouoJRCARvj2QNtjOlJGRhsCwvV-f1bsKv4VXlZtPx6C6Ev1fBfYmW1lrN2lb_EbqUJUItaXTS3KSoikzKqtjNhgnPHs1uRGvK',
    imageAlt: 'Pork katsudon with egg and steamed jasmine rice',
  },
  {
    baseId: 'spicy-basil-pork-rice',
    title: 'Spicy Basil Pork (Pad Krapao)',
    brand: 'Ezy Choice',
    subtitle: 'Authentic Thai spicy holy basil minced pork with fried egg',
    category: 'food',
    preferredBrands: ['7-Eleven'],
    discountBadge: '-30% OFF',
    discountPercent: 30,
    originalPrice: 49,
    salePrice: 34,
    unit: '300g box',
    isFlash: true,
    stockCount: 8,
    expiresText: 'Expires in 6h',
    expiresHours: 6.0,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDM02wou5CN8TgsUMRyAtz0ZKPHcc8HxZdprxsd5cH7RWyf6u3pe6rfKU93oOdKe6uNcgitS8jHYf2WgaFoWjma6POj7o06ZFQcA_U4Itiq-hrG0K5lyRuDe0McT1LVZ0XDhA8z3o6wdSPVtYxsenRNPv4Gu0E0K9VsVFkhAVwt4gN1RsqHxAlyU06leFv1sELOgkOTnxELizUGpR21Icf2z01_JtphsOywEP-TXx3uk7k8z1CDECdX',
    imageAlt: 'Pad Krapao spicy basil minced pork with crispy fried egg over rice',
  },
  {
    baseId: 'allcafe-iced-americano',
    title: 'Signature Iced Americano (L)',
    brand: 'All Café',
    subtitle: 'Freshly extracted espresso with 100% Arabica roast',
    category: 'beverages',
    preferredBrands: ['7-Eleven'],
    discountBadge: '-30% OFF',
    discountPercent: 30,
    originalPrice: 50,
    salePrice: 35,
    unit: '22oz cold cup',
    isFlash: false,
    stockCount: 40,
    expiresText: 'All-Day Deal',
    expiresHours: 8.0,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKWITmeYEK-iSSZ2nUlQD1LeFf1KjEg6-qwmzZgXaOfnJdjRyxyuHVvKl9baxVXcGfyhMIzEETdR5OAA6OcgbJ--YnmPugKk6oQGO-WmH0Zrs16Vq0g0IaFtsEoN4owpp41KwcFsGXeUDrfr_MqODkJBUKvluZ02rugriaZdr-RJlKKUtE-yuKrQbipMzzyNsd2_PvahGc3Q1CDi6-EkQntJNqJ40kD8JVT64b-NMc3vp-hJCt8yVm',
    imageAlt: 'Iced Americano in transparent takeaway cup',
  },
  {
    baseId: 'malee-coconut-water',
    title: 'Malee 100% Young Coconut Water 330ml',
    brand: 'Malee',
    subtitle: 'Pure sweet aromatic coconut water with natural electrolytes',
    category: 'beverages',
    preferredBrands: ['7-Eleven', 'Lotus', 'Tops'],
    discountBadge: '-50% OFF',
    discountPercent: 50,
    originalPrice: 32,
    salePrice: 16,
    unit: '330ml carton pack',
    isFlash: true,
    stockCount: 22,
    expiresText: 'Exp. This Week',
    expiresHours: 12.0,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1CuV0KedbGPLDoYNoFYsb2vh2tkhBNdZe7QFyaLQoZKSZvIoMNiwXOad8RJMUPMJOQp48BJ0nRBSa7PS2Bsxys8iSPsId_l8d6P_xa4YsTNR_nN2tFpsngy1Oe8IdtWF-sOHIfib3lx8mfwaqLd2BqXh0AYdbrUgrYWcYutFiujl88yMMAptSCE1EtiCuA_ELB1BF6TlIDWFc559fDHDod4R4jj-1LpNkrAGRA7ssPyeF5krlhdYR',
    imageAlt: 'Malee 100% natural young coconut water pack',
  },
  {
    baseId: 'singha-yuzu-soda',
    title: 'Singha Yuzu Lemon Soda 330ml',
    brand: 'Singha',
    subtitle: 'Zero calories zero sugar sparkling citrus soda can',
    category: 'beverages',
    preferredBrands: ['7-Eleven', 'Lotus', 'BigC'],
    discountBadge: '-40% OFF',
    discountPercent: 40,
    originalPrice: 20,
    salePrice: 12,
    unit: '330ml sleek can',
    isFlash: true,
    stockCount: 10,
    expiresText: 'Ending 22:00',
    expiresHours: 2.5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8-nqryXhaMQumpWUI-VPGUETZd5QjR_-feCJWyNy24XyiBknhFUbk3Ry0nEXQoKhnxMBzW0bYs4Q0sDnHK4hVJDE0-TxBBtXDw0hdy2u9mcy6wh_vtC3vkhQmhW78Bevd7b5tnRzzDy4IOGa6WR4Xmea8w-9iH62qTPUMVC_eRIopmyKY95j3mSsba4PdfS9wFKI0R7hps4YZei438E7hlzEEWzDQLzDwvxX5w_zm24TrbcBC65Pc',
    imageAlt: 'Sparkling citrus soda sleek can with yellow label',
  },
  {
    baseId: 'lays-classic-chips',
    title: "Lay's Classic Salted / Nori 44g",
    brand: "Lay's",
    subtitle: 'Golden thinly sliced real potato chips classic salted taste',
    category: 'food',
    preferredBrands: ['7-Eleven', 'Lotus', 'BigC'],
    discountBadge: 'BOGO',
    discountPercent: 50,
    originalPrice: 64,
    salePrice: 32,
    unit: '44g pack (2 bags)',
    isFlash: false,
    stockCount: 15,
    expiresText: 'Expires in 4h',
    expiresHours: 4.0,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDg9XlplRvsAg_EpjJ4MbIkLBMhiNEN2ZFF_o8x9A9TPsUBUvYbVJc4cDQ6CIEUjN6E84TccCQt_-oYxlfoi2vDZqFUUonTgEM9RcYSogBV0ywwNWXeBR1FR6WF3J5kKC5Ex2P7K2104Ow7cmsvus9Y2ynmLa1jwLkzz_brGLpU5RjuYJcG_vEHaLQz5ZecnCVxjzLvvQmbbjxu42CQrXnhqskrfM_pLSv5rBuXPwzYFUajxmC_eoDd',
    imageAlt: "Crispy yellow Lay's potato chips pack",
  },
];

/**
 * Generate fully dynamic, location-anchored deals for the stores found in the current neighborhood.
 */
export function generateDealsForLocation(
  stores: Store[],
  pinnedLocation: PinnedLocation,
  previousDeals: Deal[] = []
): Deal[] {
  if (!stores || stores.length === 0) return [];

  // Track user's favorited status from previous state
  const favoritedBaseIds = new Set<string>();
  previousDeals.forEach((d) => {
    if (d.isFavorited) {
      favoritedBaseIds.add(d.id);
      favoritedBaseIds.add(d.id.split('-store-')[0]);
    }
  });

  const deals: Deal[] = [];

  // Distribute templates among stores in this neighborhood
  PRODUCT_TEMPLATES.forEach((tmpl, index) => {
    // Find matching store for this item or round-robin among available stores
    let store = stores.find((s) => tmpl.preferredBrands.includes(s.brand));
    if (!store) {
      store = stores[index % stores.length];
    }

    const distKm = store.distanceKm ?? calculateDistanceKm(pinnedLocation.lat, pinnedLocation.lng, store.lat, store.lng);
    const storeLocText = `${distKm} km • ${store.name}`;

    // Calculate competitor prices using other real stores in this selected neighborhood
    const otherStores = stores.filter((s) => s.id !== store!.id);
    const competitorPrices: Deal['competitorPrices'] = [];

    // Add current store as best deal
    competitorPrices.push({
      storeName: store.name,
      brandType: (store.brand === '7-Eleven' ? '7' : store.brand === 'Lotus' ? 'L' : store.brand === 'BigC' ? 'B' : 'T') as any,
      distanceText: `${distKm} km away`,
      price: tmpl.salePrice,
      diffBadge: 'BEST DEAL',
      isBest: true,
    });

    // Add 2-3 other real nearby stores in this area for price comparison
    otherStores.slice(0, 3).forEach((compStore, cIdx) => {
      const compDist = compStore.distanceKm ?? calculateDistanceKm(pinnedLocation.lat, pinnedLocation.lng, compStore.lat, compStore.lng);
      const markupMultipliers = [1.25, 1.4, 1.55];
      const compPrice = Math.round(tmpl.salePrice * markupMultipliers[cIdx % markupMultipliers.length] * 10) / 10;
      const diffPercent = Math.round(((compPrice - tmpl.salePrice) / compPrice) * 100);

      competitorPrices.push({
        storeName: compStore.name,
        brandType: (compStore.brand === '7-Eleven' ? '7' : compStore.brand === 'Lotus' ? 'L' : compStore.brand === 'BigC' ? 'B' : 'T') as any,
        distanceText: `${compDist} km away`,
        price: compPrice,
        diffBadge: `-${diffPercent}%`,
        isBest: false,
      });
    });

    const dealId = `deal-${tmpl.baseId}`;
    const isFavorited = favoritedBaseIds.has(dealId) || favoritedBaseIds.has(tmpl.baseId);

    deals.push({
      id: dealId,
      title: tmpl.title,
      brand: tmpl.brand,
      subtitle: tmpl.subtitle,
      category: tmpl.category,
      storeId: store.id,
      storeName: store.name,
      storeLocationText: storeLocText,
      storeLat: store.lat,
      storeLng: store.lng,
      discountBadge: tmpl.discountBadge,
      discountPercent: tmpl.discountPercent,
      price: tmpl.salePrice,
      originalPrice: tmpl.originalPrice,
      savingAmount: tmpl.originalPrice - tmpl.salePrice,
      stockText: tmpl.stockCount <= 5 ? `Only ${tmpl.stockCount} left in stock` : `${tmpl.stockCount} available in stock`,
      stockCount: tmpl.stockCount,
      claimedPercent: Math.min(95, Math.floor(60 + (index * 7) % 35)),
      expiresText: tmpl.expiresText,
      expiresSeconds: Math.floor(tmpl.expiresHours * 3600),
      imageUrl: tmpl.imageUrl,
      imageAlt: tmpl.imageAlt,
      isFlash: tmpl.isFlash,
      isFavorited: isFavorited,
      unit: tmpl.unit,
      competitorPrices: competitorPrices,
    });
  });

  return deals;
}

/**
 * Generate notifications that accurately reflect the current neighborhood stores and deals.
 */
export function generateNotificationsForLocation(
  stores: Store[],
  deals: Deal[],
  pinnedLocation: PinnedLocation
): NotificationItem[] {
  const shortArea = pinnedLocation.name.split(',')[0].trim();
  const primaryStore = stores[0] || { name: '7-Eleven', distanceKm: 0.2 };
  const secondaryStore = stores[1] || { name: "Lotus's Go Fresh", distanceKm: 0.5 };
  const topFlashDeal = deals.find((d) => d.isFlash) || deals[0];

  return [
    {
      id: `notif-loc-switch-${Date.now()}`,
      type: 'location',
      title: `DealSpot Radar: ${shortArea}`,
      message: `Active area centered on ${shortArea}. Found ${deals.length} verified deals at ${stores.length} nearby stores within your alert radius.`,
      timestampText: 'Just now',
      isRead: false,
      isToday: true,
      routeInfo: `Fastest route ~${primaryStore.walkTimeMin || 3} min walk`,
    },
    {
      id: `notif-flash-${Date.now() + 1}`,
      type: 'flash',
      title: `${primaryStore.name}`,
      message: `Just replenished shelf inventory with up to 50% off fresh meals, milks & snacks in ${shortArea}.`,
      storeName: primaryStore.name,
      timestampText: '10m ago',
      isRead: false,
      isToday: true,
      dealPreview: topFlashDeal
        ? {
            title: topFlashDeal.title,
            price: topFlashDeal.price,
            originalPrice: topFlashDeal.originalPrice,
            discountBadge: topFlashDeal.discountBadge,
            imageUrl: topFlashDeal.imageUrl,
            distanceText: `${topFlashDeal.storeLocationText.split('•')[0].trim()} away`,
            expiresText: topFlashDeal.expiresText,
          }
        : undefined,
    },
    {
      id: `notif-clearance-${Date.now() + 2}`,
      type: 'store_clearance',
      title: `${secondaryStore.name}`,
      message: `Neighborhood clearance started: buy 1 get 1 free on snacks and pantry essentials.`,
      timestampText: '45m ago',
      isRead: false,
      isToday: true,
      highlightPill: `${secondaryStore.distanceKm} km away • ${shortArea}`,
    },
  ];
}
