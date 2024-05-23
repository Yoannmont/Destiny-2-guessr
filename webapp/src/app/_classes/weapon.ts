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

export interface FlavorText{
    flavorText_en : string;
    flavorText_fr : string;
    [index : string] : string;
}

export interface CollectibleName{
    name_en : string;
    name_fr : string;
    [index : string] : string;
}
export interface Weapon{
    id : number;
    category:  number ;
    defaultDamageType : number ;
    damageTypes : Array<DamageType>;
    flavorText :  Array<FlavorText>;
    hash : string;
    iconLink : string;
    name : Array<CollectibleName>;
    screenshotLink: string;
    tier:  number;
    type :   number;
}

