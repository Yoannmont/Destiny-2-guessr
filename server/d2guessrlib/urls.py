from django.urls import path
from . import views

app_name = "d2guessrlib"

urlpatterns = [
    path("", views.index, name="index"),
    path("getSingleWeapon/<int:pk>", views.GetSingleWeaponView.as_view(), name="single-weapon-view"),
    path("getWeapons/", views.GetWeaponsView.as_view(), name="weapons-view"),
    path("getAllTiers/", views.GetAllTiersView.as_view(), name="all-tiers-view"),
    path("getAllTypes/", views.GetAllTypesView.as_view(), name="all-types-view"),
    path("getAllDamageTypes/", views.GetAllDamageTypesView.as_view(), name="all-damage-types-view"),
    path("getAllCategories/", views.GetAllCategoriesView.as_view(), name="all-categories-view"),
    
]