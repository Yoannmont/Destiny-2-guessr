# Generated by Django 5.0.3 on 2024-05-06 10:32

from django.db import migrations
from django.contrib.postgres.operations import UnaccentExtension

CORRECTION_TABLE = {
    "TypeDefinition": {
        "type_en": {"Trace Rifles":  "Trace Rifle",
                    "Grenade Launchers":  "Grenade Launcher",
                    "Submachine Guns": "Submachine Gun",
                    "Linear Fusion Rifles":  "Linear Fusion Rifle",
                    "Glaives":  "Glaive",
                    "Bows":  "Bow"},
        "type_fr": {"Fusils automatiques" : "Fusil automatique",
                    "Revolvers" : "Revolver",
                    "Fusils à impulsion" : "Fusil à impulsion",
                    "Fusils d'éclaireur" : "Fusil d'éclaireur",
                    "Fusils à pompe" : "Fusil à pompe",
                    "Fusils de précision" : "Fusil de précision",
                    "Fusils à fusion" : "Fusil à fusion",
                    "Mitrailleuses" : "Mitrailleuse",
                    "Pistolets" : "Pistolet",
                    "Épées" : "Épée",
                    "Fusils à rayon" : "Fusil à rayon",
                    "Pistolets-mitrailleurs" : "Pistolet-mitrailleur",
                    "Fusils à fusion linéaire" : "Fusil à fusion linéaire",
                    "Glaives" : "Glaive",
                    "Arcs" : "Arc"}
    },
    "DamageTypeDefinition": {
        "damageType_fr": {"Cinétiques": "Cinétique",
                          "Cryo-électriques": "Cryo-électrique",
                          "Solaires": "Solaire",
                          "Abyssaux": "Abyssal"}
    }
}



def correct_tables(apps, schema_editor):
    for modelName in ["TypeDefinition", "DamageTypeDefinition"]:
        model = apps.get_model("d2guessrlib", modelName)
        for fieldName in CORRECTION_TABLE[modelName].keys():
            for oldValue, newValue in CORRECTION_TABLE[modelName][fieldName].items():
                filter_dict = {fieldName: oldValue}
                update_dict = {fieldName: newValue}
                model.objects.filter(**filter_dict).update(**update_dict)


class Migration(migrations.Migration):
    dependencies = [
        ("d2guessrlib", "0002_populate"),
    ]

    operations = [
        UnaccentExtension(),
        migrations.RunPython(correct_tables)
    ]