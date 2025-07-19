from urllib.parse import urlencode

from django.http import HttpResponse, HttpResponseRedirect
from rest_framework.views import APIView


class MockBungieAuthorizeView(APIView):
    """
    Mock view to simulate Bungie OAuth authorization.
    This is used for testing purposes to avoid actual OAuth flow.
    """

    IS_ONE_ACCOUNT = False

    def get(self, request):
        redirect_uri = request.GET.get("redirect_uri")
        state = request.GET.get("state")
        code = "one-account" if self.IS_ONE_ACCOUNT else "multi-account"

        params = urlencode({"code": code, "state": state})
        return HttpResponseRedirect(f"{redirect_uri}?{params}")


class MockFrontendMembershipSelection(APIView):
    def get(self, request):
        return HttpResponse("OK")


class MockFrontendAuthCallbackView(APIView):
    def get(self, request):
        return HttpResponse("OK")
