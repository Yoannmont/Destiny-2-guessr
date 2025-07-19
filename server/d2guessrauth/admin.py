from django.contrib import admin
from django.contrib.sessions.models import Session

from d2guessrauth.models import BungieAccount, BungieUser

# Register your models here.


@admin.register(BungieUser)
class BungieUserAdmin(admin.ModelAdmin):
    list_display = ("display_name", "get_user_id", "bungie_membership_id")
    readonly_fields = ("creation_date", "last_auth_date")

    @admin.display(description="User Id")
    def get_user_id(self, obj):
        return obj.user.id


@admin.register(BungieAccount)
class BungieAccountAdmin(admin.ModelAdmin):
    list_display = (
        "account_display_name",
        "destiny_membership_id",
        "last_auth_date",
    )
    readonly_fields = ("last_auth_date",)


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("session_key",)
