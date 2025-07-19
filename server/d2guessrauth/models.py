from django.contrib.auth.models import User
from django.db import models

from d2guessrlib.models import Item


class BungieUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="bungie_user", null=False)
    bungie_membership_id = models.BigIntegerField(null=False)
    creation_date = models.DateTimeField(
        auto_now_add=True,
        null=False,
    )
    last_auth_date = models.DateTimeField(auto_now=True, null=False)
    profile_pic_url = models.URLField()
    display_name = models.CharField(max_length=32)

    def __str__(self):
        return f"BungieUser({self.display_name}, {self.bungie_membership_id})"


class BungieAccount(models.Model):
    MEMBERSHIP_TYPE_CHOICES = [
        (1, "TigerXbox"),
        (2, "TigerPsn"),
        (3, "TigerSteam"),
        (4, "TigerBlizzard"),
        (5, "TigerStadia"),
        (6, "TigerEgs"),
        (10, "TigerDemon"),
        (254, "BungieNext"),
    ]

    bungie_user = models.ForeignKey(BungieUser, related_name="accounts", null=False, on_delete=models.CASCADE)
    membership_type = models.IntegerField(choices=MEMBERSHIP_TYPE_CHOICES, null=False, unique=True)
    destiny_membership_id = models.BigIntegerField(null=False)
    last_auth_date = models.DateTimeField(auto_now=True, null=False)
    account_display_name = models.CharField(max_length=32, null=False)
    items = models.ManyToManyField(Item)

    def __str__(self):
        return f"BungieAccount({self.account_display_name}, {self.destiny_membership_id})"
