from django.apps import AppConfig
# from .populate import check_manifest_update

class D2GuessrlibConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "d2guessrlib"
    def ready(self):
        # if not check_manifest_update():
        #     print("There is a new update on Bungie Manifest")
        pass