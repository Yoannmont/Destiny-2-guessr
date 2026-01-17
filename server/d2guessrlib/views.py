import logging

from django.conf import settings
from django.db.models import Prefetch
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from d2guessrlib.filters import ItemFilterSet
from d2guessrlib.models import Category, ClassType, DamageType, Item, ItemTranslation, StatType, TierType
from d2guessrlib.paginations import ItemPagination
from d2guessrlib.serializers import (
    CategorySerializer,
    ClassTypeSerializer,
    DamageTypeSerializer,
    ItemDetailSerializer,
    ItemSerializer,
    StatTypeSerializer,
    TierTypeSerializer,
)

logger = logging.getLogger("views")


class CachedReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Base readonly class with caching. Should NOT be used directly.
    """

    def dispatch(self, request, *args, **kwargs):
        if self.__class__ == CachedReadOnlyViewSet:
            raise NotImplementedError("Do not use CachedReadOnlyViewSet directly.")
        return super().dispatch(request, *args, **kwargs)

    @method_decorator(
        name="list",
        decorator=swagger_auto_schema(
            operation_description="List all instances.",
            responses={200: "List of objects"},
        ),
    )
    @method_decorator(cache_page(settings.CACHE_TTL), name="list")
    def list(self, request, *args, **kwargs):
        logger.info(f"Fetched {self.__class__.__name__} list view")
        return super().list(request, *args, **kwargs)

    @method_decorator(
        name="retrieve",
        decorator=swagger_auto_schema(
            operation_description="Retrieve a specific instance by ID.",
            responses={200: "Object details", 404: "Not found"},
        ),
    )
    @method_decorator(cache_page(settings.CACHE_TTL), name="retrieve")
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        logger.info(f"Fetched {str(instance)} detail view")
        return Response(serializer.data)


class ItemViewSet(CachedReadOnlyViewSet):
    pagination_class = ItemPagination
    filterset_class = ItemFilterSet

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    ordering_fields = ["translations__name", "tier_type", "default_damage_type", "category"]
    ordering = ["translations__name"]
    search_fields = ["translations__name"]

    def get_serializer_class(self):
        return ItemSerializer if self.action == "list" else ItemDetailSerializer

    def get_queryset(self):
        lang = self.request.query_params.get("lang", "en")

        return (
            Item.objects.all()
            .prefetch_related(
                Prefetch(
                    "translations",
                    queryset=ItemTranslation.objects.filter(language=lang),
                    to_attr="localized_translations",
                ),
                "perks__translations",
                "stats__stat_type__translations",
                "damage_types",
            )
            .select_related("tier_type", "class_type", "category", "default_damage_type")
        )


class DamageTypeViewSet(CachedReadOnlyViewSet):
    queryset = DamageType.objects.all()
    serializer_class = DamageTypeSerializer


class CategoryViewSet(CachedReadOnlyViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TierTypeViewSet(CachedReadOnlyViewSet):
    queryset = TierType.objects.all()
    serializer_class = TierTypeSerializer


class ClassTypeViewSet(CachedReadOnlyViewSet):
    queryset = ClassType.objects.all()
    serializer_class = ClassTypeSerializer


class StatTypeViewSet(CachedReadOnlyViewSet):
    queryset = StatType.objects.all()
    serializer_class = StatTypeSerializer
