import pytest
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from rest_framework.test import APIClient

from d2guessrlib.models import (
    Category,
    ClassType,
    ContentTranslation,
    DamageType,
    Item,
    ItemStat,
    ItemTranslation,
    Perk,
    StatType,
    TierType,
)


@pytest.fixture
def user(db) -> User:
    return User.objects.create_user(username="testuser", email="test@email.com", password="secret")


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def tier_type(db) -> TierType:
    return TierType.objects.create(name="tier_type", id_bungie=1)


@pytest.fixture
def class_type(db) -> ClassType:
    return ClassType.objects.create(name="class_type", id_bungie=1)


@pytest.fixture
def stat_type(db) -> StatType:
    return StatType.objects.create(name="stat_type", id_bungie=1, desc="stat_type")


@pytest.fixture
def category(db) -> Category:
    return Category.objects.create(name="category", id_bungie=1)


@pytest.fixture
def damage_type(db) -> DamageType:
    return DamageType.objects.create(name="damage_type", id_bungie=1)


@pytest.fixture
def perk(db) -> Perk:
    return Perk.objects.create(name="perk", desc="perk description", id_bungie=1)


@pytest.fixture
def item(db, tier_type, class_type, category, damage_type, stat_type, perk) -> Item:
    item = Item(
        id_bungie=1,
        api_name="item",
        item_type=1,  # Weapon
        tier_type=tier_type,
        class_type=class_type,
        category=category,
        icon_url="fake_url",
        screenshot_url="fake_url_2",
        default_damage_type=damage_type,
        flavor_text="This is some text",
        weapon_slot=2,  # Kinetic
        weapon_ammo_type=1,  # Primary
    )
    item.save()
    item.damage_types.add(damage_type)
    item.perks.add(perk)
    ItemStat.objects.create(item=item, stat_type=stat_type, value=100)
    return item


@pytest.fixture
def i18n_item(db, item) -> Item:
    ItemTranslation.objects.create(
        item=item,
        language="fr",
        name="objet",
        flavor_text="Je suis du texte",
    )
    return item


@pytest.fixture
def i18n_damage_type(db, damage_type) -> DamageType:
    ContentTranslation.objects.create(
        language="fr",
        field_name="name",
        text="type_de_dommages",
        content_type=ContentType.objects.get_for_model(damage_type),
        object_id=damage_type.id,
    )
    return damage_type


@pytest.fixture
def i18n_stat_type(db, stat_type) -> StatType:
    ContentTranslation.objects.create(
        language="fr",
        field_name="name",
        text="Type de statistique",
        content_type=ContentType.objects.get_for_model(stat_type),
        object_id=stat_type.id,
    )
    ContentTranslation.objects.create(
        language="fr",
        field_name="desc",
        text="Description de la statistique",
        content_type=ContentType.objects.get_for_model(stat_type),
        object_id=stat_type.id,
    )
    return stat_type


@pytest.fixture
def i18n_item_perk(db, perk) -> Perk:
    ContentTranslation.objects.create(
        language="fr",
        field_name="name",
        text="attribut",
        content_type=ContentType.objects.get_for_model(perk),
        object_id=perk.id,
    )
    ContentTranslation.objects.create(
        language="fr",
        field_name="desc",
        text="description de l'attribut",
        content_type=ContentType.objects.get_for_model(perk),
        object_id=perk.id,
    )
    return perk
