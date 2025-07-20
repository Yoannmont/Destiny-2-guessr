import logging
from typing import Iterable

from django.conf import settings
from django.db.models import Prefetch
from django.urls import reverse
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from social_core.actions import do_disconnect
from social_django.utils import load_backend, load_strategy

from d2guessrauth.models import BungieAccount
from d2guessrlib.filters import ItemFilterSet
from d2guessrlib.models import ItemTranslation
from d2guessrlib.paginations import ItemPagination
from d2guessrlib.serializers import ItemSerializer

logger = logging.getLogger("views")


class AccountInfoView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get user's Bungie membership info.",
        responses={200: openapi.Response("Memberships retrieved")},
    )
    def get(self, request):
        user = request.user
        bungie_user = getattr(user, "bungie_user", None)

        if not bungie_user:
            logger.critical("User %s has no associated BungieUser.", user)
            return Response({"error": "No associated Bungie user found."}, status=status.HTTP_404_NOT_FOUND)

        accounts: Iterable[BungieAccount] = bungie_user.accounts.all()
        memberships = [
            {
                "membershipId": account.destiny_membership_id,
                "membershipType": account.membership_type,
                "displayName": account.account_display_name,
                "lastAuthDate": account.last_auth_date,
            }
            for account in accounts
        ]
        return Response({"memberships": memberships})


class SelectMembershipAPIView(APIView):
    @swagger_auto_schema(
        operation_description="Get list of Bungie memberships stored in session for selection.",
        responses={200: "Memberships list"},
    )
    def get(self, request):
        memberships = request.session.get("memberships", [])
        return Response({"memberships": memberships})

    @swagger_auto_schema(
        operation_description="Select a Bungie membership.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["membership_id"],
            properties={
                "membership_id": openapi.Schema(type=openapi.TYPE_STRING, description="Selected membership ID"),
            },
        ),
        responses={
            200: "Membership selected",
            400: "Invalid membership ID",
        },
    )
    def post(self, request):
        memberships = request.session.get("memberships", [])
        memberships_dict = {m["membershipId"]: m for m in memberships}

        selected_id = request.data.get("membership_id")

        if not selected_id or selected_id not in memberships_dict:
            logger.error("Invalid membership ID selected: %s", selected_id)
            return Response({"error": "Invalid membership ID"}, status=status.HTTP_400_BAD_REQUEST)

        selected = memberships_dict[selected_id]
        request.session["selected_destiny_membership_id"] = selected_id
        request.session["selected_destiny_membership_type"] = selected["membershipType"]
        request.session["selected_destiny_display_name"] = selected["displayName"]

        continue_url = reverse("social:complete", args=("bungie",))
        return Response(
            {"message": "Membership selected successfully.", "redirect_url": continue_url},
            status=status.HTTP_200_OK,
        )


class BungieAccountItemView(ListAPIView):
    pagination_class = ItemPagination
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = ItemFilterSet

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    ordering_fields = ["translations__name", "tier_type", "default_damage_type", "category"]
    ordering = ["translations__name"]
    search_fields = ["translations__name"]

    @swagger_auto_schema(
        operation_description="Get items for a Bungie account by destiny_membership_id.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["destiny_membership_id"],
            properties={
                "destiny_membership_id": openapi.Schema(
                    type=openapi.TYPE_STRING, description="Selected Destiny membership ID"
                ),
            },
        ),
        responses={200: "List of items", 400: "Incorrect destiny_membership_id value", 404: "Account not found"},
    )
    def get_queryset(self):
        lang = self.request.query_params.get("lang", "en")
        user = self.request.user
        destiny_membership_id = self.kwargs.get("destiny_membership_id")

        try:
            destiny_membership_id = int(destiny_membership_id)
        except ValueError:
            raise ValidationError("Incorrect destiny_membership_id value")

        bungie_user = getattr(user, "bungie_user", None)
        if not bungie_user:
            logger.critical("User %s has no associated BungieUser.", user)
            raise NotFound("No associated Bungie user found.")

        try:
            bungie_account = bungie_user.accounts.get(destiny_membership_id=destiny_membership_id)
        except BungieAccount.DoesNotExist:
            logger.critical(
                "BungieAccount with destiny_membership_id %s not found for user %s",
                destiny_membership_id,
                user,
            )
            raise NotFound(f"Bungie account with destiny_membership_id '{destiny_membership_id}' not found.")

        return (
            bungie_account.items.all()
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


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Logout by blacklisting refresh token.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["refresh"],
            properties={
                "refresh": openapi.Schema(type=openapi.TYPE_STRING, description="Refresh token"),
            },
        ),
        responses={
            204: "Logged out successfully",
            400: "Invalid or missing token",
        },
    )
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            logger.error("No refresh token in request when trying to logout %s", request.user)
            return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_400_BAD_REQUEST)

        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(
            key="refresh_token",
            domain=settings.SESSION_COOKIE_DOMAIN,
            samesite=settings.SESSION_COOKIE_SAMESITE,
        )
        return response


class DisconnectBungieAccountView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Disconnect Bungie account from user.",
        responses={
            200: "Successfully disconnected",
            400: "Disconnection failed",
        },
    )
    def post(self, request, *args, **kwargs):
        user = request.user
        provider = "bungie"

        strategy = load_strategy(request)
        backend = load_backend(strategy, provider, redirect_uri=None)

        try:
            do_disconnect(strategy=strategy, user=user, backend=backend)
            return Response({"message": "Bungie account disconnected successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to disconnect Bungie account: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST
            )


class CookieTokenRefreshView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token_str = request.COOKIES.get("refresh_token")

            if not refresh_token_str:
                return Response(
                    {"error": "Refresh token not found in cookies"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            try:
                refresh = RefreshToken(refresh_token_str)
            except TokenError as e:
                logger.critical("Unknown error during token refresh: %r", e)
                return Response(
                    {"error": "Invalid or expired refresh token"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            access_token_obj = refresh.access_token

            membership_id = refresh.payload.get("membership_id")
            display_name = refresh.payload.get("display_name")
            membership_type = refresh.payload.get("membership_type")
            last_auth_date = refresh.payload.get("last_auth_date")
            logger.debug("Found payload info %s", refresh.payload.items())

            access_token_obj["membership_id"] = membership_id
            access_token_obj["display_name"] = display_name
            access_token_obj["membership_type"] = membership_type
            access_token_obj["last_auth_date"] = last_auth_date

            response_data = {
                "access": str(access_token_obj),
            }

            response = Response(response_data)

            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                domain=settings.SESSION_COOKIE_DOMAIN,
                httponly=settings.SESSION_COOKIE_HTTPONLY,
                secure=settings.SESSION_COOKIE_SECURE,
                samesite=settings.SESSION_COOKIE_SAMESITE,
                max_age=24 * 60 * 60,
            )

            return response

        except Exception as e:
            logger.critical("Unknown error during token refresh: %r", e)
            return Response(
                {"error": "Internal server error during token refresh"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
