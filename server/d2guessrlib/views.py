from django.shortcuts import get_object_or_404, render
from rest_framework import generics
from traitlets import default
from .paginations import WeaponPagination
from datetime import datetime
from django.http import HttpResponse
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
    queryset = Weapon.objects.all().select_related(
        'tier', 
        'defaultDamageType', 
        'type', 
        'category'
    ).prefetch_related(
        '_flavorText',
        '_name'
    )
    # pagination_class = WeaponPagination



class GetSingleWeaponView(generics.RetrieveAPIView):
    queryset = Weapon.objects.all().select_related(
        'tier', 
        'defaultDamageType', 
        'type', 
        'category'
    ).prefetch_related(
        '_flavorText',
        '_name'
    )
    serializer_class = WeaponSerializer




def index(request):
    html = f'''
    <html>
        <body>
            <h1>Hello from D2G-server!</h1>
        </body>
    </html>
    '''
    return HttpResponse(html)