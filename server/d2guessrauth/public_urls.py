from django.urls import path

from d2guessrauth.views import CookieTokenRefreshView, SelectMembershipAPIView

app_name = "public-urls"

urlpatterns = [
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path(
        "select-membership/",
        SelectMembershipAPIView.as_view(),
        name="select_membership_view",
    ),
]
