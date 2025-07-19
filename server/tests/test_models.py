import pytest
from django.contrib.contenttypes.models import ContentType

from d2guessrlib.models import (
    Category,
    ClassType,
    ContentTranslation,
    DamageType,
    Item,
    ItemTranslation,
    StatType,
    TierType,
)


@pytest.mark.django_db
class TestGenericModel:
    @pytest.mark.parametrize(
        "model, name",
        [
            (TierType, "tier_type"),
            (Category, "category"),
            (DamageType, "damage_type"),
            (ClassType, "class_type"),
            (StatType, "stat_type"),
        ],
    )
    def test_str_method(self, model, name):
        obj = model.objects.create(name=name, id_bungie=1)
        assert str(obj) == name

    def test_translations(self, damage_type, category, tier_type, class_type, stat_type, perk):
        for model_obj in [damage_type, category, tier_type, class_type, stat_type, perk]:
            content_type = ContentType.objects.get_for_model(model_obj)
            translation_obj = ContentTranslation.objects.create(
                language="fr",
                field_name="name",
                text="trad_" + model_obj.name,
                content_type=content_type,
                content_object=model_obj,
                object_id=model_obj.id,
            )
            assert str(translation_obj) == f"FR - {model_obj} (name)"
            assert model_obj.translations.get(language="fr") == translation_obj


@pytest.mark.django_db
class TestItem:
    def test_item_creation_and_methods(self, damage_type, tier_type, category, class_type, perk):
        new_item = Item(
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
        new_item.save()
        new_item.damage_types.add(damage_type)
        new_item.perks.add(perk)

        new_item_translation = ItemTranslation(
            item=new_item, language="fr", name="objet", flavor_text="Je suis du texte"
        )
        new_item_translation.save()

        assert str(new_item) == "item"
        assert str(new_item.translations.get(language="fr")) == "objet"
        assert str(new_item.translations.get(language="fr").flavor_text) == "Je suis du texte"
        assert new_item.get_localized_type() == "Weapon"
        assert new_item.get_localized_type("de") == "Waffe"

        # wrong language
        assert new_item.get_localized_type("fake") == "Weapon"

        assert new_item.get_localized_weapon_slot("fr") == "Cinétique"
        assert new_item.get_localized_weapon_ammo_type("fr") == "Principale"

        # item is armor or weapon ammo type is not filled
        new_item.item_type = 0
        assert not new_item.get_localized_weapon_slot()
        assert not new_item.get_localized_weapon_ammo_type()
