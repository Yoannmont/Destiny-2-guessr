# admin.py
from django.contrib import admin

from ip_filter.models import AllowedAdminIP

admin.site.register(AllowedAdminIP)
