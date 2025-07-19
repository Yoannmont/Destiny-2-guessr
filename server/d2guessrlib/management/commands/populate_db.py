import io
import logging
import os
import sqlite3
import zipfile
from datetime import datetime

import requests
from django.core.management.base import BaseCommand

from d2guessrlib.management.commands._populate_tools import (
    create_or_update_categories,
    create_or_update_classes,
    create_or_update_damage_types,
    create_or_update_items,
    create_or_update_stat_types,
    create_or_update_tier_types,
)

logger = logging.getLogger("populate_db")


SELECTED_LANGUAGES = ["fr"]


class Command(BaseCommand):
    help = "Import Destiny 2 weapons and armor info from Bungie API"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force-update",
            action="store_true",
            help="Update database even if up to date",
        )
        parser.add_argument("--use-local", action="store_true", help="Use existing local files")
        parser.add_argument(
            "--local-path",
            type=str,
            default=None,
            help="Only if use-local is True. Path of .content file folder. "
            "Every file must be in 'world_sql_[lang_code].content' format",
            required=False,
        )
        parser.add_argument(
            "--exotic-only", default=False, action="store_true", help="Download data on exotic items only"
        )

        return parser

    def handle(self, *args, **options):
        start = datetime.now()
        if not options["use_local"]:
            # 1. Download sqlite db from bungie.net
            manifest_url = "https://www.bungie.net/Platform/Destiny2/Manifest/"
            try:
                logger.debug("Getting Manifest from bungie.net")
                res = requests.get(manifest_url, timeout=20)
                res.raise_for_status()
            except requests.RequestException as e:
                logger.error("ConnectionError when getting dbs: %r", e)
                return

            manifest = res.json().get("Response")
            if not manifest:
                logger.error("Unexpected response from Bungie.")
                return

            with open("manifest_version.txt", "a+") as m_file:
                current_version = m_file.read()
                bungie_version = manifest.get("version")
                if current_version == bungie_version and not options["force_update"]:
                    logger.info("Already up to date.")
                    return

            # 2. Choose languages
            en_path = manifest["mobileWorldContentPaths"].get("en")
            languages_paths = {
                lang_code: manifest["mobileWorldContentPaths"].get(lang_code) for lang_code in SELECTED_LANGUAGES
            }

            base_url = "https://www.bungie.net"
            paths = {
                "en": base_url + en_path,
                **{lang_code: base_url + lang_path for lang_code, lang_path in languages_paths.items()},
            }
            conn = {}
            try:
                for lang, url in paths.items():
                    logger.debug("Getting sqlite_db %s from %s", lang, url)
                    r = requests.get(url, timeout=20)
                    r.raise_for_status()
                    with zipfile.ZipFile(io.BytesIO(r.content)) as z:
                        name = z.namelist()[0]
                        content = z.read(name)
                    temp_file = f"world_sql_{lang}.content"
                    with open(temp_file, "wb") as f:
                        f.write(content)
                    conn[lang] = sqlite3.connect(temp_file)
                    logger.debug("Generated connection for %s", temp_file)
            except requests.RequestException as e:
                logger.error("Error when downloading manifest: %r", e)
                return
            except zipfile.BadZipFile as e:
                logger.error("Error when unzipping manifest: %r", e)
                return
            except Exception as e:
                logger.error("Error when opening manifest: %r", e)
                return
        else:
            conn = {}
            for lang_code in SELECTED_LANGUAGES + ["en"]:
                try:
                    conn[lang_code] = sqlite3.connect(
                        os.path.join(options["local_path"], f"world_sql_{lang_code}.content")
                    )
                except Exception as e:
                    logger.critical(f"Couldn't load {lang_code} cursor: {repr(e)}")
                    continue

        english_cursor = conn["en"].cursor()
        localized_cursors = {lang_code: conn.cursor() for lang_code, conn in conn.items() if lang_code != "en"}

        # 3. Import DamageTypes
        created_count, updated_count = create_or_update_damage_types(
            english_cursor, localized_cursors=localized_cursors
        )
        logger.info("DamageTypes : Created %i, Updated %i", created_count, updated_count)

        # 4. Import TierTypes
        created_count, updated_count = create_or_update_tier_types(english_cursor, localized_cursors=localized_cursors)
        logger.info("Tier Types : Created %i, Updated %i", created_count, updated_count)

        # 5. Import Categories
        created_count, updated_count = create_or_update_categories(english_cursor, localized_cursors=localized_cursors)
        logger.info("Categories : Created %i, Updated %i", created_count, updated_count)

        # 6. Import Classes
        created_count, updated_count = create_or_update_classes(english_cursor, localized_cursors=localized_cursors)
        logger.info("Classes : Created %i, Updated %i", created_count, updated_count)

        # 7. Import Stat Types
        created_count, updated_count = create_or_update_stat_types(english_cursor, localized_cursors=localized_cursors)
        logger.info("Stat Types : Created %i, Updated %i", created_count, updated_count)

        # 7. Import Seasons
        # created_count, updated_count = create_or_update_seasons(english_cursor, localized_cursors=localized_cursors)
        # logger.info("Seasons : Created %i, Updated %i", created_count, updated_count)

        # 9. Import Items
        exotic_only = options["exotic_only"]
        created_count, updated_count = create_or_update_items(
            english_cursor, localized_cursors=localized_cursors, exotic_only=exotic_only
        )
        logger.info("Items : Created %i, Updated %i", created_count, updated_count)

        for key in conn:
            conn[key].close()
        end = datetime.now()
        logger.info("Ended populate_db in %i seconds", (end - start).seconds)

        # 10. Update manifest version if online update
        if not options["use_local"]:
            with open("manifest_version.txt", "w") as m_file:
                m_file.write(manifest.get("version"))
