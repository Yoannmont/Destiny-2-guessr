from django.db import models

AVAILABLE_LANGS = ["en", "fr"]

class TierDefinition(models.Model):
    tier_en = models.CharField()
    tier_fr = models.CharField()
    hash = models.CharField()

class DamageTypeDefinition(models.Model):
    damageType_en = models.CharField()
    damageType_fr = models.CharField()
    iconLink = models.CharField()
    hash = models.CharField()

class TypeDefinition(models.Model):
    type_en = models.CharField()
    type_fr = models.CharField()
    hash = models.CharField()

class CategoryDefinition(models.Model):
    category_en = models.CharField()
    category_fr = models.CharField()
    hash = models.CharField()

class Weapon(models.Model):
    tier = models.ForeignKey(TierDefinition, on_delete=models.CASCADE)
    defaultDamageType = models.ForeignKey(DamageTypeDefinition, on_delete=models.CASCADE)
    iconLink = models.CharField()
    screenshotLink = models.CharField()
    type = models.ForeignKey(TypeDefinition, on_delete=models.CASCADE)
    category = models.ForeignKey(CategoryDefinition, on_delete=models.CASCADE)
    hash = models.CharField()

class WeaponName(models.Model):
    weapon = models.ForeignKey(Weapon, on_delete=models.CASCADE, related_name="_name")
    name_en = models.CharField()
    name_fr = models.CharField()

class WeaponDamageTypes(models.Model):
    weapon = models.ForeignKey(Weapon, on_delete=models.CASCADE, related_name="_damageTypes")
    damageType = models.ForeignKey(DamageTypeDefinition, on_delete=models.CASCADE)

class WeaponFlavorText(models.Model):
    weapon = models.ForeignKey(Weapon, on_delete=models.CASCADE, related_name="_flavorText")
    flavorText_en = models.CharField()
    flavorText_fr = models.CharField()

