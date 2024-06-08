import { DamageType } from "./weapon";

export interface Collectible{
    id : number;
    tier : number;
    iconLink: string;
    screenshotLink: string;
    hash: string;
    flavorText :  CollectibleFlavorText[];
    name : CollectibleName[];
    objectType : number;
    [index: string]: number | string | CollectibleName[] | CollectibleFlavorText[] | DamageType[];
}

export interface CollectibleName {
    id: number;
    name_en: string;
    name_fr: string;
    collectible: number;
    [index: string]: number | string;
}

export interface CollectibleFlavorText {
    id: number;
    collectible: number;
    flavorText_en: string;
    flavorText_fr: string;
    [index: string]: number | string;
}

