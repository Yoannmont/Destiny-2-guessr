from django.urls import include, path
from rest_framework.routers import DefaultRouter

from d2guessrlib import views

app_name = "d2guessrlib"

router = DefaultRouter()
router.register("items", views.ItemViewSet, basename="item")
router.register("damage-types", views.DamageTypeViewSet, basename="damage-type")
router.register("categories", views.CategoryViewSet, basename="category")
router.register("class-types", views.ClassTypeViewSet, basename="class-type")
router.register("tier-types", views.TierTypeViewSet, basename="tier-type")
router.register("stat-types", views.StatTypeViewSet, basename="stat-type")
urlpatterns = [path("", include(router.urls))]
