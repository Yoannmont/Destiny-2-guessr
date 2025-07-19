from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.utils.translation import gettext_lazy as _


# Generic models that are translated using ContentTranslation
class DamageType(models.Model):
    id_bungie = models.BigIntegerField()
    name = models.CharField(max_length=50, unique=True)
    desc = models.TextField()
    icon_url = models.URLField(blank=True, null=True)
    translations = GenericRelation("ContentTranslation")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Category(models.Model):
    id_bungie = models.BigIntegerField()
    name = models.CharField(max_length=50, unique=True)
    desc = models.TextField()
    icon_url = models.URLField(blank=True, null=True)
    translations = GenericRelation("ContentTranslation")

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ["name"]

    def __str__(self):
        return self.name


class TierType(models.Model):
    id_bungie = models.BigIntegerField()
    name = models.CharField(max_length=50, unique=True)
    translations = GenericRelation("ContentTranslation")

    class Meta:
        verbose_name = _("Tier Type")
        verbose_name_plural = _("Tier Types")
        ordering = ["name"]

    def __str__(self):
        return self.name


class ClassType(models.Model):
    id_bungie = models.BigIntegerField()
    name = models.CharField(max_length=50, unique=True)
    translations = GenericRelation("ContentTranslation")

    class Meta:
        verbose_name = _("Class Type")
        verbose_name_plural = _("Class Types")
        ordering = ["name"]

    def __str__(self):
        return self.name


class StatType(models.Model):
    id_bungie = models.BigIntegerField(unique=True)
    name = models.CharField(max_length=50, unique=True)
    desc = models.TextField()
    icon_url = models.URLField(blank=True, null=True)
    translations = GenericRelation("ContentTranslation")

    class Meta:
        verbose_name = _("Statistic Type")
        verbose_name_plural = _("Statistic Types")
        ordering = ["name"]

    def __str__(self):
        return self.name


class ContentTranslation(models.Model):
    language = models.CharField(max_length=10)
    field_name = models.CharField(max_length=40)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    text = models.CharField(max_length=60)

    class Meta:
        unique_together = ("language", "field_name", "content_type", "object_id")

    def __str__(self):
        return f"{self.language.upper()} - {self.content_object} ({self.field_name})"


# Not used
class Season(models.Model):
    id_bungie = models.BigIntegerField(unique=True)
    name = models.CharField(max_length=100)
    desc = models.TextField(null=True)
    season_number = models.IntegerField()
    icon_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Season({self.season_number}: {self.name})"


class Perk(models.Model):
    id_bungie = models.BigIntegerField(unique=True)
    name = models.CharField(max_length=100)
    desc = models.TextField()
    icon_url = models.URLField(blank=True, null=True)
    is_intrinsic = models.BooleanField(default=False)
    translations = GenericRelation("ContentTranslation")

    def __str__(self):
        return f"{self.name}" + " (Intrinsic)" if self.is_intrinsic else ""


# Item models
class Item(models.Model):
    ITEM_TYPE_LABELS = {
        1: {
            "en": "Weapon",
            "fr": "Arme",
            "de": "Waffe",
            "es": "Arma",
            "it": "Arma",
            "ja": "武器",
        },
        20: {
            "en": "Armor",
            "fr": "Armure",
            "de": "Rüstung",
            "es": "Armadura",
            "it": "Armatura",
            "ja": "防具",
        },
    }

    WEAPON_SLOT_LABELS = {
        2: {
            "en": "Kinetic",
            "fr": "Cinétique",
            "de": "Kinetisch",
            "es": "Cinético",
            "it": "Cinetico",
            "ja": "キネティック",
        },
        3: {
            "en": "Energy",
            "fr": "Énergétique",
            "de": "Energie",
            "es": "Energético",
            "it": "Energetico",
            "ja": "エネルギー",
        },
        4: {
            "en": "Power",
            "fr": "Puissante",
            "de": "Schwere",
            "es": "Poderosa",
            "it": "Potente",
            "ja": "パワー",
        },
    }

    WEAPON_AMMO_TYPE_LABELS = {
        1: {
            "en": "Primary",
            "fr": "Principale",
            "de": "Primär",
            "es": "Primaria",
            "it": "Primaria",
            "ja": "メイン",
        },
        2: {
            "en": "Special",
            "fr": "Spéciale",
            "de": "Spezial",
            "es": "Especial",
            "it": "Speciale",
            "ja": "スペシャル",
        },
        3: {
            "en": "Heavy",
            "fr": "Lourde",
            "de": "Schwere",
            "es": "Pesada",
            "it": "Pesante",
            "ja": "ヘビー",
        },
    }

    WEAPON_AMMO_TYPE_CHOICES = (
        (1, "Primary"),
        (2, "Special"),
        (3, "Heavy"),
    )

    ITEM_TYPE_CHOICES = (
        (1, "Weapon"),
        (20, "Armor"),
    )

    WEAPON_SLOT_CHOICES = (
        (2, "Kinetic"),
        (3, "Energy"),
        (4, "Power"),
    )

    id_bungie = models.BigIntegerField()
    api_name = models.CharField(max_length=100, unique=True)
    item_type = models.IntegerField(choices=ITEM_TYPE_CHOICES, null=False)
    tier_type = models.ForeignKey(TierType, on_delete=models.PROTECT)
    class_type = models.ForeignKey(ClassType, on_delete=models.PROTECT, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    icon_url = models.URLField(blank=True, null=True)
    screenshot_url = models.URLField(blank=True, null=True)
    default_damage_type = models.ForeignKey(DamageType, on_delete=models.PROTECT, null=True)
    damage_types = models.ManyToManyField(DamageType, related_name="items")
    flavor_text = models.TextField()
    weapon_slot = models.IntegerField(choices=WEAPON_SLOT_CHOICES, null=True)
    weapon_ammo_type = models.IntegerField(choices=WEAPON_AMMO_TYPE_CHOICES, null=True)
    stat_group_hash = models.BigIntegerField(null=True)
    season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True)
    perks = models.ManyToManyField(Perk, related_name="items")

    class Meta:
        ordering = ["api_name"]

    def __str__(self):
        return self.api_name

    def get_localized_type(self, lang="en"):
        return self.ITEM_TYPE_LABELS.get(self.item_type, {}).get(lang, self.ITEM_TYPE_LABELS[self.item_type]["en"])

    def get_localized_weapon_slot(self, lang="en"):
        if self.item_type != 1 or self.weapon_slot is None:
            return None
        return self.WEAPON_SLOT_LABELS.get(self.weapon_slot, {}).get(
            lang, self.WEAPON_SLOT_LABELS.get(self.weapon_slot, {}).get("en", "Unknown")
        )

    def get_localized_weapon_ammo_type(self, lang="en"):
        if self.item_type != 1 or self.weapon_ammo_type is None:
            return None
        return self.WEAPON_AMMO_TYPE_LABELS.get(self.weapon_ammo_type, {}).get(
            lang,
            self.WEAPON_AMMO_TYPE_LABELS.get(self.weapon_ammo_type, {}).get("en", "Unknown"),
        )


class ItemStat(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="stats")
    stat_type = models.ForeignKey(StatType, on_delete=models.PROTECT)
    value = models.IntegerField()

    class Meta:
        unique_together = ("item", "stat_type")

    def __str__(self):
        return f"{self.item.api_name} - {self.stat_type.name}: {self.value}"


class ItemTranslation(models.Model):
    item = models.ForeignKey(Item, related_name="translations", on_delete=models.CASCADE)
    language = models.CharField(max_length=10)
    name = models.CharField(max_length=255)
    flavor_text = models.TextField(null=True)

    class Meta:
        unique_together = ("item", "language")

    def __str__(self):
        return f"{self.name}"
