from django.db import migrations
from django.contrib.postgres.operations import UnaccentExtension

def shorten_links(apps, schema_editor):
    Weapon = apps.get_model("d2guessrlib", "Weapon")
    DamageTypeDefinition = apps.get_model("d2guessrlib", "DamageTypeDefinition")
    weapon_objects = Weapon.objects.all()
    for weapon in weapon_objects:
        weapon.iconLink = weapon.iconLink.replace('/common/destiny2_content/icons/', '')
        weapon.screenshotLink = weapon.screenshotLink.replace('/common/destiny2_content/screenshots/', '')
        weapon.save()

    damageTypes_objects = DamageTypeDefinition.objects.all()

    for dt in damageTypes_objects:
        dt.iconLink = dt.iconLink.replace('/common/destiny2_content/icons/', '')
        dt.save()


class Migration(migrations.Migration):
    dependencies = [
        ("d2guessrlib", "0003_database_corrections"),
    ]

    operations = [
        migrations.RunPython(shorten_links)
    ]
