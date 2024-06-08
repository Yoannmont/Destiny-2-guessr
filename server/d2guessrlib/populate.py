import os
import requests
from urllib.request import urlretrieve
import pandas as pd
import json

BUNGIE_URL = "https://bungie.net"
MANIFEST_PATH = "/Platform/Destiny2/Manifest/"

AVAILABLE_LANGS = ["en", "fr"]
TABLES = ["DestinyInventoryItemDefinition", "DestinyDamageTypeDefinition", "DestinyItemTierTypeDefinition","DestinyItemCategoryDefinition"]

BASE_PATH = "d2guessrlib"

API_DATA_FOLDER = "api_data"
REFS_FOLDER = os.path.join(BASE_PATH, API_DATA_FOLDER, 'REFS') # type: ignore


TYPE_CATEGORY_HASHES = json.load(open(os.path.join( REFS_FOLDER,"type_category_hashes.json"), "r"))
TYPE_HASHES = json.load(open(os.path.join(REFS_FOLDER,"type_hashes.json"), "r"))
CATEGORY_HASHES = json.load(open(os.path.join(REFS_FOLDER,"category_hashes.json"), "r"))
OBJECT_TYPE_HASHES = json.load(open(os.path.join(REFS_FOLDER,"object_type_hashes.json"), "r"))
TIER_HASHES = json.load(open(os.path.join( REFS_FOLDER, "tier_hashes.json"), "r"))
DAMAGE_TYPE_HASHES = json.load(open(os.path.join( REFS_FOLDER, "damage_type_hashes.json"), "r"))
CLASS_HASHES = json.load(open(os.path.join(REFS_FOLDER, "class_hashes.json"), "r"))

for lang in AVAILABLE_LANGS:
    lang_path = os.path.join(BASE_PATH, API_DATA_FOLDER, lang)
    if not os.path.exists(lang_path):
        os.makedirs(lang_path)


## Bungie API Functions

def save_manifest_version(version):
    with open(os.path.join(BASE_PATH, API_DATA_FOLDER,"manifest_version.txt"), "w+") as f:
        f.write(version)
        f.close()



def check_manifest_update():
    def get_current_version():
        with open(os.path.join(BASE_PATH, API_DATA_FOLDER,"manifest_version.txt"), "r") as f:
            version = f.readline()
        return version
    
    version = get_current_version()
    manifest_url = BUNGIE_URL + MANIFEST_PATH
    try :
        manifest = requests.get(manifest_url).json()
        manifest_version = manifest.get("Response").get('version', '')
        if manifest_version == '':
            raise Exception("Error when reading manifest")
        return manifest_version == version
    except Exception as e:
        print("Error when getting manifest version : ", e)

def get_world_content_data_json(lang):
    manifest_url = BUNGIE_URL + MANIFEST_PATH
    try :
        if lang not in AVAILABLE_LANGS:
            raise Exception(f"Language '{lang}' is not in available languages")
        manifest = requests.get(manifest_url).json()
        manifest_content_url = manifest.get('Response').get("jsonWorldComponentContentPaths").get(lang)
        for table in TABLES:
            filename = os.path.join(BASE_PATH, API_DATA_FOLDER, lang, f"{table}_{lang}.json")
            table_url = BUNGIE_URL + manifest_content_url.get(table)
            urlretrieve(table_url, filename)
    except Exception as e:
        print("Error when getting world content :", e)



## Database functions
def _filter_type_category(entry, type_category):
    hashes = TYPE_CATEGORY_HASHES[type_category]
    try:
        if entry["itemCategoryHashes"][hashes[0]] == hashes[1]:
            return True
        else : 
            return False
    except:
        return False

def _get_value(entry, key):
    return entry.get(key)


def _get_type(itemCategoryHashes):
    return list(set(itemCategoryHashes) & set(TYPE_HASHES.values()))[-1]

def _get_category(itemCategoryHashes):
    return list(set(itemCategoryHashes) & set(CATEGORY_HASHES.values()))[0]

def _get_class(itemCategoryHashes):
    return list(set(itemCategoryHashes) & set(CLASS_HASHES.values()))[0]

def _get_object(itemCategoryHashes):
    return list(set(itemCategoryHashes) & set(OBJECT_TYPE_HASHES.values()))[0]

def _filter_tier(entry, tier):
    hash = TIER_HASHES[tier]
    if entry["inventory"]["tierTypeHash"] == hash:
        return True
    else : 
        return False
    

def get_tiers():
    tiers_dfs = {}
    for lang in AVAILABLE_LANGS:
        tiers_dfs[lang] = pd.read_json(os.path.join(BASE_PATH, API_DATA_FOLDER, lang, f"DestinyItemTierTypeDefinition_{lang}.json")).T[["displayProperties", "hash"]]
        tiers_dfs[lang]["displayProperties"] = tiers_dfs[lang]["displayProperties"].apply(_get_value, args=("name",))
        
        tiers_dfs[lang].rename(columns = {"displayProperties" : f"tier_{lang}"}, inplace=True)
    
    df = tiers_dfs[AVAILABLE_LANGS[0]]
    for i in range(1,len(AVAILABLE_LANGS)):
        df = df.merge(tiers_dfs[AVAILABLE_LANGS[i]],how="left", on="hash")
    
    return df

def get_damage_types():
    dt_dfs = {}
    for lang in AVAILABLE_LANGS:
        dt_dfs[lang] = pd.read_json(os.path.join(BASE_PATH, API_DATA_FOLDER, lang, f"DestinyDamageTypeDefinition_{lang}.json")).T[["displayProperties",  "hash"]]
        
        dt_dfs[lang]["iconLink"] = dt_dfs[lang]["displayProperties"].apply(_get_value, args=("icon",))
        dt_dfs[lang]["displayProperties"] = dt_dfs[lang]["displayProperties"].apply(_get_value, args=("name",))

        dt_dfs[lang].rename(columns = {"displayProperties" : f"damageType_{lang}"}, inplace=True)
    
    df = dt_dfs[AVAILABLE_LANGS[0]]
    for i in range(1,len(AVAILABLE_LANGS)):
        df = df.merge(dt_dfs[AVAILABLE_LANGS[i]],how="left", on=["hash", "iconLink"])


    return df[df["hash"].isin(list(DAMAGE_TYPE_HASHES.values()))]


def get_types():
    dt_dfs = {}
    for lang in AVAILABLE_LANGS:
        dt_dfs[lang] = pd.read_json(os.path.join(BASE_PATH, API_DATA_FOLDER, lang, f"DestinyItemCategoryDefinition_{lang}.json")).T[["displayProperties",  "hash"]]
        dt_dfs[lang]["displayProperties"] = dt_dfs[lang]["displayProperties"].apply(_get_value, args=("name",))

        dt_dfs[lang].rename(columns = {"displayProperties" : f"type_{lang}"}, inplace=True)
    
    df = dt_dfs[AVAILABLE_LANGS[0]]
    for i in range(1,len(AVAILABLE_LANGS)):
        df = df.merge(dt_dfs[AVAILABLE_LANGS[i]],how="left", on="hash")
    

    return df[df["hash"].isin(TYPE_HASHES.values())]

def get_categories():
    dt_dfs = {}
    for lang in AVAILABLE_LANGS:
        dt_dfs[lang] = pd.read_json(os.path.join(BASE_PATH, API_DATA_FOLDER, lang, f"DestinyItemCategoryDefinition_{lang}.json")).T[["displayProperties",  "hash"]]
        dt_dfs[lang]["displayProperties"] = dt_dfs[lang]["displayProperties"].apply(_get_value, args=("name",))

        dt_dfs[lang].rename(columns = {"displayProperties" : f"category_{lang}"}, inplace=True)
    
    df = dt_dfs[AVAILABLE_LANGS[0]]
    for i in range(1,len(AVAILABLE_LANGS)):
        df = df.merge(dt_dfs[AVAILABLE_LANGS[i]],how="left", on="hash")
    

    return df[df["hash"].isin(CATEGORY_HASHES.values())]

def get_object():
    dt_dfs = {}
    for lang in AVAILABLE_LANGS:
        dt_dfs[lang] = pd.read_json(os.path.join(BASE_PATH, API_DATA_FOLDER, lang, f"DestinyItemCategoryDefinition_{lang}.json")).T[["displayProperties",  "hash"]]
        dt_dfs[lang]["displayProperties"] = dt_dfs[lang]["displayProperties"].apply(_get_value, args=("name",))

        dt_dfs[lang].rename(columns = {"displayProperties" : f"objectType_{lang}"}, inplace=True)
    
    df = dt_dfs[AVAILABLE_LANGS[0]]
    for i in range(1,len(AVAILABLE_LANGS)):
        df = df.merge(dt_dfs[AVAILABLE_LANGS[i]],how="left", on="hash")
    

    return df[df["hash"].isin(OBJECT_TYPE_HASHES.values())]

def get_class():
    dt_dfs = {}
    for lang in AVAILABLE_LANGS:
        dt_dfs[lang] = pd.read_json(os.path.join(BASE_PATH, API_DATA_FOLDER, lang, f"DestinyItemCategoryDefinition_{lang}.json")).T[["displayProperties",  "hash"]]
        dt_dfs[lang]["displayProperties"] = dt_dfs[lang]["displayProperties"].apply(_get_value, args=("name",))

        dt_dfs[lang].rename(columns = {"displayProperties" : f"class_{lang}"}, inplace=True)
    
    df = dt_dfs[AVAILABLE_LANGS[0]]
    for i in range(1,len(AVAILABLE_LANGS)):
        df = df.merge(dt_dfs[AVAILABLE_LANGS[i]],how="left", on="hash")
    

    return df[df["hash"].isin(CLASS_HASHES.values())]



def get_weapons():
    weapons_dfs = {}
    for lang in AVAILABLE_LANGS:
        weapons_dfs[lang] = pd.read_json(os.path.join(BASE_PATH, API_DATA_FOLDER, lang, f"DestinyInventoryItemDefinition_{lang}.json")).T[["displayProperties","hash", "damageTypeHashes", "screenshot", "flavorText", "inventory", "itemCategoryHashes", "defaultDamageTypeHash", "collectibleHash", "tooltipNotifications"]]
        weapons_dfs[lang] = weapons_dfs[lang][weapons_dfs[lang]["hash"] != 2251716886]
        weapons_dfs[lang] = weapons_dfs[lang][weapons_dfs[lang].apply(_filter_tier, args=("Exotic",), axis=1)]
        weapons_dfs[lang] = weapons_dfs[lang][weapons_dfs[lang].apply(_filter_type_category, args=("Weapon",), axis=1)]
        weapons_dfs[lang]["inventory"] = weapons_dfs[lang]["inventory"].apply(_get_value, args=("tierTypeHash",))
        weapons_dfs[lang]["categoryHash"] = weapons_dfs[lang]["itemCategoryHashes"].apply(_get_category)
        weapons_dfs[lang]["objectHash"] = weapons_dfs[lang]["itemCategoryHashes"].apply(_get_object)
        weapons_dfs[lang]["itemCategoryHashes"] = weapons_dfs[lang]["itemCategoryHashes"].apply(_get_type)
       
        weapons_dfs[lang]["iconLink"] = weapons_dfs[lang]["displayProperties"].apply(_get_value, args=("icon",))
        weapons_dfs[lang]["displayProperties"] = weapons_dfs[lang]["displayProperties"].apply(_get_value, args=("name",))
        weapons_dfs[lang]["tooltipNotifications"] = weapons_dfs[lang]["tooltipNotifications"].apply(len) if "tooltipNotifications" in weapons_dfs[lang] else 0

        weapons_dfs[lang].rename(columns = {"displayProperties" : f"weaponName_{lang}", "flavorText" : f"flavorText_{lang}", "inventory" : "tierTypeHash", "screenshot" : "screenshotLink", "itemCategoryHashes" : "typeHash"}, inplace=True)
        

    
    df = weapons_dfs[AVAILABLE_LANGS[0]]
    for i in range(1,len(AVAILABLE_LANGS)):
        df = df.merge(weapons_dfs[AVAILABLE_LANGS[i]],how="left", on=["hash", "tierTypeHash", "typeHash", "categoryHash", "objectHash", "iconLink", "screenshotLink", "defaultDamageTypeHash", "collectibleHash", "tooltipNotifications", ])

    df.dropna(subset=["damageTypeHashes_x"], inplace=True)
    df = df.sort_values(by="tooltipNotifications", ascending=True).drop_duplicates(subset=["weaponName_en"], keep="first")
    return df
    

def get_armor():
    armor_dfs = {}
    for lang in AVAILABLE_LANGS:
        armor_dfs[lang] = pd.read_json(os.path.join(BASE_PATH, API_DATA_FOLDER, lang, f"DestinyInventoryItemDefinition_{lang}.json")).T[["displayProperties","hash", "screenshot", "flavorText", "inventory", "itemCategoryHashes", "collectibleHash", "tooltipNotifications"]]
        armor_dfs[lang] = armor_dfs[lang][armor_dfs[lang].apply(_filter_tier, args=('Exotic',), axis=1)]
        armor_dfs[lang] = armor_dfs[lang][armor_dfs[lang].apply(_filter_type_category, args=('Armor',), axis=1)]
        armor_dfs[lang]["inventory"] = armor_dfs[lang]["inventory"].apply(_get_value, args=("tierTypeHash",))
        armor_dfs[lang]["objectHash"] = armor_dfs[lang]["itemCategoryHashes"].apply(_get_object)
        armor_dfs[lang]["itemCategoryHashes"] = armor_dfs[lang]["itemCategoryHashes"].apply(_get_class)
        armor_dfs[lang]["iconLink"] = armor_dfs[lang]["displayProperties"].apply(_get_value, args=("icon",))
        armor_dfs[lang]["displayProperties"] = armor_dfs[lang]["displayProperties"].apply(_get_value, args=("name",))
        armor_dfs[lang]["tooltipNotifications"] = armor_dfs[lang]["tooltipNotifications"].apply(len) if "tooltipNotifications" in armor_dfs[lang] else 0
        armor_dfs[lang].rename(columns = {"displayProperties" : f"armorName_{lang}", "flavorText" : f"flavorText_{lang}", "inventory" : "tierTypeHash", "screenshot" : "screenshotLink", "itemCategoryHashes" : "classHash"}, inplace=True)
    
    df = armor_dfs[AVAILABLE_LANGS[0]]
    for i in range(1,len(AVAILABLE_LANGS)):
        df = df.merge(armor_dfs[AVAILABLE_LANGS[i]],how="left", on=["hash", "tierTypeHash", "classHash", "objectHash", "iconLink", "screenshotLink", "collectibleHash", "tooltipNotifications"])

    df = df.sort_values(by="tooltipNotifications", ascending=True).drop_duplicates(subset=["armorName_en"], keep="first")

    return df