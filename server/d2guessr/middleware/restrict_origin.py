from django.conf import settings
from django.http import HttpResponseForbidden


class RestrictOriginMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.META.get("HTTP_ORIGIN") or request.headers.get("Origin")
        if (
            not settings.DEBUG
            and not (
                request.path.startswith("/d2g/d2g-admin-7895/")
                or request.path.startswith("/d2g/swagger/")
                or request.path.startswith("/d2g/redoc/")
            )
            and (not origin or origin not in settings.CORS_ALLOWED_ORIGINS)
        ):
            return HttpResponseForbidden("Access denied. Unauthorized origin. ")
        return self.get_response(request)
