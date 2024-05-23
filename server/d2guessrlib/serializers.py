
from rest_framework import serializers
from .models import TierDefinition, DamageTypeDefinition, TypeDefinition, CategoryDefinition, Weapon,  WeaponDamageTypes, WeaponFlavorText, WeaponName, AVAILABLE_LANGS


class LanguageFilterSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        lang = self.context['request'].query_params.get('lang', None)
        data = super().to_representation(instance)
        if lang in AVAILABLE_LANGS :
            filtered_data = {}
            for field_name, value in data.items():
                if "_" in field_name:
                    if field_name.endswith(f"_{lang}"):
                        filtered_data[field_name] = value
                else : 
                    filtered_data[field_name] = value
            return filtered_data
        return data


class TierDefinitionSerializer(LanguageFilterSerializer):
    class Meta:
        model = TierDefinition
        fields = "__all__"

class TypeDefinitionSerializer(LanguageFilterSerializer):
    class Meta:
        model = TypeDefinition
        fields = "__all__"

class DamageTypeDefinitionSerializer(LanguageFilterSerializer):
    class Meta:
        model = DamageTypeDefinition
        fields = "__all__"

class CategoryDefinitionSerializer(LanguageFilterSerializer):
    class Meta:
        model = CategoryDefinition
        fields = "__all__"

class WeaponNameSerializer(LanguageFilterSerializer):
    class Meta:
        model = WeaponName
        exclude = ["id", "weapon"]

class WeaponFlavorTextSerializer(LanguageFilterSerializer):
    class Meta:
        model = WeaponFlavorText
        exclude = ["id", "weapon"]

class WeaponDamageTypesSerializer(LanguageFilterSerializer):
    hash = serializers.CharField(source="damageType.hash")
    damageType = serializers.IntegerField(source="damageType.id")
    class Meta:
        model = WeaponDamageTypes
        fields = ["damageType", "hash"]

class WeaponSerializer(serializers.ModelSerializer):  
    def to_representation(self, instance):
        lang = self.context['request'].query_params.get('lang', None)
        if lang in AVAILABLE_LANGS:
            self.fields['type'] = serializers.CharField(source=f"type.type_{lang}")
            self.fields['category'] = serializers.CharField(source=f"category.category_{lang}")
            self.fields['tier'] = serializers.CharField(source=f"tier.tier_{lang}")
            self.fields['defaultDamageType'] = serializers.CharField(source=f"defaultDamageType.damageType_{lang}")
            self.fields['flavorText'] = WeaponFlavorTextSerializer(source="_flavorText", many=True)
            self.fields['name'] = WeaponNameSerializer(source="_name", many=True)
            self.fields['damageTypes'] = WeaponDamageTypesSerializer(source=f"_damageTypes", many=True)
        else :
            # self.fields['type'] = TypeDefinitionSerializer()
            # self.fields['category'] = CategoryDefinitionSerializer()
            # self.fields['tier'] = TierDefinitionSerializer()
            # self.fields['defaultDamageType'] = DamageTypeDefinitionSerializer()
            self.fields['flavorText'] = WeaponFlavorTextSerializer(source="_flavorText", many=True)
            self.fields['name'] = WeaponNameSerializer(source="_name", many=True)
            self.fields['damageTypes'] = WeaponDamageTypesSerializer(source=f"_damageTypes", many=True)
            
        return super().to_representation(instance)


    class Meta :
        model = Weapon
        fields = "__all__"