import pytest
from django.http import HttpRequest, QueryDict

from d2guessrlib.admin import ItemAdmin
from d2guessrlib.filters import ItemTypeFilter, WeaponAmmoTypeFilter, WeaponSlotFilter
from d2guessrlib.models import Item


@pytest.mark.django_db
class TestItemTypeFilter:
    def test_lookups(self):
        f = ItemTypeFilter(request=HttpRequest(), params={}, model=Item, model_admin=ItemAdmin)
        expected = [(1, "Weapon"), (20, "Armor")]
        assert f.lookups(None, None) == expected

    def test_queryset_filtering(self, tier_type, class_type, category, damage_type):
        item_1 = Item(
            id_bungie=1,
            api_name="item_1",
            item_type=1,  # Armor
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
        item_1.save()
        item_1.damage_types.add(damage_type)

        item_2 = Item(
            id_bungie=2,
            api_name="item_2",
            item_type=20,  # Weapon
            tier_type=tier_type,
            class_type=class_type,
            category=category,
            icon_url="fake_url",
            screenshot_url="fake_url_2",
            flavor_text="This is some text",
        )
        item_2.save()

        request = HttpRequest()
        f = ItemTypeFilter(
            request=request,
            params={},
            model=Item,
            model_admin=ItemAdmin,
        )
        qs = f.queryset(request, Item.objects.all())

        assert qs.count() == 2

        request = HttpRequest()
        request.GET = QueryDict("item_type=1")
        f = ItemTypeFilter(
            request=request,
            params=request.GET.copy(),
            model=Item,
            model_admin=ItemAdmin,
        )
        qs = f.queryset(request, Item.objects.all())

        assert qs.count() == 1
        assert qs.first() == item_1

        request = HttpRequest()
        request.GET = QueryDict("item_type=20")
        f = ItemTypeFilter(
            request=request,
            params=request.GET.copy(),
            model=Item,
            model_admin=ItemAdmin,
        )
        qs = f.queryset(request, Item.objects.all())

        assert qs.count() == 1
        assert qs.first() == item_2


@pytest.mark.django_db
class TestWeaponSlotFilter:
    def test_lookups(self):
        f = WeaponSlotFilter(request=HttpRequest(), params={}, model=Item, model_admin=None)
        expected = [(2, "Kinetic"), (3, "Energy"), (4, "Power")]
        assert f.lookups(None, None) == expected

    def test_queryset_filtering(self, tier_type, class_type, category, damage_type):
        item_1 = Item(
            id_bungie=1,
            api_name="item_1",
            item_type=1,
            tier_type=tier_type,
            class_type=class_type,
            category=category,
            icon_url="fake_url",
            screenshot_url="fake_url_2",
            default_damage_type=damage_type,
            flavor_text="This is some text",
            weapon_slot=2,  # Energy
        )
        item_1.save()
        item_1.damage_types.add(damage_type)

        item_2 = Item(
            id_bungie=2,
            api_name="item_2",
            item_type=20,
            tier_type=tier_type,
            class_type=class_type,
            category=category,
            icon_url="fake_url",
            screenshot_url="fake_url_2",
            flavor_text="This is some text",
            weapon_slot=3,  # Power
        )
        item_2.save()
        item_2.damage_types.add(damage_type)

        request = HttpRequest()
        f = WeaponSlotFilter(
            request=request,
            params={},
            model=Item,
            model_admin=ItemAdmin,
        )
        qs = f.queryset(request, Item.objects.all())

        assert qs.count() == 2

        request = HttpRequest()
        request.GET = QueryDict("weapon_slot=2")
        f = WeaponSlotFilter(
            request=request,
            params=request.GET.copy(),
            model=Item,
            model_admin=ItemAdmin,
        )
        qs = f.queryset(request, Item.objects.all())

        assert qs.count() == 1
        assert qs.first() == item_1

        request = HttpRequest()
        request.GET = QueryDict("weapon_slot=3")
        f = WeaponSlotFilter(
            request=request,
            params=request.GET.copy(),
            model=Item,
            model_admin=ItemAdmin,
        )
        qs = f.queryset(request, Item.objects.all())

        assert qs.count() == 1
        assert qs.first() == item_2


@pytest.mark.django_db
class TestWeaponAmmoTypeFilter:
    def test_lookups(self):
        f = WeaponAmmoTypeFilter(request=HttpRequest(), params={}, model=Item, model_admin=None)
        expected = [(1, "Primary"), (2, "Special"), (3, "Heavy")]
        assert f.lookups(None, None) == expected

    def test_queryset_filtering(self, tier_type, class_type, category, damage_type):
        item_1 = Item(
            id_bungie=1,
            api_name="item_1",
            item_type=1,
            tier_type=tier_type,
            class_type=class_type,
            category=category,
            icon_url="fake_url",
            screenshot_url="fake_url_2",
            default_damage_type=damage_type,
            flavor_text="This is some text",
            weapon_slot=2,
            weapon_ammo_type=1,  # Primary
        )
        item_1.save()
        item_1.damage_types.add(damage_type)

        item_2 = Item(
            id_bungie=2,
            api_name="item_2",
            item_type=20,
            tier_type=tier_type,
            class_type=class_type,
            category=category,
            icon_url="fake_url",
            screenshot_url="fake_url_2",
            flavor_text="This is some text",
            weapon_slot=3,
            weapon_ammo_type=2,  # Special
        )
        item_2.save()
        item_2.damage_types.add(damage_type)

        request = HttpRequest()
        f = WeaponAmmoTypeFilter(
            request=request,
            params={},
            model=Item,
            model_admin=ItemAdmin,
        )
        qs = f.queryset(request, Item.objects.all())

        assert qs.count() == 2

        request = HttpRequest()
        request.GET = QueryDict("weapon_ammo_type=1")
        f = WeaponAmmoTypeFilter(
            request=request,
            params=request.GET.copy(),
            model=Item,
            model_admin=ItemAdmin,
        )
        qs = f.queryset(request, Item.objects.all())

        assert qs.count() == 1
        assert qs.first() == item_1

        request = HttpRequest()
        request.GET = QueryDict("weapon_ammo_type=2")
        f = WeaponAmmoTypeFilter(
            request=request,
            params=request.GET.copy(),
            model=Item,
            model_admin=ItemAdmin,
        )
        qs = f.queryset(request, Item.objects.all())

        assert qs.count() == 1
        assert qs.first() == item_2
