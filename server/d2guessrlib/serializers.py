from rest_framework import serializers

from d2guessrlib.filters import ItemFilterSet
from d2guessrlib.models import (
    Category,
    ClassType,
    ContentTranslation,
    DamageType,
    Item,
    StatType,
    TierType,
)


class LocalizedSerializer(serializers.ModelSerializer):
    """Base abstract class to localize serializers
    by providing 'lang' query parameter in requests.
    Fallback to 'en' if not valid.
    """

    class Meta:
        abstract = True

    def get_language(self):
        request = self.context.get("request")
        if request and request.query_params.get("lang"):
            return request.query_params.get("lang")
        return "en"


class ItemDetailSerializer(LocalizedSerializer):
    localized_name = serializers.SerializerMethodField()
    localized_flavor_text = serializers.SerializerMethodField()
    localized_item_type = serializers.SerializerMethodField()
    localized_weapon_slot = serializers.SerializerMethodField()
    localized_weapon_ammo_type = serializers.SerializerMethodField()
    localized_stats = serializers.SerializerMethodField()
    localized_perks = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            "id",
            "api_name",
            "id_bungie",
            "item_type",
            "localized_item_type",
            "localized_name",
            "localized_flavor_text",
            "localized_weapon_slot",
            "localized_weapon_ammo_type",
            "weapon_ammo_type",
            "tier_type",
            "class_type",
            "category",
            "icon_url",
            "screenshot_url",
            "default_damage_type",
            "damage_types",
            "localized_stats",
            "localized_perks",
        ]

    def get_localized_name(self, obj: Item):
        translations = getattr(obj, "localized_translations", [])
        if translations:
            return translations[0].name
        return obj.api_name

    def get_localized_flavor_text(self, obj: Item):
        translations = getattr(obj, "localized_translations", [])
        if translations:
            return translations[0].flavor_text
        return obj.flavor_text

    def get_localized_item_type(self, obj: Item):
        lang = self.get_language()
        return obj.get_localized_type(lang)

    def get_localized_weapon_slot(self, obj: Item):
        lang = self.get_language()
        return obj.get_localized_weapon_slot(lang)

    def get_localized_weapon_ammo_type(self, obj: Item):
        lang = self.get_language()
        return obj.get_localized_weapon_ammo_type(lang)

    def get_localized_stats(self, obj: Item):
        lang = self.get_language()
        stats = []

        for item_stat in obj.stats.select_related("stat_type").all():
            stat_type = item_stat.stat_type
            try:
                translated_name = stat_type.translations.get(language=lang, field_name="name").text
            except Exception:
                translated_name = stat_type.name

            stats.append(
                {
                    "name": translated_name,
                    "value": item_stat.value,
                    "icon_url": stat_type.icon_url,
                }
            )

        return stats

    def get_localized_perks(self, obj: Item):
        lang = self.get_language()
        perks = []

        for item_perk in obj.perks.all():
            try:
                perk_translations = item_perk.translations.filter(language=lang)
                perk_localized_name = perk_translations.get(field_name="name").text
                perk_localized_desc = perk_translations.get(field_name="desc").text
            except Exception:
                perk_localized_name = item_perk.name
                perk_localized_desc = item_perk.desc

            perks.append(
                {
                    "name": perk_localized_name,
                    "desc": perk_localized_desc,
                    "icon_url": item_perk.icon_url,
                    "is_intrinsic": item_perk.is_intrinsic,
                }
            )

        return perks


class ItemSerializer(ItemDetailSerializer):
    filterset_class = ItemFilterSet

    class Meta(ItemDetailSerializer.Meta):
        fields = [
            "id",
            "api_name",
            "localized_name",
            "item_type",
            "tier_type",
            "class_type",
            "category",
            "icon_url",
            "default_damage_type",
            "weapon_slot",
            "weapon_ammo_type",
        ]


class DamageTypeSerializer(LocalizedSerializer):
    localized_name = serializers.SerializerMethodField()

    class Meta:
        model = DamageType
        fields = ["id", "id_bungie", "name", "localized_name", "icon_url"]

    def get_localized_name(self, obj: DamageType):
        lang = self.get_language()
        try:
            return obj.translations.get(language=lang, field_name="name").text
        except ContentTranslation.DoesNotExist:
            return obj.name


class CategorySerializer(LocalizedSerializer):
    localized_name = serializers.SerializerMethodField()
    localized_desc = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "id_bungie",
            "name",
            "localized_name",
            "localized_desc",
            "icon_url",
        ]

    def get_localized_name(self, obj: Category):
        lang = self.get_language()
        try:
            return obj.translations.get(language=lang, field_name="name").text
        except ContentTranslation.DoesNotExist:
            return obj.name

    def get_localized_desc(self, obj: Category):
        lang = self.get_language()
        try:
            return obj.translations.get(language=lang, field_name="desc").text
        except ContentTranslation.DoesNotExist:
            return obj.name


class ClassTypeSerializer(LocalizedSerializer):
    localized_name = serializers.SerializerMethodField()

    class Meta:
        model = ClassType
        fields = [
            "id",
            "id_bungie",
            "name",
            "localized_name",
        ]

    def get_localized_name(self, obj: ClassType):
        lang = self.get_language()
        try:
            return obj.translations.get(language=lang, field_name="name").text
        except ContentTranslation.DoesNotExist:
            return obj.name


class TierTypeSerializer(LocalizedSerializer):
    localized_name = serializers.SerializerMethodField()

    class Meta:
        model = TierType
        fields = [
            "id",
            "id_bungie",
            "name",
            "localized_name",
        ]

    def get_localized_name(self, obj: TierType):
        lang = self.get_language()
        try:
            return obj.translations.get(language=lang, field_name="name").text
        except ContentTranslation.DoesNotExist:
            return obj.name


class StatTypeSerializer(LocalizedSerializer):
    localized_name = serializers.SerializerMethodField()
    localized_desc = serializers.SerializerMethodField()

    class Meta:
        model = StatType
        fields = [
            "id",
            "id_bungie",
            "name",
            "desc",
            "localized_name",
            "localized_desc",
            "icon_url",
        ]

    def get_localized_name(self, obj: StatType):
        lang = self.get_language()
        try:
            return obj.translations.get(language=lang, field_name="name").text
        except ContentTranslation.DoesNotExist:
            return obj.name

    def get_localized_desc(self, obj: StatType):
        lang = self.get_language()
        try:
            return obj.translations.get(language=lang, field_name="desc").text
        except ContentTranslation.DoesNotExist:
            return obj.name
