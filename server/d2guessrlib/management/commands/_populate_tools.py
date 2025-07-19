import json
import logging
import sqlite3

from django.contrib.contenttypes.models import ContentType

from d2guessrlib.management.commands._REFS import (
    CATEGORY_SLOT_HM,
    CLASS_HM,
    DAMAGE_TYPE_HM,
    STATS_HM,
    TIER_TYPE_HM,
    classify_item,
)
from d2guessrlib.models import (
    Category,
    ClassType,
    ContentTranslation,
    DamageType,
    Item,
    ItemStat,
    ItemTranslation,
    Perk,
    Season,
    StatType,
    TierType,
)

logger = logging.getLogger("populate_db")


def load_table(cursor, table_name, hashset=None, extra_query=""):
    """
    Load sql table from cursor.
    """
    query = "SELECT json FROM %s"
    filters = []
    if hashset and isinstance(hashset, tuple):
        if len(hashset) > 1:
            filters.append(f"json_extract(json, '$.hash') IN {hashset}")
        else:
            filters.append(f"json_extract(json, '$.hash') = {hashset[0]}")
    if extra_query:
        filters.append(extra_query)
    if filters:
        filter_query = " WHERE " + " AND ".join(filters)
        query += filter_query
    try:
        cursor.execute(query % table_name)
    except sqlite3.OperationalError as exc:
        raise Exception(f"Error when processing query: {repr(exc)}, {hashset}")
    rows = cursor.fetchall()
    return [json.loads(r[0]) for r in rows]


def create_or_update_object_translations(
    target_object, content_type, localized_cursors, table_name, hashset=None, extra_query=""
):
    """
    Create or update translations for a given object in multiple languages.
    """
    if hashset is None:
        hashset = []

    model_name = content_type.name
    for lang_code, cursor in localized_cursors.items():
        translations_by_hash = {
            row["hash"]: row
            for row in load_table(cursor, table_name=table_name, hashset=hashset, extra_query=extra_query)
        }
        logger.debug(f"Got {len(translations_by_hash)} for {model_name}_{lang_code}")

        display_props = translations_by_hash.get(target_object.id_bungie, {}).get("displayProperties", {})
        translated_fields = {"name": display_props.get("name")}

        description = display_props.get("description")
        if description:
            translated_fields["desc"] = description

        for field_name, translated_text in translated_fields.items():
            ContentTranslation.objects.update_or_create(
                language=lang_code,
                field_name=field_name,
                content_type=content_type,
                object_id=target_object.id,
                text=translated_text,
            )
            logger.info(
                f"Created {lang_code.upper()} - ContentTranslation({field_name}) for {model_name}"
                f"({translated_fields['name']})"
            )


def create_or_update_damage_types(english_cursor, localized_cursors=None):
    """
    Create or update all DamageType objects from English definitions and their translations.
    """
    if localized_cursors is None:
        localized_cursors = {}

    english_damage_defs = {
        entry["hash"]: entry
        for entry in load_table(english_cursor, "DestinyDamageTypeDefinition", hashset=DAMAGE_TYPE_HM.get_values())
    }
    logger.debug(f"Got {len(english_damage_defs)} for DamageType (EN)")

    created_count = 0
    updated_count = 0
    content_type = ContentType.objects.get_for_model(DamageType)

    for hash_id, definition in english_damage_defs.items():
        display_props = definition.get("displayProperties", {})
        icon_url = display_props.get("icon")
        name = display_props.get("name")

        if not (icon_url and name):
            continue

        damage_type_obj, was_created = DamageType.objects.update_or_create(
            id_bungie=hash_id, defaults={"icon_url": icon_url, "name": name}
        )

        logger.info(f"Created EN - DamageType({name})")
        created_count += int(was_created)
        updated_count += int(not was_created)

        create_or_update_object_translations(
            target_object=damage_type_obj,
            content_type=content_type,
            localized_cursors=localized_cursors,
            table_name="DestinyDamageTypeDefinition",
            hashset=DAMAGE_TYPE_HM.get_values(),
        )

    return created_count, updated_count


def create_or_update_tier_types(english_cursor, localized_cursors=None):
    """
    Create or update all TierType objects from English definitions and their translations.
    """
    if localized_cursors is None:
        localized_cursors = {}

    tier_definitions = {
        row["hash"]: row
        for row in load_table(english_cursor, "DestinyItemTierTypeDefinition", hashset=TIER_TYPE_HM.get_values())
    }
    logger.debug(f"Got {len(tier_definitions)} for DestinyItemTierTypeDefinition")

    created_count = 0
    updated_count = 0
    content_type = ContentType.objects.get_for_model(TierType)

    for hash_id, definition in tier_definitions.items():
        name = definition.get("displayProperties", {}).get("name")
        tier_type_obj, created = TierType.objects.update_or_create(id_bungie=hash_id, defaults={"name": name})
        created_count += int(created)
        updated_count += int(not created)
        logger.info(f"Created EN - TierType({name})")

        create_or_update_object_translations(
            target_object=tier_type_obj,
            content_type=content_type,
            localized_cursors=localized_cursors,
            table_name="DestinyItemTierTypeDefinition",
            hashset=TIER_TYPE_HM.get_values(),
        )

    return created_count, updated_count


def create_or_update_categories(english_cursor, localized_cursors=None):
    """
    Create or update all Category objects from English definitions and their translations.
    """
    if localized_cursors is None:
        localized_cursors = {}

    category_definitions = {
        row["hash"]: row
        for row in load_table(english_cursor, "DestinyItemCategoryDefinition", hashset=CATEGORY_SLOT_HM.get_values())
    }
    logger.debug(f"Got {len(category_definitions)} for DestinyItemCategoryDefinition")

    created_count = 0
    updated_count = 0
    content_type = ContentType.objects.get_for_model(Category)

    for hash_id, definition in category_definitions.items():
        name = definition.get("displayProperties", {}).get("name")
        category_obj, created = Category.objects.update_or_create(
            id_bungie=hash_id, defaults={"name": name, "icon_url": None}
        )
        created_count += int(created)
        updated_count += int(not created)
        logger.info(f"Created EN - Category({name})")

        create_or_update_object_translations(
            target_object=category_obj,
            content_type=content_type,
            localized_cursors=localized_cursors,
            table_name="DestinyItemCategoryDefinition",
            hashset=CATEGORY_SLOT_HM.get_values(),
        )

    return created_count, updated_count


def create_or_update_classes(english_cursor, localized_cursors=None):
    """
    Create or update all ClassType objects from English definitions and their translations.
    """
    if localized_cursors is None:
        localized_cursors = {}

    class_definitions = {
        row["hash"]: row
        for row in load_table(english_cursor, "DestinyItemCategoryDefinition", hashset=CLASS_HM.get_values())
    }
    logger.debug(f"Got {len(class_definitions)} for DestinyItemCategoryDefinition (Classes)")

    created_count = 0
    updated_count = 0
    content_type = ContentType.objects.get_for_model(ClassType)

    for hash_id, definition in class_definitions.items():
        name = definition.get("displayProperties", {}).get("name")
        class_obj, created = ClassType.objects.update_or_create(id_bungie=hash_id, defaults={"name": name})
        created_count += int(created)
        updated_count += int(not created)
        logger.info(f"Created EN - ClassType({name})")

        create_or_update_object_translations(
            target_object=class_obj,
            content_type=content_type,
            localized_cursors=localized_cursors,
            table_name="DestinyItemCategoryDefinition",
            hashset=CLASS_HM.get_values(),
        )

    return created_count, updated_count


def create_or_update_stat_types(english_cursor, localized_cursors=None):
    """
    Create or update all StatType objects from English definitions and their translations.
    """
    if localized_cursors is None:
        localized_cursors = {}

    stat_definitions = {
        row["hash"]: row for row in load_table(english_cursor, "DestinyStatDefinition", hashset=STATS_HM.get_values())
    }
    logger.debug(f"Got {len(stat_definitions)} for DestinyStatDefinition")

    created_count = 0
    updated_count = 0
    content_type = ContentType.objects.get_for_model(StatType)

    for hash_id, definition in stat_definitions.items():
        display = definition.get("displayProperties", {})
        name = display.get("name")
        icon_url = display.get("icon")
        description = display.get("description")

        stat_obj, created = StatType.objects.update_or_create(
            id_bungie=hash_id, defaults={"name": name, "icon_url": icon_url, "desc": description}
        )
        created_count += int(created)
        updated_count += int(not created)
        logger.info(f"Created EN - StatType({name})")

        create_or_update_object_translations(
            target_object=stat_obj,
            content_type=content_type,
            localized_cursors=localized_cursors,
            table_name="DestinyStatDefinition",
            hashset=STATS_HM.get_values(),
        )

    return created_count, updated_count


def create_or_update_seasons(english_cursor, localized_cursors=None):
    """
    Create or update all Season objects from English definitions and their translations.
    """
    if localized_cursors is None:
        localized_cursors = {}

    season_definitions = {row["hash"]: row for row in load_table(english_cursor, "DestinySeasonDefinition")}
    logger.debug(f"Got {len(season_definitions)} for DestinySeasonDefinition")

    created_count = 0
    updated_count = 0
    content_type = ContentType.objects.get_for_model(Season)

    for hash_id, definition in season_definitions.items():
        display = definition.get("displayProperties", {})
        name = display.get("name")
        icon_url = display.get("icon")
        description = display.get("description")
        season_number = definition.get("seasonNumber")

        season_obj, created = Season.objects.update_or_create(
            id_bungie=hash_id,
            defaults={"name": name, "icon_url": icon_url, "desc": description, "season_number": season_number},
        )
        created_count += int(created)
        updated_count += int(not created)
        logger.info(f"Created EN - Season({name})")

        create_or_update_object_translations(
            target_object=season_obj,
            content_type=content_type,
            localized_cursors=localized_cursors,
            table_name="DestinySeasonDefinition",
        )

    return created_count, updated_count


def populate_item_stats(item, i_def_stats):
    """
    Populate the stats for a given Item instance.

    For each stat in i_def_stats that matches a tracked StatType,
    this function creates or updates the corresponding ItemStat in the database.
    """
    for stat_hash, _dict in i_def_stats.items():
        if int(stat_hash) not in STATS_HM.get_values():
            continue
        stat_value = _dict.get("value")
        stat_type_obj = StatType.objects.get(id_bungie=stat_hash)
        try:
            ItemStat.objects.update_or_create(item=item, value=stat_value, stat_type=stat_type_obj)
        except:
            raise
        logger.info(f"Created Stat({stat_type_obj}) for Item({item.api_name})")


def create_or_update_items(english_cursor, localized_cursors=None, exotic_only=False):
    """
    Create or update Item objects and their related data (e.g. stats, perks, translations).

    This function:
    - Filters and loads relevant items from DestinyInventoryItemDefinition.
    - Classifies items by type, class, category, etc.
    - Associates default damage types, perks, and stats.
    - Creates or updates ItemTranslation records for localized data.
    """
    EXTRA_QUERY_EXOTIC_ONLY = """
        json_extract(json, '$.itemType') IN (2, 3)
        AND json_extract(json, '$.inventory.tierType') = 6
        GROUP BY json_extract(json, '$.displayProperties.name')
    """

    EXTRA_QUERY_ALL_ITEMS = """
        json_extract(json, '$.itemType') IN (2, 3)
        AND json_extract(json, '$.inventory.tierTypeHash') > 1
        GROUP BY json_extract(json, '$.displayProperties.name')
    """

    extra_query = EXTRA_QUERY_EXOTIC_ONLY if exotic_only else EXTRA_QUERY_ALL_ITEMS

    if not localized_cursors:
        localized_cursors = {}

    full_table = {row["hash"]: row for row in load_table(english_cursor, "DestinyInventoryItemDefinition")}

    item_defs_en = {
        row["hash"]: row
        for row in load_table(english_cursor, "DestinyInventoryItemDefinition", extra_query=extra_query)
    }
    logger.debug(f"Got {len(item_defs_en)} items")

    created_count = 0
    updated_count = 0

    for hash_id, item_def in item_defs_en.items():
        # Parse key properties for the Item
        display = item_def.get("displayProperties", {})
        api_name = display.get("name")
        icon_url = display.get("icon")
        screenshot_url = item_def.get("screenshot")
        flavor_text = item_def.get("flavorText")
        default_damage_type_hash = item_def.get("defaultDamageTypeHash")
        item_category_hashes = item_def.get("itemCategoryHashes")
        class_type_value = item_def.get("classType")
        # season_hash = item_def.get("seasonHash")

        default_damage_type_obj = None
        damage_types_obj_list = None
        ammo_type_hash = None

        if default_damage_type_hash:
            default_damage_type_obj = DamageType.objects.get(id_bungie=default_damage_type_hash)
            logger.debug(f"Found default DamageType({default_damage_type_obj}) for {api_name}")
            damage_type_hashes = item_def.get("damageTypeHashes")
            damage_types_obj_list = DamageType.objects.filter(id_bungie__in=damage_type_hashes)
            ammo_type_hash = item_def.get("equippingBlock", {}).get("ammoType")

        # Classify item using helper function
        classification_info = classify_item(item_category_hashes=item_category_hashes, class_type=class_type_value)

        class_obj = (
            ClassType.objects.get(id_bungie=classification_info["classHash"])
            if classification_info["classHash"]
            else None
        )
        category_obj = Category.objects.get(id_bungie=classification_info["categoryHash"])
        tier_type_obj = TierType.objects.get(id_bungie=item_def["inventory"]["tierTypeHash"])

        stat_group_hash = item_def.get("stats", {}).get("statGroupHash")
        # season_obj = Season.objects.get(id_bungie=season_hash)

        perk_obj = None
        added_perks = []
        # Process sockets to find and create intrinsic Perks
        for socket_entry in item_def.get("sockets", {}).get("socketEntries", []):
            plug_hash = socket_entry.get("singleInitialItemHash")
            if not plug_hash:
                continue
            p_def = full_table.get(plug_hash)
            if not p_def:
                logger.critical(f"Did not find Plug definition for hash {plug_hash} Item({api_name})")
                continue
            if p_def.get("itemTypeDisplayName", "").lower() == "intrinsic":
                perk_obj, _ = Perk.objects.update_or_create(
                    id_bungie=plug_hash,
                    defaults={
                        "name": p_def["displayProperties"]["name"],
                        "desc": p_def["displayProperties"]["description"],
                        "icon_url": p_def["displayProperties"].get("icon"),
                        "is_intrinsic": True,
                    },
                )
                added_perks.append(perk_obj)
                logger.info(f"Created EN - Perk({perk_obj.name}) for Item({api_name})")
                content_type = ContentType.objects.get_for_model(Perk)
                create_or_update_object_translations(
                    target_object=perk_obj,
                    content_type=content_type,
                    localized_cursors=localized_cursors,
                    table_name="DestinyInventoryItemDefinition",
                    hashset=(plug_hash,),
                )

        item_obj, created = Item.objects.update_or_create(
            id_bungie=hash_id,
            defaults={
                "api_name": api_name,
                "item_type": classification_info["itemTypeHash"],
                "tier_type": tier_type_obj,
                "class_type": class_obj,
                "category": category_obj,
                "icon_url": icon_url,
                "screenshot_url": screenshot_url,
                "default_damage_type": default_damage_type_obj,
                "flavor_text": flavor_text,
                "weapon_slot": classification_info["weaponSlotHash"],
                "weapon_ammo_type": ammo_type_hash,
                "stat_group_hash": stat_group_hash,
                # "season": season_obj,
            },
        )

        created_count += int(created)
        updated_count += int(not created)

        if damage_types_obj_list:
            item_obj.damage_types.set(damage_types_obj_list)

        if added_perks:
            item_obj.perks.set(added_perks)

        logger.info(
            f"Created EN - {tier_type_obj.name} {item_obj.get_localized_type()} "
            f"Item({api_name}, {class_obj}, {category_obj.name})"
        )

        # Populate item stats
        item_stats = item_def.get("stats", {}).get("stats")
        populate_item_stats(item=item_obj, i_def_stats=item_stats)
        localized_item_defs = {
            lang_code: {
                row["hash"]: row
                for row in load_table(cursor, "DestinyInventoryItemDefinition", extra_query=extra_query)
            }
            for lang_code, cursor in localized_cursors.items()
        }

        # Process localized item translations
        for lang_code, defs in localized_item_defs.items():
            logger.debug(f"Got {len(defs)} items in {lang_code.upper()}")
            item_def_lang = defs.get(hash_id, {})
            name_lang = item_def_lang.get("displayProperties", {}).get("name", "")
            flavor_text_lang = item_def_lang.get("flavorText")

            ItemTranslation.objects.update_or_create(
                item=item_obj,
                language=lang_code,
                defaults={
                    "name": name_lang,
                    "flavor_text": flavor_text_lang,
                },
            )
            logger.info(f"Created {lang_code.upper()} - ItemTranslation({name_lang}) for Item({api_name})")

    return created_count, updated_count
