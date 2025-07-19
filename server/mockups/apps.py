from django.apps import AppConfig

from mockups.setup import AVAILABLE_MOCKUPS, install_mockups


class MockupsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "mockups"

    def ready(self) -> None:
        install_mockups(AVAILABLE_MOCKUPS)
        return super().ready()
