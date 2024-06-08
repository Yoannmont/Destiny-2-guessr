
from rest_framework import generics
from .paginations import WeaponPagination
from django.http import HttpResponse
from .models import Weapon, TierDefinition, TypeDefinition, CategoryDefinition, DamageTypeDefinition, Armor, ObjectDefinition, ClassDefinition
from .serializers import TierDefinitionSerializer, TypeDefinitionSerializer, CategoryDefinitionSerializer, DamageTypeDefinitionSerializer, WeaponSerializer, ObjectDefinitionSerializer, ClassDefinitionSerializer, ArmorSerializer

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

class GetAllObjectsView(generics.ListAPIView):
    queryset = ObjectDefinition.objects.all()
    serializer_class = ObjectDefinitionSerializer

class GetAllClassesView(generics.ListAPIView):
    queryset = ClassDefinition.objects.all()
    serializer_class = ClassDefinitionSerializer

class GetWeaponsView(generics.ListAPIView):
    serializer_class = WeaponSerializer
    queryset = Weapon.objects.all().select_related(
        'tier', 
        'defaultDamageType', 
        'type', 
        'category',
        'objectType'
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
        'category',
        'objectType'
    ).prefetch_related(
        '_flavorText',
        '_name'
    )
    serializer_class = WeaponSerializer

class GetArmorView(generics.ListAPIView):
   queryset = Armor.objects.all().select_related(
       'tier',
       'objectType',
       'classType',
   ).prefetch_related(
       '_flavorText',
       '_name'
   )
   serializer_class = ArmorSerializer

class GetSingleArmorView(generics.RetrieveAPIView):
   queryset = Armor.objects.all().select_related(
       'tier',
       'objectType',
       'classType',
   ).prefetch_related(
       '_flavorText',
       '_name'
   )
   serializer_class = ArmorSerializer

def index(request):
    html = f'''
    <html>
        <body>
            <h1>Hello from D2G-server!</h1>
        </body>
    </html>
    '''
    return HttpResponse(html)