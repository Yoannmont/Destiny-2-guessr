from django.urls import path

from d2guessrauth.views import (
    AccountInfoView,
    BungieAccountItemView,
    DisconnectBungieAccountView,
    LogoutView,
)

app_name = "auth-urls"

urlpatterns = [
    path("account/info/", AccountInfoView.as_view(), name="account-info"),
    path(
        "disconnect-bungie-account/",
        DisconnectBungieAccountView.as_view(),
        name="disconnect-bungie",
    ),
    path("logout/", LogoutView.as_view(), name="logout"),
    path(
        "account-items/<int:destiny_membership_id>/",
        BungieAccountItemView.as_view(),
        name="account-items-view",
    ),
]
