import logging

import requests
from requests.adapters import HTTPAdapter
from social_core.backends.bungie import BungieOAuth2
from social_core.exceptions import AuthConnectionError
from social_core.utils import user_agent
from urllib3.util.retry import Retry

logger = logging.getLogger("bungie_client")


class BungieClient(BungieOAuth2):
    """Custom Bungie OAuth2 client with persistent session and better timeout handling."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.session = requests.Session()
        retries = Retry(total=3, backoff_factor=0.3, status_forcelist=[502, 503, 504])
        adapter = HTTPAdapter(max_retries=retries)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

        self.timeout = self.setting("REQUESTS_TIMEOUT") or self.setting("URLOPEN_TIMEOUT") or 5
        self.proxies = self.setting("PROXIES")
        self.verify_ssl = self.setting("VERIFY_SSL", True)

        self.session.headers["User-Agent"] = self.setting("USER_AGENT") or user_agent()

    def make_bungie_request(self, url, access_token, kwargs):
        """Helper function to get data from Bungie API with bearer token and timeout."""
        headers = self.auth_headers()
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"

        return self.get_json(url=url, headers=headers)

    def request(self, url, *, method="GET", headers=None, data=None, auth=None, params=None):
        headers = {} if headers is None else dict(headers)
        if self.SEND_USER_AGENT and "User-Agent" not in headers:
            headers["User-Agent"] = self.session.headers.get("User-Agent")

        try:
            response = self.session.request(
                method,
                url,
                headers=headers,
                data=data,
                auth=auth,
                params=params,
                timeout=self.timeout,
                proxies=self.proxies,
                verify=self.verify_ssl,
            )
        except requests.ConnectionError as err:
            raise AuthConnectionError(self, str(err)) from err

        if response.status_code != 200:
            logger.critical("Error when fetching response %s", response.content)
            response.raise_for_status()

        return response

    def user_data(self, access_token, *args, **kwargs) -> dict:
        """Grab user profile information from Bungie"""
        bungie_membership_id = kwargs["response"]["membership_id"]
        url = "https://www.bungie.net/Platform/User/GetBungieNetUser/"
        try:
            response = self.make_bungie_request(url, access_token=access_token, kwargs=kwargs)
            logger.info(
                "Getting (bungie_membership_id: %s) user data from Bungie API",
                bungie_membership_id,
            )
        except AuthConnectionError as err:
            logger.error(
                "Error occured when fetching (membership_id: %s) user data",
                bungie_membership_id,
            )
            raise err
        user_data = response["Response"]["user"]
        return {"uid": bungie_membership_id, **user_data}

    def get_user_details(self, response, *args, **kwargs):
        """Extract user info from Bungie API response"""
        return {
            "display_name": response["displayName"],
            "bungie_membership_id": response["uid"],
            "profile_pic_url": response["profilePicturePath"],
        }

    def get_user_destiny_memberships_info(self, access_token, bungie_membership_id, *args, **kwargs) -> dict:
        """Fetch Destiny memberships info from Destiny API using Bungie membership ID"""
        url = f"https://www.bungie.net/Platform/User/GetMembershipsById/{bungie_membership_id}/-1/"
        try:
            response = self.make_bungie_request(url=url, access_token=access_token, kwargs=kwargs)
            logger.info(
                "Getting (bungie_membership_id: %s) Destiny memberships info from Destiny API",
                bungie_membership_id,
            )
        except AuthConnectionError as err:
            logger.error(
                "Error occured when fetching (bungie_membership_id: %s) user inventoryDestiny memberships info",
                bungie_membership_id,
            )
            raise err
        destiny_memberships_info = response["Response"]["destinyMemberships"]
        return destiny_memberships_info

    def get_user_inventory(self, access_token, destiny_membership_id, membership_type, *args, **kwargs) -> dict:
        """Fetch user inventory info from Destiny API"""
        url = f"https://www.bungie.net/Platform/Destiny2/{membership_type}/Profile/{destiny_membership_id}/?components=102,201,205"

        try:
            response = self.make_bungie_request(url=url, access_token=access_token, kwargs=kwargs)
            logger.info("Getting (destiny_membership_id: %s) user inventory from Destiny API")
        except AuthConnectionError as err:
            logger.error(
                "Error occured when fetching (destiny_membership_id: %s, membership_type: %s) user inventory",
                destiny_membership_id,
                membership_type,
            )
            raise err
        return response["Response"]
