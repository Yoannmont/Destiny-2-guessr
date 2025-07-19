from django.contrib import admin

from d2guessrlib.filters import ItemTypeFilter, WeaponAmmoTypeFilter, WeaponSlotFilter
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

# Register your models here.


@admin.register(DamageType)
class DamageTypeAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(TierType)
class TierTypeAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(ClassType)
class ClassTypeAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(StatType)
class StatTypeAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(ItemStat)
class ItemStatAdmin(admin.ModelAdmin):
    list_display = ("item__api_name", "stat_type", "value")


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("api_name", "default_damage_type", "category")
    search_fields = (
        "api_name",
        "id_bungie",
    )
    list_filter = (
        ItemTypeFilter,
        "tier_type",
        "class_type",
        "default_damage_type",
        "category",
        WeaponSlotFilter,
        WeaponAmmoTypeFilter,
        "season",
    )


@admin.register(ItemTranslation)
class ItemTranslationAdmin(admin.ModelAdmin):
    list_display = ("name", "language")
    search_fields = ("name",)


@admin.register(ContentTranslation)
class ContentTranslationAdmin(admin.ModelAdmin):
    list_display = ("field_name", "text", "language")
    search_fields = ("field_name", "text")


@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ("name", "season_number")
    search_fields = ("name", "season_number")
    ordering = ("season_number",)


@admin.register(Perk)
class PerkAdmin(admin.ModelAdmin):
    list_display = ("name",)
