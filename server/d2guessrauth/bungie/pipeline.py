import logging

from django.conf import settings
from rest_framework.authentication import get_authorization_header
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from social_core.exceptions import SocialAuthBaseException
from social_core.pipeline.partial import partial

from d2guessrauth.bungie.oauth_client import BungieClient
from d2guessrauth.models import BungieAccount, BungieUser
from d2guessrlib.models import Item

logger = logging.getLogger("auth_pipeline")


class DisconnectionError(SocialAuthBaseException):
    """An error happened when trying to disconnect social account."""

    def __str__(self):
        return "An error happened when trying to disconnect social account."


def use_existing_user_if_authenticated(strategy, *args, **kwargs):
    request = strategy.request
    user = request.user if request else None
    if request and user and user.is_authenticated:
        auth_header = get_authorization_header(request).decode("utf-8")
        logger.debug("Auth header: %s", auth_header)

        try:
            access_token_str = auth_header.split("Bearer ")[1]
            access_token_obj = AccessToken(access_token_str)

            return {
                "user": user,
                "selected_destiny_membership_id": access_token_obj["membership_id"],
                "selected_destiny_display_name": access_token_obj["display_name"],
                "selected_destiny_membership_type": access_token_obj["membership_type"],
            }
        except Exception as e:
            logger.warning("Error when trying to authenticate user from token: %r. No token workflow", e)


@partial
def choose_destiny_membership(strategy, response, details, user, *args, **kwargs):
    """Select membership if multiple."""
    BungieUser.objects.update_or_create(user=user, defaults=details)

    if "selected_destiny_membership_id" in strategy.session:
        logger.info(
            "Selected membership %s from session",
            strategy.session["selected_destiny_membership_id"],
        )
        selected_destiny_membership_id = strategy.session_pop("selected_destiny_membership_id")
        selected_destiny_membership_type = strategy.session_pop("selected_destiny_membership_type")
        selected_destiny_display_name = strategy.session_pop("selected_destiny_display_name")
        # pop selected info for future calls

        return {
            "selected_destiny_membership_id": selected_destiny_membership_id,
            "selected_destiny_membership_type": selected_destiny_membership_type,
            "selected_destiny_display_name": selected_destiny_display_name,
        }

    if "selected_destiny_membership_id" in kwargs:
        logger.info(
            "Selected membership %s from authenticated user request info",
            kwargs["selected_destiny_membership_id"],
        )
        selected_destiny_membership_id = kwargs.get("selected_destiny_membership_id")
        selected_destiny_membership_type = kwargs.get("selected_destiny_membership_type")
        selected_destiny_display_name = kwargs.get("selected_destiny_display_name")

        return {
            "selected_destiny_membership_id": selected_destiny_membership_id,
            "selected_destiny_membership_type": selected_destiny_membership_type,
            "selected_destiny_display_name": selected_destiny_display_name,
        }

    access_token = response.get("access_token")
    bungie_client = BungieClient()
    destiny_memberships_info = bungie_client.get_user_destiny_memberships_info(
        access_token=access_token, bungie_membership_id=details["bungie_membership_id"]
    )

    if len(destiny_memberships_info) == 1:
        logger.info(
            "Selected only membership %s",
            destiny_memberships_info[0]["membershipId"],
        )
        return {
            "selected_destiny_membership_id": destiny_memberships_info[0]["membershipId"],
            "selected_destiny_membership_type": destiny_memberships_info[0]["membershipType"],
            "selected_destiny_display_name": destiny_memberships_info[0]["displayName"],
        }

    strategy.session_set("memberships", destiny_memberships_info)
    strategy.session_set("access_token", access_token)

    # Create redirect response
    response = strategy.redirect(settings.SOCIAL_AUTH_BUNGIE_FRONTEND_MEMBERSHIP_SELECTION_URL)

    session_key = strategy.request.session.session_key
    if session_key:
        response.set_cookie(
            key=settings.SESSION_COOKIE_NAME,
            value=session_key,
            max_age=settings.SESSION_COOKIE_AGE,
            domain=settings.SESSION_COOKIE_DOMAIN,
            path=settings.SESSION_COOKIE_PATH,
            secure=settings.SESSION_COOKIE_SECURE,
            httponly=settings.SESSION_COOKIE_HTTPONLY,
            samesite=settings.SESSION_COOKIE_SAMESITE,
        )
        logger.info(f"Set sessionid cookie in redirect response: {session_key}")
    else:
        logger.warning("No session_key found on strategy.request.session")
    return response


def create_or_update_bungie_user_account(user, *args, **kwargs):
    """Create or update bungie user details using data from Bungie."""
    selected_destiny_membership_id = kwargs.get("selected_destiny_membership_id")
    selected_destiny_display_name = kwargs.get("selected_destiny_display_name")
    selected_destiny_membership_type = kwargs.get("selected_destiny_membership_type")
    bungie_user: BungieUser = user.bungie_user
    bungie_account = None
    try:
        bungie_account = bungie_user.accounts.get(
            membership_type=selected_destiny_membership_type,
            destiny_membership_id=selected_destiny_membership_id,
        )
    except BungieAccount.DoesNotExist:
        # need to create it
        pass

    if not bungie_account:
        bungie_account = BungieAccount.objects.create(
            bungie_user=bungie_user,
            destiny_membership_id=selected_destiny_membership_id,
            account_display_name=selected_destiny_display_name,
            membership_type=selected_destiny_membership_type,
        )
        action = "created"
    else:
        bungie_account.account_display_name = selected_destiny_display_name
        bungie_account.save()
        action = "updated"

    logger.info("Successfully %s %s", action, bungie_account)
    return {"selected_destiny_membership_last_auth_date": 1000 * round(bungie_account.last_auth_date.timestamp())}


def create_or_update_bungie_account_inventory(strategy, response, user=None, *args, **kwargs):
    """Create or update bungie user inventory using data from Bungie."""
    selected_destiny_membership_id = kwargs.get("selected_destiny_membership_id")
    selected_destiny_membership_type = kwargs.get("selected_destiny_membership_type")
    bungie_account: BungieAccount = user.bungie_user.accounts.get(destiny_membership_id=selected_destiny_membership_id)

    bungie_client = BungieClient()
    access_token = response.get("access_token")
    try:
        response = bungie_client.get_user_inventory(
            access_token=access_token,
            destiny_membership_id=selected_destiny_membership_id,
            membership_type=selected_destiny_membership_type,
        )
    except Exception as e:
        logger.error(
            "Error when trying to retrieve inventory for destiny account %s: %s.",
            bungie_account,
            repr(e),
        )
        return strategy.redirect(settings.SOCIAL_AUTH_BUNGIE_FRONTEND_ERROR_URL)

    keys = ["profileInventory", "characterInventories", "characterEquipment"]
    inventory_data = {k: v for k, v in response.items() if k in keys}

    total_added_count = 0
    for set_info in inventory_data.values():
        set_data = set_info.get("data")
        if not set_data:
            continue
        if "items" in set_data:
            # Vault items
            inventory_set_data = set_data["items"]
            added_count = _add_items_to_account(inventory_set_data=inventory_set_data, bungie_account=bungie_account)
            total_added_count += added_count
            logger.debug("Added %s vault items to %s", added_count, bungie_account)
        else:
            # Character items: must iterate on all
            for character_set_data in set_data.values():
                inventory_character_set_data = character_set_data["items"]
                added_count = _add_items_to_account(
                    inventory_set_data=inventory_character_set_data,
                    bungie_account=bungie_account,
                )
                total_added_count += added_count
                logger.debug("Added %s character items to %s", added_count, bungie_account)

    bungie_account.save()
    logger.info(
        "Successfully added %d items in total to %s",
        total_added_count,
        bungie_account,
    )


def _add_items_to_account(inventory_set_data, bungie_account):
    item_hashes = {item["itemHash"] for item in inventory_set_data}
    item_objs = Item.objects.filter(id_bungie__in=item_hashes)
    item_map = {item.id_bungie: item for item in item_objs}

    existing_item_ids = set(bungie_account.items.filter(id_bungie__in=item_hashes).values_list("id_bungie", flat=True))

    new_items = []
    for item in inventory_set_data:
        item_hash = item["itemHash"]
        if item_hash not in item_map:
            logger.debug(
                "Error when retrieving object hash %s for destiny account %s",
                item_hash,
                bungie_account,
            )
            continue

        if item_hash in existing_item_ids:
            logger.warning(
                "Item %s already in destiny account %s",
                item_map[item_hash],
                bungie_account,
            )
        else:
            logger.info(
                "Adding item %s to destiny account %s",
                item_map[item_hash],
                bungie_account,
            )
            new_items.append(item_map[item_hash])

    if new_items:
        bungie_account.items.add(*new_items)

    return len(new_items)


def disconnect_bungie_account(user, *args, **kwargs):
    """Disconnect account by deleting BungieUser instance"""
    try:
        if user and user.bungie_user:
            user.bungie_user.delete()
        else:
            msg = "Account was not found for disconnection"
            logger.critical(msg)
            raise DisconnectionError(msg)
    except Exception as e:
        msg = f"Error when trying to disconnect account {user.bungie_user} : {repr(e)}"
        logger.critical(msg)
        raise DisconnectionError(msg)


def bungie_association_complete(strategy, details, user, *args, **kwargs):
    """Handle successful account association."""

    refresh = RefreshToken.for_user(user)
    refresh["membership_id"] = kwargs.get("selected_destiny_membership_id")
    refresh["display_name"] = kwargs.get("selected_destiny_display_name")
    refresh["membership_type"] = kwargs.get("selected_destiny_membership_type")
    refresh["last_auth_date"] = kwargs.get("selected_destiny_membership_last_auth_date")
    access_token_obj = refresh.access_token
    access_token_obj["membership_id"] = kwargs.get("selected_destiny_membership_id")
    access_token_obj["display_name"] = kwargs.get("selected_destiny_display_name")
    access_token_obj["membership_type"] = kwargs.get("selected_destiny_membership_type")
    access_token_obj["last_auth_date"] = kwargs.get("selected_destiny_membership_last_auth_date")

    frontend_url = settings.SOCIAL_AUTH_BUNGIE_FRONTEND_CALLBACK_URL
    redirect_url = f"{frontend_url}#access_token={str(access_token_obj)}"
    response = strategy.redirect(redirect_url)

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
