class HashMapping:
    def __init__(self, data):
        assert isinstance(data, dict)
        self._data = data

    def get_values(self):
        return tuple(self._data.values())

    def get_keys(self):
        return tuple(self._data.keys())

    def __getitem__(self, key):
        return self._data[key]

    def reverse(self):
        return {v: k for k, v in self._data.items()}


DAMAGE_TYPE_HM = HashMapping(
    {
        "Kinetic": 3373582085,
        "Arc": 2303181850,
        "Solar": 1847026933,
        "Void": 3454344768,
        "Stasis": 151347233,
        "Strand": 3949783978,
    }
)

TIER_TYPE_HM = HashMapping(
    {
        "Common": 3340296461,
        "Uncommon": 2395677314,
        "Rare": 2127292149,
        "Legendary": 4008398120,
        "Exotic": 2759499571,
    }
)

AMMO_TYPE = HashMapping({"Primary": 1, "Special": 2, "Heavy": 3})

CATEGORY_SLOT_HM = HashMapping(
    {
        "Kinetic": 2,
        "Energy": 3,
        "Power": 4,
        "Auto": 5,
        "Revolver": 6,
        "Impulse": 7,
        "Scout": 8,
        "Fusion": 9,
        "Sniper": 10,
        "Shotgun": 11,
        "LMG": 12,
        "RPG": 13,
        "Pistol": 14,
        "Sword": 54,
        "GL": 153950757,
        "LinearFusion": 1504945536,
        "Bow": 3317538576,
        "Trace": 2489664120,
        "Glaive": 3871742104,
        "SMG": 3954685534,
        "Armor": 20,
        "Weapon": 1,
        "Helmet": 45,
        "Gauntlets": 46,
        "Chest Armor": 47,
        "Leg Armor": 48,
        "Class Item": 49,
    }
)

CLASS_HM = HashMapping({"Warlock": 21, "Titan": 22, "Hunter": 23})

STATS_HM = HashMapping(
    {
        "Velocity": 2523465841,
        "Airborne Effectiveness": 2714457168,
        "Recoil Direction": 2715839340,
        "Guard Efficiency": 2762071195,
        "Swing Speed": 2837207746,
        "Charge Time": 2961396640,
        # "Mobility": 2996146975,
        "Charge Rate": 3022301683,
        "Blast Radius": 3614673599,
        "Guard Endurance": 3736848092,
        "Magazine": 3871231066,
        # "Defense": 3897883278,
        "Move Speed": 3907551967,
        "Time to Aim Down Sights": 3988418950,
        "Impact": 4043523819,
        "Reload Speed": 4188031367,
        "Strength": 4244567218,
        "Rounds Per Minute": 4284893193,
        # "Intellect": 144602215,
        "Stability": 155624089,
        "Guard Resistance": 209426660,
        "Durability": 360359141,
        # "Resilience": 392767087,
        "Draw Time": 447667954,
        "Ammo Capacity": 925767036,
        "Handling": 943549884,
        "Range": 1240592695,
        "Aim Assistance": 1345609583,
        # "Attack": 1480404414,
        "Speed": 1501155019,
        "Accuracy": 1591432999,
        # "Discipline": 1735777505,
        # # "Power": 1935470627,
        # "Recovery": 1943323491,
    }
)


ITEM_CATEGORY_HM = CATEGORY_SLOT_HM.reverse()

ITEM_CATEGORY_HM.update(CLASS_HM.reverse())


def classify_item(item_category_hashes, class_type=None):
    item_info = {"itemTypeHash": None, "categoryHash": None, "classHash": None, "weaponSlotHash": None}

    # Identify type first
    for h in item_category_hashes:
        if h == 1:
            item_info["itemTypeHash"] = h
            break

        if h == 20:
            item_info["itemTypeHash"] = h
            break

    # Then category and weapon slot

    for h in item_category_hashes:
        if h in (1, 20):
            continue
        label = ITEM_CATEGORY_HM.get(h)
        if label:
            if label in ["Titan", "Hunter", "Warlock"]:
                item_info["classHash"] = h
            elif label in ["Kinetic", "Energy", "Power"]:
                item_info["weaponSlotHash"] = h
            else:
                item_info["categoryHash"] = h

    return item_info
