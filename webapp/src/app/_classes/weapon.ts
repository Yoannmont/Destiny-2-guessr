import { Collectible } from "./collectible";

export interface DamageType {
    id : number;
    hash : string;
    damageType_en : string;
    damageType_fr : string;
    [index : string] : number|string;
}

export interface Category{
    id : number;
    hash : string;
    category_en : string;
    category_fr : string;
    [index : string] : number|string;
}

export interface Tier{
    id : number;
    hash : string;
    tier_en : string;
    tier_fr : string;
    [index : string] : number|string;
}
export interface Type{
    id : number;
    hash : string;
    type_en : string;
    type_fr : string;
    [index : string] : number|string;
}

export interface Weapon extends Collectible{
    category:  number ;
    defaultDamageType : number;
    damageTypes : DamageType[];
    tier:  number;
    type :   number;
}

