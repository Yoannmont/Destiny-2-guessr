from django.urls import path

from mockups.views import MockBungieAuthorizeView, MockFrontendAuthCallbackView, MockFrontendMembershipSelection

urlpatterns = [
    path("mock-bungie/authorize/", MockBungieAuthorizeView.as_view(), name="mock-bungie-authorize"),
    path(
        "mock-frontend/membership-selection/",
        MockFrontendMembershipSelection.as_view(),
        name="mock-frontend-membership-selection",
    ),
    path("mock-frontend/auth-callback/", MockFrontendAuthCallbackView.as_view(), name="mock-front-callback"),
]
