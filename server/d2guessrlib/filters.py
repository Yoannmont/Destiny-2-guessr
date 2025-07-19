from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django_filters import rest_framework as filters

from d2guessrlib.models import Item


class NumberInFilter(filters.BaseInFilter, filters.NumberFilter):
    pass


class ItemFilterSet(filters.FilterSet):
    item_type = filters.ChoiceFilter(choices=Item.ITEM_TYPE_CHOICES)
    weapon_slot = NumberInFilter(field_name="weapon_slot", lookup_expr="in")
    weapon_ammo_type = NumberInFilter(field_name="weapon_ammo_type", lookup_expr="in")
    tier_type = NumberInFilter(field_name="tier_type", lookup_expr="in")
    class_type = NumberInFilter(field_name="class_type", lookup_expr="in")
    default_damage_type = NumberInFilter(field_name="default_damage_type", lookup_expr="in")
    category = NumberInFilter(field_name="category", lookup_expr="in")

    class Meta:
        model = Item
        fields = [
            "item_type",
            "weapon_slot",
            "weapon_ammo_type",
            "class_type",
            "default_damage_type",
            "category",
            "tier_type",
        ]


class ItemTypeFilter(admin.SimpleListFilter):
    title = _("Item Type")
    parameter_name = "item_type"

    def lookups(self, request, model_admin):
        return [(key, value["en"]) for key, value in Item.ITEM_TYPE_LABELS.items()]

    def queryset(self, request, queryset):
        if value := self.value():
            return queryset.filter(item_type=value)
        return queryset


class WeaponSlotFilter(admin.SimpleListFilter):
    title = _("Weapon Slot")
    parameter_name = "weapon_slot"

    def lookups(self, request, model_admin):
        return [(key, value["en"]) for key, value in Item.WEAPON_SLOT_LABELS.items()]

    def queryset(self, request, queryset):
        if value := self.value():
            return queryset.filter(weapon_slot=value)
        return queryset


class WeaponAmmoTypeFilter(admin.SimpleListFilter):
    title = _("Weapon Ammo Type")
    parameter_name = "weapon_ammo_type"

    def lookups(self, request, model_admin):
        return [(key, value["en"]) for key, value in Item.WEAPON_AMMO_TYPE_LABELS.items()]

    def queryset(self, request, queryset):
        if value := self.value():
            return queryset.filter(weapon_ammo_type=value)
        return queryset
