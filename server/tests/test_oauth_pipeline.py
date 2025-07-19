import mock
import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from social_core.exceptions import AuthConnectionError

from d2guessrauth.bungie.oauth_client import BungieClient
from d2guessrauth.bungie.pipeline import DisconnectionError, disconnect_bungie_account
from d2guessrauth.models import BungieAccount, BungieUser
from d2guessrlib.models import Item
from mockups.bungie_mockup import load_json_from_file


@pytest.mark.django_db
class TestBungieOAuthPipeline:
    @pytest.fixture(autouse=True)
    def _inject_items(self, class_type, tier_type, category, damage_type):
        for i in range(1, 4):
            item = Item(
                id_bungie=i,
                api_name=f"item_{i}",
                item_type=1,  # Weapon
                tier_type=tier_type,
                class_type=class_type,
                category=category,
                icon_url="fake_url",
                screenshot_url="fake_url_2",
                default_damage_type=damage_type,
                flavor_text="This is some text",
                weapon_slot=2,  # Kinetic
                weapon_ammo_type=1,  # Primary
            )
            item.save()
            item.damage_types.add(damage_type)

    def _authenticate_one_account_user(self, client: APIClient):
        redirect = client.post(reverse("social:begin", args=("bungie",)), follow=False)
        for i in range(3):
            with mock.patch("mockups.views.MockBungieAuthorizeView.IS_ONE_ACCOUNT", True):
                print(redirect.url)
                redirect = client.get(redirect.url, follow=False)
        access_token = redirect.url.split("#access_token=")[1]
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    def test_bungie_auth_workflow_multi_account(self, client: APIClient, user: User):
        assert BungieUser.objects.count() == 0
        assert BungieAccount.objects.count() == 0

        # Beginning pipeline
        """During this request, user is successfully authenticated to Bungie
        and access_token is retrieved (refresh too).
        Then, while getting info on user through Bungie API, it seems that user has
        multiple Destiny 2 accounts. 
        'public-urls:select_membership_view' allows to select which account to use. 
        """
        response = client.get(reverse("social:begin", args=("bungie",)), follow=True)
        assert response.status_code == 200, response.content
        assert (
            client.session.get("memberships")
            == load_json_from_file("fake_memberships_response.json")["Response"]["destinyMemberships"]
        )
        assert BungieUser.objects.all().count() == 1
        assert BungieAccount.objects.count() == 0

        response = client.get(reverse("public-urls:select_membership_view"))

        assert (
            response.json()["memberships"]
            == load_json_from_file("fake_memberships_response.json")["Response"]["destinyMemberships"]
        )

        """ Here user selects account with destiny_membership_id=100"""
        data = {"membership_id": "100"}
        response = client.post(reverse("public-urls:select_membership_view"), data)
        assert response.status_code == 200
        assert response.json() == {
            "message": "Membership selected successfully.",
            "redirect_url": "/d2g/complete/bungie/",
        }

        response = client.get(reverse("social:complete", args=("bungie",)), follow=False)
        assert response.status_code == 302, response.content

        location = response.get("Location")
        assert location is not None
        assert "access_token" in location
        access_token = location.split("#access_token=")[1]
        assert access_token

        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        assert BungieAccount.objects.count() == 1

        bungie_account = BungieAccount.objects.first()
        assert bungie_account.account_display_name == "fakeDisplayName"
        assert bungie_account.destiny_membership_id == 100
        assert bungie_account.membership_type == 6
        assert bungie_account.items.count() == 3

        # Disconnection deletes all user info
        response = client.post(reverse("auth-urls:disconnect-bungie"))
        assert response.status_code == 200, response.content
        assert response.json() == {"message": "Bungie account disconnected successfully."}

        assert BungieAccount.objects.count() == 0
        assert BungieUser.objects.count() == 0

    def test_bungie_auth_workflow_one_account(self, client: APIClient):
        assert BungieUser.objects.count() == 0
        assert BungieAccount.objects.count() == 0

        # Beginning pipeline
        redirect = client.post(reverse("social:begin", args=("bungie",)), follow=False)
        assert redirect.status_code == 302
        assert "mock-bungie" in redirect.url

        redirect_2 = client.get(redirect.url)
        assert redirect_2.status_code == 301, redirect_2.content
        assert "mock-bungie/authorize" in redirect_2.url

        with mock.patch("mockups.views.MockBungieAuthorizeView.IS_ONE_ACCOUNT", True):
            redirect_3 = client.get(redirect_2.url, follow=False)
        assert redirect_3.status_code == 302

        redirect_4 = client.get(redirect_3.url, follow=False)
        assert redirect_4.status_code == 302
        assert "access_token" in redirect_4.url
        access_token = redirect_4.url.split("#access_token=")[1]
        assert access_token

        """ No selection since only one account """
        assert BungieAccount.objects.count() == 1

        bungie_account = BungieAccount.objects.first()
        assert bungie_account.account_display_name == "fakeDisplayName"
        assert bungie_account.destiny_membership_id == 100
        assert bungie_account.membership_type == 1
        assert bungie_account.items.count() == 3

        # Disconnection deletes all user info
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = client.post(reverse("auth-urls:disconnect-bungie"))
        assert response.status_code == 200

        assert BungieAccount.objects.count() == 0
        assert BungieUser.objects.count() == 0

    def test_bungie_disconnection_errors(self, client: APIClient):
        # error when disconnecting

        assert BungieUser.objects.count() == 0
        assert BungieAccount.objects.count() == 0

        # Beginning pipeline
        with mock.patch("mockups.views.MockBungieAuthorizeView.IS_ONE_ACCOUNT", True):
            response = client.post(reverse("social:begin", args=("bungie",)), follow=True)
        assert response.status_code == 200

        user = mock.MagicMock()
        user.bungie_user = mock.MagicMock()
        user.bungie_user.delete.side_effect = Exception("Database error")

        with pytest.raises(DisconnectionError):
            disconnect_bungie_account(user)

        user = mock.MagicMock()
        user.bungie_user = None

        with pytest.raises(DisconnectionError):
            disconnect_bungie_account(user)

    def test_auth_bungie_account_update(self, client: APIClient):
        assert BungieUser.objects.count() == 0
        assert BungieAccount.objects.count() == 0

        # Beginning pipeline
        with mock.patch("mockups.views.MockBungieAuthorizeView.IS_ONE_ACCOUNT", True):
            response = client.post(reverse("social:begin", args=("bungie",)), follow=True)
        assert response.status_code == 200

        bungie_account = BungieAccount.objects.first()

        assert bungie_account.account_display_name == "fakeDisplayName"
        bungie_account.account_display_name = "NewDisplayName"
        bungie_account.save()  # changing name in db

        with mock.patch("mockups.views.MockBungieAuthorizeView.IS_ONE_ACCOUNT", True):
            response = client.post(reverse("social:begin", args=("bungie",)), follow=True)
        assert response.status_code == 200
        bungie_account.refresh_from_db()
        assert bungie_account.account_display_name == "fakeDisplayName"  # back to its original name

    def test_bungie_account_items_view(
        self,
        client: APIClient,
    ):
        assert BungieUser.objects.count() == 0
        assert BungieAccount.objects.count() == 0

        # Beginning pipeline
        self._authenticate_one_account_user(client)

        destiny_membership_id = BungieAccount.objects.first().destiny_membership_id

        response = client.get(
            reverse("auth-urls:account-items-view", args=(destiny_membership_id,)),
        )

        assert response.json() == {
            "count": 3,
            "next": None,
            "previous": None,
            "results": [
                {
                    "id": 1,
                    "api_name": "item_1",
                    "item_type": 1,
                    "localized_name": "item_1",
                    "default_damage_type": 1,
                    "tier_type": 1,
                    "class_type": 1,
                    "category": 1,
                    "icon_url": "fake_url",
                    "weapon_slot": 2,
                    "weapon_ammo_type": 1,
                },
                {
                    "id": 2,
                    "api_name": "item_2",
                    "item_type": 1,
                    "localized_name": "item_2",
                    "default_damage_type": 1,
                    "tier_type": 1,
                    "class_type": 1,
                    "category": 1,
                    "icon_url": "fake_url",
                    "weapon_slot": 2,
                    "weapon_ammo_type": 1,
                },
                {
                    "id": 3,
                    "api_name": "item_3",
                    "item_type": 1,
                    "localized_name": "item_3",
                    "tier_type": 1,
                    "default_damage_type": 1,
                    "class_type": 1,
                    "category": 1,
                    "icon_url": "fake_url",
                    "weapon_slot": 2,
                    "weapon_ammo_type": 1,
                },
            ],
        }

    def test_bungie_account_items_view_errors(self, client: APIClient):
        # Beginning pipeline
        self._authenticate_one_account_user(client)

        response = client.get(reverse("auth-urls:account-items-view", args=(999,)))  # Non-existing membership ID
        assert response.status_code == 404  # Not found
        assert response.json() == {"detail": "Bungie account with destiny_membership_id '999' not found."}

        # Test with no authentication
        client.credentials()
        destiny_membership_id = BungieAccount.objects.first().destiny_membership_id
        response = client.get(reverse("auth-urls:account-items-view", args=(destiny_membership_id,)))
        assert response.status_code == 401  # Unauthorized
        assert response.json() == {"detail": "Authentication credentials were not provided."}

    def test_bungie_client_exceptions(self):
        bungie_client = BungieClient()
        access_token = "dummy-access-token-multi-account"
        bungie_membership_id = "12"
        destiny_membership_id = "100"
        membership_type = 6
        kwargs = {"response": {"membership_id": "12"}}

        with (
            mock.patch(
                "d2guessrauth.bungie.oauth_client.BungieClient.make_bungie_request",
                side_effect=AuthConnectionError(backend=bungie_client),
            ),
            pytest.raises(AuthConnectionError),
        ):
            bungie_client.user_data(access_token=access_token, **kwargs)

        with (
            mock.patch(
                "d2guessrauth.bungie.oauth_client.BungieClient.make_bungie_request",
                side_effect=AuthConnectionError(backend=bungie_client),
            ),
            pytest.raises(AuthConnectionError),
        ):
            bungie_client.get_user_destiny_memberships_info(
                access_token=access_token,
                bungie_membership_id=bungie_membership_id,
                **kwargs,
            )

        with (
            mock.patch(
                "d2guessrauth.bungie.oauth_client.BungieClient.make_bungie_request",
                side_effect=AuthConnectionError(backend=bungie_client),
            ),
            pytest.raises(AuthConnectionError),
        ):
            bungie_client.get_user_inventory(
                access_token=access_token,
                destiny_membership_id=destiny_membership_id,
                membership_type=membership_type,
                **kwargs,
            )

    def test_account_info(self, client: APIClient):
        # Beginning pipeline
        self._authenticate_one_account_user(client)

        # Test with Bungie account associated
        response = client.get(reverse("auth-urls:account-info"))
        assert response.status_code == 200
        response_json = response.json()
        assert "lastAuthDate" in response_json["memberships"][0]
        del response_json["memberships"][0]["lastAuthDate"]
        assert response.json() == {
            "memberships": [
                {
                    "displayName": "fakeDisplayName",
                    "membershipId": 100,
                    "membershipType": 1,
                }
            ]
        }

    def test_logout(self, client: APIClient, user: User):
        self._authenticate_one_account_user(client)
        logout_url = reverse("auth-urls:logout")

        # No refresh token in cookies
        del client.cookies["refresh_token"]
        response = client.post(logout_url)
        assert response.status_code == 400
        assert response.json() == {"error": "Refresh token is required."}

        # Valid refresh token
        valid_refresh_token = str(RefreshToken.for_user(user))
        client.cookies["refresh_token"] = valid_refresh_token

        response = client.post(logout_url)
        assert response.status_code == 204
        assert "refresh_token" in response.cookies
        assert response.cookies["refresh_token"].value == ""
        assert response.cookies["refresh_token"]["max-age"] == 0

        # Invalid refresh token
        client.cookies["refresh_token"] = "invalid.token.here"

        response = client.post(logout_url)
        assert response.status_code == 400
        assert response.json() == {"error": "Invalid or expired refresh token"}

    def test_refresh(self, client: APIClient):
        self._authenticate_one_account_user(client)

        response = client.post(reverse("public-urls:token-refresh"))

        assert response.status_code == 200
        assert "access" in response.json()
        assert "refresh_token" in response.cookies

        # No refresh token in cookies
        del client.cookies["refresh_token"]
        response = client.post(reverse("public-urls:token-refresh"))
        assert response.json() == {"error": "Refresh token not found in cookies"}

        client.cookies["refresh_token"] = "wrong_token_format"
        response = client.post(reverse("public-urls:token-refresh"))
        assert response.json() == {"error": "Invalid or expired refresh token"}

        # Unexpected error
