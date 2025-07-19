import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from d2guessrlib.models import Category, ClassType, DamageType, Item, Perk, StatType, TierType


@pytest.mark.django_db
class TestViews:
    def test_damage_type_view(self, client: APIClient, damage_type: DamageType):
        response = client.get(reverse("d2guessrlib:damage-type-list"))
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["count"] == 1
        assert response_json["results"] == [
            {
                "icon_url": None,
                "id": 1,
                "id_bungie": 1,
                "localized_name": "damage_type",
                "name": "damage_type",
            }
        ]

        response = client.get(
            reverse("d2guessrlib:damage-type-detail", args=[damage_type.pk]),
        )
        assert response.status_code == 200
        assert response.json() == {
            "icon_url": None,
            "id": 1,
            "id_bungie": 1,
            "localized_name": "damage_type",
            "name": "damage_type",
        }

    def test_stat_type_view(self, client: APIClient, stat_type: StatType):
        response = client.get(reverse("d2guessrlib:stat-type-list"))
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["count"] == 1
        assert response_json["results"] == [
            {
                "id": 1,
                "id_bungie": 1,
                "name": "stat_type",
                "desc": "stat_type",
                "localized_name": "stat_type",
                "localized_desc": "stat_type",
                "icon_url": None,
            }
        ]

        response = client.get(
            reverse("d2guessrlib:stat-type-detail", args=[stat_type.pk]),
        )
        assert response.status_code == 200
        assert response.json() == {
            "id": 1,
            "id_bungie": 1,
            "name": "stat_type",
            "desc": "stat_type",
            "localized_name": "stat_type",
            "localized_desc": "stat_type",
            "icon_url": None,
        }

    def test_class_type_view(self, client: APIClient, class_type: ClassType):
        response = client.get(reverse("d2guessrlib:class-type-list"))
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["count"] == 1
        assert response_json["results"] == [
            {
                "id": 1,
                "id_bungie": 1,
                "localized_name": "class_type",
                "name": "class_type",
            }
        ]

        response = client.get(
            reverse("d2guessrlib:class-type-detail", args=[class_type.pk]),
        )
        assert response.status_code == 200
        assert response.json() == {
            "id": 1,
            "id_bungie": 1,
            "localized_name": "class_type",
            "name": "class_type",
        }

    def test_category_view(self, client: APIClient, category: Category):
        response = client.get(reverse("d2guessrlib:category-list"))
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["count"] == 1
        assert response_json["results"] == [
            {
                "id": 1,
                "id_bungie": 1,
                "localized_name": "category",
                "name": "category",
                "icon_url": None,
                "localized_desc": "category",
            }
        ]

        response = client.get(
            reverse("d2guessrlib:category-detail", args=[category.pk]),
        )
        assert response.status_code == 200
        assert response.json() == {
            "id": 1,
            "id_bungie": 1,
            "localized_name": "category",
            "name": "category",
            "icon_url": None,
            "localized_desc": "category",
        }

    def test_tier_type_view(self, client: APIClient, tier_type: TierType):
        response = client.get(reverse("d2guessrlib:tier-type-list"))
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["count"] == 1
        assert response_json["results"] == [
            {
                "id": 1,
                "id_bungie": 1,
                "localized_name": "tier_type",
                "name": "tier_type",
            }
        ]

        response = client.get(
            reverse("d2guessrlib:tier-type-detail", args=[tier_type.pk]),
        )
        assert response.status_code == 200
        assert response.json() == {
            "id": 1,
            "id_bungie": 1,
            "localized_name": "tier_type",
            "name": "tier_type",
        }

    def test_item_view(self, client: APIClient, item: Item):
        response = client.get(reverse("d2guessrlib:item-list"))
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["count"] == 1
        assert response_json["results"] == [
            {
                "id": 1,
                "api_name": "item",
                "item_type": 1,
                "localized_name": "item",
                "tier_type": 1,
                "default_damage_type": 1,
                "class_type": 1,
                "category": 1,
                "icon_url": "fake_url",
                "weapon_slot": 2,
                "weapon_ammo_type": 1,
            }
        ]

        response = client.get(
            reverse("d2guessrlib:item-detail", args=[item.pk]),
        )
        assert response.status_code == 200
        assert response.json() == {
            "id": 1,
            "api_name": "item",
            "id_bungie": 1,
            "item_type": 1,
            "localized_name": "item",
            "localized_item_type": "Weapon",
            "localized_flavor_text": "This is some text",
            "localized_weapon_slot": "Kinetic",
            "localized_weapon_ammo_type": "Primary",
            "weapon_ammo_type": 1,
            "tier_type": 1,
            "class_type": 1,
            "category": 1,
            "icon_url": "fake_url",
            "screenshot_url": "fake_url_2",
            "default_damage_type": 1,
            "damage_types": [1],
            "localized_stats": [{"icon_url": None, "name": "stat_type", "value": 100}],
            "localized_perks": [
                {
                    "name": "perk",
                    "desc": "perk description",
                    "icon_url": None,
                    "is_intrinsic": False,
                }
            ],
        }

    def test_localization(
        self,
        client: APIClient,
        i18n_item: Item,
        i18n_damage_type: DamageType,
        i18n_stat_type: StatType,
        i18n_item_perk: Perk,
    ):
        # on item
        response = client.get(path=reverse("d2guessrlib:item-list"), data={"lang": "fr"})
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["count"] == 1
        assert response_json["results"] == [
            {
                "id": 1,
                "api_name": "item",
                "item_type": 1,
                "localized_name": "objet",
                "tier_type": 1,
                "class_type": 1,
                "category": 1,
                "icon_url": "fake_url",
                "default_damage_type": 1,
                "weapon_slot": 2,
                "weapon_ammo_type": 1,
            }
        ]

        response = client.get(path=reverse("d2guessrlib:item-detail", args=[i18n_item.pk]), data={"lang": "fr"})
        assert response.status_code == 200
        assert response.json() == {
            "id": 1,
            "api_name": "item",
            "id_bungie": 1,
            "item_type": 1,
            "localized_item_type": "Arme",
            "localized_name": "objet",
            "localized_flavor_text": "Je suis du texte",
            "localized_weapon_slot": "Cinétique",
            "localized_weapon_ammo_type": "Principale",
            "weapon_ammo_type": 1,
            "tier_type": 1,
            "class_type": 1,
            "category": 1,
            "icon_url": "fake_url",
            "screenshot_url": "fake_url_2",
            "default_damage_type": 1,
            "damage_types": [1],
            "localized_stats": [{"icon_url": None, "name": "Type de statistique", "value": 100}],
            "localized_perks": [
                {
                    "name": "attribut",
                    "desc": "description de l'attribut",
                    "icon_url": None,
                    "is_intrinsic": False,
                }
            ],
        }

        # on generic model (damage type here)
        response = client.get(path=reverse("d2guessrlib:damage-type-list"), data={"lang": "fr"})
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["count"] == 1
        assert response_json["results"] == [
            {
                "icon_url": None,
                "id": 1,
                "id_bungie": 1,
                "localized_name": "type_de_dommages",
                "name": "damage_type",
            }
        ]

        response = client.get(
            path=reverse("d2guessrlib:damage-type-detail", args=[i18n_damage_type.pk]),
            data={"lang": "fr"},
        )
        assert response.status_code == 200
        assert response.json() == {
            "icon_url": None,
            "id": 1,
            "id_bungie": 1,
            "localized_name": "type_de_dommages",
            "name": "damage_type",
        }
