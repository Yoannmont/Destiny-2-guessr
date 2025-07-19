import { Filter } from './filter';

export interface Item {
  id: number;
  api_name: string;
  id_bungie: string;
  item_type: number;
  localized_item_type: string;
  localized_name: string;
  localized_flavor_text: string;
  localized_weapon_slot: string;
  localized_weapon_ammo_type: string;
  weapon_ammo_type: number;
  tier_type: number;
  class_type: number;
  category: number;
  icon_url: string;
  screenshot_url: string;
  default_damage_type: number;
  damage_types: number[];
  localized_stats: LocalizedStat[];
  localized_perks: LocalizedPerk[];

  [index: string]:
    | number
    | string
    | number[]
    | LocalizedPerk[]
    | LocalizedStat[];
}

export interface DamageType {
  id: number;
  id_bungie: string;
  name: string;
  localized_name: string;
  icon_url: string;
  [index: string]: number | string;
}

export interface Category {
  id: number;
  id_bungie: string;
  name: string;
  localized_name: string;
  icon_url: string;
  localized_desc: string;
  [index: string]: number | string;
}

export interface Tier {
  id: number;
  id_bungie: string;
  name: string;
  localized_name: string;
  [index: string]: number | string;
}

export interface ClassType {
  id: number;
  id_bungie: string;
  name: string;
  localized_name: string;
}

export interface LocalizedStat {
  name: string;
  value: number;
  icon_url: string;
}

export interface LocalizedPerk {
  name: string;
  desc: string;
  icon_url: string;
  is_intrinsic: boolean;
}

export interface ItemFilter {
  tier_type?: Filter[];
  category?: Filter[];
  class_type?: Filter[];
  default_damage_type?: Filter[];
  [key: string]: Filter[] | undefined;
}

export type ItemOrdering =
  | 'translations__name'
  | '-translations__name'
  | 'tier_type'
  | '-tier_type'
  | 'category'
  | '-category'
  | 'default_damage_type'
  | '-default_damage_type';

export const switchOrdering = (ordering: ItemOrdering): ItemOrdering => {
  if (ordering.startsWith('-')) {
    return ordering.slice(1) as ItemOrdering;
  } else {
    return `-${ordering}` as ItemOrdering;
  }
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
};

export const item_filter_to_request = (
  item_filter: ItemFilter
): { [key: string]: string } => {
  const output: { [key: string]: string } = {};

  for (const key in item_filter) {
    const filters = item_filter[key];
    if (filters && filters.length > 0) {
      output[key] = filters.map((item) => item.value).join(',');
    }
  }

  return output;
};

export const ITEM_TYPE_LABELS = {
  '1': {
    en: 'Weapon',
    fr: 'Armes',
    de: 'Waffe',
    es: 'Arma',
    it: 'Arma',
    ja: '武器',
  },
  '20': {
    en: 'Armor',
    fr: 'Armures',
    de: 'Rüstung',
    es: 'Armadura',
    it: 'Armatura',
    ja: '防具',
  },
};
export const WEAPON_SLOT_LABELS = {
  '2': {
    en: 'Kinetic',
    fr: 'Cinétique',
    de: 'Kinetisch',
    es: 'Cinético',
    it: 'Cinetico',
    ja: 'キネティック',
  },
  '3': {
    en: 'Energy',
    fr: 'Énergétique',
    de: 'Energie',
    es: 'Energético',
    it: 'Energetico',
    ja: 'エネルギー',
  },
  '4': {
    en: 'Power',
    fr: 'Puissante',
    de: 'Schwere',
    es: 'Poderosa',
    it: 'Potente',
    ja: 'パワー',
  },
};

export const WEAPON_AMMO_TYPE_LABELS = {
  '1': {
    en: 'Primary',
    fr: 'Principale',
    de: 'Primär',
    es: 'Primaria',
    it: 'Primaria',
    ja: 'メイン',
  },
  '2': {
    en: 'Special',
    fr: 'Spéciale',
    de: 'Spezial',
    es: 'Especial',
    it: 'Speciale',
    ja: 'スペシャル',
  },
  '3': {
    en: 'Heavy',
    fr: 'Lourde',
    de: 'Schwere',
    es: 'Pesada',
    it: 'Pesante',
    ja: 'ヘビー',
  },
};

export function isWeaponLabel(str: string) {
  const weaponLabels = Object.values(ITEM_TYPE_LABELS['1']);
  return weaponLabels.some(
    (label) => label.toLowerCase() === str.toLowerCase()
  );
}

export function isArmorLabel(str: string) {
  const armorLabels = Object.values(ITEM_TYPE_LABELS['20']);
  return armorLabels.some((label) => label.toLowerCase() === str.toLowerCase());
}
