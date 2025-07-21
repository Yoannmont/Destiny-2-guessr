"""
URL configuration for d2guessr project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="D2Guessr API",
        default_version="v1",
        description="API documentation",
        terms_of_service=None,
        contact=openapi.Contact(email="y.mont@orange.fr"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path("d2g/d2g-admin-7895/", admin.site.urls, name="admin-page"),
    path("d2g/api/v1/", include("d2guessrlib.urls", namespace="d2guessrlib")),
    path("d2g/auth/", include("d2guessrauth.auth_urls", namespace="auth-urls")),
    path("d2g/", include("d2guessrauth.public_urls", namespace="d2guessrauth")),
    path("d2g/", include("social_django.urls", namespace="social")),
    path("d2g/swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("d2g/redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]

if settings.ACTIVATE_MOCKUPS:
    urlpatterns += [path("", include("mockups.urls"))]

if settings.DEBUG:
    import debug_toolbar  # noqa

    urlpatterns = [
        path("__debug__/", include(debug_toolbar.urls)),
    ] + urlpatterns
