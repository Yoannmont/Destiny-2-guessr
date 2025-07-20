from django.http import HttpResponseForbidden

from ip_filter.models import AllowedAdminIP


class RestrictAdminIPMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith("/d2g/d2g-admin-7895"):
            ip = request.META.get("HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR")).split(",")[0]
            print(ip)
            if not AllowedAdminIP.objects.filter(ip_address=ip).exists():
                return HttpResponseForbidden("Access denied. Unauthorized IP address. ")
        return self.get_response(request)
