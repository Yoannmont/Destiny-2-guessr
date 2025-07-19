from django.contrib.admin.sites import AdminSite
from django.contrib.auth.models import User

from d2guessrauth.admin import BungieUserAdmin
from d2guessrauth.models import BungieUser


class TestAdmin:
    def test_bungie_user(self, user: User):
        bungie_user = BungieUser.objects.create(user=user, display_name="Test Display", bungie_membership_id="12345")
        admin_instance = BungieUserAdmin(BungieUser, AdminSite())

        result = admin_instance.get_user_id(bungie_user)

        assert result == user.pk
