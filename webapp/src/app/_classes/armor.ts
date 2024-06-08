import { Collectible } from "./collectible";

export interface ObjectType {
    id: number;
    objectType_en: string;
    objectType_fr: string;
    hash: string;
    [index: string]: number | string;
}

export interface Class {
    id: number;
    class_en: string;
    class_fr: string;
    hash: string;
    [index: string]: number | string;
}

export interface Armor extends Collectible {
    classType: number;
}