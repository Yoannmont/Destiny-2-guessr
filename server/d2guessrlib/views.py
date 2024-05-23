from django.shortcuts import get_object_or_404, render
from rest_framework import generics
from traitlets import default
from .models import Weapon, TierDefinition, TypeDefinition, CategoryDefinition, DamageTypeDefinition, WeaponDamageTypes, WeaponFlavorText, WeaponName
from .serializers import TierDefinitionSerializer, TypeDefinitionSerializer, CategoryDefinitionSerializer, DamageTypeDefinitionSerializer, WeaponSerializer

class GetAllTiersView(generics.ListAPIView):
    queryset = TierDefinition.objects.all()
    serializer_class = TierDefinitionSerializer

class GetAllTypesView(generics.ListAPIView):
    queryset = TypeDefinition.objects.all()
    serializer_class = TypeDefinitionSerializer

class GetAllDamageTypesView(generics.ListAPIView):
    queryset = DamageTypeDefinition.objects.all()
    serializer_class = DamageTypeDefinitionSerializer

class GetAllCategoriesView(generics.ListAPIView):
    queryset = CategoryDefinition.objects.all()
    serializer_class = CategoryDefinitionSerializer


class GetWeaponsView(generics.ListAPIView):
    serializer_class = WeaponSerializer

    def get_queryset(self):
        queryset = Weapon.objects.all()
        query_params = self.request.query_params # type: ignore

        filters = {}

        category = query_params.get("category")
        if category:
            filters["category"] = category

        weapon_type = query_params.get("type")
        if weapon_type:
            filters["type"] = weapon_type

        tier = query_params.get("tier")
        if tier:
            filters["tier"] = tier

        default_damage_type = query_params.get("defaultDamageType")
        if default_damage_type:
            filters["defaultDamageType"] = default_damage_type
        

        if filters:
            queryset = queryset.filter(**filters)

        return queryset


class GetSingleWeaponView(generics.RetrieveAPIView):
    serializer_class = WeaponSerializer
    queryset = Weapon.objects.all()

    
    