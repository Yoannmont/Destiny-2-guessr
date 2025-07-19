import json
import os
import re

from django.conf import settings

from d2guessrauth.bungie.oauth_client import BungieClient

MEMBERSHIP_PATTERN = r"^User/GetMembershipsById/(?P<bungie_membership_id>\d+)/-1/$"
INVENTORY_PATTERN = (
    r"^Destiny2/(?P<membership_type>\d+)/Profile/(?P<destiny_membership_id>\d+)/\?components"
    "=102,201,205$"
)


def load_json_from_file(filename: str) -> dict:
    path = os.path.join(settings.BASE_DIR, "mockups/fake_responses", filename)
    with open(path, "r") as f:
        response = json.load(f)
    return response


def get_json_mockup(
    self,
    url: str,
    method="GET",
    headers=None,
    data=None,
    auth=None,
    params=None,
):
    print(f">>>> {url} was called with headers={headers}, data={data}, auth={auth}, params={params}")

    # Token retrieval

    if url.endswith("/token"):
        code = data.get("code")

        if code == "multi-account":
            return {
                "access_token": "dummy-access-token-multi-account",
                "token_type": "Bearer",
                "expires_in": 3600,
                "refresh_token": "dummy-refresh-token-multi-account",
                "refresh_expires_in": 86400,
                "membership_id": "12",
            }
        elif code == "one-account":
            return {
                "access_token": "dummy-access-token-one-account",
                "token_type": "Bearer",
                "expires_in": 3600,
                "refresh_token": "dummy-refresh-token-one-account",
                "refresh_expires_in": 86400,
                "membership_id": "100",
            }

    url = url.split("Platform/")[1]
    if url.endswith("GetBungieNetUser/"):  # GET user data
        response = load_json_from_file("fake_user_data_response.json")

    # Membership retrieval
    elif url.endswith("/-1/"):  # GET memberships info
        pattern = re.compile(MEMBERSHIP_PATTERN)
        if match := pattern.match(url):
            bungie_membership_id = match.group("bungie_membership_id")
            if bungie_membership_id == "12":
                response = load_json_from_file("fake_memberships_response.json")
            else:
                response = load_json_from_file("short_fake_memberships_response.json")

        else:
            response = {"error": "Malformed url"}  # Look at bungie's error codes

    # Inventory retrieval
    elif url.endswith("?components=102,201,205"):
        pattern = re.compile(INVENTORY_PATTERN)
        if match := pattern.match(url):
            destiny_membership_id = match.group("destiny_membership_id")
            if destiny_membership_id == "12":
                response = load_json_from_file("fake_inventory_response.json")
            else:
                response = load_json_from_file("short_fake_inventory_response.json")
        else:
            response = {"error": f"Malformed url {match}"}  # Look at bungie's error codes
    return response


def monkey_patch():
    BungieClient.AUTHORIZATION_URL = "http://localhost:8000/mock-bungie/authorize"
    BungieClient.ACCESS_TOKEN_URL = "http://localhost:8000/mock-bungie/token"
    BungieClient.REFRESH_TOKEN_URL = "http://localhost:8000/mock-bungie/token"

    BungieClient.get_json = get_json_mockup
